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
    // Effect to save result when entering finished state
    // MOVED TO TOP to avoid Hook Error

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

    // Safety check just in case index is out of bounds (though handled by logic)
    const question = qcm.content[currentQuestionIndex];
    if (!question) return null; // Should not happen given check above

    // --- FINISHED STATE ---

    if (step === 'finished') {
        const total = qcm.content.length;
        const score20 = Math.round((score / total) * 20);

        let message = "Excellent travail ! 🌟";
        let color = "text-green-500";
        if (score20 < 10) {
            message = "Il faut réviser encore un peu. 💪";
            color = "text-orange-500";
        } else if (score20 < 16) {
            message = "Bien joué ! 👍";
            color = "text-indigo-500";
        }

        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <Navbar />
                <div className="pt-32 px-4 max-w-2xl mx-auto text-center animate-fade-in-up">
                    <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-6 shadow-inner">
                            <span className={`text-4xl font-extrabold ${color}`}>{score20}/20</span>
                        </div>

                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Résultats</h2>
                        <p className={`text-xl font-medium mb-8 ${color}`}>{message}</p>

                        <div className="border-t border-gray-100 pt-8 flex flex-col gap-2 text-gray-500 mb-8">
                            <p>Score brut : {score} / {total}</p>
                            <p>Taux de réussite : {Math.round((score / total) * 100)}%</p>
                        </div>

                        <button
                            onClick={() => navigate('/')}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all transform duration-200"
                        >
                            Retour au Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- QUIZ STATE ---
    // reused 'question' from above scope
    const isMultiple = Array.isArray(question.answer);
    const progress = ((currentQuestionIndex) / qcm.content.length) * 100;

    console.log("Current Question:", question);
    console.log("Options:", question.options);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* ... Navbar ... */}
            <Navbar />

            <div className="pt-24 px-4 max-w-3xl mx-auto">
                {/* Header & Progress */}
                {/* ... (keep header code) ... */}
                <div className="mb-8 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-gray-600 transition-colors text-sm font-medium flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Quitter sans finir
                    </button>
                    <span className="text-gray-400 font-bold text-sm tracking-wider uppercase">
                        Question {currentQuestionIndex + 1} / {qcm.content.length}
                    </span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full mb-10 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden min-h-[400px] flex flex-col">
                    <div className="p-8 md:p-10 flex-grow">
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wide mb-4">
                            {isMultiple ? 'Choix Multiples' : 'Choix Unique'}
                        </span>

                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-8 leading-tight">
                            {question.question}
                        </h2>

                        <div className="space-y-4">
                            {question.options && question.options.map((option, idx) => {
                                const isSelected = selectedAnswers.includes(option);
                                let optionClass = "border-gray-200 hover:border-indigo-200 hover:bg-gray-50";
                                let icon = null;
                                // ... (rest of logic)

                                if (step === 'feedback') {
                                    const correctArr = isMultiple ? question.answer : [question.answer];
                                    const isCorrectOpt = correctArr.includes(option);

                                    if (isCorrectOpt) {
                                        optionClass = "border-green-500 bg-green-50 ring-1 ring-green-500";
                                        icon = <span className="text-green-500 font-bold">✓</span>;
                                    } else if (isSelected) {
                                        optionClass = "border-red-400 bg-red-50 ring-1 ring-red-400";
                                        icon = <span className="text-red-500 font-bold">✕</span>;
                                    } else {
                                        optionClass = "border-gray-100 opacity-50";
                                    }
                                } else if (isSelected) {
                                    optionClass = "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600 shadow-md";
                                }

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => handleOptionSelect(option, isMultiple)}
                                        className={`group flex items-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${optionClass}`}
                                    >
                                        <div className={`w-6 h-6 rounded-md border-2 mr-4 flex items-center justify-center transition-colors ${isSelected
                                            ? (step === 'feedback' ? 'border-transparent' : 'bg-indigo-600 border-indigo-600')
                                            : 'border-gray-300 group-hover:border-indigo-400'
                                            }`}>
                                            {isSelected && step !== 'feedback' && (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className={`flex-grow text-lg font-medium ${step === 'feedback' && !selectedAnswers.includes(option) && !Array.isArray(question.answer) && question.answer !== option ? 'text-gray-400' : 'text-gray-700'}`}>
                                            {option}
                                        </span>
                                        {icon}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer / Actions */}
                    <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                        {step === 'answering' ? (
                            <button
                                onClick={handleValidate}
                                disabled={selectedAnswers.length === 0}
                                className={`px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform ${selectedAnswers.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-indigo-200'
                                    }`}
                            >
                                Valider
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="px-8 py-4 rounded-xl font-bold text-lg shadow-lg bg-gray-900 text-white hover:bg-black hover:scale-[1.02] transition-all transform flex items-center"
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
    );
};

export default QcmPage;
