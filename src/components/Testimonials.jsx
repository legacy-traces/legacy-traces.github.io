import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Star } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import staticTestimonials from '../data/testimonials.json';
import { fetchAllFeedback } from '../api/api';

const Testimonials = () => {
    const [testimonials, setTestimonials] = useState(staticTestimonials);

    useEffect(() => {
        fetchAllFeedback().then(data => {
            if (data && data.length > 0) {
                const dynamicTestimonials = data
                    .filter(f => !f.CommentParentID && f.Comments)
                    .map(f => ({
                        id: f.CommentID,
                        text: f.Comments,
                        name: f.UserId || 'Anonymous',
                        rating: 5,
                        location: 'Verified Buyer',
                        image: null
                    }));
                // Only replace if we got valid testimonial rows
                if (dynamicTestimonials.length > 0) {
                    setTestimonials(dynamicTestimonials);
                }
            }
        });
    }, []);

    return (
        <section className="container mx-auto px-4 mt-20 mb-20">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Loved by Our Community</h2>
                <p className="text-gray-600 font-sans">Real stories from people who wear our culture.</p>
            </div>

            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                breakpoints={{
                    640: {
                        slidesPerView: 2,
                    },
                    1024: {
                        slidesPerView: 3,
                    },
                }}
                className="testimonial-swiper pb-12"
            >
                {testimonials.slice(0, 7).map((testimonial) => (
                    <SwiperSlide key={testimonial.id}>
                        <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] h-full flex flex-col items-center text-center transition-transform hover:-translate-y-1">
                            <div className="flex mb-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className={`w-5 h-5 ${i < testimonial.rating ? 'fill-primary text-primary' : 'text-gray-300'}`} 
                                    />
                                ))}
                            </div>
                            
                            <p className="text-gray-700 italic mb-6 line-clamp-2 min-h-[3rem]" title={testimonial.text}>"{testimonial.text}"</p>
                            
                            <div className="mt-auto flex flex-col items-center">
                                {testimonial.image && (
                                    <img 
                                        src={testimonial.image} 
                                        alt={testimonial.name} 
                                        className="w-14 h-14 rounded-full object-cover mb-3 grayscale hover:grayscale-0 transition-all duration-300 border-2 border-primary/10"
                                    />
                                )}
                                <h4 className="font-heading font-bold text-gray-900">{testimonial.name}</h4>
                                {testimonial.location && (
                                    <span className="text-sm text-gray-500">{testimonial.location}</span>
                                )}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
};

export default Testimonials;
