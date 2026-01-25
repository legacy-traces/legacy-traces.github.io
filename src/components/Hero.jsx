import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { fetchBanners } from '../api/api';
import { Link } from 'react-router-dom';

const Hero = () => {
    const [banners, setBanners] = useState([]);

    useEffect(() => {
        fetchBanners().then(setBanners);
    }, []);

    if (banners.length === 0) return <div className="container mx-auto h-[400px] bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse mt-4"></div>;

    return (
        <div className="container mx-auto px-4 mt-6">
            <div className="rounded-2xl overflow-hidden shadow-xl">
                <Swiper
                    spaceBetween={0}
                    centeredSlides={true}
                    autoplay={{
                        delay: 3500,
                        disableOnInteraction: false,
                    }}
                    pagination={{
                        clickable: true,
                    }}
                    navigation={true}
                    modules={[Autoplay, Pagination, Navigation]}
                    className="mySwiper h-[400px] md:h-[500px]"
                >
                    {banners.map((banner) => (
                        <SwiperSlide key={banner.id}>
                            <div className="relative w-full h-full">
                                <img src={banner.image} alt={banner.alt} className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8 md:p-16 text-white">
                                    <h2 className="text-4xl md:text-6xl font-heading font-bold mb-4 drop-shadow-lg">New Collection</h2>
                                    <p className="text-lg md:text-xl mb-8 max-w-xl drop-shadow-md">Discover the latest trends in Tamil inspired streetwear. Bold, authentic, and premium.</p>
                                    <Link to="/shop" className="inline-block bg-primary text-black px-8 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors transform hover:scale-105 w-fit">
                                        Shop Now
                                    </Link>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default Hero;
