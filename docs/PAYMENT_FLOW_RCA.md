# Payment Flow — Root Cause Analysis

**Reported symptom (production):** orders sometimes stay `Pending Payment` even
though the customer completed payment successfully, and the same
customer/cart sometimes ends up with two order rows — one stuck
`Pending Payment`, one `New` — after the customer left the payment page once
and paid successfully on a later attempt. For COD, an order has been seen
reaching a placed state without the ₹100 advance actually clearing.

**Confirmed (2026-07-14, project owner): there is currently no Cashfree
webhook configured for this account.** This is the single most important
fact in this analysis — it means the mechanism this document originally
treated as a "fallback" is, in production today, the *only* mechanism that
exists. Everything below is written with that confirmed.

This document explains the current process end-to-end (button click →
API → Cashfree → DB), then walks through exactly where it breaks.

---

## 1. Current process, explained

There are two payment paths, both built the same way: **create a
`Pending Payment` order row first, then take payment, then promote the row
to `New` once payment is actually confirmed.** This order is intentional —
Cashfree needs a `cf_order_id`/amount to create its own order before the
customer ever sees a payment form, so *something* has to exist in D1 first.

- **Full online payment** — `initPayment` → `handlePayNow` (`Checkout.jsx`)
- **COD (₹100 advance)** — `initCodPayment` → `handleCodAdvancePayment` (`Checkout.jsx`)

Both are structurally identical (same helpers, same guard rails), differing
only in the amount charged (full total vs. fixed ₹100) and the `cod` flag
stored on the order. The code was written assuming a webhook would confirm
payment server-side, with the frontend poll as a UX nicety for immediate
feedback. That assumption doesn't hold today — see §2.1.

### 1.1 Sequence diagram — happy path (full online payment), as it actually runs today

```mermaid
sequenceDiagram
    actor C as Customer
    participant FE as Checkout.jsx
    participant BE as Worker (backend.js)
    participant D1 as D1 (orders / payments)
    participant CF as Cashfree

    C->>FE: Click "Pay Now"
    FE->>BE: POST ?type=initPayment {cart, name, address, ...}
    activate BE
    BE->>D1: upsertPendingOrder()<br/>SELECT ... WHERE customer_sub=? AND order_status='Pending Payment'<br/>AND product_list=? (exact string match)
    alt matching pending row exists
        D1-->>BE: existing.id
        BE->>D1: UPDATE orders SET ... WHERE id = existing.id
    else no match
        BE->>D1: INSERT INTO orders (..., order_status='Pending Payment')
    end
    D1-->>BE: orderId
    BE->>CF: POST /orders {order_amount, notify_url: WORKER_URL+?type=paymentWebhook}
    Note over BE,CF: notify_url is sent on every request, but no webhook<br/>is actually configured for this Cashfree account —<br/>Cashfree never calls it. This entire step is currently inert.
    CF-->>BE: {payment_session_id}
    BE->>D1: upsertPayment(orderId, cfOrderId, amount)<br/>DELETE FROM payments WHERE order_id=?<br/>INSERT INTO payments (order_id, cf_order_id, amount, status='PENDING')
    BE-->>FE: {payment_session_id, order_id}
    deactivate BE

    FE->>CF: cashfree.checkout({payment_session_id}) — opens MODAL (same tab)
    C->>CF: Enters card/UPI, completes payment
    CF-->>FE: checkout() resolves (SDK always resolves null — not trustworthy)

    rect rgb(255, 245, 235)
    Note over FE,CF: THE ONLY CONFIRMATION PATH THAT EXISTS TODAY.<br/>No webhook will ever call the backend independently.
    FE->>BE: POST ?type=paymentStatus {orderId} (×up to 6, 2s apart — ~12s total)
    BE->>D1: SELECT status FROM payments WHERE order_id=?
    Note over D1: status is still 'PENDING' — nothing else ever writes 'SUCCESS' to this row
    BE->>CF: GET /orders/{cf_order_id}
    CF-->>BE: order_status=PAID
    BE->>D1: UPDATE payments SET status='SUCCESS'; markOrderPaid(orderId) → order_status='New'
    BE-->>FE: {status: 'SUCCESS'}
    end

    FE->>FE: clearCart(); navigate('/orders')
```

