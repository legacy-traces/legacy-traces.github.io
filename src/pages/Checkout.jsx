import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { CheckCircle2 } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { saveCustomer, saveOrder, fetchUserDetails } from '../api/api';
import { useUser } from '../context/UserContext';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user, setUser } = useUser();
    
    // Step State: 1 = Login, 2 = Details, 3 = Summary
    const [step, setStep] = useState(1);
    
    // Form State
    const [formData, setFormData] = useState({
        mobileNumber: '',
        fullName: '',
        email: '',
        address: '',
        pincode: ''
    });

    const [errors, setErrors] = useState({});
    const [authError, setAuthError] = useState('');
    const [isCod, setIsCod] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [isSavingDetails, setIsSavingDetails] = useState(false);

    useEffect(() => {
        setTimeout(() => setPageLoading(false), 800);
    }, []);

    const formatProductList = (items) => {
        return items.map(item => `${item.Name} (Size: ${item.size}, Qty: ${item.quantity})`).join("\n");
    };

    const getDeliveryDetails = (pincode) => {
        if (!pincode) return { charge: 0, message: "", error: null };
        if (!/^\d{6}$/.test(pincode)) {
            return { error: "Enter a valid 6-digit pincode", charge: 0, message: "" };
        }

        const prefix = pincode.substring(0, 2);

        if (["60","61","62","63","64"].includes(prefix)) {
            return { charge: 0, message: "Free Delivery available 🎉", isCod: true };
        }

        if (
            ["50","51","52","53","54","55","56","57","58","59",
             "66","67","68","69"].includes(prefix)
        ) {
            return { charge: 50, message: "₹50 delivery charges applied 🚚", isCod: false };
        }

        return {
            charge: 0,
            message: "Additional courier charges may apply. Our sales agent will contact you with exact details.",
            isCod: false
        };
    };

    const deliveryDetails = getDeliveryDetails(formData.pincode);
    const isPincodeValid = !deliveryDetails.error && /^\d{6}$/.test(formData.pincode);
    const deliveryCharge = isPincodeValid ? deliveryDetails.charge : 0;
    const isFreeDelivery = isPincodeValid && deliveryCharge === 0 && deliveryDetails.message?.includes("Free");
    const isCodAvailable = isPincodeValid && deliveryDetails.isCod;

    const subtotal = getCartTotal();
    const codCharge = isCod ? 70 : 0;
    const finalTotal = subtotal + deliveryCharge + codCharge;

    useEffect(() => {
        if (!isCodAvailable) {
            setIsCod(false);
        }
    }, [isCodAvailable, formData.pincode]);

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate]);

    useEffect(() => {
        // Auto-fill from global user context if authenticated
        if (user && user.email) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                email: user.email || '',
                mobileNumber: user.phone || '',
                address: user.address || ''
            }));
            setStep(2); // Skip login if already authenticated globally

            // Dynamically fetch latest details from DB
            fetchUserDetails(user.email).then(customer => {
                if (customer) {
                    setFormData(prev => ({
                        ...prev,
                        fullName: customer.name || prev.fullName,
                        mobileNumber: customer.phoneNumber ? String(customer.phoneNumber) : prev.mobileNumber,
                        address: customer.address || prev.address
                    }));
                }
            }).catch(err => console.error("Failed to autopopulate:", err));
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error on type
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleLoginSuccess = async (credentialResponse) => {
        try {
            const decoded = jwtDecode(credentialResponse.credential);
            
            const newUser = {
                email: decoded.email,
                name: decoded.name,
                phone: "",
                address: ""
            };
            
            setUser(newUser);
            
            setFormData(prev => ({
                ...prev,
                fullName: decoded.name,
                email: decoded.email
            }));
            
            if (decoded.email) {
                await saveCustomer(newUser);
            }
            
            setAuthError('');
            // Move to Details
            setStep(2);
        } catch (error) {
            console.error(error);
            setAuthError('Authentication failed parsing token.');
        }
    };

    const handleLoginError = () => {
        setAuthError('Google Sign-In failed. Please try again.');
    };

    const validateStep2 = () => {
        const newErrors = {};
        if (!formData.fullName?.trim()) newErrors.fullName = 'Full Name is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
        if (!/^\d{10}$/.test(formData.mobileNumber)) newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
        if (!formData.address?.trim()) newErrors.address = 'Address is required';
        if (!/^\d{6}$/.test(formData.pincode)) newErrors.pincode = 'Enter a valid 6-digit pincode';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleDetailsSubmit = async (e) => {
        e.preventDefault();
        if (validateStep2()) {
            setIsSavingDetails(true);
            try {
                if (formData.email && formData.mobileNumber.length === 10 && formData.address) {
                    const updatedPayload = {
                        email: formData.email,
                        name: formData.fullName,
                        phone: formData.mobileNumber,
                        address: formData.address
                    };
                    setUser(updatedPayload);
                    await saveCustomer(updatedPayload);
                }
                setStep(3);
            } finally {
                setIsSavingDetails(false);
            }
        }
    };

    const handlePlaceOrder = async () => {
        if (!formData.email || !formData.fullName || !formData.mobileNumber || !formData.address) {
            alert("Please fill all required details");
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        setIsPlacingOrder(true);

        const productListFormatted = formatProductList(cartItems);

        const totalTshirts = cartItems.reduce((total, item) => {
            return total + Number(item.quantity || 0);
        }, 0);

        const orderData = {
            email: formData.email,
            name: formData.fullName,
            mobile: formData.mobileNumber,
            address: `${formData.address}, Pincode: ${formData.pincode}`,
            productList: productListFormatted,
            cod: isCod ? "Yes" : "No",
            orderStatus: "New",
            trackingId: "N/A",
            totalTshirts,
            amountPaid: finalTotal
        };

        try {
            await saveOrder(orderData);

            setShowMessage(true);

            // Construct WhatsApp message
            let text = `*Order Details:*\n\n`;
            text += `*Name:* ${formData.fullName}\n`;
            text += `*Phone:* ${formData.mobileNumber}\n`;
            text += `*Email:* ${formData.email}\n`;
            text += `*Address:* ${formData.address}\n`;
            text += `*Pincode:* ${formData.pincode}\n\n`;
            
            text += `*Products:*\n${productListFormatted}\n`;
            
            text += `\n*Charges:*\n`;
            text += `Subtotal: ₹${subtotal}\n`;
            text += `Delivery Charge: ${isFreeDelivery ? 'Free' : (deliveryCharge > 0 ? '₹' + deliveryCharge : 'TBD')}\n`;
            if (isCod) {
                text += `COD: ₹70\n`;
            }
            text += `\n*Total Amount:* ₹${finalTotal}`;

            const encodedMessage = encodeURIComponent(text);
            const waNumber = '919360685192'; 
            const url = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodedMessage}`;

            setTimeout(() => {
                window.open(url, "_blank");
                clearCart();
                setIsPlacingOrder(false);
            }, 1200);

        } catch (error) {
            console.error("Failed to place order:", error);
            setIsPlacingOrder(false);
            alert("Failed to place order. Please try again.");
        }
    };

    const steps = [
        { id: 1, title: 'Login' },
        { id: 2, title: 'Details' },
        { id: 3, title: 'Summary' }
    ];

    if (cartItems.length === 0) return null; // handled by useEffect redirect

    return (
        <div className="container mx-auto px-4 py-8 mb-20 max-w-2xl min-h-[70vh]">
            <h1 className="text-3xl font-heading font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-600">
                Secure Checkout
            </h1>

            {/* Progress Indicator */}
            <div className="mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 -translate-y-1/2 rounded-full z-0"></div>
                <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-500 ease-in-out"
                    style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
                
                <div className="flex justify-between relative z-10 w-full px-2">
                    {steps.map((s, index) => (
                        <div key={s.id} className="flex flex-col items-center gap-2">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300
                                ${step >= s.id 
                                    ? 'bg-primary text-black' 
                                    : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-400'}`}
                            >
                                {step > s.id ? <CheckCircle2 size={20} /> : s.id}
                            </div>
                            <span className={`text-xs font-semibold hidden md:block transition-colors duration-300
                                ${step >= s.id ? 'text-black dark:text-white' : 'text-gray-400'}`}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Form Steps */}
            <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative min-h-[400px]">
                {pageLoading ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[300px] animate-pulse">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
                        <div className="w-48 h-6 bg-gray-200 dark:bg-gray-800 rounded-md mb-2"></div>
                        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
                    </div>
                ) : (
                <AnimatePresence mode="wait">
                    {/* Step 1: Login */}
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6 flex flex-col items-center justify-center min-h-[300px]"
                        >
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold mb-2">Login or Signup</h2>
                                <p className="text-gray-500 dark:text-gray-400">Continue with Google to auto-fill your details.</p>
                            </div>
                            
                            <div className="w-full flex justify-center mt-4">
                                <GoogleLogin
                                    onSuccess={handleLoginSuccess}
                                    onError={handleLoginError}
                                    useOneTap
                                    shape="rectangular"
                                    size="large"
                                    text="continue_with"
                                />
                            </div>

                            {authError && (
                                <p className="text-red-500 text-sm mt-4 text-center">{authError}</p>
                            )}
                        </motion.div>
                    )}

                    {/* Step 2: Details Input */}
                    {step === 2 && (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleDetailsSubmit}
                            className="space-y-4"
                        >
                            <h2 className="text-2xl font-bold mb-6">Shipping Details</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Full Name</label>
                                    <input 
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                                    />
                                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email Address</label>
                                    <input 
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        readOnly
                                        className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 focus:outline-none text-gray-500 cursor-not-allowed"
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                            </div>
                            
                            {/* Mobile Number */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Mobile Number</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                                    <input 
                                        type="tel"
                                        name="mobileNumber"
                                        value={formData.mobileNumber}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) handleInputChange({ target: { name: 'mobileNumber', value: val } });
                                        }}
                                        className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.mobileNumber ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl py-3 pl-14 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                                        placeholder="10-digit number"
                                    />
                                </div>
                                {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Complete Address</label>
                                <textarea 
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="House/Flat No., Street Name, Area..."
                                    rows="3"
                                    className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.address ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none`}
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>

                            {/* Pincode */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Pincode</label>
                                <input 
                                    type="text"
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 6) handleInputChange({ target: { name: 'pincode', value: val } });
                                    }}
                                    placeholder="6-digit Pincode"
                                    className={`w-full bg-gray-50 dark:bg-gray-900 border ${errors.pincode ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
                                />
                                <AnimatePresence>
                                    {isPincodeValid && !errors.pincode && deliveryDetails.message && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <p className={`text-sm mt-2 font-medium ${isFreeDelivery ? 'text-green-500' : 'text-orange-500'}`}>
                                                {deliveryDetails.message}
                                            </p>
                                        </motion.div>
                                    )}
                                    {formData.pincode.length > 0 && !isPincodeValid && !errors.pincode && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-red-500 text-xs mt-1">
                                                {deliveryDetails.error}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                            </div>
                            
                            <div className="pt-4 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setUser(null);
                                        setFormData(prev => ({ ...prev, fullName: '', email: '', mobileNumber: '', address: '' }));
                                        setStep(1);
                                    }}
                                    className="px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    LOGOUT
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSavingDetails}
                                    className="flex-1 py-4 bg-primary text-black font-bold rounded-xl hover:bg-green-400 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSavingDetails ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                            SAVING...
                                        </>
                                    ) : (
                                        'PROCEED TO SUMMARY'
                                    )}
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {/* Step 3: Summary */}
                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                            
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                                <h3 className="font-bold text-gray-500 dark:text-gray-400 text-sm mb-3 uppercase tracking-wider">Products</h3>
                                <div className="space-y-3 divide-y divide-gray-200 dark:divide-gray-800">
                                    {cartItems.map((item, idx) => (
                                        <div key={idx} className="flex justify-between py-2 first:pt-0 last:pb-0">
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm line-clamp-1">{item.Name}</p>
                                                <p className="text-xs text-gray-500">Size: {item.size} × {item.quantity}</p>
                                            </div>
                                            <p className="font-bold whitespace-nowrap ml-4">₹{item.Price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-black dark:text-white">₹{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600 dark:text-gray-400">
                                        <span>Delivery Charge {isFreeDelivery ? '🎉' : (!isFreeDelivery && deliveryCharge === 0 ? '' : '🚚')}</span>
                                        <span className={`font-bold ${isFreeDelivery ? 'text-green-500' : 'text-black dark:text-white'}`}>
                                            {isFreeDelivery ? 'Free' : (deliveryCharge > 0 ? `₹${deliveryCharge}` : 'TBD')}
                                        </span>
                                    </div>
                                    
                                    <AnimatePresence>
                                        {isCodAvailable && (
                                            <motion.div 
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <label className="flex items-center justify-between cursor-pointer p-3 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg mt-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                                                    <div className="flex items-center gap-2">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary accent-primary"
                                                            checked={isCod}
                                                            onChange={(e) => setIsCod(e.target.checked)}
                                                        />
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">Cash on Delivery available (+₹70)</span>
                                                    </div>
                                                    {isCod && <span className="font-bold text-black dark:text-white">₹70</span>}
                                                </label>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span className="text-primary text-xl">₹{finalTotal}</span>
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {showMessage && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 p-4 rounded-xl flex items-center justify-center gap-3 font-bold shadow-sm"
                                    >
                                        <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                                        Redirecting to WhatsApp to complete your order 🛒
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!showMessage && (
                                <div className="bg-blue-50 dark:bg-[#1a2332] text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm border border-blue-100 dark:border-[#2a3648]">
                                    <p className="font-semibold mb-1">Next Step</p>
                                    <p>You will be redirected to WhatsApp to confirm and place your order securely with all details pre-filled.</p>
                                </div>
                            )}

                            <div className="pt-2 flex gap-4 flex-wrap sm:flex-nowrap">
                                <button 
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full sm:w-auto px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                >
                                    EDIT DETAILS
                                </button>
                                <button 
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacingOrder}
                                    className="flex-1 py-4 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1ebe57] transition-colors shadow-lg shadow-[#25D366]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isPlacingOrder ? 'PLACING ORDER...' : 'PLACE ORDER ON WHATSAPP'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                )}
            </div>
        </div>
    );
};

export default Checkout;
