import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchProductById, fetchProducts, getImageUrl } from '../api/api';
import { ShoppingCart, Heart, Share2, Truck } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';
import SizeChartDrawer from '../components/SizeChartDrawer';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import SharePopup from '../components/SharePopup';
import FeedbackSection from '../components/FeedbackSection';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [pincode, setPincode] = useState('');
    const [pincodeStatus, setPincodeStatus] = useState(null); // 'success', 'error', 'failure'
    const [showCartToast, setShowCartToast] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();
    const { addToCart } = useCart();

    const handlePincodeChange = (e) => {
        const val = e.target.value;
        // Allow numbers only, max 6 digits
        if (/^\d*$/.test(val) && val.length <= 6) {
            setPincode(val);
            if (pincodeStatus) setPincodeStatus(null);
        }
    };

    const checkPincode = (e) => {
        e.preventDefault();
        if (!pincode || pincode.length < 6) {
            setPincodeStatus('error');
            return;
        }

        // Availability Logic: 6 digits starting with 1-9 is available
        // 6 digits starting with 0 is "not available" to show failure state
        if (pincode.startsWith('0')) {
            setPincodeStatus('failure');
        } else {
            setPincodeStatus('success');
        }
    };

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
                    <div className="flex justify-between items-start mb-4">
                        <h1 className="text-4xl font-heading font-bold">{product.Name}</h1>
                        <div className="relative">
                            <button
                                onClick={() => setIsShareOpen(!isShareOpen)}
                                className={`p-2 rounded-full transition-colors ${isShareOpen ? 'bg-primary text-black' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-black dark:hover:text-white'}`}
                            >
                                <Share2 size={24} />
                            </button>
                            <SharePopup
                                isOpen={isShareOpen}
                                onClose={() => setIsShareOpen(false)}
                                productName={product.Name}
                                productUrl={window.location.href}
                            />
                        </div>
                    </div>
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
                    <div className="space-y-3 mb-8">
                        <div className="flex gap-4">
                            <button
                                disabled={!selectedSize}
                                onClick={() => {
                                    if (selectedSize) {
                                        addToCart(product, selectedSize);
                                        setShowCartToast(true);
                                        setTimeout(() => setShowCartToast(false), 3000);
                                    }
                                }}
                                className={`flex-1 font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all ${selectedSize
                                    ? 'bg-primary text-black hover:bg-green-400'
                                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                <ShoppingCart size={20} /> {selectedSize ? 'ADD TO CART' : 'SELECT SIZE'}
                            </button>
                            <button
                                onClick={() => toggleFavorite(product)}
                                className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-colors
                    ${favorite ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}
                            >
                                <Heart fill={favorite ? "currentColor" : "none"} />
                            </button>
                        </div>
                        {!selectedSize && (
                            <p className="text-red-500 text-sm font-medium animate-pulse">
                                Please select a size to add this product to your cart.
                            </p>
                        )}
                    </div>

                    {/* Delivery */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl mb-8 border border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-2 font-bold mb-4">
                            <Truck size={20} className="text-primary" /> Delivery Availability
                        </div>
                        <form onSubmit={checkPincode} className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={pincode}
                                onChange={handlePincodeChange}
                                placeholder="Enter Pincode"
                                className={`flex-1 bg-white dark:bg-gray-900 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${pincodeStatus === 'error' ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                    }`}
                                maxLength={6}
                                inputMode="numeric"
                            />
                            <button
                                type="submit"
                                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
                            >
                                CHECK
                            </button>
                        </form>

                        <AnimatePresence mode="wait">
                            {pincodeStatus === 'error' && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2 text-red-500 font-medium text-sm"
                                >
                                    <span>⚠️ Please enter a valid 6-digit pincode</span>
                                </motion.div>
                            )}
                            {pincodeStatus === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-sm"
                                >
                                    <span>🚚 Delivery available to this location ✅</span>
                                </motion.div>
                            )}
                            {pincodeStatus === 'failure' && (
                                <motion.div
                                    key="failure"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-1"
                                >
                                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-sm">
                                        <span>Delivery not available to this location 😔</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 pl-0">
                                        Please reach our <Link to="/contact" className="text-primary underline font-bold">customer support</Link> for more information
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Share moved to top */}
                </div>
            </div>

            {/* Size Chart Drawer */}
            <SizeChartDrawer
                isOpen={isSizeChartOpen}
                onClose={() => setIsSizeChartOpen(false)}
                productType={['TY001', 'TY002', 'TY003'].includes(product.Type) ? 'T-Shirt' : product.Type}
            />

            {/* Feedback & Ratings */}
            <FeedbackSection productId={product.ID} />

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

            {/* Add to Cart Toast Container */}
            <div className="fixed top-24 left-0 right-0 md:left-auto md:right-8 z-50 flex justify-center md:justify-end pointer-events-none px-4">
                <AnimatePresence>
                    {showCartToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white dark:bg-gray-800 text-black dark:text-white px-6 py-4 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 pointer-events-auto flex items-center gap-3"
                        >
                            <span className="text-xl">✅</span>
                            <span className="font-medium text-sm md:text-base">Product added to cart successfully</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProductDetails;
