import React, { useState } from 'react';
import { Menu, ShoppingBag, Sun, Moon, X, Heart } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Header = () => {
    const { theme, toggleTheme } = useTheme();
    const { favorites } = useFavorites();
    const { getCartCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <>
            <style>{`


@media only screen and (max-width: 600px) {

      .mobileStyle {
                   background-color: black; 
                }
}

@media only screen and (min-width: 600px) {
      .mobileStyle {
                   background-color: black; 
                }
}
          
            `}</style>
            <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
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
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
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

                        <button className="md:hidden p-2" onClick={() => setIsMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div className={`fixed inset-0 bg-gray-50 dark:bg-gray-900 z-[60] transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e]">
                        <h2 className="text-xl font-bold font-heading text-black dark:text-white">MENU</h2>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 text-black dark:text-white">
                            <X size={24} />
                        </button>
                    </div>
                    <nav className="flex flex-col p-4 gap-2 text-lg font-medium mobileStyle">
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="block p-4 text-black dark:text-white hover:text-primary transition-colors border-b border-gray-200 dark:border-gray-800 last:border-none">Home</Link>
                        <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="block p-4 text-black dark:text-white hover:text-primary transition-colors border-b border-gray-200 dark:border-gray-800 last:border-none">Shop</Link>
                        <Link to="/customize" onClick={() => setIsMenuOpen(false)} className="block p-4 text-black dark:text-white hover:text-primary transition-colors border-b border-gray-200 dark:border-gray-800 last:border-none">Customize</Link>
                        <Link to="/about" onClick={() => setIsMenuOpen(false)} className="block p-4 text-black dark:text-white hover:text-primary transition-colors border-b border-gray-200 dark:border-gray-800 last:border-none">Our Story</Link>
                    </nav>
                </div>
            </header>
        </>
    );
};

export default Header;
