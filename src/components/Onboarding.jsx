import React, { useState, useEffect } from 'react';
import calu from '../assets/calu-hero.svg';

const Onboarding = ({ steps, onFinish, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [position, setPosition] = useState(null);

    const step = steps[currentStep];

    // Calcula a posição do destaque
    // EFEITO 1: Travar o Scroll (Roda apenas na montagem/desmontagem)
    useEffect(() => {
        // Ao abrir o componente, trava
        document.body.style.overflow = 'hidden';

        // Ao fechar o componente, destrava
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []); // Array vazio = roda só uma vez

    // EFEITO 2: Calcular Posição (Roda quando o 'step' muda)
    useEffect(() => {
        // Seguranças
        if (!step) return;

        if (!step.targetId) {
            setPosition(null);
            return; // Esse return agora é seguro, pois este efeito não tem cleanup
        }

        const element = document.getElementById(step.targetId);
        if (element) {
            const rect = element.getBoundingClientRect();
            setPosition({
                top: rect.top - 10,
                left: rect.left - 10,
                width: rect.width + 20,
                height: rect.height + 20,
            });
        } else {
            setPosition(null);
        }
    }, [currentStep, step]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(curr => curr + 1);
        } else {
            onFinish();
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden">

            {/* 1. MÁSCARA ESCURA (Overlay com recorte) */}
            <div
                className="absolute inset-0 bg-black/90 transition-all duration-300"
                style={position ? {
                    // Truque CSS para criar um buraco transparente:
                    clipPath: `polygon(
                0% 0%, 
                0% 100%, 
                ${position.left}px 100%, 
                ${position.left}px ${position.top}px, 
                ${position.left + position.width}px ${position.top}px, 
                ${position.left + position.width}px ${position.top + position.height}px, 
                ${position.left}px ${position.top + position.height}px, 
                ${position.left}px 100%, 
                100% 100%, 
                100% 0%
            )`
                } : {}}
            ></div>

            {/* 2. BORDA DE DESTAQUE (Opcional, para dar o glow) */}
            {position && (
                <div
                    className="absolute border-2 border-brand-green rounded-lg shadow-[0_0_20px_rgba(76,175,80,0.6)] pointer-events-none transition-all duration-300"
                    style={{
                        top: position.top,
                        left: position.left,
                        width: position.width,
                        height: position.height
                    }}
                ></div>
            )}

            {/* 3. CONTEÚDO (Texto + Calu) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Caixa de Texto (Clicável) */}
                <div className="bg-transparent text-white max-w-2xl w-full p-6 pointer-events-auto flex flex-col md:flex-row items-center gap-8 animate-fade-in mt-20">

                    {/* Mascote */}
                    <div className="w-240 md:w-336 shrink-0">
                        <img
                            src={calu}
                        />
                    </div>

                    {/* Texto */}
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-2xl font-black uppercase mb-4 text-white">
                            {step.title}
                        </h2>
                        <p className="text-gray-200 text-lg leading-relaxed mb-8">
                            {step.content}
                        </p>

                        <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
                            <button
                                onClick={onSkip}
                                className="bg-brand-brown text-white font-black px-6 py-3 rounded-lg hover:brightness-110 uppercase text-sm"
                            >
                                Continuar s/ Calu
                            </button>
                            <button
                                onClick={handleNext}
                                className="bg-brand-green text-white font-black px-8 py-3 rounded-lg hover:brightness-110 uppercase text-sm shadow-lg"
                            >
                                {currentStep === steps.length - 1 ? "Finalizar Tutorial" : "Continuar Tutorial"}
                            </button>
                        </div>

                        {/* Indicador de Progresso (Bolinhas) */}
                        <div className="flex justify-center md:justify-center gap-2 mt-6">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`w-3 h-3 rounded-full transition-colors ${idx === currentStep ? 'bg-brand-green' : 'bg-gray-600'}`}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Onboarding;