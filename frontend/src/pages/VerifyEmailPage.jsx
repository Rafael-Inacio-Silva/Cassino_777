import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading');
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) { setStatus('error'); return; }

    api.get(`/auth/verify-email/${token}`)
      .then(async () => {
        setStatus('success');
        // Atualiza o estado do React com os dados frescos do servidor
        await refreshUser();
        // Redireciona ao lobby após 2s
        setTimeout(() => navigate('/lobby', { replace: true }), 2000);
      })
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-casino-bg flex items-center justify-center px-4">
      <div className="card-casino max-w-sm w-full text-center space-y-4">

        {status === 'loading' && (
          <>
            <div className="w-10 h-10 border-2 border-casino-gold border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-casino-muted">Verificando seu e-mail...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl">✅</div>
            <h2 className="text-white font-bold text-xl">E-mail confirmado!</h2>
            <p className="text-casino-muted text-sm">
              Sua conta está ativa. Entrando no lobby...
            </p>
            <div className="w-6 h-6 border-2 border-casino-gold border-t-transparent rounded-full animate-spin mx-auto" />
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl">❌</div>
            <h2 className="text-white font-bold text-xl">Link inválido ou expirado</h2>
            <p className="text-casino-muted text-sm leading-relaxed">
              O link de verificação expirou ou já foi usado.<br />
              Faça login e solicite um novo e-mail de confirmação.
            </p>
            <Link to="/" className="btn-outline inline-block px-8 py-3 text-sm">
              Ir para o Login
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
