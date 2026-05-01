"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/lib/ThemeContext";

/* ─── Configuration ──────────────────────────────────────────────── */
const CONFIG = {
  PARTICLE_COUNT:    600,
  MOUSE_RADIUS:      180,
  MOUSE_STRENGTH:    0.06,
  RETURN_STRENGTH:   0.012,
  DRIFT_SPEED:       0.15,
  FRICTION:          0.92,
  LINE_DISTANCE:     70,
  LINE_OPACITY:      0.1,
  LINE_ZONE_RADIUS:  200,
  CURSOR_GLOW_RADIUS:120,
  FADE_IN_MS:        2000,
};

interface Particle {
  x: number; y: number;
  ox: number; oy: number;
  vx: number; vy: number;
  dx: number; dy: number;
  radius: number;
  color: { r: number; g: number; b: number };
  brightness: number;
  depth: number;
}

function createParticle(
  w: number,
  h: number,
  palette: Array<{ r: number; g: number; b: number }>
): Particle {
  const x = Math.random() * w;
  const y = Math.random() * h;
  const depth = Math.random();
  const color = palette[Math.floor(Math.random() * palette.length)];
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
  const { theme } = useTheme();
  const canvasRef    = useRef<HTMLCanvasElement | null>(null);
  const mouseRef     = useRef({ x: -9999, y: -9999, active: false });
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef(0);
  /* Keep a live ref to theme so render() always reads the latest without re-subscribing */
  const themeRef     = useRef(theme);
  useEffect(() => { themeRef.current = theme; }, [theme]);

  const rebuildParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    particlesRef.current = Array.from({ length: CONFIG.PARTICLE_COUNT }, () =>
      createParticle(canvas.width, canvas.height, themeRef.current.particles)
    );
  }, []);

  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    rebuildParticles();
  }, [rebuildParticles]);

  /* Rebuild particles when theme changes (new colour palette) */
  useEffect(() => {
    rebuildParticles();
  }, [theme, rebuildParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    rebuildParticles();
    startTimeRef.current = performance.now();

    const onMouseMove  = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY, active: true }; };
    const onMouseLeave = ()              => { mouseRef.current.active = false; };

    window.addEventListener("mousemove",   onMouseMove);
    window.addEventListener("resize",      handleResize);
    document.addEventListener("mouseleave", onMouseLeave);

    let raf: number;

    function render(now: number) {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      const elapsed     = now - startTimeRef.current;
      const globalAlpha = Math.min(1, elapsed / CONFIG.FADE_IN_MS);
      const { glowRgb } = themeRef.current;

      ctx.clearRect(0, 0, w, h);

      const mouse     = mouseRef.current;
      const particles = particlesRef.current;

      /* ── Update ─────────────────────────────────────────── */
      for (const p of particles) {
        p.ox += p.dx;
        p.oy += p.dy;
        if (p.ox < 0 || p.ox > w) p.dx *= -1;
        if (p.oy < 0 || p.oy > h) p.dy *= -1;
        p.ox = Math.max(0, Math.min(w, p.ox));
        p.oy = Math.max(0, Math.min(h, p.oy));

        if (mouse.active) {
          const ddx  = mouse.x - p.x;
          const ddy  = mouse.y - p.y;
          const dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < CONFIG.MOUSE_RADIUS) {
            const force = (1 - dist / CONFIG.MOUSE_RADIUS) * CONFIG.MOUSE_STRENGTH * (0.4 + p.depth * 0.6);
            p.vx += ddx * force;
            p.vy += ddy * force;
          }
        }

        p.vx += (p.ox - p.x) * CONFIG.RETURN_STRENGTH;
        p.vy += (p.oy - p.y) * CONFIG.RETURN_STRENGTH;
        p.vx *= CONFIG.FRICTION;
        p.vy *= CONFIG.FRICTION;
        p.x  += p.vx;
        p.y  += p.vy;
      }

      /* ── Connection lines near cursor ───────────────────── */
      if (mouse.active) {
        const nearby: Particle[] = [];
        const zr = CONFIG.LINE_ZONE_RADIUS;
        for (const p of particles) {
          const ddx = p.x - mouse.x, ddy = p.y - mouse.y;
          if (ddx * ddx + ddy * ddy < zr * zr) nearby.push(p);
        }
        const ld = CONFIG.LINE_DISTANCE;
        ctx.lineWidth = 0.5;
        for (let i = 0; i < nearby.length; i++) {
          const a = nearby[i];
          for (let j = i + 1; j < nearby.length; j++) {
            const b = nearby[j];
            const ddx = a.x - b.x, ddy = a.y - b.y;
            const distSq = ddx * ddx + ddy * ddy;
            if (distSq < ld * ld) {
              const opacity = (1 - Math.sqrt(distSq) / ld) * CONFIG.LINE_OPACITY * globalAlpha;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(${glowRgb}, ${opacity})`;
              ctx.stroke();
            }
          }
        }
      }

      /* ── Particles ──────────────────────────────────────── */
      for (const p of particles) {
        const alpha = p.brightness * globalAlpha;
        const { r, g, b } = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.fill();

        if (p.brightness > 0.65) {
          const glowR = p.radius * 3;
          const grad  = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
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
        grad.addColorStop(0,   `rgba(${glowRgb}, ${0.12 * globalAlpha})`);
        grad.addColorStop(0.5, `rgba(${glowRgb}, ${0.04 * globalAlpha})`);
        grad.addColorStop(1,   "rgba(0, 0, 0, 0)");
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
      window.removeEventListener("mousemove",    onMouseMove);
      window.removeEventListener("resize",       handleResize);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [handleResize, rebuildParticles]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", top: 0, left: 0,
        width: "100vw", height: "100vh",
        pointerEvents: "none", zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
}
