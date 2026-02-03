import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

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
            // POST /api/login (json_login)
            const response = await api.post('/login', formData);
            // Login context
            login(response.data);
            // On success, redirect to dashboard
            navigate('/');
        } catch (err) {
            console.error("Login error", err);
            setError("Identifiants incorrects.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Glass Card */}
            <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl mx-4">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-indigo-500/20 rounded-xl mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Espace Élève</h2>
                    <p className="text-gray-300">Connectez-vous pour accéder à vos cours</p>
                </div>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 transition-all outline-none"
                            placeholder="etudiant@ecole.fr"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>

                    <div className="text-center mt-4 space-y-2">
                        <p className="text-sm text-gray-400">
                            Pas encore de compte ? {' '}
                            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                                Créer un compte
                            </Link>
                        </p>
                        <Link to="/" className="text-sm text-gray-400 hover:text-white transition-colors block">
                            Retour à l'accueil
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
