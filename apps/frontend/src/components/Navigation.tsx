import { Link } from 'react-router-dom';

import Brand from './Brand';

export default function Navigation() {
    return (
        <nav className="flex items-center w-full h-24 select-none relative flex-wrap justify-between mx-auto font-medium">
            <Link to="/" className="w-1/4 pl-6 pr-4">
                <Brand />
            </Link>

            <div className="text-sm lg:text-base w-3/4 bg-transparent p-0 relative flex h-full select-none rounded-none flex-row overflow-auto">
                <div className="flex items-center justify-end w-full h-full flex-row py-0">
                    <Link
                        to="/login"
                        className="text-emerald-100 hover:text-white pl-0 mr-3 lg:mr-5 w-auto">
                        Login
                    </Link>
                    <Link
                        to="/register"
                        className="inline-flex items-center justify-center px-4 py-2 mr-1 text-base font-medium leading-6 text-emerald-600 bg-white rounded-full">
                        Register
                    </Link>
                </div>
            </div>
        </nav>
    );
}
