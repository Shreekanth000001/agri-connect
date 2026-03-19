"use client"
import { useState } from 'react'
import ImgUpload from '@/app/productAuc/imgUpload/page'
export default function Home() {
    const [imgs, setImgs] = useState<string[]>([]);
    const handleImgs = (newUrl: string) => {
        setImgs((prev) => [...prev, newUrl])
        console.log(newUrl)
    }

    return (
        <div className='min-h-[65vh]'>
            <form action='#'>
                <div className='flex flex-col justify-center items-center '>
                    <ImgUpload onUploadSuccess={handleImgs} />
                    <input type='hidden' name="imgs" value={JSON.stringify(imgs)} />
                    <button type='submit' className="w-2/3 bg-green-600 text-white py-2 rounded-md hover:bg-green-500 m-1">Create Auction</button>
                </div>
            </form>
        </div>
    )
}