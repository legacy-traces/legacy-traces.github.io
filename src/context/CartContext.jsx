import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const localData = localStorage.getItem('cartItems');
        return localData ? JSON.parse(localData) : [];
    });

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, size, quantity = 1) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.ID && item.size === size);
            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.ID && item.size === size
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prevItems, { ...product, id: product.ID, size, quantity }];
        });
    };

    const removeFromCart = (id, size) => {
        setCartItems(prevItems => prevItems.filter(item => !(item.id === id && item.size === size)));
    };

    const updateQuantity = (id, size, quantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id && item.size === size
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    // Reconciles cached cart items (price/stock snapshotted at add-to-cart
    // time, possibly long ago) against a fresh catalog fetch — called at
    // checkout so the customer pays the current price, not a stale one.
    // Items no longer in the active catalog are flagged (`unavailable: true`)
    // rather than silently dropped, so Checkout can surface it instead of
    // the cart just quietly losing an item.
    const syncCartWithCatalog = (freshProducts) => {
        const freshById = Object.fromEntries(freshProducts.map(p => [p.ID, p]));
        setCartItems(prevItems =>
            prevItems.map(item => {
                const fresh = freshById[item.id];
                if (!fresh) return { ...item, unavailable: true };
                return { ...item, ...fresh, id: fresh.ID, size: item.size, quantity: item.quantity, unavailable: false };
            })
        );
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.Price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount,
            syncCartWithCatalog
        }}>
            {children}
        </CartContext.Provider>
    );
};
