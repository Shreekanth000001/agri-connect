"use client"
import { useState } from 'react';

export default function ImageGallery({ images }: { images: string[] }) {
    const validImages = Array.isArray(images) && images.length > 0 ? images : ['/agri-conn-logo.png'];
    const [selectedImage, setSelectedImage] = useState<string>(validImages[0]);

    const mainImage = selectedImage || validImages[0];
    const isMultiImage = validImages.length > 1;

    return (
        <div className="flex flex-col gap-4 items-center w-full">
            {/* Main Hero Image */}
            <div className="w-full max-w-lg aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-gray-200/80 shadow-sm flex items-center justify-center">
                <img 
                    src={mainImage} 
                    alt="Product main hero" 
                    className="w-full h-full object-cover object-center transition-all duration-300" 
                />
            </div>

            {/* Thumbnail Row (Only displayed if product has multiple photos) */}
            {isMultiImage && (
                <div className="flex flex-wrap gap-3 justify-center items-center mt-1">
                    {validImages.map((img, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedImage(img)}
                            className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-white border transition-all duration-200 ${
                                mainImage === img 
                                    ? 'border-[#009C25] ring-2 ring-[#009C25]/30 shadow-md scale-105' 
                                    : 'border-gray-200 opacity-70 hover:opacity-100 hover:border-gray-400'
                            }`}
                        >
                            <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover object-center" />
                            {mainImage === img && (
                                <span className="absolute bottom-0 inset-x-0 bg-[#009C25] text-white text-[8px] font-bold text-center py-0.5">
                                    Active
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}