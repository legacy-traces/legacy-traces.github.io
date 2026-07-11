import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const SESSION_KEY = 'authSession';

// localStorage stores ONLY non-sensitive display fields: { email, name, phone }
// idToken/isAdmin are never written to localStorage. They ARE cached in
// sessionStorage (tab-scoped, wiped on browser/tab close) so a page reload —
// or landing deep-linked into checkout — doesn't force a fresh Google
// sign-in every single time. Only once the cached token's own ~1hr
// Google-issued expiry actually passes does SessionGate (App.jsx) fall back
// to silently re-authenticating via Google One-Tap.
const restoreSession = () => {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!session.idToken || !session.exp || session.exp * 1000 <= Date.now()) {
            sessionStorage.removeItem(SESSION_KEY);
            return null;
        }
        return { idToken: session.idToken, isAdmin: !!session.isAdmin };
    } catch {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
    }
};

export const UserProvider = ({ children }) => {
    const [user, setUserState] = useState(() => {
        let restored = null;

        // Migrate legacy key name
        const oldAuth = localStorage.getItem('googleAuthUser');
        if (oldAuth) {
            try {
                const parsed = JSON.parse(oldAuth);
                restored = { email: parsed.email, name: parsed.name, phone: '' };
                localStorage.setItem('user', JSON.stringify(restored));
                localStorage.removeItem('googleAuthUser');
            } catch { /* ignore */ }
        }

        if (!restored) {
            const stored = localStorage.getItem('user');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (!parsed.email) {
                        localStorage.removeItem('user');
                    } else {
                        // Restore ONLY safe display fields — never idToken/isAdmin
                        restored = { email: parsed.email, name: parsed.name || '', phone: parsed.phone || '' };
                    }
                } catch { /* ignore */ }
            }
        }

        // Layer in a still-valid cached session, if any, so idToken/isAdmin
        // are available immediately on this render instead of waiting on a
        // One-Tap round trip.
        const session = restoreSession();
        if (session) {
            restored = { ...(restored || {}), ...session };
        }

        return restored;
    });

    useEffect(() => {
        if (user) {
            // Persist ONLY non-sensitive display fields
            localStorage.setItem('user', JSON.stringify({
                email: user.email  || '',
                name:  user.name   || '',
                phone: user.phone  || '',
            }));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // Mirror idToken/isAdmin into sessionStorage so they survive reloads
    // within this tab — cleared the moment the token's own expiry passes or
    // the user logs out.
    useEffect(() => {
        if (!user?.idToken) {
            sessionStorage.removeItem(SESSION_KEY);
            return;
        }
        try {
            const { exp } = jwtDecode(user.idToken);
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                idToken: user.idToken,
                isAdmin: !!user.isAdmin,
                exp,
            }));
        } catch {
            sessionStorage.removeItem(SESSION_KEY);
        }
    }, [user?.idToken, user?.isAdmin]);

    // Merge updates so callers can do setUser({ phone: '...' }) without losing other fields
    const setUser = (value) => {
        setUserState(prev => {
            if (value === null) return null;
            if (typeof value === 'function') return value(prev);
            return { ...prev, ...value };
        });
    };

    const logout = () => {
        sessionStorage.removeItem(SESSION_KEY);
        setUserState(null);
    };

    return (
        <UserContext.Provider value={{ user, setUser, logout }}>
            {children}
        </UserContext.Provider>
    );
};
