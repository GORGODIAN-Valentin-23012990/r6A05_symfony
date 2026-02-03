import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/20 bg-white/70 backdrop-blur-xl transition-all duration-300">
            <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
                {/* Brand */}
                <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
                    <div className="p-2 bg-indigo-100 rounded-lg group-hover:scale-110 transition-transform duration-300">
                        <svg
                            className="w-8 h-8 text-indigo-600"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path fillRule="evenodd" d="M11 4.717c-2.286-.58-4.16-.756-7.045-.71A1.99 1.99 0 0 0 2 6v11c0 1.133.934 2.022 2.044 2.007 2.759-.038 4.5.16 6.956.791V4.717Zm2 15.081c2.456-.631 4.198-.829 6.956-.791A1.99 1.99 0 0 0 22 17V6c0-1.066-.758-1.999-1.955-1.993-2.885-.046-4.76.13-7.045.71v15.081Z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="self-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                        EduLearn
                    </span>
                </a>

                {/* Buttons */}
                <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
                    {isAuthenticated ? (
                        <button
                            onClick={logout}
                            className="text-white bg-red-500 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-full text-sm px-6 py-2.5 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Déconnexion
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 font-medium rounded-full text-sm px-6 py-2.5 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            Connexion
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
