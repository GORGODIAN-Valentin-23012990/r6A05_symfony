import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Login = () => {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.type]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/login', formData);
            login(response.data);
            navigate('/');
        } catch (err) {
            console.error("Login error", err);
            setError("Identifiants incorrects.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4 py-12">
                {/* Background Decor */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30 mix-blend-multiply filter animate-blob"></div>

                <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex justify-center items-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mb-6 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2">Bon retour !</h1>
                            <p className="text-slate-500">Connectez-vous à votre espace étudiant</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium"
                                    placeholder="etudiant@ecole.fr"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Mot de passe</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <div className="flex justify-end mt-2">
                                    <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                        Mot de passe oublié ?
                                    </a>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transform transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Connexion...
                                    </span>
                                ) : 'Se connecter'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                        <p className="text-slate-500 text-sm">
                            Pas encore de compte ? {' '}
                            <Link to="/register" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Créer un compte
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

