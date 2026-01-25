import React, { useState, useRef } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Twitter, Facebook, CheckCircle2, AlertCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';
import SEO from '../components/SEO';

const Contact = () => {
    const form = useRef();
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSending(true);
        setStatus({ type: '', message: '' });

        // EmailJS integration
        // Note: These should ideally be in environment variables (VITE_EMAILJS_SERVICE_ID, etc.)
        const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_placeholder';
        const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_placeholder';
        const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'public_key_placeholder';

        try {
            await emailjs.sendForm(
                serviceId,
                templateId,
                form.current,
                publicKey
            );
            setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' });
            form.current.reset();
        } catch (error) {
            console.error('EmailJS Error:', error);
            setStatus({ type: 'error', message: 'Failed to send message. Please try again later or email us directly.' });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 mt-8 max-w-6xl">
            <SEO
                title="Contact Legacy Traces"
                description="Get in touch with Legacy Traces for inquiries about orders, sizing, or custom requests."
            />
            {/* Heading Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">GET IN TOUCH</h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                    Have a question about your order, sizing, or a custom request? Shoot us a message.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Contact Information & Socials */}
                <div className="space-y-12">
                    <div className="space-y-8">
                        <div className="flex gap-6">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Address</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    20/60, Sakthi Nagar, T Nagar, Ramanathapuram,<br />
                                    Coimbatore, Tamil Nadu 641045
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-2">Email</h3>
                                <a href="mailto:legacytraces24@gmail.com" className="text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                                    legacytraces24@gmail.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                        <h3 className="font-bold text-lg mb-6">Social Media</h3>
                        <div className="flex gap-6">
                            <a
                                href="https://www.instagram.com/legacy_traces_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-black transition-all group"
                            >
                                <Instagram size={24} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a
                                href="https://twitter.com/legacytraces"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-black transition-all group"
                            >
                                <Twitter size={24} className="group-hover:scale-110 transition-transform" />
                            </a>
                            <a
                                href="https://facebook.com/legacytraces"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-primary hover:text-black transition-all group"
                            >
                                <Facebook size={24} className="group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="bg-white dark:bg-gray-900/50 p-8 md:p-10 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/50 dark:shadow-none">
                    <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="user_name" className="text-sm font-bold ml-1">Name</label>
                                <input
                                    type="text"
                                    id="user_name"
                                    name="user_name"
                                    required
                                    placeholder="Your full name"
                                    className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="user_email" className="text-sm font-bold ml-1">Email</label>
                                <input
                                    type="email"
                                    id="user_email"
                                    name="user_email"
                                    required
                                    placeholder="Your email address"
                                    className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="subject" className="text-sm font-bold ml-1">Subject</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                required
                                placeholder="What is this regarding?"
                                className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-bold ml-1">Message</label>
                            <textarea
                                id="message"
                                name="message"
                                required
                                rows="5"
                                placeholder="Tell us more about your inquiry..."
                                className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                            ></textarea>
                        </div>

                        {status.message && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <p className="text-sm font-medium">{status.message}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSending}
                            className={`w-full py-5 rounded-2xl bg-black dark:bg-primary text-white dark:text-black font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isSending ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin"></div>
                                    SENDING...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    SEND MESSAGE
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
