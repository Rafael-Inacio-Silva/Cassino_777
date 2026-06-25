import { useState, useEffect, useCallback } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function fmt(val) {
  return Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}
function fmtDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-casino-card border border-casino-border rounded-xl p-5">
      <p className="text-casino-muted text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
      {sub && <p className="text-casino-muted text-xs mt-1">{sub}</p>}
    </div>
  );
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

function StatsTab({ stats, loading }) {
  if (loading) return <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-casino-gold border-t-transparent rounded-full animate-spin" /></div>;
  if (!stats) return null;

  const { transactions: tx, ggr, players } = stats;
  const ggrNum = parseFloat(ggr?.ggr || 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="GGR (Lucro)"
          value={`R$ ${fmt(ggr?.ggr)}`}
          sub={`${ggr?.total_rounds || 0} rodadas`}
          color={ggrNum >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <StatCard
          label="Saldo creditado (demo)"
          value={`R$ ${fmt(tx?.total_deposits)}`}
          sub={`${tx?.deposit_count || 0} créditos`}
          color="text-white"
        />
        <StatCard
          label="Pendentes"
          value={tx?.pending_count || 0}
          sub="transações aguardando"
          color={parseInt(tx?.pending_count) > 0 ? 'text-yellow-400' : 'text-white'}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Jogadores"     value={players?.total_players  || 0} sub="cadastros totais" />
        <StatCard label="Ativos"        value={players?.active_players || 0} sub="contas ativas" />
        <StatCard label="Novos (7 dias)" value={players?.new_this_week || 0} sub="últimos 7 dias" />
        <StatCard label="Novos (hoje)"  value={players?.new_today      || 0} sub="nas últimas 24h" />
      </div>

      <div className="bg-casino-card border border-casino-border rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Volume apostado vs pago (últimos 30 dias)</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-casino-muted text-xs mb-1">Total apostado</p>
            <p className="text-white font-bold font-mono">R$ {fmt(ggr?.total_wagered)}</p>
          </div>
          <div>
            <p className="text-casino-muted text-xs mb-1">Total pago</p>
            <p className="text-white font-bold font-mono">R$ {fmt(ggr?.total_paid_out)}</p>
          </div>
          <div>
            <p className="text-casino-muted text-xs mb-1">Margem</p>
            <p className={`font-bold font-mono ${ggrNum >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(ggr?.total_wagered) > 0
                ? `${((ggrNum / parseFloat(ggr.total_wagered)) * 100).toFixed(1)}%`
                : '—'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransactionsTab() {
  const [txs, setTxs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]  = useState({ type: '', status: '' });

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 100 });
    if (filter.type)   params.set('type', filter.type);
    if (filter.status) params.set('status', filter.status);
    api.get(`/admin/transactions?${params}`)
      .then(({ data }) => setTxs(data.transactions || []))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <select
          value={filter.type}
          onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
          className="bg-casino-card border border-casino-border text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-casino-gold"
        >
          <option value="">Todos os tipos</option>
          <option value="deposit">Crédito</option>
        </select>
        <select
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          className="bg-casino-card border border-casino-border text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-casino-gold"
        >
          <option value="">Todos os status</option>
          <option value="completed">Concluído</option>
          <option value="pending">Pendente</option>
          <option value="failed">Falhou</option>
        </select>
      </div>

      {loading
        ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-casino-gold border-t-transparent rounded-full animate-spin" /></div>
        : txs.length === 0
          ? <p className="text-casino-muted text-center py-16">Nenhuma transação encontrada.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-casino-border text-casino-muted text-left">
                    <th className="pb-3 pr-4 font-medium">Data</th>
                    <th className="pb-3 pr-4 font-medium">Jogador</th>
                    <th className="pb-3 pr-4 font-medium">Tipo</th>
                    <th className="pb-3 pr-4 font-medium text-right">Valor</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-casino-border/40">
                  {txs.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4 text-casino-muted whitespace-nowrap text-xs">{fmtDate(tx.created_at)}</td>
                      <td className="py-3 pr-4">
                        <p className="text-white font-medium">{tx.user_name}</p>
                        <p className="text-casino-muted text-xs">{tx.user_email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`font-semibold ${tx.type === 'deposit' ? 'text-green-400' : 'text-casino-muted'}`}>
                          {tx.type === 'deposit' ? 'Crédito' : 'Ajuste'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right font-mono font-semibold text-white">R$ {fmt(tx.amount)}</td>
                      <td className="py-3"><StatusBadge status={tx.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      }
    </div>
  );
}

function PlayersTab() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [search, setSearch]    = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: 100 });
    if (search) params.set('search', search);
    api.get(`/admin/players?${params}`)
      .then(({ data }) => setPlayers(data.players || []))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Buscar por nome, e-mail ou CPF..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="bg-casino-card border border-casino-border text-white text-sm rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:border-casino-gold placeholder-casino-muted"
      />
      {loading
        ? <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-casino-gold border-t-transparent rounded-full animate-spin" /></div>
        : players.length === 0
          ? <p className="text-casino-muted text-center py-16">Nenhum jogador encontrado.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-casino-border text-casino-muted text-left">
                    <th className="pb-3 pr-4 font-medium">Jogador</th>
                    <th className="pb-3 pr-4 font-medium">CPF</th>
                    <th className="pb-3 pr-4 font-medium text-right">Saldo</th>
                    <th className="pb-3 pr-4 font-medium">Cadastro</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-casino-border/40">
                  {players.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 pr-4">
                        <p className="text-white font-medium">{p.name}</p>
                        <p className="text-casino-muted text-xs">{p.email}</p>
                      </td>
                      <td className="py-3 pr-4 text-casino-muted font-mono text-xs">{p.cpf || '—'}</td>
                      <td className="py-3 pr-4 text-right font-mono font-semibold text-casino-gold">R$ {fmt(p.balance)}</td>
                      <td className="py-3 pr-4 text-casino-muted text-xs whitespace-nowrap">{fmtDate(p.created_at)}</td>
                      <td className="py-3">
                        <div className="flex flex-col gap-1">
                          {p.is_active
                            ? <span className="text-[11px] font-semibold text-green-400">Ativo</span>
                            : <span className="text-[11px] font-semibold text-red-400">Inativo</span>}
                          {!p.email_verified && <span className="text-[10px] text-yellow-500">E-mail pendente</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      }
    </div>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab]       = useState('stats');
  const [stats, setStats]   = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (tab === 'stats') {
      setStatsLoading(true);
      api.get('/admin/stats')
        .then(({ data }) => setStats(data))
        .finally(() => setStatsLoading(false));
    }
  }, [tab]);

  if (!user?.isAdmin) return <Navigate to="/lobby" replace />;

  const tabs = [
    ['stats',        'Visão Geral'],
    ['transactions', 'Transações'],
    ['players',      'Jogadores'],
  ];

  return (
    <div className="min-h-screen bg-casino-bg">
      <header className="bg-casino-surface border-b border-casino-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/lobby" className="text-xl font-display font-black tracking-wider">
              INACIOS<span className="text-casino-gold">777</span>
            </Link>
            <span className="text-[11px] bg-casino-gold text-casino-bg font-bold px-2 py-0.5 rounded">ADMIN</span>
          </div>
          <Link to="/lobby" className="text-casino-muted text-sm hover:text-white transition-colors">← Lobby</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-white font-bold text-2xl mb-6">Painel Administrativo</h1>

        <div className="flex gap-1 mb-6 bg-casino-card border border-casino-border rounded-lg p-1 w-fit">
          {tabs.map(([key, label]) => (
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
          {tab === 'stats'        && <StatsTab stats={stats} loading={statsLoading} />}
          {tab === 'transactions' && <TransactionsTab />}
          {tab === 'players'      && <PlayersTab />}
        </div>
      </main>
    </div>
  );
}
