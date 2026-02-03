import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full z-50 flex justify-center pt-6 px-4 pointer-events-none">
            <nav
                className={`
                    pointer-events-auto
                    relative flex items-center justify-between 
                    transition-all duration-500 ease-out
                    ${scrolled
                        ? 'w-[90%] md:w-[800px] py-4 px-8 bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-indigo-500/10 rounded-full'
                        : 'w-full max-w-7xl py-6 px-8 bg-transparent'
                    }
                `}
            >
                {/* Brand */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <div className="absolute inset-0 rounded-xl bg-white/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <span className={`text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-violet-800 ${scrolled ? 'opacity-100' : 'text-gray-900'}`}>
                        EduLearn
                    </span>
                </Link>

                {/* Right Actions */}
                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <span className="hidden md:block text-sm font-medium text-gray-600">
                                {user?.email}
                            </span>
                            <button
                                onClick={logout}
                                className="group relative px-6 py-2.5 rounded-full bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 text-sm font-bold transition-all duration-300 border border-transparent hover:border-red-100 active:scale-95"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <span>Déconnexion</span>
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="relative group px-8 py-3 rounded-full bg-black text-white text-sm font-bold overflow-hidden shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative z-10 flex items-center gap-2">
                                Connexion
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </Link>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