**If the browser tab is closed, the app is backgrounded, or the customer is
bounced to a separate UPI app and doesn't return within that ~12-second
window, the `rect`-highlighted block above never runs — for anyone.** There
is nothing else in the system that will ever confirm that payment. Even if
Cashfree successfully charged the customer, D1 never finds out.

### 1.2 Sequence diagram — COD ₹100 advance

Identical shape, only the amount and the `cod` flag differ — same single
point of failure applies:

```mermaid
sequenceDiagram
    actor C as Customer
    participant FE as Checkout.jsx
    participant BE as Worker (backend.js)
    participant D1 as D1
    participant CF as Cashfree

    C->>FE: Click "Pay ₹100 advance (COD)"
    FE->>BE: POST ?type=initCodPayment {cart, ...}
    BE->>D1: upsertPendingOrder({cod:'Yes', ...})
    BE->>D1: order row (Pending Payment, cod='Yes', amount_paid=FULL order total)
    BE->>CF: POST /orders {order_amount: 100} — only ₹100 is actually charged now
    BE->>D1: upsertPayment(orderId, cfOrderId, amount=100)
    BE-->>FE: {payment_session_id, order_id, amount: 100}
    FE->>CF: cashfree.checkout() — modal for ₹100 only
    Note over BE,D1: No webhook exists. The ~12s client poll (pollPaymentStatus)<br/>is the ONLY thing that can call markOrderPaid() → order_status='New'.<br/>The FULL amount (amount_paid) is collected by the courier on delivery — never charged again here.
```

`order_status` only ever becomes `'New'` (i.e. "placed") through
`markOrderPaid()`, which today is only ever reachable via that one client
poll. There is no code path where a COD order reaches `'New'` from client
action alone without Cashfree having confirmed the ₹100 — but there's also
no path to reach `'New'` at all if the poll doesn't get to run (see §2.4 for
the one way this can still be bypassed manually).

---

## 2. Where it actually breaks

### 2.1 — ROOT CAUSE (confirmed, primary): no webhook exists, so the ~12s client poll is the only confirmation path in the entire system

