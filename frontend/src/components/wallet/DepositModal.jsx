import { useState } from 'react';
import api from '../../services/api';

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

// Crédito de saldo de demonstração — projeto de portfólio, sem dinheiro real.
export default function DepositModal({ onClose, onSuccess }) {
  const [step, setStep] = useState('input'); // input | success
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credited, setCredited] = useState(0);

  const handleAdd = async () => {
    const val = parseFloat(amount);
    if (!val || val < 1) { setError('Valor mínimo: R$ 1,00'); return; }
    if (val > 10000) { setError('Valor máximo: R$ 10.000,00'); return; }
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/wallet/deposit', { amount: val });
      setCredited(val);
      setStep('success');
      onSuccess(data.balance);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao adicionar saldo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md bg-casino-card border border-casino-border rounded-2xl shadow-2xl animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-casino-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-casino-gold/15 rounded-lg flex items-center justify-center text-lg">🎮</div>
            <div>
              <h2 className="text-white font-bold">Adicionar saldo</h2>
              <p className="text-casino-muted text-xs">Saldo de demonstração — sem dinheiro real</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg text-casino-muted hover:text-white hover:bg-casino-surface transition-colors flex items-center justify-center text-xl leading-none">×</button>
        </div>

        <div className="p-5">
          {step === 'input' && (
            <div className="space-y-5">
              <div>
                <label className="block text-casino-muted text-xs uppercase tracking-wide mb-3">Valor rápido</label>
                <div className="grid grid-cols-5 gap-2">
                  {QUICK_AMOUNTS.map(v => (
                    <button key={v} onClick={() => { setAmount(String(v)); setError(''); }}
                      className={`py-2 rounded-lg text-sm font-semibold border transition-all ${
                        amount === String(v)
                          ? 'bg-casino-gold text-casino-bg border-casino-gold'
                          : 'border-casino-border text-casino-muted hover:border-casino-gold hover:text-white'
                      }`}>
                      {v >= 1000 ? `${v/1000}k` : v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-casino-muted text-xs uppercase tracking-wide mb-1.5">Outro valor</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-casino-muted text-sm">R$</span>
                  <input type="number" min="1" max="10000" value={amount}
                    onChange={e => { setAmount(e.target.value); setError(''); }}
                    placeholder="0,00" className="input-casino pl-10" />
                </div>
                <p className="text-casino-muted text-xs mt-1.5">Mín. R$ 1 · Máx. R$ 10.000</p>
              </div>

              {error && <p className="text-casino-danger text-sm">{error}</p>}

              <div className="bg-casino-surface border border-casino-border rounded-lg p-3 text-xs text-casino-muted">
                Ambiente de demonstração: o saldo é fictício e serve apenas para testar os jogos. Nenhum pagamento é processado.
              </div>

              <button onClick={handleAdd} disabled={loading || !amount}
                className="btn-gold w-full text-base">
                {loading
                  ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-casino-bg border-t-transparent rounded-full animate-spin"/>Adicionando...</span>
                  : 'Adicionar saldo de demonstração'}
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4 animate-slide-up">
              <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto text-3xl">✓</div>
              <div>
                <h3 className="text-white text-xl font-bold">Saldo adicionado!</h3>
                <p className="text-casino-muted text-sm mt-1">
                  R$ {credited.toFixed(2).replace('.', ',')} de saldo de demonstração creditado.
                </p>
              </div>
              <button onClick={onClose} className="btn-gold w-full">Ir para os Jogos</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
