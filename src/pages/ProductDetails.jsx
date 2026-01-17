import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById, getImageUrl } from '../api/api';
import { ShoppingCart, Heart, Share2, Truck } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [mainImage, setMainImage] = useState('');
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addToCart } = useCart();

    useEffect(() => {
        setLoading(true);
        fetchProductById(id).then((data) => {
            setProduct(data);
            if (data) {
                setMainImage(getImageUrl(data['Primary Image']));
            }
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

    const favorite = isFavorite(product.ID);

    // Parse gallery images
    const galleryImages = product['Gallery Images']
        ? product['Gallery Images'].split(',').map(imgId => getImageUrl(imgId.trim()))
        : [];

    // Default sizes
    const sizes = ["S", "M", "L", "XL", "XXL"];

    return (
        <div className="container mx-auto px-4 py-8 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Images */}
                <div className="space-y-4">
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img src={mainImage} alt={product.Name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        <button
                            onClick={() => setMainImage(getImageUrl(product['Primary Image']))}
                            className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 ${mainImage === getImageUrl(product['Primary Image']) ? 'border-primary' : 'border-transparent'}`}
                        >
                            <img src={getImageUrl(product['Primary Image'])} alt="Main" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                        {galleryImages.map((img, index) => (
                            <button
                                key={index}
                                onClick={() => setMainImage(img)}
                                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 ${mainImage === img ? 'border-primary' : 'border-transparent'}`}
                            >
                                <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="lg:pl-8">
                    <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider">{product.Type}</div>
                    <h1 className="text-4xl font-heading font-bold mb-4">{product.Name}</h1>
                    <div className="flex items-end gap-4 mb-6">
                        <span className="text-3xl font-bold text-primary">₹{product.Price}</span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed whitespace-pre-line">
                        {product.Description || product['Short description']}
                    </p>

                    {/* Size Selector */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold">Select Size</span>
                            <button className="text-sm text-primary underline">Size Chart</button>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold transition-all
                    ${selectedSize === size
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 mb-8">
                        <button
                            onClick={() => {
                                if (!selectedSize) {
                                    alert('Please select a size');
                                    return;
                                }
                                addToCart(product, selectedSize);
                            }}
                            className="flex-1 bg-primary text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-400 transition-colors"
                        >
                            <ShoppingCart /> ADD TO CART
                        </button>
                        <button
                            onClick={() => toggleFavorite(product)}
                            className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-colors
                ${favorite ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                        >
                            <Heart fill={favorite ? "currentColor" : "none"} />
                        </button>
                    </div>

                    {/* Delivery */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl mb-8">
                        <div className="flex items-center gap-2 font-bold mb-3">
                            <Truck size={20} /> Check Delivery
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter Pincode"
                                className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                            />
                            <button className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black font-bold rounded-lg">
                                CHECK
                            </button>
                        </div>
                    </div>

                    {/* Share */}
                    <div className="flex items-center gap-4 text-gray-500">
                        <span className="text-sm uppercase tracking-wider">Share:</span>
                        <button className="hover:text-primary"><Share2 size={20} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
