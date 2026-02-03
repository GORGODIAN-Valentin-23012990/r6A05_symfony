
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [content, setContent] = useState([]);
    const [qcmResults, setQcmResults] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Parallel fetch
                const [docsRes, videosRes, resultsRes] = await Promise.all([
                    api.get('/documents'),
                    api.get('/videos'),
                    api.get('/qcm_results')
                ]);

                // Normalize and merge content
                const docsData = docsRes.data['hydra:member'] || docsRes.data.member || [];
                const videosData = videosRes.data['hydra:member'] || videosRes.data.member || [];

                const docs = docsData.map(d => ({ ...d, type: 'document' }));
                const videos = videosData.map(v => ({ ...v, type: 'video' }));

                const merged = [...docs, ...videos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setContent(merged);

                // Process QCM results
                const resultsData = resultsRes.data['hydra:member'] || resultsRes.data.member || [];
                const resultsMap = {};
                resultsData.forEach(result => {
                    // Assuming result.qcm is the IRI string "/api/qcms/1" or an object with id
                    const qcmId = typeof result.qcm === 'object' ? result.qcm.id : result.qcm.split('/').pop();
                    // We only keep the latest result if multiple exists, or just one. 
                    // Let's assume one result per QCM for now or overwrite with latest.
                    resultsMap[qcmId] = result;
                });
                setQcmResults(resultsMap);

            } catch (error) {
                console.error("Error fetching content:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getTypeIcon = (type) => {
        if (type === 'video') {
            return (
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-500 mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z" /></svg>
                </div>
            );
        }
        return (
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z" /><path d="M4.603 14.087a.81.81 0 0 1-1.32-.443c-.2-.708-.344-1.667-.344-2.85 0-1.18.14-2.14.34-2.85.115-.41.49-.694.908-.694.42 0 .795.286.91.695.2.709.342 1.668.342 2.85 0 1.18-.14 2.142-.34 2.85a.81.81 0 0 1-.497.492z" /></svg>
            </div>
        );
    };

    const getScoreColor = (score, max) => {
        const percentage = (score / max) * 100;
        if (percentage >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
        if (percentage >= 50) return 'text-amber-500 bg-amber-50 border-amber-200';
        return 'text-rose-500 bg-rose-50 border-rose-200';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />


            {/* Hero Section */}
            <div className="relative bg-white pt-32 pb-20 px-4 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 inset-x-0 h-full bg-gradient-to-b from-indigo-50/50 to-white -z-10"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-30 mix-blend-multiply filter"></div>

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold tracking-wider uppercase mb-6 shadow-sm">
                        Espace Apprentissage
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-slate-900">
                        {user ? (
                            <>
                                Bonjour, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{user.firstname || user.email.split('@')[0]}</span>
                            </>
                        ) : 'Bienvenue'}
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-light">
                        Retrouvez ici tous les modules de formation, documents et vidéos partagés par vos professeurs pour exceller dans votre parcours.
                    </p>
                </div>
            </div>

            {/* Content Grid */}
            <div className="mt-12 px-4 max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Contenus Disponibles</h2>
                    <span className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold">
                        {content.length} Ressource(s)
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {content.map((item) => {
                            const qcmId = item.qcm ? (typeof item.qcm === 'object' ? item.qcm.id : item.qcm.split('/').pop()) : null;
                            const result = qcmId ? qcmResults[qcmId] : null;

                            return (
                                <div key={`${item.type}-${item.id}`} className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 flex flex-col h-full transform hover:-translate-y-1">
                                    <div className="flex justify-between items-start">
                                        {getTypeIcon(item.type)}
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded uppercase tracking-wider">
                                                {item.type === 'video' ? 'Vidéo' : 'PDF/Doc'}
                                            </span>
                                            {result && (
                                                <span className={`text-xs font-bold px-2 py-1 rounded border ${getScoreColor(result.score, result.maxScore)}`}>
                                                    Note: {result.score}/{result.maxScore}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                        {item.title}
                                    </h3>

                                    <p className="text-gray-500 text-sm mb-6 line-clamp-3 flex-grow">
                                        {item.description || "Aucune description disponible pour ce contenu."}
                                    </p>

                                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-2">
                                                {item.user?.firstname ? item.user.firstname.charAt(0) : 'P'}
                                            </div>
                                            <span className="text-xs text-gray-500 font-medium">
                                                {item.user?.firstname ? `Pr. ${item.user.firstname}` : 'Professeur'}
                                            </span>
                                        </div>
                                        {item.qcm ? (
                                            result ? (
                                                <button
                                                    onClick={() => window.location.href = `/student/qcm/${qcmId}`}
                                                    className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 text-sm font-bold rounded-full shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Refaire
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => window.location.href = `/student/qcm/${qcmId}`}
                                                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-105 flex items-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                    </svg>
                                                    Passer QCM
                                                </button>
                                            )
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Pas de QCM</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {!loading && content.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <p className="text-xl text-gray-400 font-medium">Aucun contenu disponible pour le moment.</p>
                        <p className="text-gray-400 mt-2">Revenez plus tard !</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
