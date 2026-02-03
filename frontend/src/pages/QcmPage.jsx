import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';

const QcmPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // Data state
    const [qcm, setQcm] = useState(null);
    const [loading, setLoading] = useState(true);

    // Quiz state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]); // Array for multi, single value for radio
    const [score, setScore] = useState(0);

    // Flow state: 'answering' -> 'feedback' -> (next question) -> 'finished'
    const [step, setStep] = useState('answering');
    const [submitted, setSubmitted] = useState(false);

    // --- FINISHED STATE ---
    useEffect(() => {
        if (step === 'finished' && !submitted) {
            const saveResult = async () => {
                try {
                    await api.post('/qcm_results', {
                        score: score,
                        maxScore: qcm ? qcm.content.length : 0,
                        qcm: qcm ? `/api/qcms/${qcm.id}` : null,
                    });
                    setSubmitted(true);
                } catch (error) {
                    console.error("Error saving result:", error);
                }
            };
            if (qcm) saveResult(); // Ensure QCM exists before saving
        }
    }, [step, submitted, score, qcm]);

    useEffect(() => {
        const fetchQcm = async () => {
            try {
                const response = await api.get(`/qcms/${id}`);
                setQcm(response.data);
            } catch (error) {
                console.error("Error fetching QCM:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchQcm();
    }, [id]);

    const handleOptionSelect = (option, isMultiple) => {
        if (step !== 'answering') return; // Lock during feedback

        if (isMultiple) {
            if (selectedAnswers.includes(option)) {
                setSelectedAnswers(selectedAnswers.filter(a => a !== option));
            } else {
                setSelectedAnswers([...selectedAnswers, option]);
            }
        } else {
            setSelectedAnswers([option]);
        }
    };

    const handleValidate = () => {
        if (selectedAnswers.length === 0) return;

        const currentQuestion = qcm.content[currentQuestionIndex];
        const correct = currentQuestion.answer;
        let isCorrect = false;

        if (Array.isArray(correct)) {
            // Check if arrays match
            const selectedSorted = [...selectedAnswers].sort();
            const correctSorted = [...correct].sort();
            isCorrect = JSON.stringify(selectedSorted) === JSON.stringify(correctSorted);
        } else {
            isCorrect = selectedAnswers[0] === correct;
        }

        if (isCorrect) {
            setScore(s => s + 1);
        }

        setStep('feedback');
    };

    const handleNext = () => {
        if (currentQuestionIndex < qcm.content.length - 1) {
            setCurrentQuestionIndex(i => i + 1);
            setSelectedAnswers([]);
            setStep('answering');
        } else {
            setStep('finished');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!qcm || !qcm.content || qcm.content.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center flex-col">
                <p className="text-gray-500 mb-4">Ce QCM ne contient aucune question.</p>
                <button onClick={() => navigate('/')} className="text-indigo-600 font-bold hover:underline">Retour</button>
            </div>
        );
    }

    // --- FINISHED STATE ---
    if (step === 'finished') {
        const total = qcm.content.length;
        const score20 = Math.round((score / total) * 20);

        let message = "Excellent travail ! 🌟";
        let colorClass = "from-emerald-400 to-teal-500";
        if (score20 < 10) {
            message = "Il faut réviser encore un peu. 💪";
            colorClass = "from-orange-400 to-amber-500";
        } else if (score20 < 16) {
            message = "Bien joué ! 👍";
            colorClass = "from-indigo-400 to-purple-500";
        }

        return (
            <div className="min-h-screen bg-gray-50 pb-20 overflow-hidden relative">
                <Navbar />

                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>

                <div className="pt-32 px-4 max-w-2xl mx-auto text-center">
                    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-12 shadow-2xl border border-white/50 transform transition-all duration-500 ease-out translate-y-0 opacity-100">

                        <div className={`mx-auto w-32 h-32 rounded-full bg-gradient-to-tr ${colorClass} p-1 mb-8 shadow-lg flex items-center justify-center`}>
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                <span className={`text-4xl font-black bg-clip-text text-transparent bg-gradient-to-tr ${colorClass}`}>
                                    {score20}/20
                                </span>
                            </div>
                        </div>

                        <h2 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">Résultats</h2>
                        <p className="text-xl font-medium text-slate-500 mb-10">{message}</p>

                        <div className="grid grid-cols-2 gap-4 mb-10">
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Score</p>
                                <p className="text-2xl font-bold text-slate-700">{score} / {total}</p>
                            </div>
                            <div className="bg-slate-50 rounded-2xl p-4">
                                <p className="text-sm text-slate-400 font-semibold uppercase tracking-wider mb-1">Réussite</p>
                                <p className="text-2xl font-bold text-slate-700">{Math.round((score / total) * 100)}%</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className={`w-full bg-gradient-to-r ${colorClass} text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-indigo-200 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300`}
                        >
                            Retour au Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- QUIZ STATE ---
    const question = qcm.content[currentQuestionIndex];
    if (!question) return null;

    const isMultiple = Array.isArray(question.answer);
    const progress = ((currentQuestionIndex) / qcm.content.length) * 100;

    return (
        <div className="min-h-screen bg-slate-50 pb-20 selection:bg-indigo-100 selection:text-indigo-700">
            <Navbar />

            <div className="pt-28 px-4 max-w-4xl mx-auto">
                {/* Header Actions */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="group flex items-center text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold tracking-wide"
                    >
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 group-hover:bg-slate-200 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                        Quitter
                    </button>
                    <div className="flex flex-col items-end">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Progression</span>
                        <span className="text-slate-700 font-black text-lg">
                            {currentQuestionIndex + 1} <span className="text-slate-300">/</span> {qcm.content.length}
                        </span>
                    </div>
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden relative">
                    {/* Progress Bar Top */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="p-8 md:p-12">
                        {/* Question Type Badge */}
                        <div className="mb-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isMultiple ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                {isMultiple ? (
                                    <>
                                        <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                        Choix Multiples
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3 h-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Choix Unique
                                    </>
                                )}
                            </span>
                        </div>

                        {/* Question Text */}
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-10 leading-tight">
                            {question.question}
                        </h2>

                        {/* Options Grid */}
                        <div className="grid grid-cols-1 gap-4">
                            {question.options && question.options.map((option, idx) => {
                                const isSelected = selectedAnswers.includes(option);
                                let cardClasses = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50";
                                let textClasses = "text-slate-600";
                                let indicatorDefault = "border-slate-300 group-hover:border-indigo-400";
                                let feedbackIcon = null;

                                if (step === 'feedback') {
                                    const correctArr = isMultiple ? question.answer : [question.answer];
                                    const isCorrectOpt = correctArr.includes(option);

                                    if (isCorrectOpt) {
                                        cardClasses = "border-emerald-400 bg-emerald-50/50 ring-1 ring-emerald-400 cursor-default";
                                        textClasses = "text-emerald-700 font-semibold";
                                        indicatorDefault = "bg-emerald-500 border-emerald-500 text-white";
                                        feedbackIcon = (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                            </svg>
                                        );
                                    } else if (isSelected) {
                                        cardClasses = "border-rose-300 bg-rose-50/50 ring-1 ring-rose-300 cursor-default";
                                        textClasses = "text-rose-700 font-semibold";
                                        indicatorDefault = "bg-rose-500 border-rose-500 text-white";
                                        feedbackIcon = (
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        );
                                    } else {
                                        cardClasses = "border-slate-100 bg-slate-50 opacity-60 cursor-default";
                                        textClasses = "text-slate-400";
                                        indicatorDefault = "border-slate-200";
                                    }
                                } else if (isSelected) {
                                    cardClasses = "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 shadow-md shadow-indigo-100";
                                    textClasses = "text-indigo-700 font-semibold";
                                    indicatorDefault = "bg-indigo-600 border-indigo-600 text-white";
                                    feedbackIcon = <div className="w-2 h-2 rounded-full bg-white"></div>;
                                }

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleOptionSelect(option, isMultiple)}
                                        className={`group relative flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 ease-out ${cardClasses}`}
                                    >
                                        {/* Checkbox/Radio Indicator */}
                                        <div className={`w-6 h-6 rounded-lg border-2 mr-5 flex items-center justify-center transition-all duration-200 ${indicatorDefault}`}>
                                            {feedbackIcon}
                                        </div>

                                        <span className={`flex-grow text-lg transition-colors ${textClasses}`}>
                                            {option}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 md:p-10 bg-slate-50 border-t border-slate-100/50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-slate-400 text-sm font-medium hidden md:block">
                            {step === 'answering' ? 'Sélectionnez votre réponse' : 'Réponse validée'}
                        </p>

                        <div className="w-full md:w-auto">
                            {step === 'answering' ? (
                                <button
                                    onClick={handleValidate}
                                    disabled={selectedAnswers.length === 0}
                                    className={`w-full md:w-auto min-w-[200px] px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 transition-all transform duration-200 ${selectedAnswers.length === 0
                                        ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] hover:-translate-y-0.5'
                                        }`}
                                >
                                    Valider
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="w-full md:w-auto min-w-[200px] px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-slate-200 bg-slate-900 text-white hover:bg-black hover:scale-[1.02] hover:-translate-y-0.5 transition-all transform flex items-center justify-center"
                                >
                                    {currentQuestionIndex < qcm.content.length - 1 ? 'Question Suivante' : 'Voir mon résultat'}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QcmPage;
