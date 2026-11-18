
import { useEffect, useRef } from "react";

function AnimatedNetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let animationId;
    let width = 0;
    let height = 0;
    let particles = [];

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const colors = {
      line: "190, 130, 30",
      particle: "217, 154, 37",
    };

    const createParticles = () => {
      const area = width * height;

      const count = Math.min(
        100,
        Math.max(35, Math.floor(area / 14000))
      );

      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 1.2,
        glow: Math.random() * 5 + 5,
      }));
    };

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createParticles();
      drawNetwork(false);
    };

    const drawNetwork = (animate = true) => {
      ctx.clearRect(0, 0, width, height);

      const connectionDistance = 155;

      // Move particles slowly
      if (animate) {
        particles.forEach((particle) => {
          particle.x += particle.vx;
          particle.y += particle.vy;

          // Bounce from screen boundaries
          if (particle.x < 0 || particle.x > width) {
            particle.vx *= -1;
          }

          if (particle.y < 0 || particle.y > height) {
            particle.vy *= -1;
          }
        });
      }

      // Draw connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity =
              (1 - distance / connectionDistance) * 0.24;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);

            ctx.strokeStyle =
              `rgba(${colors.line}, ${opacity})`;

            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw glowing particles
      particles.forEach((particle) => {
        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          `rgba(${colors.particle}, 0.65)`;

        ctx.shadowBlur = particle.glow;
        ctx.shadowColor = "rgba(244, 173, 40, 0.65)";

        ctx.fill();
      });

      ctx.shadowBlur = 0;
    };

    const animate = () => {
      drawNetwork(true);
      animationId = requestAnimationFrame(animate);
    };

    resizeCanvas();

    if (!reducedMotion) {
      animate();
    }

    window.addEventListener("resize", resizeCanvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="animated-network-background"
      aria-hidden="true"
    />
  );
}

export default AnimatedNetworkBackground;
