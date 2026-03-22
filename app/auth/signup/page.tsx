"use client"

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { signup } from '@/lib/auth';

const LocationPicker = dynamic(() => import('@/app/auth/signup/LocationPicker'), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div>
});

export default function RegisterPage() {
    const [loc, setLoc] = useState('')

    const handleLocationSelect = (formattedLocation: string) => {
        setLoc(formattedLocation);
        console.log("User dropped pin at:", formattedLocation);
    };

    return (<div className='px-6 md:px-[20%] mt-6 pb-10'>
        <form action={signup}>
            <div className="space-y-12">
                <div className="border-b border-gray-900/10 pb-12">
                    <div className="text-2xl font-semibold text-gray-900">Registration Form</div>
                    <p className="mt-1 text-sm/6 text-gray-600">
                        Enter the following details to register to Agri Connect
                    </p>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                            <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                Your Name
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Shubham"
                                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="sm:col-span-4"></div>

                        <div className="col-span-3">
                            <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900">
                                Your Email
                            </label>
                            <div className="mt-2">
                                <input
                                    id="email"
                                    name="email"
                                    placeholder='shubham@gmail.com'
                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#009C25] sm:text-sm/6"
                                    defaultValue={''}
                                />
                            </div>
                        </div>
                        <div className="sm:col-span-3"></div>

                        <div className="sm:col-span-2">
                            <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                Password
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="*****"
                                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className='sm:col-span-4' id='grid-filler1'></div>

                        <div className="sm:col-span-4">
                            <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                Address
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                    <textarea
                                        id="address"
                                        name="address"
                                        rows={3}
                                        placeholder="Apple"
                                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-2"></div>

                        <div className="sm:col-span-2">
                            <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                State
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                    <input
                                        id="state"
                                        name="state"
                                        type="text"
                                        placeholder="Apple"
                                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="sm:col-span-2">
                            <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                Pincode
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                    <input
                                        id="pincode"
                                        name="pincode"
                                        type="text"
                                        placeholder="Apple"
                                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='sm:col-span-2' id='grid-filler1'></div>

                        <div className="sm:col-span-1">
                            <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                Country Code
                            </label>
                            <div className="mt-2">
                                <div className="flex w-16 items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                    <input
                                        id="cnum"
                                        name="cnum"
                                        type="number"
                                        placeholder="001"
                                        className="block  min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="prodName" className="block text-sm/6 font-medium text-gray-900">
                                Phone number
                            </label>
                            <div className="mt-2">
                                <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-[#009C25]">
                                    <input
                                        id="ph"
                                        name="ph"
                                        type="number"
                                        placeholder="001"
                                        className="block min-w-0 grow bg-white py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className='col-span-3'></div>

                        <div className="flex flex-col col-span-6">
                            <label className="block text-sm font-medium text-gray-900">
                                Pinpoint your Farm Location
                            </label>
                            <p className="text-sm text-gray-500">Click anywhere on the map to set your exact location.</p>

                            {/* 2. THE MAP COMPONENT */}
                            <LocationPicker onLocationSelect={handleLocationSelect} />

                            {/* 3. THE HIDDEN INPUT */}
                            {/* This bridges your React state to your Server Action formData */}
                            <input type="hidden" name="loc" value={loc} />

                            {loc && <p className="text-xs text-green-600">Location captured successfully!</p>}
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
    );
}