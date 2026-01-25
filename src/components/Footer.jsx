import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-50 dark:bg-[#1e1e1e] border-t border-gray-200 dark:border-gray-800 mt-auto pt-12 pb-8 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                    <div className="md:w-1/3">
                        <h3 className="text-2xl font-bold font-heading mb-4">LEGACY TRACES</h3>
                        <p className="text-gray-500 mb-6 leading-relaxed">
                            Premium streetwear for the modern generation. Quality, style, and comfort in every stitch.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary hover:text-white transition-colors"><Facebook size={20} /></a>
                            <a href="https://www.instagram.com/legacy_traces_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target='_blank' className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary hover:text-white transition-colors"><Instagram size={20} /></a>
                            <a href="#" className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary hover:text-white transition-colors"><Twitter size={20} /></a>
                        </div>
                    </div>

                    <div className="md:w-1/6">
                        <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Shop</h4>
                        <ul className="space-y-2 text-gray-500">
                            <li><Link to="/shop" className="hover:text-primary transition-colors">Men</Link></li>
                            <li><Link to="/shop" className="hover:text-primary transition-colors">Women</Link></li>
                            <li><Link to="/shop" className="hover:text-primary transition-colors">New Arrivals</Link></li>
                            <li><Link to="/shop" className="hover:text-primary transition-colors">Best Sellers</Link></li>
                        </ul>
                    </div>

                    <div className="md:w-1/6">
                        <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Support</h4>
                        <ul className="space-y-2 text-gray-500">
                            <li><a href="#" className="hover:text-primary transition-colors">Track Order</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Returns & Exchanges</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Shipping Policy</a></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div className="md:w-1/3">
                        <h4 className="font-bold mb-4 uppercase tracking-wider text-sm">Newsletter</h4>
                        <p className="text-gray-500 mb-4 text-sm">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:border-primary"
                            />
                            <button className="bg-primary text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors">
                                JOIN
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Legacy Traces. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
