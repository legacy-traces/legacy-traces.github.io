import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Attempt to migrate from older logic if needed
        const oldAuth = localStorage.getItem('googleAuthUser');
        if (oldAuth) {
            try {
                const parsed = JSON.parse(oldAuth);
                const migratedUser = { email: parsed.email, name: parsed.name, phone: '', address: '' };
                localStorage.setItem('user', JSON.stringify(migratedUser));
                localStorage.removeItem('googleAuthUser');
                return migratedUser;
            } catch(e) { /* ignore */ }
        }

        const localData = localStorage.getItem('user');
        if (localData) {
            try {
                return JSON.parse(localData);
            } catch(e) {
                return null;
            }
        }
        return null;
    });

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    const logout = () => {
        setUser(null);
    };

    return (
        <UserContext.Provider value={{
            user,
            setUser,
            logout
        }}>
            {children}
        </UserContext.Provider>
    );
};
