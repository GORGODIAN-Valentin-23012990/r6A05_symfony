import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '', // Assuming existing backend uses simple names or we'll map it
        email: '',
        password: '',
        confirmPassword: ''
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // POST /api/users (API Platform)
            await api.post('/users', {
                email: formData.email,
                password: formData.password, // This will be mapped to plainPassword via serialization or customized
                plainPassword: formData.password, // Explicitly sending plainPassword as mapped in Entity
                firstname: formData.firstname
                // Lastname if you added it to entity
            });
            // On success, redirect to login
            navigate('/login');
        } catch (err) {
            console.error("Register error", err);
            if (err.response && err.response.status === 422) {
                // Handle API Platform validation errors
                const data = err.response.data;
                if (data.violations && data.violations.length > 0) {
                    setError(data.violations[0].message);
                } else if (data.detail) {
                    setError(data.detail);
                } else {
                    setError("Erreur de validation. Vérifiez les champs.");
                }
            } else {
                setError("Erreur lors de l'inscription. Vérifiez les champs.");
            }
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
            <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl mx-4 my-8">
                <div className="text-center mb-8">
                    <div className="inline-flex p-3 bg-indigo-500/20 rounded-xl mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Inscription</h2>
                    <p className="text-gray-300">Créez votre compte étudiant</p>
                </div>

                {error && (
                    <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Prénom</label>
                            <input
                                type="text"
                                name="firstname"
                                value={formData.firstname}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 transition-all outline-none"
                                placeholder="Jean"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nom (Optional)</label>
                            <input
                                type="text"
                                name="lastname"
                                value={formData.lastname}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 transition-all outline-none"
                                placeholder="Dupont"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 transition-all outline-none"
                            placeholder="etudiant@ecole.fr"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Mot de passe</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Confirmer</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-white placeholder-gray-400 transition-all outline-none"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-lg shadow-lg transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Création...' : 'Créer un compte'}
                    </button>

                    <div className="text-center mt-4 space-y-2">
                        <p className="text-sm text-gray-400">
                            Déjà un compte ? {' '}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
