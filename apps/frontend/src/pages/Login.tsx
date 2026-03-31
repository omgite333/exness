import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuthCheck } from "@/lib/useAuthCheck";
import { useSessionStore } from "@/lib/session";
import { ArrowRight, Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);

  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: async () => {
      const cleanEmail = email.trim();
      await api.post("/auth/signup", { email: cleanEmail });
    },
  });

  const { isSuccess: isAuthSuccess } = useAuthCheck();
  const navigate = useNavigate();
  const isGuest = useSessionStore((s) => s.isGuest);

  useEffect(() => {
    if (isAuthSuccess && !isGuest) {
      navigate("/trade", { replace: true });
    }
  }, [isAuthSuccess, isGuest, navigate]);

  return (
    <div className="min-h-screen bg-[#080c14] text-white flex">

      {/* LEFT PANEL — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#0d1117] border-r border-white/5 p-12">
        <div>
          <div className="flex items-center gap-3 mb-16 cursor-pointer"
            onClick={() =>navigate("/")}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm font-bold">EX</div>
            <span className="font-semibold text-white tracking-tight">Exness</span>
          </div>

          <div className="space-y-10">
            <div>
              <h1 className="text-4xl font-bold leading-tight mb-3">
                Trade smarter.<br />
                <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Move faster.</span>
              </h1>
              <p className="text-gray-400 leading-relaxed text-sm">
                Professional perpetuals trading with sub-millisecond execution and real-time WebSocket feeds.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "No KYC — sign in with just your email",
                "Demo account with $50,000 in virtual funds",
                "Live BTC, ETH, SOL perpetuals up to 100×",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-600">© {new Date().getFullYear()} Exness. Demo platform only.</p>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative">

        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-sm font-bold">EX</div>
            <span className="font-semibold tracking-tight">Exness</span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Welcome back</h2>
          <p className="text-gray-500 text-sm mb-8">Enter your email to receive a secure sign-in link.</p>

          {!isSuccess ? (
            <form
              onSubmit={(e) => { e.preventDefault(); mutate(); }}
              className="space-y-4"
            >
              {/* Email field */}
              <div className={`relative rounded-xl border transition-all duration-200 ${focused ? "border-blue-500/60 bg-blue-500/5" : "border-white/8 bg-white/3"}`}>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Mail size={15} />
                </div>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm outline-none text-white placeholder:text-gray-600 rounded-xl"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  {(error as Error).message || "Something went wrong. Please try again."}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-[#080c14] font-semibold text-sm hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#080c14]/30 border-t-[#080c14] rounded-full animate-spin" />
                    Sending link...
                  </>
                ) : (
                  <>Send Magic Link <ArrowRight size={15} /></>
                )}
              </button>
            </form>
          ) : (
            /* Success state */
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="text-emerald-400" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">Check your inbox</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We sent a sign-in link to{" "}
                <span className="text-white font-medium">{email}</span>.
                Click it to access your account.
              </p>
              <p className="text-gray-600 text-xs mt-4">Didn't get it? Check your spam folder.</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600 mb-3">Just want to explore?</p>
            <button
              onClick={() => navigate("/trade")}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Try the demo — no account needed →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