`backend.js` has a fully-implemented `paymentWebhook` handler — signature
verification, idempotent lookup by `cf_order_id`, calls `markOrderPaid`.
Every `initPayment`/`initCodPayment` call correctly sends a `notify_url`
pointing at it. **None of that runs**, because Cashfree has no webhook
configured for this account/app to actually call that URL. The code was
written assuming the webhook (server-to-server, independent of the
customer's device) would be the primary confirmation path, with the
frontend poll as a fast-feedback nicety. In reality, the poll is carrying
100% of the load it was never designed to carry alone.

This directly explains "payment succeeded but shows Pending Payment,"
without needing any other bug in the mix: Cashfree took the money, the
customer's browser tab/app just wasn't still executing JS 12 seconds later
to ask about it — closed the tab too fast, switched to a UPI app and didn't
return promptly, lost signal, or the OS suspended a backgrounded mobile
browser tab. None of those are exotic; they're normal mobile payment
behavior, especially for UPI intent flows where the customer necessarily
leaves the browser to authorize in a separate app.

**This is not a "sometimes" bug — it is structurally guaranteed to happen at
some rate proportional to how often customers don't sit and watch the tab
for 12 seconds after paying**, and there is currently no way for any of
those orders to ever self-correct.

### 2.2 — Duplicate order rows: the reuse guard only catches a byte-for-byte identical retry

`upsertPendingOrder` (`backend.js`) de-dupes retries by:

```sql
SELECT id FROM orders
WHERE customer_sub = ? AND order_status = 'Pending Payment'
  AND custom_order_id IS NULL AND product_list = ?
```

`product_list` is built as `"{name} (Size: {size}, Qty: {qty})"` lines
joined per cart item. This was added specifically to fix an earlier version
of this same bug (see commit `9106f77`/`fc050f8` — a prior attempt hid
abandoned orders client-side, then was reverted in favor of this
reuse-on-exact-match approach, on the belief it fully solved the problem).

It only matches if the retried cart is **identical in content and order** to
the abandoned one. In practice, a customer who abandons a payment (or, per
§2.1, whose order is simply never confirmed despite paying) very commonly
adjusts something before retrying — changes a quantity, removes an item,
picks a different size, applies a coupon — all ordinary shopping behavior.
Any of that changes the `product_list` string, the lookup finds nothing, and
a **new** `Pending Payment` row is created next to the orphaned one from
before. Neither row is ever cleaned up. This is the direct mechanism behind
seeing two rows (one stuck `Pending Payment`, one `New`) for what was, from
the customer's perspective, one purchase.

### 2.3 — Latent bug, will activate the moment a webhook is added: retries delete the previous payment record

`upsertPayment` (`backend.js`):

```js
const upsertPayment = async (orderId, cfOrderId, amount, googleSub) => {
    await env.DB.prepare("DELETE FROM payments WHERE order_id = ?").bind(orderId).run();
    await env.DB.prepare(
        "INSERT INTO payments (order_id, cf_order_id, amount, customer_sub) VALUES (?, ?, ?, ?)"
    ).bind(orderId, cfOrderId, amount, googleSub).run();
};
```

This doesn't cause visible damage *today* only because there's no webhook
to orphan — the client poll always looks up the payment row for its own
`orderId`/`cf_order_id` from the same request it just made, so it's
self-consistent in the moment. But the instant a webhook is configured (see
recommendation #1), this becomes live and dangerous: if a customer retries
before an *earlier* attempt's webhook has arrived, that retry's
`upsertPayment` call deletes the payment row the earlier webhook needs to
match against (`SELECT ... WHERE cf_order_id = ?` in `paymentWebhook`
finds nothing → discarded as "unknown order"). A real, successful charge
from the first attempt would then have no order to attach to — and if both
attempts settle, the customer is charged twice with only the second ever
reflected.

**This must be fixed in the same change that adds the webhook**, not
treated as a separate follow-up — otherwise turning the webhook on will
introduce a new failure mode rather than removing one.

### 2.4 — Secondary: admin status changes have no payment-verification guard

`updateOrderStatus` / `applyOrderShippingUpdate` (`backend.js`) will accept
any status transition an admin submits — including moving a `Pending
Payment` COD order straight to `New`/`Shipped` — without checking whether
`payments.status = 'SUCCESS'` for that order at all. Given §2.1, this is
unlikely to be how most "COD placed without ₹100 collected" cases are
actually happening (the far more likely path is simply that the ₹100 *did*
clear on Cashfree, but the order was never confirmed and someone assumed it
was safe to advance manually) — but it's worth closing regardless: nothing
today distinguishes a genuinely-verified payment from an admin override.

---

## 3. Recommendations (priority order)

1. **Get a real webhook configured with Cashfree, and fix §2.3 in the same
   change.** This is the actual fix for "payment succeeded but shows
   Pending" — nothing else meaningfully addresses it, since right now
   nothing but a 12-second client-side poll ever confirms a payment.
   Confirm in Cashfree's dashboard whether webhooks need to be registered
   there directly (some integration modes don't honor a per-order
   `notify_url` at all and require the webhook URL configured against the
   app/account instead) — this can't be resolved from the codebase, it's a
   Cashfree account setting. When wiring it up, change `upsertPayment` to
   stop deleting prior payment rows for an order that might still have a
   webhook in flight (e.g. keep one `payments` row per attempt instead of
   per order, or check the existing row's status before overwriting it).
2. **Add a scheduled reconciliation job** (Cron Trigger in
   `wrangler.toml`) that finds `orders` in `Pending Payment` older than,
   say, 15 minutes with a linked `payments` row still `PENDING`, and
   re-queries Cashfree's order status directly — the same check
   `getPaymentStatus` already does, just run server-side on a timer instead
   of depending on the customer's tab. Do this even after the webhook is
   added — it's the safety net for whatever the webhook itself misses
   (delivery failures happen on every payment provider).
3. **Loosen or drop the exact-string cart match**, or replace it with
   something more deliberate — e.g. reuse *any* of the customer's
   `Pending Payment` orders regardless of cart contents (there should only
   ever be one legitimate in-flight checkout per customer at a time), or
   explicitly cancel/expire the old row when a new attempt starts instead of
   silently leaving it behind.
4. **Guard admin status transitions** on COD/online orders still in
   `Pending Payment` — require `payments.status = 'SUCCESS'` (or an explicit
   admin override reason) before allowing a move to `New` or beyond.
