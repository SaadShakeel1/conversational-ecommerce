"use client";

import { useEffect, useRef, useCallback } from "react";

/* ─── Configuration ──────────────────────────────────────────────── */
const CONFIG = {
  /** Total number of particles */
  PARTICLE_COUNT: 600,
  /** Maximum radius for mouse attraction */
  MOUSE_RADIUS: 180,
  /** Strength of gravitational pull toward cursor */
  MOUSE_STRENGTH: 0.06,
  /** How fast particles return to origin (0–1, lower = softer) */
  RETURN_STRENGTH: 0.012,
  /** Maximum idle drift speed (px / frame) */
  DRIFT_SPEED: 0.15,
  /** Friction applied each frame (0–1) */
  FRICTION: 0.92,
  /** Distance threshold for drawing faint connection lines (near cursor only) */
  LINE_DISTANCE: 70,
  /** Maximum opacity for connection lines */
  LINE_OPACITY: 0.1,
  /** Only draw lines for particles within this radius of the cursor */
  LINE_ZONE_RADIUS: 200,
  /** Cursor glow radius */
  CURSOR_GLOW_RADIUS: 120,
  /** Fade-in duration in ms */
  FADE_IN_MS: 2000,
};

/* ─── Green palette (hue 120–160) ────────────────────────────────── */
const GREENS = [
  { r: 0, g: 255, b: 65 },    // neon green
  { r: 74, g: 222, b: 128 },  // soft lime
  { r: 16, g: 185, b: 129 },  // emerald
  { r: 34, g: 197, b: 94 },   // green-500
  { r: 52, g: 211, b: 153 },  // mint
  { r: 6, g: 95, b: 70 },     // dim emerald
];

interface Particle {
  x: number;
  y: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  dx: number;
  dy: number;
  radius: number;
  color: { r: number; g: number; b: number };
  brightness: number;
  depth: number;
}

function createParticle(w: number, h: number): Particle {
  const x = Math.random() * w;
  const y = Math.random() * h;
  const depth = Math.random();
  const color = GREENS[Math.floor(Math.random() * GREENS.length)];
  const angle = Math.random() * Math.PI * 2;

  return {
    x, y, ox: x, oy: y,
    vx: 0, vy: 0,
    dx: Math.cos(angle) * CONFIG.DRIFT_SPEED * (0.3 + depth * 0.7),
    dy: Math.sin(angle) * CONFIG.DRIFT_SPEED * (0.3 + depth * 0.7),
    radius: 0.5 + depth * 1.8,
    color,
    brightness: 0.25 + Math.random() * 0.75,
    depth,
  };
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef(0);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesRef.current = Array.from({ length: CONFIG.PARTICLE_COUNT }, () =>
      createParticle(canvas.width, canvas.height)
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesRef.current = Array.from({ length: CONFIG.PARTICLE_COUNT }, () =>
      createParticle(canvas.width, canvas.height)
    );
    startTimeRef.current = performance.now();

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };
    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", handleResize);
    document.addEventListener("mouseleave", onMouseLeave);

    let raf: number;

    function render(now: number) {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;

      // Fade-in
      const elapsed = now - startTimeRef.current;
      const globalAlpha = Math.min(1, elapsed / CONFIG.FADE_IN_MS);

      ctx.clearRect(0, 0, w, h);

      const mouse = mouseRef.current;
      const particles = particlesRef.current;

      /* ── Update particles ───────────────────────────────── */
      for (const p of particles) {
        // Idle drift
        p.ox += p.dx;
        p.oy += p.dy;

        // Bounce origin off edges
        if (p.ox < 0 || p.ox > w) p.dx *= -1;
        if (p.oy < 0 || p.oy > h) p.dy *= -1;
        p.ox = Math.max(0, Math.min(w, p.ox));
        p.oy = Math.max(0, Math.min(h, p.oy));

        // Mouse attraction
        if (mouse.active) {
          const ddx = mouse.x - p.x;
          const ddy = mouse.y - p.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < CONFIG.MOUSE_RADIUS) {
            const force =
              (1 - dist / CONFIG.MOUSE_RADIUS) *
              CONFIG.MOUSE_STRENGTH *
              (0.4 + p.depth * 0.6);
            p.vx += ddx * force;
            p.vy += ddy * force;
          }
        }

        // Spring back to origin
        p.vx += (p.ox - p.x) * CONFIG.RETURN_STRENGTH;
        p.vy += (p.oy - p.y) * CONFIG.RETURN_STRENGTH;

        // Friction & integrate
        p.vx *= CONFIG.FRICTION;
        p.vy *= CONFIG.FRICTION;
        p.x += p.vx;
        p.y += p.vy;
      }

      /* ── Connection lines (only near cursor for performance) ── */
      if (mouse.active) {
        // Collect particles near cursor
        const nearby: Particle[] = [];
        const zr = CONFIG.LINE_ZONE_RADIUS;
        for (const p of particles) {
          const ddx = p.x - mouse.x;
          const ddy = p.y - mouse.y;
          if (ddx * ddx + ddy * ddy < zr * zr) {
            nearby.push(p);
          }
        }

        // Draw lines between nearby particles
        const ld = CONFIG.LINE_DISTANCE;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < nearby.length; i++) {
          const a = nearby[i];
          for (let j = i + 1; j < nearby.length; j++) {
            const b = nearby[j];
            const ddx = a.x - b.x;
            const ddy = a.y - b.y;
            const distSq = ddx * ddx + ddy * ddy;
            if (distSq < ld * ld) {
              const dist = Math.sqrt(distSq);
              const opacity =
                (1 - dist / ld) * CONFIG.LINE_OPACITY * globalAlpha;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(74, 222, 128, ${opacity})`;
              ctx.stroke();
            }
          }
        }
      }

      /* ── Draw particles ─────────────────────────────────── */
      for (const p of particles) {
        const alpha = p.brightness * globalAlpha;
        const { r, g, b } = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        // Soft glow for brighter particles
        if (p.brightness > 0.65) {
          const glowR = p.radius * 3;
          const grad = ctx.createRadialGradient(
            p.x, p.y, 0, p.x, p.y, glowR
          );
          grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`);
          grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        }
      }

      /* ── Cursor glow ────────────────────────────────────── */
      if (mouse.active) {
        const grad = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, CONFIG.CURSOR_GLOW_RADIUS
        );
        grad.addColorStop(0, `rgba(74, 222, 128, ${0.12 * globalAlpha})`);
        grad.addColorStop(0.5, `rgba(34, 197, 94, ${0.04 * globalAlpha})`);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, CONFIG.CURSOR_GLOW_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    }

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [handleResize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}
