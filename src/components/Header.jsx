import React, { useState } from 'react';
import { Menu, ShoppingBag, Sun, Moon, X, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { Link } from 'react-router-dom';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { favorites } = useFavorites();
    const { getCartCount } = useCart();
    const { user } = useUser();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <Link to="/" className="text-2xl font-bold font-heading tracking-wider">
                        LEGACY TRACES
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-8 items-center font-medium ">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <Link to="/shop" className="hover:text-primary transition-colors">Shop</Link>
                        <Link to="/customize" className="hover:text-primary transition-colors">Customize</Link>
                        <Link to="/about" className="hover:text-primary transition-colors">Our Story</Link>
                        <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            {theme === 'light' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <Link to="/favorites" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Heart size={20} />
                            {favorites.length > 0 && (
                                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {favorites.length}
                                </span>
                            )}
                        </Link>

                        <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <ShoppingBag size={20} />
                            {getCartCount() > 0 && (
                                <span className="absolute top-0 right-0 bg-primary text-black text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                    {getCartCount()}
                                </span>
                            )}
                        </Link>
                        
                        {user ? (
                            <>
                                {user?.email === "legacytraces24@gmail.com" && (
                                    <Link to="/admin" className="hidden md:flex items-center justify-center px-4 py-1.5 text-sm font-bold bg-black text-white dark:bg-white dark:text-black rounded-full hover:opacity-80 transition-opacity">
                                        Admin Dashboard
                                    </Link>
                                )}
                                <Link to="/profile" className="w-8 h-8 rounded-full bg-primary text-black font-bold flex items-center justify-center text-sm shadow-sm hover:scale-105 transition-transform">
                                    {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                                </Link>
                            </>
                        ) : (
                            <Link to="/profile" className="hidden md:flex items-center justify-center px-4 py-1.5 text-sm font-bold bg-primary text-black rounded-full hover:bg-green-400 transition-colors">
                                Login
                            </Link>
                        )}

                        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-[998] md:hidden transition-opacity"
                        onClick={() => setIsMenuOpen(false)}
                    />
                )}

                {/* Mobile Menu */}
                <div 
                    className={`fixed top-0 bottom-0 left-0 w-[80%] max-w-[320px] min-h-[100dvh] z-[999] bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col overflow-hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    <div className="p-5 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 shrink-0">
                        <h2 className="text-xl font-bold font-heading text-black dark:text-white">MENU</h2>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0">
                            <X size={24} />
                        </button>
                    </div>
                    <nav className="flex flex-col p-6 gap-6 font-medium overflow-y-auto flex-1">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="block text-xl text-black dark:text-white hover:text-primary transition-colors">Home</Link>
                        <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="block text-xl text-black dark:text-white hover:text-primary transition-colors">Shop</Link>
                        <Link to="/customize" onClick={() => setIsMenuOpen(false)} className="block text-xl text-black dark:text-white hover:text-primary transition-colors">Customize</Link>
                        <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block text-xl text-black dark:text-white hover:text-primary transition-colors">Our Story</Link>
                        <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="block text-xl text-black dark:text-white hover:text-primary transition-colors">Contact</Link>
                        {!user && (
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block text-xl text-primary font-bold transition-colors mt-4">Login / Register</Link>
                        )}
                        {user?.email === "legacytraces24@gmail.com" && (
                            <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block text-xl text-black dark:text-white font-bold hover:text-primary transition-colors mt-4">
                                🛡️ Admin Dashboard
                            </Link>
                        )}
                    </nav>
                </div>
            </header>
        </>
    );
};

export default Header;
