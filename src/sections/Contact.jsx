import { useState } from "react";
import emailjs from "@emailjs/browser";
import { motion, AnimatePresence } from "framer-motion";
import ParticlesBackground from "../components/ParticlesBackground";

const SERVICE_ID = import.meta.env.VITE_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;

export default function Contact() {
  const [lines, setLines] = useState([
    { type: "system", text: "Ankesh@portfolio:~$ ./contact.sh" },
    { type: "system", text: "Initializing contact protocol..." },
    { type: "system", text: "Connection established ✓" },
    { type: "blank" },
    { type: "system", text: "Hello! Let's work together." },
    { type: "blank" },
  ]);

  const [step, setStep] = useState(0);
  const [current, setCurrent] = useState("");
  const [formData, setFormData] = useState({});
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [done, setDone] = useState(false);

  const getQuestions = (data) => [
    {
      key: "name",
      prompt: "enter your name:",
      placeholder: "e.g. John Doe",
      type: "text",
      required: true,
    },
    {
      key: "email",
      prompt: "enter your email: ",
      placeholder: "e.g. john@gmail.com",
      type: "text",
      required: true,
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "⚠ Please enter a valid email address",
    },
    {
      key: "service",
      prompt: "service needed:",
      placeholder: null,
      type: "options",
      required: true,
      options: [
        { label: "1. Full Stack Web Development", value: "Full Stack Web Development" },
        { label: "2. Frontend Development", value: "Frontend Development" },
        { label: "3. Backend Development", value: "Backend Development" },
        { label: "4. Other", value: "other" },
      ],
    },
    ...(data.service && data.service !== "other" ? [{
      key: "budget",
      prompt: "your budget (numbers only): *",
      placeholder: "e.g. 50000",
      type: "text",
      required: true,
      validate: (v) => /^\d+$/.test(v) || "⚠ Budget must contain numbers only",
    }] : []),
    {
      key: "idea",
      prompt: "explain your idea: * (Shift+Enter for new line, Enter to submit)",
      placeholder: "Tell me what you want to build...",
      type: "textarea",
      required: true,
    },
  ]

  const questions = getQuestions(formData);
  const currentQ = questions[step];

  const handleNext = async (val) => {
    const value = val !== undefined ? val : current.trim();

    // required check
    if (!value && currentQ.required) {
      setError("⚠ This field is required. Please fill it in.");
      return;
    }

    // custom validation
    if (value && currentQ.validate) {
      const result = currentQ.validate(value);
      if (result !== true) {
        setError(result);
        return;
      }
    }

    setError("");
    const newData = { ...formData, [currentQ.key]: value };
    setFormData(newData);

    setLines(p => [
      ...p,
      { type: "prompt", text: `> ${currentQ.prompt}` },
      {
        type: "input",
        text: val
          ? (currentQ.options?.find(o => o.value === val)?.label || val)
          : value
      },
      { type: "blank" },
    ]);

    setCurrent("");

    const updatedQs = getQuestions(newData);

    if (step < updatedQs.length - 1) {
      setStep(s => s + 1);
    } else {
      setLines(p => [...p,
      { type: "system", text: "Processing your message..." },
      { type: "system", text: "Connecting to mail server..." },
      ]);
      setDone(true);
      setStatus("sending");

      try {
        await emailjs.send(
          SERVICE_ID, TEMPLATE_ID,
          { ...newData, from_name: newData.name, reply_to: newData.email },
          PUBLIC_KEY
        );
        setStatus("success");
        setLines(p => [...p,
        { type: "blank" },
        { type: "success", text: "✓ Message sent successfully!" },
        { type: "success", text: "✓ I'll get back to you soon." },
        { type: "blank" },
        { type: "system", text: "Ankesh@portfolio:~$ _" },
        ]);
      } catch {
        setStatus("error");
        setLines(p => [...p,
        { type: "blank" },
        { type: "error", text: "✗ Something went wrong. Please try again." },
        { type: "blank" },
        { type: "system", text: "Ankesh@portfolio:~$ _" },
        ]);
      }
    }
  }

  const getColor = (type) => {
    if (type === "system") return "text-cyan-400";
    if (type === "prompt") return "text-green-400";
    if (type === "input") return "text-white";
    if (type === "success") return "text-green-400";
    if (type === "error") return "text-red-400";
    return "";
  }

  const restart = () => {
    setLines([
      { type: "system", text: "Ankesh@portfolio:~$ ./contact.sh" },
      { type: "system", text: "Restarting contact protocol..." },
      { type: "system", text: "Connection established ✓" },
      { type: "blank" },
      { type: "system", text: "Hello again! Let's work together." },
      { type: "blank" },
    ]);
    setStep(0);
    setCurrent("");
    setFormData({});
    setError("");
    setStatus("");
    setDone(false);
  }

  return (
    <section
      id="contact"
      className="w-full min-h-screen relative bg-black overflow-hidden text-white flex items-center justify-center py-20 px-4"
    >
      <ParticlesBackground />

      {/* background glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[70vw] sm:w-[50vw] md:w-[40vw] h-[70vw] sm:h-[50vw] md:h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-r from-[#00ffcc] via-[#00aaff] to-[#00ffcc] opacity-20 blur-[180px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[70vw] sm:w-[50vw] md:w-[40vw] h-[70vw] sm:h-[50vw] md:h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-gradient-to-r from-[#00ffcc] via-[#00aaff] to-[#00ffcc] opacity-20 blur-[200px] animate-pulse delay-500" />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-3xl"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >

        {/* section title */}
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text"
            style={{ backgroundImage: "linear-gradient(90deg, #00ffcc, #00aaff)" }}>
            Get In Touch
          </h2>
          <p className="text-gray-500 text-sm mt-2 font-mono">
            Fill the terminal below to send mail— press Enter to proceed
          </p>
        </div>

        {/* terminal window */}
        <div className="rounded-2xl overflow-hidden shadow-2xl"
          style={{
            border: "1px solid rgba(0,255,204,0.2)",
            boxShadow: "0 0 40px rgba(0,255,204,0.05)"
          }}
        >

          {/* terminal top bar */}
          <div className="flex items-center gap-2 px-4 py-3"
            style={{ background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 text-gray-400 text-sm font-mono">
              contact.sh — ankesh@portfolio
            </span>
          </div>

          {/* terminal body */}
          <div
            className="p-6 font-mono text-sm min-h-[500px] max-h-[600px] overflow-y-auto flex flex-col gap-1"
            style={{ background: "rgba(0,0,0,0.85)" }}
          >

            {/* printed lines */}
            <AnimatePresence>
              {lines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`${getColor(line.type)} leading-relaxed`}
                >
                  {line.type === "blank" ? "\u00A0" : line.text}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* current input */}
            {!done && currentQ && (
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2"
              >
                <div className="text-green-400 mb-1">{`> ${currentQ.prompt}`}</div>

                {/* single error message */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-xs mb-2"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* options */}
                {currentQ.type === "options" && (
                  <div className="flex flex-col gap-2 mt-2">
                    {currentQ.options.map((opt) => (
                      <motion.button
                        key={opt.value}
                        onClick={() => { setError(""); handleNext(opt.value); }}
                        className="text-left px-4 py-2 rounded-lg text-cyan-400 font-mono text-sm transition-all hover:scale-[1.02]"
                        style={{
                          background: "rgba(0,255,204,0.05)",
                          border: "1px solid rgba(0,255,204,0.2)"
                        }}
                        whileHover={{ borderColor: "rgba(0,255,204,0.6)" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* textarea */}
                {currentQ.type === "textarea" && (
                  <div className="flex items-start gap-2 mt-1">
                    <span className="text-cyan-400 mt-1">$</span>
                    <textarea
                      autoFocus
                      rows={4}
                      value={current}
                      onChange={e => { setCurrent(e.target.value); setError(""); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleNext();
                        }
                      }}
                      placeholder={currentQ.placeholder}
                      className="flex-1 bg-transparent text-white outline-none resize-none placeholder-gray-600 border-b border-cyan-400/30 pb-1 leading-relaxed"
                    />
                    <span className="text-cyan-400 animate-pulse mt-1">▌</span>
                  </div>
                )}

                {/* text */}
                {currentQ.type === "text" && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-cyan-400">$</span>
                    <input
                      autoFocus
                      type="text"
                      value={current}
                      onChange={e => {
                        if (currentQ.key === "budget") {
                          if (e.target.value && !/^\d+$/.test(e.target.value)) return;
                        }
                        setCurrent(e.target.value);
                        setError("");
                      }}
                      onKeyDown={e => e.key === "Enter" && handleNext()}
                      placeholder={currentQ.placeholder}
                      className="flex-1 bg-transparent text-white outline-none placeholder-gray-600 border-b border-cyan-400/30 pb-1"
                    />
                    <span className="text-cyan-400 animate-pulse">▌</span>
                  </div>
                )}

                <p className="text-gray-600 text-xs mt-3">
                  {currentQ.type === "options"
                    ? "Click an option to select"
                    : currentQ.type === "textarea"
                      ? "Shift+Enter for new line · Enter to submit"
                      : "Press Enter to continue"}
                </p>

              </motion.div>
            )}
          </div>
        </div>

        {done && status !== "sending" && (
          <motion.button
            onClick={restart}
            className="mt-4 w-full py-3 rounded-xl font-mono font-semibold text-black transition-all hover:scale-105"
            style={{ background: "linear-gradient(90deg, #00ffcc, #00aaff)" }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {status === "success" ? "> run again ./contact.sh" : "> retry ./contact.sh"}
          </motion.button>
        )}

      </motion.div>

    </section>
  )
}