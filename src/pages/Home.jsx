import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ProductCarousel from '../components/ProductCarousel';
import { fetchProducts } from '../api/api';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts().then(data => {
            setProducts(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // For now, using the same product list for all sections as requested
    // In future, this can be filtered by 'New', 'Trending', etc.

    return (
        <main>
            <Hero />
            <ProductCarousel title="Trending Now" products={products} />
            <ProductCarousel title="New Arrivals" products={products} />
            <ProductCarousel title="Best Sellers" products={products} />
        </main>
    );
};

export default Home;
