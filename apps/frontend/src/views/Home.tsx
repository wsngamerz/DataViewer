import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <>
            <section className="w-full px-3 bg-indigo-700 lg:px-6">
                <div className="mx-auto max-w-7xl">
                    {/* Navigation */}
                    <nav className="flex items-center w-full h-24 select-none relative flex-wrap justify-between mx-auto font-medium">
                        <Link to="/" className="w-1/4 pl-6 pr-4">
                            <span className="p-1 text-xl font-black leading-none text-white select-none">
                                <span className="">DataViewer</span>
                                <span className="text-indigo-300">.</span>
                            </span>
                        </Link>

                        <div className="text-sm lg:text-base w-3/4 bg-transparent p-0 relative flex h-full select-none rounded-none flex-row overflow-auto">
                            <div className="flex items-center justify-end w-full h-full flex-row py-0">
                                <Link
                                    to="/login"
                                    className="text-indigo-200 hover:text-white pl-0 mr-3 lg:mr-5 w-auto">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center justify-center px-4 py-2 mr-1 text-base font-medium leading-6 text-indigo-600 bg-white rounded-full">
                                    Register
                                </Link>
                            </div>
                        </div>
                    </nav>

                    {/* Hero Heading */}
                    <div className="container py-32 mx-auto text-center sm:px-4">
                        <h1 className="text-4xl font-extrabold leading-10 tracking-tight text-white sm:text-5xl sm:leading-none md:text-6xl xl:text-7xl lg:m-0">
                            DataViewer
                        </h1>
                        <div className="my-8 max-w-lg mx-auto text-sm text-center text-indigo-200 sm:text-base md:max-w-xl md:text-lg xl:text-xl">
                            A powerful software solution for visualising data
                            exports from popular 3rd party services.
                        </div>
                    </div>
                </div>
            </section>
            <section></section>
        </>
    );
}
