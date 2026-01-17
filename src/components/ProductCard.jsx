import React from 'react';
import { ShoppingCart, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { getImageUrl } from '../api/api';

const ProductCard = ({ product }) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorite = isFavorite(product.ID);

    return (
        <div className="group bg-white dark:bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative h-full flex flex-col">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(product);
                }}
                className={`absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm transition-colors ${favorite ? 'text-red-500' : 'text-gray-500 hover:text-red-500'}`}
            >
                <Heart size={18} fill={favorite ? "currentColor" : "none"} />
            </button>

            <Link to={`/product/${product.ID}`} className="block relative pt-[125%] overflow-hidden">
                <img
                    src={`https://lh3.googleusercontent.com/d/${product['Primary Image']}?authuser=1/view`}
                    alt={product.Name}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                />
            </Link>

            <div className="p-4 flex flex-col flex-grow">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.Type}</div>
                <Link to={`/product/${product.ID}`} className="block">
                    <h3 className="font-heading font-bold text-lg mb-2 truncate group-hover:text-primary transition-colors">{product.Name}</h3>
                </Link>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg">₹{product.Price}</span>
                    </div>
                </div>


                <button className="w-full mt-4 py-2 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                    <ShoppingCart size={16} /> Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ProductCard;
