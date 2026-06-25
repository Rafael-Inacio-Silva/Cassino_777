import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import LobbyPage from './pages/LobbyPage';
import HistoryPage from './pages/HistoryPage';
import AdminPage from './pages/AdminPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import DemoBanner from './components/DemoBanner';

// ─── Tela de pendência de verificação ────────────────────────────────────────
function EmailPendingWall() {
  const { user, resendVerification, logout } = useAuth();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try { await resendVerification(); setSent(true); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-casino-bg flex items-center justify-center px-4">
      <div className="card-casino max-w-sm w-full text-center space-y-5">
        <div className="text-6xl">📬</div>
        <h2 className="text-white font-bold text-xl">Confirme seu e-mail</h2>
        <p className="text-casino-muted text-sm leading-relaxed">
          Enviamos um link de ativação para<br />
          <span className="text-casino-gold font-semibold">{user?.email}</span>
        </p>
        <p className="text-casino-muted text-xs">
          Verifique também a pasta de <strong>spam</strong>.<br />
          O link expira em <strong>48 horas</strong>.
        </p>

        {sent ? (
          <div className="bg-green-900/40 border border-green-600 text-green-300 rounded-lg px-4 py-3 text-sm">
            E-mail reenviado! Verifique sua caixa de entrada.
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={loading}
            className="btn-outline text-sm px-6 py-2 w-full"
          >
            {loading ? 'Enviando...' : '🔄 Reenviar e-mail de confirmação'}
          </button>
        )}

        <button
          onClick={logout}
          className="text-casino-muted text-xs hover:text-casino-danger transition-colors"
        >
          Sair e usar outro e-mail
        </button>
      </div>
    </div>
  );
}

// ─── Tela de perfil incompleto (Google users) ─────────────────────────────────
function ProfileIncompleteWall() {
  return <Navigate to="/?completar=1" replace />;
}

// ─── Guards ───────────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-casino-bg flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-casino-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/" replace />;

  // Bloqueia se e-mail não verificado
  if (!user.emailVerified) return <EmailPendingWall />;

  // Bloqueia se perfil incompleto (Google sem CPF/data)
  if (!user.profileComplete) return <ProfileIncompleteWall />;

  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  // Usuário logado mas sem verificação/perfil → deixa na rota pública (AuthPage trata)
  if (user && user.emailVerified && user.profileComplete) return <Navigate to="/lobby" replace />;
  return children;
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <DemoBanner />
      <Routes>
        <Route path="/"                element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/lobby"           element={<PrivateRoute><LobbyPage /></PrivateRoute>} />
        <Route path="/historico"       element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
        <Route path="/admin"           element={<PrivateRoute><AdminPage /></PrivateRoute>} />
        <Route path="/verificar-email" element={<VerifyEmailPage />} />
        <Route path="*"                element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
