import { useState, useEffect, useRef } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useSessionStore } from "@/lib/session";
import { useQuotesFeed, useQuotesStore, getMidPrice } from "@/lib/quotesStore";
import { wsClient } from "@/lib/ws";
import CandlesChart, { TimeframeSwitcher } from "@/components/CandlesChart";
import QuotesTable from "@/components/QuotesTable";
import TradeForm from "@/components/TradeForm";
import OpenOrders from "@/components/OpenOrders";
import { useUsdBalance } from "@/lib/balance";
import { useOpenOrdersStore } from "@/lib/openOrdersStore";
import { backendToAppSymbol } from "@/lib/symbols";
import { toDecimalNumber } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { LogOut, History, TrendingUp, TrendingDown, Wifi, WifiOff, User, ChevronDown } from "lucide-react";
import api from "@/lib/api";
import { useAuthCheck } from "@/lib/useAuthCheck";
import { useGuestSession } from "@/lib/useGuestSession";

export default function Trade() {
  useQuotesFeed();
  const queryClient = useQueryClient();
  const userId = useSessionStore((s) => s.userId);
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const isGuest = useSessionStore((s) => s.isGuest);
  const navigate = useNavigate();
  const [wsConnected, setWsConnected] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { isLoading: isAuthLoading, isSuccess: isAuthSuccess } = useAuthCheck();
  const { mutate: initGuestSession, isPending: isGuestLoading } = useGuestSession();
  const guestInitiated = useRef(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthSuccess && !isAuthenticated && !guestInitiated.current) {
      guestInitiated.current = true;
      initGuestSession();
    }
  }, [isAuthLoading, isAuthSuccess, isAuthenticated]);

  const { mutate: handleLogout } = useMutation({
    mutationFn: async () => { await api.post("/auth/logout"); },
    onSuccess: () => { queryClient.clear(); navigate("/"); },
  });

  useEffect(() => {
    if (userId) wsClient.identify(userId);
  }, [userId]);

  useEffect(() => {
    const unsubscribe = wsClient.subscribeUserState(() => {
      queryClient.invalidateQueries({ queryKey: ["openOrders"] });
      queryClient.refetchQueries({ queryKey: ["balance.usd"] });
    });
    return () => unsubscribe();
  }, [queryClient]);

  // WS connection indicator
  useEffect(() => {
    const interval = setInterval(() => {
      const ws = (wsClient as any).ws as WebSocket | null;
      setWsConnected(ws?.readyState === WebSocket.OPEN);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const { quotes, selectedSymbol } = useQuotesStore();
  const q = quotes[selectedSymbol];
  const { data: usdBalance, isLoading: isBalanceLoading } = useUsdBalance();
  const openOrders = Object.values(useOpenOrdersStore((s) => s.ordersById));

  const equity = (() => {
    const base = usdBalance ? usdBalance.balance : 0;
    let pnl = 0;
    let margin = 0;
    for (const o of openOrders) {
      const appSym = backendToAppSymbol(o.asset);
      const lq = quotes[appSym];
      if (!lq) continue;
      const decimal = lq.decimal;
      const current = o.type === "long" ? lq.bid_price : lq.ask_price;
      const diffInt = o.type === "long" ? current - o.openPrice : o.openPrice - current;
      pnl += toDecimalNumber(diffInt, decimal) * o.quantity;
      margin += toDecimalNumber(o.margin || 0, decimal);
    }
    return base + pnl + margin;
  })();

  const equityNum = usdBalance ? toDecimalNumber(equity, usdBalance.decimal) : 0;
  const balanceNum = usdBalance ? usdBalance.balance : 0;
  const unrealizedPnl = equityNum - balanceNum;
  const pnlPositive = unrealizedPnl >= 0;

  if ((isAuthLoading || isGuestLoading) && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Initializing trading session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#080c14] text-white font-sans flex flex-col overflow-hidden">

      {/* NAVBAR */}
      <nav className="h-12 shrink-0 px-4 flex items-center justify-between bg-[#0d1117] border-b border-white/5 z-30">

        {/* LEFT — logo + symbol info */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold shrink-0">EX</div>
            <span className="font-semibold text-sm tracking-tight hidden sm:block">Exness</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 h-12">
            <div className="h-full w-px bg-white/5" />
            <div className="flex items-center gap-3 px-4">
              <span className="text-xs font-medium text-gray-300">{selectedSymbol}</span>
              {q && (
                <>
                  <span className="text-sm font-bold font-mono">{getMidPrice(q).toFixed(q.decimal)}</span>
                  <div className="flex items-center gap-1 text-xs text-emerald-400">
                    <TrendingUp size={11} />
                    Live
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — equity + ws status + user */}
        <div className="flex items-center gap-3">

          {/* WS indicator */}
          <div className={`hidden sm:flex items-center gap-1.5 text-xs ${wsConnected ? "text-emerald-400" : "text-red-400"}`}>
            {wsConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span className="hidden md:block">{wsConnected ? "Live" : "Offline"}</span>
          </div>

          {/* Equity */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-white/3 border border-white/5">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide leading-none mb-0.5">Equity</p>
              <p className="text-sm font-semibold font-mono">
                {isBalanceLoading || !usdBalance ? (
                  <span className="text-gray-600">Loading...</span>
                ) : (
                  `$${equityNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                )}
              </p>
            </div>
            {!isBalanceLoading && usdBalance && unrealizedPnl !== 0 && (
              <div className={`text-xs font-mono font-medium ${pnlPositive ? "text-emerald-400" : "text-red-400"}`}>
                {pnlPositive ? "+" : ""}{unrealizedPnl.toFixed(2)}
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <User size={14} />
              <ChevronDown size={12} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-[#0d1117] border border-white/8 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-3 py-2.5 border-b border-white/5">
                  <p className="text-xs text-gray-500">{isGuest ? "Guest Account" : "Authenticated"}</p>
                  <p className="text-xs text-gray-300 mt-0.5 truncate">{userId?.slice(0, 24)}...</p>
                </div>
                {!isGuest && (
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate("/past-orders"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <History size={13} /> Trade History
                  </button>
                )}
                {isGuest ? (
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate("/login"); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 transition-colors"
                  >
                    Sign up for full access →
                  </button>
                ) : (
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors"
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <main className="flex flex-1 overflow-hidden">

        {/* LEFT — instruments */}
        <aside className="w-56 shrink-0 bg-[#0d1117] border-r border-white/5 hidden lg:flex flex-col">
          <div className="px-3 py-2.5 border-b border-white/5">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Markets</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <QuotesTable />
          </div>
        </aside>

        {/* CENTER — chart + orders */}
        <section className="flex-1 flex flex-col min-w-0 overflow-hidden">

          {/* Chart topbar */}
          <div className="h-10 shrink-0 flex items-center justify-between px-4 bg-[#0d1117] border-b border-white/5">
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">{selectedSymbol}</span>
              {q && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-white">{getMidPrice(q).toFixed(q.decimal)}</span>
                  <span className="text-[10px] text-gray-600">|</span>
                  <span className="text-[10px] text-gray-500">Bid <span className="text-red-400 font-mono">{toDecimalNumber(q.bid_price, q.decimal).toFixed(q.decimal)}</span></span>
                  <span className="text-[10px] text-gray-500">Ask <span className="text-emerald-400 font-mono">{toDecimalNumber(q.ask_price, q.decimal).toFixed(q.decimal)}</span></span>
                </div>
              )}
            </div>
            <TimeframeSwitcher />
          </div>

          {/* Chart */}
          <div className="flex-1 bg-[#080c14] min-h-0">
            <CandlesChart symbol={selectedSymbol} decimal={q?.decimal} />
          </div>

          {/* Open positions */}
          <div className="h-44 shrink-0 bg-[#0d1117] border-t border-white/5 overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Open Positions</p>
              <span className="text-[10px] text-gray-600">{openOrders.length} active</span>
            </div>
            <div className="overflow-auto h-[calc(100%-33px)]">
              <OpenOrders />
            </div>
          </div>
        </section>

        {/* RIGHT — trade form */}
        <aside className="w-72 shrink-0 bg-[#0d1117] border-l border-white/5 hidden lg:flex flex-col">
          <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">New Order</p>
            {isGuest && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">Demo</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <TradeForm />
          </div>
        </aside>
      </main>

      {/* Click outside to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </div>
  );
}
