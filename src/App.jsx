import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Customize from './pages/Customize';
import Favorites from './pages/Favorites';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import ShippingPolicy from './pages/ShippingPolicy';
import Checkout from './pages/Checkout';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import ScrollToTop from './components/ScrollToTop';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <UserProvider>
      <CartProvider>
        <ScrollToTop />
      <div className="app min-h-screen flex flex-col bg-white dark:bg-[#121212] text-black dark:text-white transition-colors duration-300">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/customize" element={<Customize />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
        </Routes>
        <Footer />
      </div>
      </CartProvider>
    </UserProvider>
  );
}

export default App;
