import { Link } from 'react-router-dom';

import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

export default function Login() {
    return (
        <div className="h-screen flex flex-col">
            <section className="w-full px-3 bg-emerald-500 lg:px-6">
                <div className="mx-auto max-w-7xl">
                    <Navigation />
                </div>
            </section>

            <section className="flex-grow flex flex-col justify-center">
                <div className="bg-white rounded-md drop-shadow-sm my-8 mx-4 w-100 md:w-4/5 lg:w-3/5 xl:w-[32rem] md:mx-auto p-4">
                    <h1 className="font-black text-center text-2xl py-2">
                        Login
                    </h1>

                    <form action="/">
                        <div className="py-2">
                            <label
                                htmlFor="emailInput"
                                className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                type="text"
                                name="email"
                                id="emailInput"
                                autoComplete="email"
                                placeholder="user@example.com"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                            />
                        </div>

                        <div className="py-2">
                            <label
                                htmlFor="passwordInput"
                                className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="passwordInput"
                                placeholder="************"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                            />
                        </div>

                        <Link to="/app">
                            <button className="block w-full mt-2 rounded-md border border-transparent bg-emerald-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-emerald-600">
                                Login
                            </button>
                        </Link>
                    </form>
                </div>
            </section>
            <Footer />
        </div>
    );
}
