"use client"

import { useState, useActionState } from 'react';
import { signup } from '@/lib/auth';

export default function RegisterPage() {
    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [state, formAction, isPending] = useActionState(signup, undefined);

    // 1. Centralize all form data in one state object
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        stateName: "",
        pincode: "",
        ph: ""
    });

    // 2. Universal handler for all inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Step validation functions
    const handleNextStep1 = () => {
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setError("");
        setStep(2);
    };

    const handleNextStep2 = () => {
        // You can add empty field validation here if needed
        setStep(3);
    };

    // Note: We combine the address fields here so the Server Action gets the final string
    const fullGeoLocation = `${formData.address}, ${formData.stateName}, ${formData.pincode}`;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <img className="mx-auto h-10 w-auto" src="https://www.svgrepo.com/show/301692/login.svg" alt="Workflow" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create a new account</h2>
            </div>

            {/* Step Indicators */}
            <div className='flex justify-center items-center mt-8'>
                <div className={`${step >= 1 ? 'bg-green-600' : 'bg-green-400'} w-3 h-3 rounded-full`}></div>
                <hr className={`w-10 mx-1 ${step >= 2 ? 'border-green-600' : 'border-gray-300'}`} />
                <div className={`${step >= 2 ? 'bg-green-600' : 'bg-green-400'} w-3 h-3 rounded-full`}></div>
                <hr className={`w-10 mx-1 ${step >= 3 ? 'border-green-600' : 'border-gray-300'}`} />
                <div className={`${step >= 3 ? 'bg-green-600' : 'bg-green-400'} w-3 h-3 rounded-full`}></div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                {/* Error Display */}
                {/* {error && <p className="text-red-500 text-sm mb-4">{error}</p>} */}
                {/* {state?.message && <p className="text-red-500 text-sm mb-4">{state.message}</p>} */}

                {/* The Single Form */}
                <form action={formAction}>

                    {/* Hidden inputs ensure the Server Action receives ALL data, even from previous steps */}
                    <input type="hidden" name="name" value={formData.name} />
                    <input type="hidden" name="email" value={formData.email} />
                    <input type="hidden" name="password" value={formData.password} />
                    <input type="hidden" name="geo" value={fullGeoLocation} />
                    <input type="hidden" name="ph" value={formData.ph} />

                    {/* STEP 1 */}
                    {step === 1 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" name="password" value={formData.password} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <button type="button" onClick={handleNextStep1} className="w-full mt-4 bg-green-600 text-white py-2 rounded-md hover:bg-green-500">
                                Next
                            </button>
                        </div>
                    )}

                    {/* STEP 2 */}
                    {step === 2 && (
                        <div className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Home Address</label>
                                <input name="address" value={formData.address} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">State</label>
                                    <input name="stateName" value={formData.stateName} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                                <div className="w-1/2">
                                    <label className="block text-sm font-medium text-gray-700">Pincode</label>
                                    <input name="pincode" value={formData.pincode} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input name="ph" value={formData.ph} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md" />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button type="button" onClick={() => setStep(1)} className="w-1/3 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300">
                                    Back
                                </button>
                                <button type="button" onClick={handleNextStep2} className="w-2/3 bg-green-600 text-white py-2 rounded-md hover:bg-green-500">
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3 */}
                    {step === 3 && (
                        <div className="text-center">
                            <h3 className="text-xl font-bold mb-4">Welcome to Agri Connect!</h3>
                            <p className="text-gray-600 mb-6">Review your details and finalize your account creation.</p>

                            <div className="flex gap-2">
                                <button type="button" onClick={() => setStep(2)} className="w-1/3 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 disabled:opacity-50" disabled={isPending}>
                                    Back
                                </button>
                                {/* Only the final step has type="submit" */}
                                <button type="submit" disabled={isPending} className="w-2/3 bg-green-600 text-white py-2 rounded-md hover:bg-green-500 disabled:bg-green-400">
                                    {isPending ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}