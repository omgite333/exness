import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, AlertCircle, InboxIcon } from "lucide-react";
import { toDecimalNumber } from "@/lib/utils";

interface ClosedTrade {
  id: string;
  asset: string;
  type: string;
  quantity: number;
  openPrice: number;
  closePrice: number;
  pnl: number;
  decimal: number;
  liquidated: boolean;
  createdAt: string;
}

function formatAsset(raw: string) {
  return raw.replace("_USDC_PERP", "/USDC").replaceAll("_", "");
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " · " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function PastOrders() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["closedOrders"],
    queryFn: async () => {
      const res = await api.get("/trade/closed");
      return res.data.trades as ClosedTrade[];
    },
  });

  const totalPnl = data?.reduce((sum, t) => sum + toDecimalNumber(t.pnl, t.decimal), 0) ?? 0;
  const wins = data?.filter((t) => t.pnl > 0).length ?? 0;
  const losses = data?.filter((t) => t.pnl < 0).length ?? 0;
  const winRate = data?.length ? Math.round((wins / data.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans flex flex-col">

      {/* NAV */}
      <nav className="h-12 shrink-0 flex items-center justify-between px-6 bg-[#0d1117] border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold">EX</div>
            <span className="font-semibold text-sm tracking-tight">Exness</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <Link
            to="/trade"
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Back to Trading
          </Link>
        </div>
        <p className="text-xs text-gray-600">Trade History</p>
      </nav>

      <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Trade History</h1>
          <p className="text-gray-500 text-sm">All closed and liquidated positions</p>
        </div>

        {/* SUMMARY CARDS */}
        {data && data.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              {
                label: "Total Trades",
                value: data.length,
                sub: `${wins}W / ${losses}L`,
              },
              {
                label: "Win Rate",
                value: `${winRate}%`,
                sub: "of closed trades",
                positive: winRate >= 50,
              },
              {
                label: "Total P&L",
                value: `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)}`,
                sub: "all positions",
                colored: true,
                positive: totalPnl >= 0,
              },
              {
                label: "Liquidated",
                value: data.filter((t) => t.liquidated).length,
                sub: "forced closes",
              },
            ].map((card, i) => (
              <div key={i} className="bg-[#0d1117] border border-white/5 rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-2">{card.label}</p>
                <p className={`text-xl font-bold font-mono ${card.colored ? (card.positive ? "text-emerald-400" : "text-red-400") : "text-white"}`}>
                  {card.value}
                </p>
                <p className="text-[10px] text-gray-600 mt-1">{card.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* TABLE */}
        <div className="bg-[#0d1117] border border-white/5 rounded-2xl overflow-hidden">

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="text-gray-600 animate-spin" size={20} />
              <p className="text-sm text-gray-600">Loading trade history...</p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <AlertCircle className="text-red-500/50" size={20} />
              <p className="text-sm text-gray-500">Failed to load trades</p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && data?.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <InboxIcon className="text-gray-700" size={28} />
              <p className="text-sm text-gray-500">No closed trades yet</p>
              <Link to="/trade" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                Start trading →
              </Link>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && data && data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Date", "Asset", "Side", "Size", "Entry", "Exit", "P&L", "Status"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3 text-[10px] font-medium text-gray-500 uppercase tracking-widest ${i >= 3 ? "text-right" : "text-left"} ${i === 7 ? "text-center" : ""}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((trade, idx) => {
                    const pnlReal = toDecimalNumber(trade.pnl, trade.decimal);
                    const isProfit = pnlReal > 0;
                    const isLong = trade.type === "long";
                    return (
                      <tr
                        key={trade.id}
                        className={`border-b border-white/3 hover:bg-white/2 transition-colors ${idx === data.length - 1 ? "border-b-0" : ""}`}
                      >
                        <td className="px-5 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                          {formatDate(trade.createdAt)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="text-sm font-medium text-white">{formatAsset(trade.asset)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${isLong ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                            {isLong ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {trade.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-sm font-mono text-gray-300">
                          {trade.quantity}
                        </td>
                        <td className="px-5 py-3.5 text-right text-sm font-mono text-gray-400">
                          ${toDecimalNumber(trade.openPrice, trade.decimal).toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5 text-right text-sm font-mono text-gray-400">
                          ${toDecimalNumber(trade.closePrice, trade.decimal).toLocaleString()}
                        </td>
                        <td className={`px-5 py-3.5 text-right text-sm font-bold font-mono ${isProfit ? "text-emerald-400" : pnlReal < 0 ? "text-red-400" : "text-gray-400"}`}>
                          {pnlReal > 0 ? "+" : ""}${Math.abs(pnlReal).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${trade.liquidated ? "bg-red-500/10 text-red-400 border border-red-500/15" : "bg-white/5 text-gray-400"}`}>
                            {trade.liquidated ? "Liquidated" : "Closed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
