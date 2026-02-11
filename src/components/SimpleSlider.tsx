'use client';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

interface SimpleSliderProps {
    images: string[];
    height?: string;
}

export default function SimpleSlider({ images, height = "h-80" }: SimpleSliderProps) {
    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 4000,
        arrows: true,
    };

    return (
        <div className={`${height} rounded-2xl overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow`}>
            {images.length > 1 ? (
                <Slider {...settings} className="h-full">
                    {images.map((img, index) => (
                        <div key={index} className="relative h-full outline-none">
                            {/* Wrapper div to force height on the slide content */}
                            <div className={`${height} relative`}>
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                                    style={{ backgroundImage: `url('${img}')` }}
                                />
                            </div>
                        </div>
                    ))}
                </Slider>
            ) : (
                <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                    style={{ backgroundImage: `url('${images[0]}')` }}
                />
            )}
        </div>
    );
}
