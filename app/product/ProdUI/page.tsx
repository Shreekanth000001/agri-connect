"use client"
import { useState } from 'react';

export default function ImageGallery({ images }: { images: string[] }) {
    // 1. Safety check: If the farmer uploaded no images, show a placeholder
    if (!images || images.length === 0) {
        return <div className="aspect-square w-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">No images available</div>;
    }

    // 2. State to track which image is currently in the big viewer
    const [mainImage, setMainImage] = useState(images[0]);

    return (
        <div className="flex flex-col gap-4 justify-center items-center">
            {/* The Big Main Image */}
            <div className="sm:w-160 sm:h-160 overflow-hidden rounded-lg bg-gray-100">
                <img 
                    src={mainImage} 
                    alt="Product main" 
                    className="aspect-square h-fit w-fit object-cover object-center" 
                />
            </div>

            {/* The Row of Thumbnails */}
            <div className={`grid grid-cols-3 gap-4 sm:grid-cols-${images.length <5 ? images.length : 5} `}>
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setMainImage(img)}
                        className={`relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-md bg-white sm:w-57.5 sm:h-57.5 
                        ${mainImage === img ? 'ring-2 ring-[#009C25] ring-offset-2' : 'ring-1 ring-gray-200'}`}
                    >
                        <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover object-center" />
                    </button>
                ))}
            </div>
        </div>
    );
}