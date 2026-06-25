import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import DepositModal from '../components/wallet/DepositModal';

const NAV_ITEMS = ['Slots', 'Ao Vivo', 'Roleta', 'Blackjack', 'Promoções'];

const GAMES = [
  { id: 1, name: 'Roleta Francesa', tag: 'AO VIVO', color: 'from-red-900 to-red-700',       img: '/games/roleta.png',         href: '/roulette-fr/index.html', square: true },
  { id: 2, name: 'Blackjack',       tag: 'AO VIVO', color: 'from-green-900 to-emerald-700', img: '/games/blackjack-logo.png', href: '/blackjack/index.html' },
];

function GameCard({ game }) {
  const rounded = game.square ? '' : 'rounded-xl overflow-hidden';
  return (
    <div className={`group relative ${rounded} cursor-pointer border border-casino-border hover:border-casino-gold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-casino-gold/20`}>
      {game.img
        ? <div className={`aspect-square w-full ${game.square ? '' : 'overflow-hidden'}`}>
            <img src={game.img} alt={game.name} className="w-full h-full object-cover object-center" />
          </div>
        : <div className={`bg-gradient-to-br ${game.color} aspect-square flex items-center justify-center`}>
            <span className="text-white/20 text-5xl font-display font-black select-none">{game.name.charAt(0)}</span>
          </div>
      }
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
        {game.href
          ? <a href={game.href} className="opacity-0 group-hover:opacity-100 btn-gold text-sm py-2 px-5 transition-all duration-300 translate-y-2 group-hover:translate-y-0">Jogar</a>
          : <button className="opacity-0 group-hover:opacity-100 btn-gold text-sm py-2 px-5 transition-all duration-300 translate-y-2 group-hover:translate-y-0">Jogar</button>
        }
      </div>
      <div className="absolute top-2 left-2">
        <span className="bg-casino-gold text-casino-bg text-[10px] font-bold px-2 py-0.5 rounded">{game.tag}</span>
      </div>
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white text-xs font-semibold truncate">{game.name}</p>
      </div>
    </div>
  );
}

export default function LobbyPage() {
  const { user, logout, updateBalance, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [modal, setModal] = useState(null); // null | 'deposit'

  const handleLogout = () => { logout(); navigate('/'); };

  // A rodada é liquidada no servidor no momento do giro; aqui só limpamos a
  // sessão de animação pendente e atualizamos o saldo exibido.
  useEffect(() => {
    const SPIN_KEY = 'roulette_spin_session';
    const SPIN_TOTAL_MS = 6000;
    let timeoutId;

    const clearFinishedSpin = async () => {
      let session;
      try { session = JSON.parse(localStorage.getItem(SPIN_KEY)); } catch { return; }
      if (!session?.startTime) { await refreshUser(); return; }

      const elapsed = Date.now() - session.startTime;
      if (elapsed < SPIN_TOTAL_MS) {
        // Animação ainda em andamento em outra aba — aguarda terminar
        timeoutId = setTimeout(clearFinishedSpin, SPIN_TOTAL_MS - elapsed + 500);
        return;
      }

      localStorage.removeItem(SPIN_KEY);
      await refreshUser();
    };

    clearFinishedSpin();
    return () => clearTimeout(timeoutId);
  }, [refreshUser]);

  const handleDepositSuccess = (newBalance) => {
    updateBalance(newBalance);
  };

  return (
    <div className="min-h-screen bg-casino-bg">

      {/* Modais */}
      {modal === 'deposit' && (
        <DepositModal
          onClose={() => setModal(null)}
          onSuccess={(bal) => { handleDepositSuccess(bal); }}
        />
      )}

      {/* Header */}
      <header className="bg-casino-surface border-b border-casino-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

          <span className="text-xl font-display font-black tracking-wider shrink-0">
            INACIOS<span className="text-casino-gold">777</span>
          </span>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button key={item} className="px-4 py-2 text-sm text-casino-muted hover:text-casino-gold rounded-lg hover:bg-casino-card transition-colors">
                {item}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {/* Saldo */}
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-white text-sm font-semibold leading-none">{user?.name?.split(' ')[0]}</span>
              <span className="text-casino-gold text-xs font-bold mt-0.5">
                R$ {Number(user?.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <Link to="/historico" className="hidden sm:block text-casino-muted text-sm hover:text-white transition-colors px-2 py-1">
              Histórico
            </Link>

            {user?.isAdmin && (
              <Link to="/admin" className="hidden sm:block text-casino-gold text-sm font-semibold hover:text-white transition-colors px-2 py-1">
                Admin
              </Link>
            )}

            <button onClick={() => setModal('deposit')} className="btn-gold text-sm py-2 px-4">
              + Adicionar saldo
            </button>

            <button onClick={handleLogout}
              className="w-9 h-9 rounded-lg border border-casino-border flex items-center justify-center text-casino-muted hover:text-casino-danger hover:border-casino-danger transition-colors"
              title="Sair">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-casino-surface via-purple-950/30 to-casino-surface border-b border-casino-border">
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="animate-fade-in">
            <p className="text-casino-gold text-sm font-semibold tracking-widest uppercase mb-2">Bônus de Boas-vindas</p>
            <h1 className="text-4xl md:text-5xl font-display font-black text-white leading-tight">
              DEPOSITE E GANHE<br />
              <span className="text-casino-gold">ATÉ R$ 8.000</span>
            </h1>
            <p className="text-casino-muted mt-3 text-sm max-w-md">
              Faça seu primeiro depósito e receba 100% de bônus. Saldo de demonstração — sem dinheiro real.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal('deposit')} className="btn-gold text-base px-8 py-3">
                Adicionar Saldo
              </button>
              <button className="btn-outline text-base px-6 py-3">Saiba Mais</button>
            </div>
          </div>
          <div className="text-[120px] leading-none select-none opacity-20 font-display font-black text-casino-gold">777</div>
        </div>
      </div>

      {/* Jogos */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-bold text-xl">Jogos em Destaque</h2>
          <button className="text-casino-gold text-sm hover:underline">Ver todos</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {GAMES.map(g => <GameCard key={g.id} game={g} />)}
        </div>

        <div className="mt-12 bg-casino-card border border-casino-border rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="text-3xl">🛡️</div>
          <div>
            <p className="text-white font-semibold">Jogo Responsável</p>
            <p className="text-casino-muted text-sm mt-1">
              Este é um projeto de demonstração (portfólio): não há apostas com dinheiro real. A empresa, o CNPJ e a licença exibidos são fictícios, sem qualquer valor legal.
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-casino-surface border-t border-casino-border mt-10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-casino-muted text-xs">
            © 2026 inacios777 — projeto de portfólio/estudo · Empresa, CNPJ e licença são fictícios (sem valor legal) · Ambiente de demonstração, sem dinheiro real.
          </p>
        </div>
      </footer>
    </div>
  );
}
