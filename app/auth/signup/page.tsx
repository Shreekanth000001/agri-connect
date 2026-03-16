"use client"
import { FormEvent } from 'react'
import { useState } from 'react';
export default function page() {
    const [steps, setSteps] = useState(1);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get("name");
        const email = formData.get("email");
        const password = formData.get("password");
        const conpassword = formData.get("password_confirmation");

        if (password == conpassword) {
            submitUser();
        }
        else {
            console.log(password, conpassword);
        }
        async function submitUser() {
            const result = await fetch("http://localhost:3000/auth/signupauth",
                {
                    method: "POST",
                    headers: {
                        'content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        'uname': name,
                        'uemail': email,
                        'password': password,
                        'uphone': 12435345,
                        'ugeo': 'Hubbli'
                    })
                }
            );
            console.log(result);
        }

    }
    function modal1() {
            return (<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium leading-5  text-gray-700">Name</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input id="name" name="name" placeholder="John Doe" type="text" required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5" />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label htmlFor="email" className="block text-sm font-medium leading-5 text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input id="email" name="email" placeholder="user@example.com" type="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5" />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label htmlFor="password" className="block text-sm font-medium leading-5 text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 rounded-md shadow-sm">
                                <input id="password" name="password" type="password" required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5" />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label htmlFor="password_confirmation" className="block text-sm font-medium leading-5 text-gray-700">
                                Confirm Password
                            </label>
                            <div className="mt-1 rounded-md shadow-sm">
                                <input id="password_confirmation" name="password_confirmation" type="password" required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:shadow-outline-blue focus:border-blue-300 transition duration-150 ease-in-out sm:text-sm sm:leading-5" />
                            </div>
                        </div>

                        <div className="mt-6">
                            <span className="block w-full rounded-md shadow-sm">
                                <button type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:border-green-700 focus:shadow-outline-indigo active:bg-green-700 transition duration-150 ease-in-out">
                                    Next
                                </button>
                            </span>
                        </div>
                    </form>

                </div>
            </div>)
        }
    return (
        <div>
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <img className="mx-auto h-10 w-auto" src="https://www.svgrepo.com/show/301692/login.svg" alt="Workflow" />
                    <h2 className="mt-6 text-center text-3xl leading-9 font-extrabold text-gray-900">
                        Create a new account
                    </h2>
                    <p className="mt-2 text-center text-sm leading-5 text-gray-500 max-w">
                        Or
                        <a href="/auth/login"
                            className="ml-2 font-medium text-green-600 hover:text-green-500 focus:outline-none focus:underline transition ease-in-out duration-150">
                            login to your account
                        </a>
                    </p>
                </div>
                <div className='flex justify-center items-center'>
                    <div className='flex justify-center items-center mt-8'>
                        <div className={`${steps >= 1 ? 'bg-green-600' : 'bg-green-400'} w-3 h-3 border rounded-full border-green-800`}></div>
                        <hr className='w-10 mx-1' />
                    </div>

                    <div className='flex justify-center items-center mt-8'>
                        <div className={`${steps >= 2 ? 'bg-green-600' : 'bg-green-400'} w-3 h-3 border rounded-full border-green-800`}></div>
                        <hr className='w-10 mx-1' />
                    </div>

                    <div className='flex justify-center items-center mt-8'>
                        <div className={`${steps >= 3 ? 'bg-green-600' : 'bg-green-400'} w-3 h-3 border rounded-full border-green-800`}></div>
                    </div>

                </div>
                {steps == 1 && modal1()}
                {steps == 2 && modal2()}
                {steps == 3 && modal3()}

            </div>
        </div>
    );
}