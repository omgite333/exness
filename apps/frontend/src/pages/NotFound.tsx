import { Link } from "react-router-dom";
import { ArrowLeft, Home, LineChart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080c14] text-white flex flex-col items-center justify-center px-6 relative overflow-hidden">

      {/* Subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-blue-500/8 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm font-bold">EX</div>
        </div>

        {/* Error code */}
        <div className="text-8xl font-bold text-white/5 select-none mb-2 leading-none">404</div>
        <div className="text-8xl font-bold absolute top-[calc(50%-80px)] left-1/2 -translate-x-1/2 bg-gradient-to-b from-white to-white/30 bg-clip-text text-transparent select-none leading-none">404</div>

        <h2 className="text-xl font-semibold mt-4 mb-2">Page not found</h2>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#080c14] font-semibold text-sm hover:bg-gray-100 transition-all"
          >
            <Home size={14} /> Home
          </Link>
          <Link
            to="/trade"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <LineChart size={14} /> Trade
          </Link>
        </div>

        <p className="mt-10 text-[10px] text-gray-700 font-mono">ERROR_CODE: 404_NOT_FOUND</p>
      </div>
    </div>
  );
}
