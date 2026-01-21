import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
    children,
    title,
    subtitle
}) => {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-3xl opacity-50 animate-fade-in" />
                <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-slate-200/40 rounded-full blur-3xl opacity-50 animate-fade-in" style={{ animationDelay: '0.2s' }} />
            </div>

            <div className="w-full max-w-md animate-slide-up">
                {/* Logos Header */}
                <div className="flex items-center justify-center gap-6 mb-8">
                    <img
                        src="/insi.png"
                        alt="INSI Logo"
                        className="h-12 object-contain grayscale hover:grayscale-0 transition-all duration-500 opacity-80 hover:opacity-100"
                    />
                    <div className="h-8 w-px bg-slate-200" />
                    <img
                        src="/Rise.png"
                        alt="Rise Logo"
                        className="h-15 object-contain hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* content Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8">
                    {(title || subtitle) && (
                        <div className="text-center mb-8">
                            {title && <h1 className="text-2xl font-bold text-slate-900 mb-2">{title}</h1>}
                            {subtitle && <p className="text-slate-500">{subtitle}</p>}
                        </div>
                    )}
                    {children}
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                        Platforme de Notation Hackathon
                    </p>
                </div>
            </div>
        </div>
    );
};
