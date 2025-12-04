import { useEffect, useRef, useState } from 'react';
import type { Team } from '../types';
import './SpinningWheel.css';

interface SpinningWheelProps {
    teams: Team[];
    onComplete: (orderedTeams: Team[]) => void;
}

export const SpinningWheel = ({ teams, onComplete }: SpinningWheelProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);

    const colors = [
        '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6',
        '#ef4444', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
    ];

    useEffect(() => {
        drawWheel();
    }, [teams, rotation]);

    const drawWheel = () => {
        const canvas = canvasRef.current;
        if (!canvas || teams.length === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw segments
        const anglePerSegment = (2 * Math.PI) / teams.length;

        teams.forEach((team, index) => {
            const startAngle = index * anglePerSegment + rotation;
            const endAngle = startAngle + anglePerSegment;

            // Draw segment
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.lineTo(centerX, centerY);
            ctx.fillStyle = colors[index % colors.length];
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + anglePerSegment / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.max(12, radius / 15)}px sans-serif`;

            // Truncate long team names
            const maxLength = Math.floor(radius / 10);
            const displayName = team.name.length > maxLength
                ? team.name.substring(0, maxLength) + '...'
                : team.name;

            ctx.fillText(displayName, radius * 0.65, 0);
            ctx.restore();
        });

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.15, 0, 2 * Math.PI);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw pointer at top
        ctx.beginPath();
        ctx.moveTo(centerX, 10);
        ctx.lineTo(centerX - 15, 35);
        ctx.lineTo(centerX + 15, 35);
        ctx.closePath();
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const getWinningTeamIndex = (finalRotation: number): number => {
        const anglePerSegment = (2 * Math.PI) / teams.length;
        // Pointer is at top (0 radians), calculate which segment it points to
        const normalizedRotation = (finalRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const pointerAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
        const winningIndex = Math.floor(pointerAngle / anglePerSegment) % teams.length;
        return winningIndex;
    };

    const spinWheel = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        const duration = 4000; // 4 seconds
        const spins = 5 + Math.random() * 3; // 5-8 full rotations
        const targetRotation = rotation + spins * 2 * Math.PI;
        const startTime = Date.now();
        const startRotation = rotation;

        const animate = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function (ease-out cubic)
            const eased = 1 - Math.pow(1 - progress, 3);
            const currentRotation = startRotation + (targetRotation - startRotation) * eased;

            setRotation(currentRotation);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setIsSpinning(false);
                const winningIndex = getWinningTeamIndex(currentRotation);
                generateOrderFromWinner(winningIndex);
            }
        };

        requestAnimationFrame(animate);
    };

    const generateOrderFromWinner = (winnerIndex: number) => {
        // Create order starting from winner
        const ordered: Team[] = [];
        for (let i = 0; i < teams.length; i++) {
            const index = (winnerIndex + i) % teams.length;
            ordered.push({
                ...teams[index],
                passageOrder: i + 1
            });
        }

        onComplete(ordered);
    };

    if (teams.length === 0) {
        return (
            <div className="spinning-wheel-empty">
                <p>Ajoutez des équipes pour utiliser la roue de randomisation</p>
            </div>
        );
    }

    if (teams.length > 20) {
        return (
            <div className="spinning-wheel-too-many">
                <p>⚠️ Trop d'équipes pour la roue visuelle ({teams.length})</p>
                <p>La randomisation se fera directement</p>
            </div>
        );
    }

    return (
        <div className="spinning-wheel-container">
            <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className="spinning-wheel-canvas"
            />
            <button
                onClick={spinWheel}
                disabled={isSpinning}
                className={`spinning-wheel-button ${isSpinning ? 'spinning' : ''}`}
            >
                {isSpinning ? '🎲' : '🎯'}
            </button>
        </div>
    );
};
