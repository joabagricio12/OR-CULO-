
import React from 'react';

const PegasusIcon: React.FC<{ className?: string }> = ({ className }) => {
    return (
        <div className={`${className} flex items-center justify-center`}>
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Geometria Estilizada Dark Horse v12.1 */}
                <path d="M50 10 L92 85 L8 85 Z" fill="url(#goldGrad)" stroke="#854D0E" strokeWidth="1.5" />
                <path d="M50 10 L50 85" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                <defs>
                    <linearGradient id="goldGrad" x1="50" y1="10" x2="50" y2="85" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FDE047" />
                        <stop offset="0.5" stopColor="#EAB308" />
                        <stop offset="1" stopColor="#854D0E" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};
export default PegasusIcon;
