import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RED_NUMS = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

function numColor(n) {
  if (n === 0) return '#15803d';
  return RED_NUMS.has(n) ? '#b91c1c' : '#1f2937';
}

function StatusBadge({ status }) {
  const map = {
    completed: { label: 'Concluído', cls: 'bg-green-900/50 text-green-300 border-green-700' },
    pending:   { label: 'Pendente',  cls: 'bg-yellow-900/50 text-yellow-300 border-yellow-700' },
    failed:    { label: 'Falhou',    cls: 'bg-red-900/50 text-red-300 border-red-700' },
    cancelled: { label: 'Cancelado', cls: 'bg-gray-800 text-gray-400 border-gray-600' },
  };
  const { label, cls } = map[status] || map.cancelled;
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${cls}`}>{label}</span>;
}

function fmt(val) {
  return Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function TransactionsTab() {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wallet/transactions?limit=50')
      .then(({ data }) => setTxs(data.transactions || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-casino-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!txs.length) return <p className="text-casino-muted text-center py-16">Nenhuma transação ainda.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-casino-border text-casino-muted text-left">
            <th className="pb-3 pr-4 font-medium">Data</th>
            <th className="pb-3 pr-4 font-medium">Tipo</th>
            <th className="pb-3 pr-4 font-medium text-right">Valor</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-casino-border/40">
          {txs.map(tx => (
            <tr key={tx.id} className="hover:bg-casino-card/30 transition-colors">
              <td className="py-3 pr-4 text-casino-muted whitespace-nowrap">{fmtDate(tx.created_at)}</td>
              <td className="py-3 pr-4">
                <span className={`font-semibold ${tx.type === 'deposit' ? 'text-green-400' : 'text-casino-muted'}`}>
                  {tx.type === 'deposit' ? 'Crédito' : 'Ajuste'}
                </span>
              </td>
              <td className="py-3 pr-4 text-right font-mono font-semibold text-white">
                R$ {fmt(tx.amount)}
              </td>
              <td className="py-3"><StatusBadge status={tx.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BetsTab() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/roulette/history?limit=50')
      .then(({ data }) => setRounds(data.rounds || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-casino-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!rounds.length) return <p className="text-casino-muted text-center py-16">Nenhuma aposta ainda. <Link to="/roleta" className="text-casino-gold hover:underline">Jogar agora</Link></p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-casino-border text-casino-muted text-left">
            <th className="pb-3 pr-4 font-medium">Data</th>
            <th className="pb-3 pr-4 font-medium">Número</th>
            <th className="pb-3 pr-4 font-medium text-right">Apostado</th>
            <th className="pb-3 pr-4 font-medium text-right">Ganho</th>
            <th className="pb-3 font-medium text-right">Resultado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-casino-border/40">
          {rounds.map(r => {
            const profit = parseFloat(r.total_win) - parseFloat(r.total_bet);
            return (
              <tr key={r.id} className="hover:bg-casino-card/30 transition-colors">
                <td className="py-3 pr-4 text-casino-muted whitespace-nowrap">{fmtDate(r.created_at)}</td>
                <td className="py-3 pr-4">
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 30, height: 30, borderRadius: '50%',
                    background: numColor(r.result), color: 'white',
                    fontSize: 12, fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.2)',
                  }}>{r.result}</span>
                </td>
                <td className="py-3 pr-4 text-right font-mono text-white">R$ {fmt(r.total_bet)}</td>
                <td className="py-3 pr-4 text-right font-mono text-white">R$ {fmt(r.total_win)}</td>
                <td className="py-3 text-right font-mono font-semibold">
                  <span className={profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                    {profit >= 0 ? '+' : ''}R$ {fmt(profit)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('transactions');

  return (
    <div className="min-h-screen bg-casino-bg">
      <header className="bg-casino-surface border-b border-casino-border sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/lobby" className="text-xl font-display font-black tracking-wider">
            INACIOS<span className="text-casino-gold">777</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-casino-muted text-sm hidden sm:block">{user?.name?.split(' ')[0]}</span>
            <span className="text-casino-gold text-sm font-bold">R$ {fmt(user?.balance)}</span>
            <Link to="/lobby" className="text-casino-muted text-sm hover:text-white transition-colors">← Lobby</Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-white font-bold text-2xl mb-6">Meu Histórico</h1>

        <div className="flex gap-1 mb-6 bg-casino-card border border-casino-border rounded-lg p-1 w-fit">
          {[['transactions', 'Transações'], ['bets', 'Apostas']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-colors ${
                tab === key
                  ? 'bg-casino-gold text-casino-bg'
                  : 'text-casino-muted hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="bg-casino-card border border-casino-border rounded-xl p-6">
          {tab === 'transactions' ? <TransactionsTab /> : <BetsTab />}
        </div>
      </main>
    </div>
  );
}
