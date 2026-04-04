import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { saveCustomer, fetchUserDetails } from '../api/api';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, ShieldCheck, Loader2, LogOut, Package } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'https://snowy-snowflake-732e.legacytracesdev.workers.dev/';

const Profile = () => {
    const { user, setUser, logout } = useUser();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: ''
    });
    
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (user) {
            // Set initial from local
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || ''
            });

            // Fetch from backend
            const fetchLatest = async () => {
                try {
                    setIsLoading(true);
                    const customer = await fetchUserDetails(user.email);
                    if (customer) {
                        setFormData({
                            name: customer.name || user.name || '',
                            phone: customer.phoneNumber ? String(customer.phoneNumber) : '',
                            address: customer.address || ''
                        });
                        setUser(prev => ({ 
                            ...prev, 
                            name: customer.name || prev.name || '', 
                            phone: customer.phoneNumber ? String(customer.phoneNumber) : '', 
                            address: customer.address || '' 
                        }));
                    }
                } catch (e) {
                    console.error("Silent fetch fail, relying on cache.", e);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchLatest();
        }
    }, [user?.email]); // Only trigger on mount/email change

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
            setError('');

            // Immediately hit backend as requested
            await saveCustomer(newUser);
            
        } catch (err) {
            console.error(err);
            setError('Google Login failed parsing token.');
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        // Validation
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
            setError('Phone number must be exactly 10 digits.');
            return;
        }
        if (!formData.address.trim()) {
            setError('Address cannot be empty.');
            return;
        }

        if (!formData.name.trim()) {
            setError('Name cannot be empty.');
            return;
        }

        setIsSaving(true);

        try {
            const payload = {
                email: user.email,
                name: formData.name.trim(),
                phone: cleanPhone,
                address: formData.address.trim()
            };

            // Call Backend
            await saveCustomer(payload);

            // Update Local State Global
            setUser(payload);
            setSuccessMsg('Profile updated successfully!');
            setTimeout(() => setSuccessMsg(''), 3000);

        } catch (err) {
            setError('Failed to save profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-20 min-h-[60vh] flex flex-col items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white dark:bg-[#1e1e1e] p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 text-center"
                >
                    <div className="w-16 h-16 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-bold font-heading mb-3">Welcome Back</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">Sign in with Google to securely access your profile and order history.</p>
                    
                    <div className="flex justify-center mb-4">
                        <GoogleLogin
                            onSuccess={handleLoginSuccess}
                            onError={() => setError('Google Sign-In failed.')}
                            useOneTap
                            theme="filled_black"
                            shape="pill"
                            size="large"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl min-h-[70vh]">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-bold font-heading bg-clip-text text-transparent bg-gradient-to-r from-primary to-green-600 mb-2">My Profile</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage your account details and shipping preferences.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        to="/orders"
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-bold px-4 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                        <Package size={16} />
                        <span className="hidden sm:inline">My Orders</span>
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 font-bold px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                {/* Avatar Header section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-10 border-b border-gray-100 dark:border-gray-800">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-green-400 text-black flex items-center justify-center text-4xl font-bold shadow-lg">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-center sm:text-left">
                        <h2 className="text-2xl font-bold">{user.name}</h2>
                        <span className="inline-flex items-center gap-2 text-gray-500 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full text-sm mt-2">
                            <ShieldCheck size={14} className="text-primary" />
                            Verified Customer
                        </span>
                    </div>
                </div>

                {isLoading && (
                    <div className="absolute top-4 right-4 text-primary animate-spin">
                        <Loader2 size={24} />
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Read-Only Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <User size={16} /> Full Name
                                </label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter your full name"
                                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Mail size={16} /> Email Address
                                </label>
                                <input 
                                    type="email"
                                    value={user.email}
                                    readOnly
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 text-gray-500 focus:outline-none cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Editable Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <Phone size={16} /> Mobile Number
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">+91</span>
                                    <input 
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 10) setFormData({ ...formData, phone: val });
                                        }}
                                        placeholder="10-digit mobile number"
                                        className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl py-3 pl-14 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                    <MapPin size={16} /> Shipping Address
                                </label>
                                <textarea 
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Enter complete shipping address..."
                                    rows="3"
                                    className="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-500/20">
                            {error}
                        </div>
                    )}
                    
                    {successMsg && (
                        <div className="p-4 bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400 rounded-xl text-sm font-medium border border-green-100 dark:border-green-500/20">
                            {successMsg}
                        </div>
                    )}

                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                        <button 
                            type="submit"
                            disabled={isSaving}
                            className="bg-primary text-black font-bold py-3 px-8 rounded-xl hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[140px] justify-center shadow-lg shadow-primary/20"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Profile'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
