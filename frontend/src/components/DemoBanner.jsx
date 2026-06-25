// Aviso permanente: esta aplicação é um projeto de portfólio/estudo, e NÃO um
// cassino real. Renderizado no topo de todas as páginas (montado no App.jsx).
export default function DemoBanner() {
  return (
    <div className="bg-amber-500/15 border-b border-amber-500/40 text-amber-200">
      <p className="max-w-7xl mx-auto px-4 py-1.5 text-center text-[11px] sm:text-xs leading-snug">
        🎓 <strong className="font-semibold">Ambiente de demonstração</strong> — projeto de portfólio/estudo.
        Sem dinheiro real · empresa, CNPJ e licença são fictícios · saldo meramente ilustrativo.
      </p>
    </div>
  );
}
