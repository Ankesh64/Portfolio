import { useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaLinkedin} from "react-icons/fa6";
import React from "react";
import ParticlesBackground from "../components/ParticlesBackground";

const socials = [
  { Icon: FaLinkedin, label: "Linkedin", href: "https://www.linkedin.com/in/ankesh-vaibhaw-6510a6331/" },
  { Icon: FaGithub, label: "Github", href: "https://github.com/Ankesh64" },
]

const playButtonSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(2.0, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.2);
  } catch {
    //can't be empty box
  }
}

class Particle {
  constructor(tx, ty, cw, ch) {
    this.tx = tx; this.ty = ty;
    this.x = Math.random() * cw;
    this.y = Math.random() * ch;
    this.vx = 0; this.vy = 0;
    this.size = Math.random() * 2 + 1;
    this.alpha = 0;
    this.cw = cw;
  }
  update(mx, my) {
    const dx = mx - this.x;
    const dy = my - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const repel = 90;
    if (dist < repel && dist > 0) {
      const force = (repel - dist) / repel;
      this.vx -= dx / dist * force * 7;
      this.vy -= dy / dist * force * 7;
    }
    this.vx += (this.tx - this.x) * 0.08;
    this.vy += (this.ty - this.y) * 0.08;
    this.vx *= 0.82; this.vy *= 0.82;
    this.x += this.vx; this.y += this.vy;
    this.alpha = Math.min(1, this.alpha + 0.03);
  }
  draw(ctx) {
    const hue = (this.tx / this.cw) * 120 + 160;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = `hsl(${hue}, 100%, 65%)`;
    ctx.shadowColor = `hsl(${hue}, 100%, 65%)`;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function getTextPixels(lines, cw, ch) {
  const off = document.createElement('canvas');
  off.width = cw; off.height = ch;
  const octx = off.getContext('2d');
  const size = Math.min(cw / (Math.max(...lines.map(l => l.length)) * 0.65), 110);
  octx.font = `900 ${size}px monospace`;
  octx.fillStyle = '#fff';
  octx.textAlign = 'center';
  octx.textBaseline = 'middle';
  const lineHeight = size * 1.3;
  const totalH = lineHeight * lines.length;
  const startY = (ch - totalH) / 2 + size * 0.5;
  lines.forEach((line, i) => {
    octx.fillText(line, cw / 2, startY + i * lineHeight);
  });
  const data = octx.getImageData(0, 0, cw, ch).data;
  const pts = [];
  const gap = 5;
  for (let y = 0; y < ch; y += gap)
    for (let x = 0; x < cw; x += gap)
      if (data[(y * cw + x) * 4 + 3] > 128) pts.push({ x, y });
  return pts;
}

export default function Home() {
  const roles = useMemo(() => ["Web Developer", "Software Developer", "Full Stack Developer"], [])
  const [index, setIndex] = React.useState(0);
  const [subIndex, setSubIndex] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const current = roles[index];
    const timeout = setTimeout(() => {
      if (!deleting && subIndex < current.length) setSubIndex(v => v + 1);
      else if (!deleting && subIndex === current.length) setTimeout(() => setDeleting(true), 1200);
      else if (deleting && subIndex > 0) setSubIndex(v => v - 1);
      else if (deleting && subIndex === 0) { setDeleting(false); setIndex(p => (p + 1) % roles.length); }
    }, deleting ? 40 : 60)
    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, roles])

  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999 });
  const particlesRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      const pts = getTextPixels(["ANKESH", "VAIBHAW"], canvas.width, canvas.height);
      particlesRef.current = pts.map(p => new Particle(p.x, p.y, canvas.width, canvas.height));
    };

    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onLeave = () => { mouseRef.current = { x: -999, y: -999 }; };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(p => {
        p.update(mouseRef.current.x, mouseRef.current.y);
        p.draw(ctx);
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section id="home" className="w-full h-screen relative bg-black overflow-hidden flex flex-col items-center justify-center">

      {/* moving stars */}
      <ParticlesBackground />

      {/* background globs — cyan + blue theme */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[70vw] sm:w-[50vw] md:w-[40vw] h-[70vw] sm:h-[50vw] md:h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-r from-[#00ffcc] via-[#00aaff] to-[#00ffcc] opacity-30 sm:opacity-20 md:opacity-10 blur-[100px] sm:blur-[130px] md:blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[70vw] sm:w-[50vw] md:w-[40vw] h-[70vw] sm:h-[50vw] md:h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-r from-[#00ffcc] via-[#00aaff] to-[#00ffcc] opacity-30 sm:opacity-20 md:opacity-10 blur-[150px] sm:blur-[180px] md:blur-[200px] animate-pulse delay-500"></div>      </div>

      {/* typewriter role — above name */}
      <motion.div
        className="absolute z-10 flex items-center gap-2"
        style={{ top: "18%" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-cyan-400 text-lg sm:text-xl lg:text-2xl font-mono tracking-widest">
          {roles[index].substring(0, subIndex)}
          <span className="inline-block w-[2px] h-[1em] bg-cyan-400 animate-pulse align-middle ml-1" />
        </span>
      </motion.div>

      {/* particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: 'crosshair' }}
      />

      {/* bottom content */}
      <div className="absolute bottom-12 left-0 right-0 z-10 flex flex-col items-center gap-5 px-4">

        {/* subtitle */}
        <motion.p
          className="text-gray-500 text-sm sm:text-base font-mono tracking-widest text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          Building scalable web apps · MERN Stack · Let's turn your idea into something real
        </motion.p>

        {/* buttons */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <a href="#projects" onClick={playButtonSound}
            className="px-8 py-3 rounded-full font-semibold text-black text-sm transition-all hover:scale-105"
            style={{ background: "linear-gradient(90deg, #00ffcc, #00aaff)" }}
          >
            View My Work
          </a>
          <a href="/Resume.pdf" download onClick={playButtonSound}
            className="px-8 py-3 rounded-full font-semibold text-sm transition-all hover:scale-105"
            style={{
              color: "#00ffcc",
              border: "1px solid rgba(0,255,204,0.4)",
              background: "rgba(0,255,204,0.05)"
            }}
          >
            My Resume
          </a>
        </motion.div>

        {/* socials */}
        <motion.div
          className="flex gap-6 text-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          {socials.map(({ Icon, label, href }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              aria-label={label}
              rel="noopener noreferrer"
              onClick={playButtonSound}
              className="text-gray-600 hover:text-cyan-400 transition-colors"
              whileHover={{ scale: 1.3, y: -3 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon />
            </motion.a>
          ))}
        </motion.div>
        
      </div>

    </section>
  )
}