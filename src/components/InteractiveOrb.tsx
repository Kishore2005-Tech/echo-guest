import React, { useEffect, useRef, useState } from 'react';
import { soundEngine } from '../lib/audio';

interface InteractiveOrbProps {
  primaryColor?: string;
  secondaryColor?: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  speed: number;
  angle: number;
  elevation: number;
  color: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: string;
}

export const InteractiveOrb: React.FC<InteractiveOrbProps> = ({
  primaryColor = '#8B5CF6',
  secondaryColor = '#3B82F6',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  // Mouse physics
  const mouseRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isDown: false,
  });

  const ripplesRef = useRef<Ripple[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize 3D orb particles
    const particleCount = 75;
    const particles: Particle[] = [];
    const colors = ['#8B5CF6', '#A78BFA', '#3B82F6', '#67E8F9', '#C084FC'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: 0,
        y: 0,
        z: (Math.random() - 0.5) * 200,
        baseRadius: Math.random() * 2 + 1,
        speed: 0.006 + Math.random() * 0.012,
        angle: Math.random() * Math.PI * 2,
        elevation: (Math.random() - 0.5) * Math.PI * 0.85,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const render = () => {
      time += 0.015;

      // Mouse lerp
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2 + mouse.x * 0.15;
      const centerY = height / 2 + mouse.y * 0.15;
      const orbRadius = Math.min(width, height) * 0.32;

      // 1. Core Ambient Glow
      const ambientGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        orbRadius * 0.1,
        centerX,
        centerY,
        orbRadius * 1.8
      );
      ambientGrad.addColorStop(0, 'rgba(139, 92, 246, 0.45)');
      ambientGrad.addColorStop(0.4, 'rgba(59, 130, 246, 0.2)');
      ambientGrad.addColorStop(0.7, 'rgba(167, 139, 250, 0.08)');
      ambientGrad.addColorStop(1, 'rgba(7, 7, 10, 0)');

      ctx.save();
      ctx.fillStyle = ambientGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Render Ripples (ECHO waves)
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const ripple = ripplesRef.current[i];
        ripple.radius += 3.5;
        ripple.opacity *= 0.96;

        if (ripple.opacity < 0.01 || ripple.radius > ripple.maxRadius) {
          ripplesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.strokeStyle = ripple.color;
        ctx.globalAlpha = ripple.opacity;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Echo harmonic sub-ring
        if (ripple.radius > 30) {
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius * 0.65, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. Concentric 3D Holographic Latitude Rings
      const ringCount = 8;
      const tiltX = (mouse.y / height) * 0.5 + Math.sin(time * 0.5) * 0.15;
      const tiltY = (mouse.x / width) * 0.5 + Math.cos(time * 0.6) * 0.15;

      for (let i = 0; i < ringCount; i++) {
        const angleOffset = (i / ringCount) * Math.PI + time * 0.3;
        const currentRadius = orbRadius * (0.4 + (i / ringCount) * 0.6);
        const squish = Math.sin(angleOffset + tiltX) * 0.55 + 0.35;

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(tiltY * 0.6 + (i * 0.15));

        ctx.strokeStyle = i % 2 === 0
          ? 'rgba(167, 139, 250, 0.4)'
          : 'rgba(96, 165, 250, 0.35)';
        ctx.lineWidth = i === 0 || i === ringCount - 1 ? 1.5 : 1;

        if (i === 3) {
          ctx.strokeStyle = 'rgba(238, 242, 255, 0.75)';
          ctx.lineWidth = 2;
        }

        ctx.beginPath();
        ctx.ellipse(0, 0, currentRadius, currentRadius * Math.abs(squish), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // 4. Central Core Sphere with Glass Specular
      const coreGrad = ctx.createRadialGradient(
        centerX - orbRadius * 0.25,
        centerY - orbRadius * 0.25,
        orbRadius * 0.05,
        centerX,
        centerY,
        orbRadius * 0.85
      );
      coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      coreGrad.addColorStop(0.2, 'rgba(196, 181, 253, 0.7)');
      coreGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.4)');
      coreGrad.addColorStop(0.85, 'rgba(30, 27, 75, 0.7)');
      coreGrad.addColorStop(1, 'rgba(7, 7, 10, 0.85)');

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, orbRadius * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      // Outer rim outline
      ctx.strokeStyle = 'rgba(196, 181, 253, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 5. 3D Floating Particles Orbiting the Core
      particles.forEach((p) => {
        p.angle += p.speed * (isHovered ? 1.6 : 1);
        const radius3d = orbRadius * 1.15;
        const px = Math.cos(p.angle) * Math.cos(p.elevation) * radius3d;
        const py = Math.sin(p.elevation) * radius3d;
        const pz = Math.sin(p.angle) * Math.cos(p.elevation) * radius3d;

        // Apply mouse tilt
        const rotY = pz * Math.cos(tiltY) - px * Math.sin(tiltY);
        const rotX = px * Math.cos(tiltY) + pz * Math.sin(tiltY);
        const rotFinalY = py * Math.cos(tiltX) - rotY * Math.sin(tiltX);
        const rotFinalZ = py * Math.sin(tiltX) + rotY * Math.cos(tiltX);

        // Perspective projection
        const focal = 350;
        const scale = focal / (focal + rotFinalZ + 50);
        const screenX = centerX + rotX * scale;
        const screenY = centerY + rotFinalY * scale;

        const alpha = Math.max(0.15, Math.min(0.9, (rotFinalZ + 150) / 300));
        const size = p.baseRadius * scale;

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isHovered]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;
  };

  const handleMouseLeave = () => {
    mouseRef.current.targetX = 0;
    mouseRef.current.targetY = 0;
    setIsHovered(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Create acoustic echo wave
    ripplesRef.current.push({
      x: clickX,
      y: clickY,
      radius: 10,
      maxRadius: Math.max(rect.width, rect.height) * 0.8,
      opacity: 0.9,
      color: pulseCount % 2 === 0 ? '#C4B5FD' : '#93C5FD',
    });

    setPulseCount((prev) => prev + 1);
    soundEngine.playChime(639 + (pulseCount % 5) * 80, 0.7);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className="relative w-full h-full min-h-[360px] md:min-h-[500px] flex items-center justify-center cursor-pointer select-none group"
      role="button"
      tabIndex={0}
      aria-label="Interactive 3D Echo Orb. Click to release an acoustic ripple."
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e as unknown as React.MouseEvent<HTMLDivElement>);
        }
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full absolute inset-0 pointer-events-none"
      />

      {/* Floating Interactive Prompt */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100 flex items-center gap-2 text-xs font-mono tracking-wider text-violet-300/80">
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
        <span>Click to emit resonance</span>
      </div>
    </div>
  );
};
