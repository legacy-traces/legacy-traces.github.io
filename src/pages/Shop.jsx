import React, { useEffect, useState } from 'react';
import { fetchAllData } from '../api/api';
import ProductCard from '../components/ProductCard';
import { Filter, X } from 'lucide-react';
import SEO from '../components/SEO';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [collections, setCollections] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedCollection, setSelectedCollection] = useState('All');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortOrder, setSortOrder] = useState('default'); // default, lowToHigh, highToLow
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        fetchAllData().then(data => {
            setProducts(data.product || []);
            setCollections(data.collection || []);
            setCategories(data.category || []);
            setLoading(false);
        });
    }, []);

    // Filter and Sort Logic
    const filteredProducts = products
        .filter(product => {
            const matchCollection = selectedCollection === 'All' || product.Collection === selectedCollection;
            const matchCategory = selectedCategory === 'All' || product.Type === selectedCategory;
            return matchCollection && matchCategory;
        })
        .sort((a, b) => {
            if (sortOrder === 'lowToHigh') return a.Price - b.Price;
            if (sortOrder === 'highToLow') return b.Price - a.Price;
            return 0;
        });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <SEO
                title="Shop Tamil Culture Streetwear | Legacy Traces"
                description="Browse our exclusive collection of Tamil culture inspired streetwear. Find the perfect t-shirt, hoodie, or customized apparel."
            />
            <div className="flex flex-col md:flex-row gap-8">
                {/* Mobile Filter Toggle */}
                <button
                    className="md:hidden flex items-center gap-2 font-bold border p-2 rounded"
                    onClick={() => setIsFilterOpen(true)}
                >
                    <Filter size={20} /> Filters
                </button>

                {/* Sidebar Filters */}
                <aside className={`fixed inset-0 bg-white dark:bg-[#121212] z-50 p-6 overflow-y-auto transition-transform duration-300 md:relative md:translate-x-0 md:w-1/4 md:bg-transparent md:p-0 md:z-0 ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex justify-between items-center mb-6 md:hidden">
                        <h2 className="text-xl font-bold">Filters</h2>
                        <button onClick={() => setIsFilterOpen(false)}><X size={24} /></button>
                    </div>

                    <div className="space-y-8">
                        {/* Collections */}
                        <div>
                            <h3 className="font-bold text-lg mb-4 font-heading">Collections</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="collection"
                                        checked={selectedCollection === 'All'}
                                        onChange={() => setSelectedCollection('All')}
                                        className="accent-primary"
                                    />
                                    <span>All Collections</span>
                                </label>
                                {collections.map(col => (
                                    <label key={col.ID} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="collection"
                                            checked={selectedCollection === col.ID}
                                            onChange={() => setSelectedCollection(col.ID)}
                                            className="accent-primary"
                                        />
                                        <span>{col.Name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <h3 className="font-bold text-lg mb-4 font-heading">Categories</h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="category"
                                        checked={selectedCategory === 'All'}
                                        onChange={() => setSelectedCategory('All')}
                                        className="accent-primary"
                                    />
                                    <span>All Categories</span>
                                </label>
                                {categories.map(cat => (
                                    <label key={cat.ID} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="category"
                                            checked={selectedCategory === cat.ID}
                                            onChange={() => setSelectedCategory(cat.ID)}
                                            className="accent-primary"
                                        />
                                        <span>{cat.Name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        className="md:hidden mt-8 w-full bg-primary text-black font-bold py-3 rounded-lg"
                        onClick={() => setIsFilterOpen(false)}
                    >
                        Apply Filters
                    </button>
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold font-heading">Shop All</h1>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="bg-transparent border border-gray-300 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-primary"
                        >
                            <option value="default">Sort by: Featured</option>
                            <option value="lowToHigh">Price: Low to High</option>
                            <option value="highToLow">Price: High to Low</option>
                        </select>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            No products found matching your filters.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.ID} product={product} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Shop;
