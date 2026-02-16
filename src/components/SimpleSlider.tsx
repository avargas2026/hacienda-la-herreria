'use client';

import Slider from 'react-slick';
import Image from 'next/image';
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
                            <div className={`${height} relative overflow-hidden`}>
                                <Image
                                    src={img}
                                    alt={`Imagen ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-700 hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>
                    ))}
                </Slider>
            ) : (
                <div className="relative h-full overflow-hidden">
                    <Image
                        src={images[0]}
                        alt="Imagen de espacio"
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
            )}
        </div>
    );
}
