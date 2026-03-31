import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Zap, Shield, BarChart2, Clock, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { FaGithub, FaXTwitter } from "react-icons/fa6";

const TICKER_DATA = [
  { sym: "BTC/USD", price: "67,842.50", change: "+2.41%", up: true },
  { sym: "ETH/USD", price: "3,521.80", change: "+1.87%", up: true },
  { sym: "SOL/USD", price: "142.34", change: "-0.63%", up: false },
  { sym: "BTC/USD", price: "67,842.50", change: "+2.41%", up: true },
  { sym: "ETH/USD", price: "3,521.80", change: "+1.87%", up: true },
  { sym: "SOL/USD", price: "142.34", change: "-0.63%", up: false },
];

const STATS = [
  { label: "Daily Volume", value: "$2.4B+" },
  { label: "Active Traders", value: "180K+" },
  { label: "Avg Execution", value: "<1ms" },
  { label: "Uptime", value: "99.98%" },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Sub-millisecond Execution",
    desc: "In-memory matching engine processes orders in under 1ms. No queues, no delays — pure speed.",
    color: "from-yellow-500/20 to-orange-500/5",
    border: "hover:border-yellow-500/40",
    iconColor: "text-yellow-400",
  },
  {
    icon: Shield,
    title: "Non-Custodial Security",
    desc: "Your funds stay in your wallet. JWT-based auth with zero personal data stored on our servers.",
    color: "from-emerald-500/20 to-teal-500/5",
    border: "hover:border-emerald-500/40",
    iconColor: "text-emerald-400",
  },
  {
    icon: BarChart2,
    title: "Professional Charts",
    desc: "Lightweight Charts with live candles, multiple timeframes, and real-time price feeds via WebSocket.",
    color: "from-blue-500/20 to-cyan-500/5",
    border: "hover:border-blue-500/40",
    iconColor: "text-blue-400",
  },
  {
    icon: Clock,
    title: "24/7 Live Markets",
    desc: "Perpetual futures on BTC, ETH, SOL — streaming live from Backpack Exchange with up to 100x leverage.",
    color: "from-violet-500/20 to-purple-500/5",
    border: "hover:border-violet-500/40",
    iconColor: "text-violet-400",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="bg-[#080c14] text-white font-sans overflow-x-hidden">

      {/* NAVBAR */}
      <nav className={`fixed w-full z-50 top-0 transition-all duration-300 ${scrolled ? "bg-[#080c14]/95 backdrop-blur-xl border-b border-white/8 shadow-2xl" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-16 ">
          <div className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">EX</div>
            <span className="font-semibold text-white tracking-tight text-lg">Exness</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <button onClick={() => navigate("/docs")} className="hover:text-white transition-colors duration-200">Architecture</button>
            <button onClick={() => navigate("/trade")} className="hover:text-white transition-colors duration-200">Demo</button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/trade")}
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
            >
              Try Demo
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 text-sm font-medium bg-white text-[#080c14] px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign In <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* TICKER STRIP */}
      <div className="fixed top-16 w-full z-40 bg-[#0d1117] border-b border-white/5 overflow-hidden">
        <div className="flex animate-[marquee_20s_linear_infinite] whitespace-nowrap">
          {TICKER_DATA.map((t, i) => (
            <div key={i} className="flex items-center gap-3 px-8 py-2 border-r border-white/5 shrink-0">
              <span className="text-xs font-medium text-gray-300">{t.sym}</span>
              <span className="text-xs font-mono text-white">{t.price}</span>
              <span className={`text-xs font-medium flex items-center gap-0.5 ${t.up ? "text-emerald-400" : "text-red-400"}`}>
                {t.up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                {t.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="pt-44 pb-28 max-w-7xl mx-auto px-6">
        <div className="max-w-4xl">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Live markets — BTC · ETH · SOL Perpetuals
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.05] tracking-tight mb-6">
            Trade with{" "}
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
              precision
            </span>
            <br />and speed.
          </h1>

          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-2xl mb-10">
            A professional-grade perpetuals exchange. Sub-millisecond execution,
            real-time WebSocket feeds, and up to 100× leverage on crypto's top assets.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/login")}
              className="group flex items-center gap-2 bg-white text-[#080c14] px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-all shadow-lg"
            >
              Open Account
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => navigate("/trade")}
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium border border-white/10 text-gray-300 hover:bg-white/5 hover:border-white/20 hover:text-white transition-all"
            >
              Try Demo — No signup needed
            </button>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5">
          {STATS.map((s, i) => (
            <div key={i} className="bg-[#0d1117] px-6 py-6">
              <p className="text-2xl md:text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Why Exness</p>
            <h2 className="text-4xl md:text-5xl font-bold">Built for serious traders.</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`group relative p-6 rounded-2xl bg-gradient-to-br ${f.color} border border-white/5 ${f.border} transition-all duration-300 cursor-default`}
              >
                <div className={`w-10 h-10 rounded-xl bg-[#080c14]/60 flex items-center justify-center mb-5 ${f.iconColor}`}>
                  <f.icon size={20} />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600/20 via-[#0d1117] to-cyan-600/20 border border-white/8 p-12 md:p-16 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.15)_0%,_transparent_70%)]" />
            <div className="relative">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Start trading in 30 seconds.</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">No KYC, no paperwork. Enter your email, get a magic link, and you're live.</p>
              <button
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-2 bg-white text-[#080c14] px-8 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-all text-sm"
              >
                Create Free Account <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold">EX</div>
            <span className="text-sm font-medium text-gray-300">Exness Trading</span>
          </div>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Exness. For demo purposes only.</p>
          <div className="flex items-center gap-4 text-gray-500">
            <button className="hover:text-white transition-colors"><FaGithub size={16} /></button>
            <button className="hover:text-white transition-colors"><FaXTwitter size={16} /></button>
            <button onClick={() => navigate("/docs")} className="text-xs hover:text-white transition-colors">Docs</button>
            <button onClick={() => navigate("/trade")} className="text-xs hover:text-white transition-colors">Trade</button>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
