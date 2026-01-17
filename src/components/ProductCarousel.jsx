import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';

const ProductCarousel = ({ title, products = [] }) => {
    if (!products.length) return null;

    return (
        <section className="container mx-auto px-4 mt-16">
            <div className="flex justify-between items-end mb-8">
                <h2 className="text-3xl font-heading font-bold">{title}</h2>
                <Link to="/shop" className="text-primary font-medium hover:underline">View All</Link>
            </div>

            <Swiper
                slidesPerView={1.5}
                spaceBetween={16}
                navigation={true}
                modules={[Navigation]}
                breakpoints={{
                    640: {
                        slidesPerView: 2.5,
                        spaceBetween: 20,
                    },
                    768: {
                        slidesPerView: 3.5,
                        spaceBetween: 24,
                    },
                    1024: {
                        slidesPerView: 4,
                        spaceBetween: 24,
                    },
                }}
                className="product-swiper !pb-10 !px-2"
            >
                {products.map((product) => (
                    <SwiperSlide key={product.ID}>
                        <ProductCard product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default ProductCarousel;
