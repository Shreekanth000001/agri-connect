"use client"
import { useState } from 'react';

export default function ImageGallery({ images }: { images: string[] }) {
    const hasImages = images && images.length > 0;
    const [selectedImage, setSelectedImage] = useState<string | null>(hasImages ? images[0] : null);

    if (!hasImages) {
        return <div className="aspect-square w-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">No images available</div>;
    }

    const mainImage = selectedImage || images[0];
    const colCount = Math.min(images.length, 5);

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
            <div 
                className="grid grid-cols-3 gap-4"
                style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
            >
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedImage(img)}
                        className={`relative flex aspect-square cursor-pointer items-center justify-center overflow-hidden rounded-md bg-white 
                        ${mainImage === img ? 'ring-2 ring-[#009C25] ring-offset-2' : 'ring-1 ring-gray-200'}`}
                    >
                        <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover object-center" />
                    </button>
                ))}
            </div>
        </div>
    );
}