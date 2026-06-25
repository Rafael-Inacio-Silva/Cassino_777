import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCpf(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/** Verifica localmente se o CPF tem dígitos verificadores válidos */
function isValidCPF(cpf) {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += +c[i] * (10 - i);
  let d1 = (s * 10) % 11; if (d1 >= 10) d1 = 0;
  if (d1 !== +c[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += +c[i] * (11 - i);
  let d2 = (s * 10) % 11; if (d2 >= 10) d2 = 0;
  return d2 === +c[10];
}

function calcAge(dateStr) {
  if (!dateStr) return 0;
  const today = new Date();
  const born = new Date(dateStr);
  let age = today.getFullYear() - born.getFullYear();
  const m = today.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
  return age;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function Alert({ type, message }) {
  const cls = type === 'error'
    ? 'bg-red-900/40 border-casino-danger text-red-300'
    : 'bg-green-900/40 border-green-600 text-green-300';
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm animate-fade-in ${cls}`}>
      {message}
    </div>
  );
}

function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-casino-border" />
      <span className="text-casino-muted text-xs">{label}</span>
      <div className="flex-1 h-px bg-casino-border" />
    </div>
  );
}

// ─── Tela: e-mail não verificado ──────────────────────────────────────────────

function EmailVerificationBanner({ email, onResend }) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    try {
      await onResend();
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center space-y-4 animate-fade-in">
      <div className="text-5xl">📬</div>
      <h2 className="text-white font-bold text-xl">Confirme seu e-mail</h2>
      <p className="text-casino-muted text-sm leading-relaxed">
        Enviamos um link de confirmação para<br />
        <span className="text-casino-gold font-semibold">{email}</span>
      </p>
      <p className="text-casino-muted text-xs">
        Verifique também a pasta de spam. O link expira em 24 horas.
      </p>
      {sent
        ? <Alert type="success" message="E-mail reenviado! Verifique sua caixa de entrada." />
        : (
          <button
            onClick={handleResend}
            disabled={loading}
            className="btn-outline text-sm px-6 py-2 mt-2"
          >
            {loading ? 'Reenviando...' : 'Reenviar e-mail'}
          </button>
        )
      }
    </div>
  );
}

// ─── Tela: completar perfil (Google users) ────────────────────────────────────

function CompleteProfileForm({ onComplete }) {
  const { completeProfile } = useAuth();
  const [form, setForm] = useState({ cpf: '', birthDate: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'cpf' ? formatCpf(value) : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidCPF(form.cpf)) { setError('CPF inválido. Verifique os números.'); return; }
    if (calcAge(form.birthDate) < 18) { setError('Você deve ter 18 anos ou mais para jogar.'); return; }

    setLoading(true);
    try {
      await completeProfile({ cpf: form.cpf, birthDate: form.birthDate });
      onComplete();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🎰</div>
        <h2 className="text-white font-bold text-xl">Quase lá!</h2>
        <p className="text-casino-muted text-sm mt-1">
          Precisamos de mais algumas informações para liberar sua conta.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <div>
          <label className="block text-casino-muted text-xs font-medium mb-1.5 uppercase tracking-wide">
            CPF
          </label>
          <input
            name="cpf" type="text" value={form.cpf} onChange={handle}
            placeholder="000.000.000-00"
            className="input-casino" required maxLength={14}
          />
        </div>

        <div>
          <label className="block text-casino-muted text-xs font-medium mb-1.5 uppercase tracking-wide">
            Data de Nascimento
          </label>
          <input
            name="birthDate" type="date" value={form.birthDate} onChange={handle}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18))
              .toISOString().split('T')[0]}
            className="input-casino" required
          />
          <p className="text-casino-muted text-xs mt-1">Você deve ter 18 anos ou mais.</p>
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full text-base mt-2">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-casino-bg border-t-transparent rounded-full animate-spin" />
              Salvando...
            </span>
          ) : 'Completar Cadastro'}
        </button>
      </form>
    </div>
  );
}

// ─── Formulário de Login ──────────────────────────────────────────────────────

function LoginForm({ onSuccess, onNeedsVerification, onNeedsCompletion }) {
  const { login, googleLogin } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (!data.user.emailVerified) {
        onNeedsVerification(data.user.email);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    try {
      const data = await googleLogin(credential);
      if (data.needsCompletion) {
        onNeedsCompletion();
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao entrar com Google.');
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 animate-slide-up">
      {error && <Alert type="error" message={error} />}

      {GOOGLE_CLIENT_ID && (
        <>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(r) => handleGoogle(r.credential)}
                onError={() => setError('Falha ao conectar com Google.')}
                theme="filled_black"
                shape="rectangular"
                text="continue_with"
                locale="pt_BR"
                width="340"
              />
            </div>
          </GoogleOAuthProvider>
          <Divider label="ou entre com e-mail" />
        </>
      )}

      <div>
        <label className="block text-casino-muted text-xs font-medium mb-1.5 uppercase tracking-wide">E-mail</label>
        <input name="email" type="email" value={form.email} onChange={handle}
          placeholder="seu@email.com" className="input-casino" required autoComplete="email" />
      </div>

      <div>
        <label className="block text-casino-muted text-xs font-medium mb-1.5 uppercase tracking-wide">Senha</label>
        <input name="password" type="password" value={form.password} onChange={handle}
          placeholder="••••••••" className="input-casino" required autoComplete="current-password" />
        <p className="text-right mt-1.5">
          <button type="button" className="text-casino-gold text-xs hover:underline">Esqueci minha senha</button>
        </p>
      </div>

      <button type="submit" disabled={loading} className="btn-gold w-full text-base">
        {loading
          ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-casino-bg border-t-transparent rounded-full animate-spin" />Entrando...</span>
          : 'Entrar'}
      </button>
    </form>
  );
}

// ─── Formulário de Cadastro ───────────────────────────────────────────────────

function RegisterForm({ onSuccess, onNeedsVerification, onNeedsCompletion }) {
  const { register, googleLogin } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', cpf: '', birthDate: '', password: '', confirm: '', terms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'cpf') setForm(prev => ({ ...prev, cpf: formatCpf(value) }));
    else setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidCPF(form.cpf)) { setError('CPF inválido. Verifique os números.'); return; }
    if (calcAge(form.birthDate) < 18) { setError('Você deve ter 18 anos ou mais para se cadastrar.'); return; }
    if (form.password !== form.confirm) { setError('As senhas não coincidem.'); return; }
    if (!form.terms) { setError('Você deve aceitar os termos para continuar.'); return; }

    setLoading(true);
    try {
      const data = await register({
        name: form.name,
        email: form.email,
        cpf: form.cpf,
        birthDate: form.birthDate,
        password: form.password,
      });
      onNeedsVerification(data.user.email);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential) => {
    try {
      const data = await googleLogin(credential);
      if (data.needsCompletion) {
        onNeedsCompletion();
      } else {
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao entrar com Google.');
    }
  };

  const maxBirthDate = new Date(new Date().setFullYear(new Date().getFullYear() - 18))
    .toISOString().split('T')[0];

  return (
    <form onSubmit={submit} className="space-y-4 animate-slide-up">
      {error && <Alert type="error" message={error} />}

      {GOOGLE_CLIENT_ID && (
        <>
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={(r) => handleGoogle(r.credential)}
                onError={() => setError('Falha ao conectar com Google.')}
                theme="filled_black"
                shape="rectangular"
                text="signup_with"
                locale="pt_BR"
                width="340"
              />
            </div>
          </GoogleOAuthProvider>
          <Divider label="ou cadastre com e-mail" />
        </>
      )}

      <div>
        <label className="block text-casino-muted text-xs font-medium mb-1.5 uppercase tracking-wide">Nome completo</label>
        <input name="name" type="text" value={form.name} onChange={handle}
          placeholder="Seu nome completo" className="input-casino" required autoComplete="name" />
      </div>

      <div>
        <label className="block text-casino-muted text-xs font-medium mb-1.5 uppercase tracking-wide">E-mail</label>
        <input name="email" type="email" value={form.email} onChange={handle}
          placeholder="seu@email.com" className="input-casino" required autoComplete="email" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-casino-muted text-xs font-medium mb-1.5 uppercase tracking-wide">CPF</label>
          <input name="cpf" type="text" value={form.cpf} onChange={handle}
            placeholder="000.000.000-00" className="input-casino" required maxLength={14} />
        </div>
        <div>
          <label className="block text-casino-muted text-xs font-medium mb-1.5 uppercase tracking-wide">Nascimento</label>
          <input name="birthDate" type="date" value={form.birthDate} onChange={handle}
            max={maxBirthDate} className="input-casino" required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-casino-muted text-xs font-medium mb-1.5 uppercase tracking-wide">Senha</label>
          <input name="password" type="password" value={form.password} onChange={handle}
            placeholder="Mín. 6 caracteres" className="input-casino" required autoComplete="new-password" />
        </div>
        <div>
          <label className="block text-casino-muted text-xs font-medium mb-1.5 uppercase tracking-wide">Confirmar</label>
          <input name="confirm" type="password" value={form.confirm} onChange={handle}
            placeholder="Repita a senha" className="input-casino" required autoComplete="new-password" />
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input name="terms" type="checkbox" checked={form.terms} onChange={handle}
          className="mt-0.5 accent-casino-gold w-4 h-4 flex-shrink-0" />
        <span className="text-casino-muted text-xs leading-relaxed group-hover:text-white transition-colors">
          Tenho 18+ anos e aceito os{' '}
          <button type="button" className="text-casino-gold hover:underline">Termos de Uso</button>
          {' '}e a{' '}
          <button type="button" className="text-casino-gold hover:underline">Política de Privacidade</button>.
        </span>
      </label>

      <button type="submit" disabled={loading} className="btn-gold w-full text-base">
        {loading
          ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-casino-bg border-t-transparent rounded-full animate-spin" />Criando conta...</span>
          : 'Criar Conta Grátis'}
      </button>
    </form>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AuthPage() {
  const [tab, setTab] = useState('login');
  const [screen, setScreen] = useState('auth'); // 'auth' | 'verify' | 'complete'
  const [verifyEmail, setVerifyEmail] = useState('');
  const { resendVerification } = useAuth();
  const navigate = useNavigate();

  const goToLobby = () => navigate('/lobby');

  const handleNeedsVerification = (email) => {
    setVerifyEmail(email);
    setScreen('verify');
  };

  const handleNeedsCompletion = () => setScreen('complete');

  return (
    <div className="min-h-screen bg-casino-bg flex flex-col">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-casino-gold/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-casino-gold/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/5 rounded-full blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-8">
            <span className="text-4xl font-display font-black tracking-wider text-white">
              INACIOS<span className="text-casino-gold">777</span>
            </span>
            <p className="text-casino-muted text-xs tracking-[0.3em] uppercase mt-1">Cassino Online</p>
          </div>

          {/* Card */}
          <div className="card-casino shadow-2xl shadow-black/50">

            {screen === 'verify' && (
              <EmailVerificationBanner
                email={verifyEmail}
                onResend={resendVerification}
              />
            )}

            {screen === 'complete' && (
              <CompleteProfileForm onComplete={goToLobby} />
            )}

            {screen === 'auth' && (
              <>
                {/* Tabs */}
                <div className="flex mb-6 bg-casino-surface rounded-lg p-1">
                  {['login', 'register'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                        tab === t
                          ? 'bg-gold-gradient text-casino-bg shadow-md'
                          : 'text-casino-muted hover:text-white'
                      }`}
                    >
                      {t === 'login' ? 'Entrar' : 'Criar Conta'}
                    </button>
                  ))}
                </div>

                {tab === 'login'
                  ? <LoginForm
                      onSuccess={goToLobby}
                      onNeedsVerification={handleNeedsVerification}
                      onNeedsCompletion={handleNeedsCompletion}
                    />
                  : <RegisterForm
                      onSuccess={goToLobby}
                      onNeedsVerification={handleNeedsVerification}
                      onNeedsCompletion={handleNeedsCompletion}
                    />
                }
              </>
            )}
          </div>

          {/* Rodapé */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-casino-muted text-xs">
              Projeto de demonstração · sem dinheiro real · empresa e licença fictícias
            </p>
            <div className="flex items-center justify-center gap-4 text-casino-muted text-xs">
              <button className="hover:text-casino-gold transition-colors">Suporte</button>
              <span>·</span>
              <button className="hover:text-casino-gold transition-colors">Termos</button>
              <span>·</span>
              <button className="hover:text-casino-gold transition-colors">Privacidade</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
