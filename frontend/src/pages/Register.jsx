import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const Register = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
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
            await api.post('/users', {
                email: formData.email,
                password: formData.password,
                plainPassword: formData.password,
                firstname: formData.firstname,
                lastname: formData.lastname
            });
            navigate('/login');
        } catch (err) {
            console.error("Register error", err);
            if (err.response && err.response.status === 422) {
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-grow flex items-center justify-center relative overflow-hidden px-4 py-8">
                {/* Background Decor */}
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30 mix-blend-multiply filter animate-blob"></div>

                <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex justify-center items-center w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl mb-6 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-2">Inscription</h1>
                            <p className="text-slate-500">Rejoignez l'espace étudiant dès maintenant</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-sm text-red-600 font-medium">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Prénom</label>
                                    <input
                                        type="text"
                                        name="firstname"
                                        value={formData.firstname}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium"
                                        placeholder="Jean"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Nom (Optionnel)</label>
                                    <input
                                        type="text"
                                        name="lastname"
                                        value={formData.lastname}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium"
                                        placeholder="Dupont"
                                    />
                                </div>
                            </div>

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Confirmer</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-xl bg-gray-50 border border-gray-200 text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 px-6 mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] transform transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? 'Création en cours...' : 'Créer un compte'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-gray-50 p-6 text-center border-t border-gray-100">
                        <p className="text-slate-500 text-sm">
                            Déjà un compte ? {' '}
                            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;

