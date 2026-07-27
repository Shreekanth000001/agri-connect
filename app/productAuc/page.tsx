"use client"
import { useState } from 'react'
import ImgUpload from '@/app/productAuc/imgUpload/page'
import AucFormSubmit from '@/app/productAuc/imgUpload/AucSubmit'
import { PhotoIcon } from '@heroicons/react/24/solid'
import { useUser } from '@/lib/SessionProvider';

export default function AucForm() {
    const user = useUser();
    console.log(user?.uid);
    const [imgs, setImgs] = useState<string[]>([]);
    const imgLimit = imgs.length >= 5;

    const handleImgs = (newUrl: string) => {
        setImgs((prev) => [...prev, newUrl]);
        console.log(newUrl);
    };

    return (
        <div className='px-6 md:px-[20%] mt-6 pb-10'>
            <form action={AucFormSubmit}>
                <input type='hidden' name='uid' value={user?.uid || ''} />
                <input type='hidden' name='imageUrl' value={JSON.stringify(imgs)} />
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <div className="text-2xl font-semibold text-gray-900">Auction Form</div>
                        <p className="mt-1 text-sm/6 text-gray-600">
                            This information will be displayed publicly so be careful what you share.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="sm:col-span-4">
                                <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                    Product Name
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                        <input
                                            id="title"
                                            name="title"
                                            type="text"
                                            placeholder="Apple"
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900">
                                    Description
                                </label>
                                <div className="mt-2">
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={3}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#009C25] sm:text-sm/6"
                                        defaultValue={''}
                                    />
                                </div>
                                <p className="mt-3 text-sm/6 text-gray-600">Write a few sentences about yourself.</p>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                    Starting Bid Amount
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                        <input
                                            id="startingBid"
                                            name="startingBid"
                                            type="number"
                                            placeholder="100"
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className='sm:col-span-4' id='grid-filler1'></div>

                            <div className="sm:col-span-2">
                                <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                    Bid Start Time
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                        <input
                                            id="startTime"
                                            name="startTime"
                                            type="datetime-local"
                                            placeholder="Apple"
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                    Bid End Time
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                        <input
                                            id="endTime"
                                            name="endTime"
                                            type="datetime-local"
                                            placeholder="Apple"
                                            className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='sm:col-span-2' id='grid-filler1'></div>

                            <div className="sm:col-span-2">
                                <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                    Category
                                </label>
                                <div className="mt-2">
                                    <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                        <select className='outline-0' name='category'>
                                            <option value='VEGETABLES'>Vegetables</option>
                                            <option value='FRUITS'>Fruits</option>
                                            <option value='GRAINS'>Grains</option>
                                            <option value='DAIRY'>Dairy</option>
                                            <option value='MEAT'>Meat</option>
                                            <option value='FISH'>Fish</option>
                                            <option value='OTHER'>Other</option>
                                        </select>

                                    </div>
                                </div>
                            </div>
{/* 1. Limit Message: Only renders if limit is reached */}
                            {imgLimit && (
                                <div className="col-span-full p-4 mt-2 bg-red-50 text-red-600 rounded-md font-medium text-sm text-center border border-red-200">
                                    Image Limit Reached: 5
                                </div>
                            )}

                            {/* 2. Upload Box: Uses CSS 'hidden' instead of being unmounted by React */}
                            <div className={`col-span-full ${imgLimit ? 'hidden' : 'block'}`}>
                                <p className="block text-sm/6 font-medium text-gray-900">
                                    Cover photo
                                </p>
                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                    <div className="text-center">
                                        <PhotoIcon aria-hidden="true" className="mx-auto size-12 text-gray-300" />
                                        <div className="mt-4 flex text-sm/6 text-gray-600 justify-center">
                                            <div className="relative cursor-pointer rounded-md bg-transparent font-semibold text-[#009C25] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#009C25] hover:text-green-600">
                                                <ImgUpload onUploadSuccess={handleImgs} />
                                            </div>
                                            <p className="pl-1 text-gray-600">PNG, JPG, up to 10MB</p>
                                        </div>
                                        <p className="text-xs/5 text-gray-600 mt-2">Up to 5 Images</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>

                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="button" className="text-sm/6 font-semibold text-gray-900">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-[#009C25]  px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#009C25] "
                        >
                            Save
                        </button>
                    </div>
            </form>
        </div>
    )
}