import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProductById, fetchProducts, getImageUrl } from '../api/api';
import { ShoppingCart, Heart, Share2, Truck } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import SizeChartDrawer from '../components/SizeChartDrawer';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addToCart } = useCart();

    useEffect(() => {
        setLoading(true);
        // Extract ID if it's in the slug--ID format
        const productId = id.includes('--') ? id.split('--').pop() : id;

        fetchProductById(productId).then((data) => {
            setProduct(data);
            if (data) {
                setCurrentImageIndex(0);
                // Fetch related products
                fetchProducts().then((allProducts) => {
                    const related = allProducts.filter(p =>
                        p.ID !== data.ID && (p.Type === data.Type || p.Collection === data.Collection)
                    ).slice(0, 4);
                    setRelatedProducts(related);
                });
            }
            setLoading(false);
        });
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

    const favorite = isFavorite(product.ID);

    // Consolidate all images
    const allImages = [
        getImageUrl(product['Primary Image']),
        ...(product['Gallery Images']
            ? product['Gallery Images'].split(',').map(imgId => getImageUrl(imgId.trim()))
            : [])
    ].filter(Boolean);

    // Default sizes
    const sizes = ["S", "M", "L", "XL", "XXL"];

    return (
        <div className="container mx-auto px-4 py-8 mt-8">
            <SEO
                title={`${product.Name} | Tamil Culture T-Shirt – Legacy Traces`}
                description={product['Short description'] || product.Description}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Images */}
                <div className="space-y-4">
                    <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                            src={allImages[currentImageIndex]}
                            alt={`${product.Name} – Tamil Culture T-Shirt`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                        {allImages.map((img, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setCurrentImageIndex(index)}
                                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === index ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}`}
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
                            {(product.Type === 'T-Shirt' || product.Name.toLowerCase().includes('shirt')) && (
                                <button
                                    type="button"
                                    onClick={() => setIsSizeChartOpen(true)}
                                    className="text-sm text-primary underline cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    Size Chart
                                </button>
                            )}
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

            {/* Size Chart Drawer */}
            <SizeChartDrawer
                isOpen={isSizeChartOpen}
                onClose={() => setIsSizeChartOpen(false)}
                productType={['TY001', 'TY002', 'TY003'].includes(product.Type) ? 'T-Shirt' : product.Type}
            />

            {/* Others Also Bought Section */}
            {relatedProducts.length > 0 && (
                <div className="mt-16 border-t pt-12">
                    <h2 className="text-3xl font-heading font-bold mb-8">Others Also Bought</h2>
                    <div className="flex overflow-x-auto pb-4 gap-6 scrollbar-hide md:grid md:grid-cols-4 md:overflow-visible">
                        {relatedProducts.map((p) => (
                            <div key={p.ID} className="flex-shrink-0 w-[280px] md:w-full">
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetails;
