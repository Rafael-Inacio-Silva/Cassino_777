# 🗺️ Roadmap — inacios777 (projeto de demonstração)

> 🎓 **Projeto de portfólio/estudo — não é um cassino real.** Demonstra engenharia full-stack (Node.js + React + PostgreSQL): autenticação, carteira de **saldo de demonstração** e jogos com motor *server-authoritative*. Não movimenta dinheiro real, não processa pagamentos e não tem licença de operação. A operadora, o CNPJ e a "licença" exibidos na interface são **fictícios**, só para dar realismo à demo.

**Legenda:** ✅ Concluído · 🔄 Parcial · ⏳ Ideia de evolução

---

## O que está pronto

### Fundação técnica ✅
- Monorepo `backend/` (Node.js + Express) e `frontend/` (React + Vite + Tailwind)
- API REST na porta 3001 com `helmet`, CORS restrito ao frontend e body parsing — `backend/src/app.js`
- PostgreSQL com pool de conexões (`pg`) e migrações SQL versionadas
- Trigger automática de `updated_at`; health check em `GET /api/health`
- Identidade visual (dark navy `#08091a` + dourado `#c9952a`, Playfair Display)

### Conta do jogador ✅
- Cadastro com nome, e-mail, **CPF validado** (dígitos verificadores), nascimento e senha
- **Verificação de maioridade (18+)** e unicidade de e-mail/CPF
- Senhas com **bcrypt (cost 12)**; login e-mail/senha com JWT
- **Login social Google OAuth** com vinculação por e-mail e fluxo "completar perfil"
- **Verificação de e-mail obrigatória** (token de 48h, reenvio, bloqueio do lobby até confirmar) — `backend/src/services/emailService.js`

### Carteira (saldo de demonstração) ✅
- **Adicionar saldo:** crédito instantâneo de saldo fictício para testar os jogos — sem pagamento, sem QR Code, sem integração bancária
- Saldo com proteção contra negativo no banco (`balance + delta >= 0`)
- Registro em `transactions` (transação SQL atômica) + extrato paginado na UI

### Jogos (motor server-authoritative) ✅
- **Roleta Francesa** — `POST /api/roulette/spin`: valida as apostas, debita, **sorteia com RNG criptográfico** (`crypto.randomInt`), paga 36/n + *la partage* e grava a rodada, tudo em **uma transação SQL com lock de linha** (sem double-spend). O cliente só anima o resultado — `backend/src/services/rouletteEngine.js`
- Matemática validada por testes (pleno 36x … chances simples 2x, la partage no zero, EV da casa)
- **Blackjack** — máquina de estados no servidor (deal/hit/stand/double/split/insurance), shoe de 6 baralhos com RNG criptográfico, dealer e pagamentos (3:2, 2:1, push) liquidados no backend; estado da mão no banco, nunca exposto — `backend/src/services/blackjackEngine.js`
- Gravação de cada rodada em `game_rounds` (alimenta o GGR do painel) e histórico em `GET /api/roulette/history`
- Lobby com os dois jogos próprios (roleta e blackjack)

### Backoffice (admin) ✅
- Flag `is_admin` + middleware de autorização
- Dashboard: **GGR** (apostado − pago), saldo creditado, pendências, jogadores ativos/novos, atividade diária 30d — `backend/src/controllers/adminController.js`
- Listagem de transações (filtros) e de jogadores (busca) com paginação

---

## Ideias de evolução (estudo)

- ⏳ Recuperação de senha ("esqueci minha senha") por e-mail
- ⏳ Publicar o app Google OAuth (hoje em modo teste no console)
- ⏳ Histórico de apostas/rodadas na UI (consumir `GET /api/roulette/history` na HistoryPage)
- ⏳ Exibir regras e RTP teórico de cada jogo antes de apostar
- ⏳ Rate limiting (login e rotas sensíveis) e bloqueio após tentativas falhas
- ⏳ Testes automatizados (unitários de regras de saldo/prêmios; integração de API; E2E)
- ⏳ Pipeline CI/CD (lint + testes + build a cada push)
- ⏳ Ações administrativas (ajuste manual de saldo com justificativa, bloquear conta)

---

## Dívida técnica conhecida

| # | Item | Severidade | Onde |
|---|---|---|---|
| 1 | Migrações dessincronizadas do schema real (colunas usadas sem migração: `birth_date`, `google_id`, `email_verify_token/expires`; `001_users.sql` exige `cpf`/`password_hash NOT NULL`, incompatível com contas Google) | Alta | `backend/database/migrations/` |
| 2 | Zero testes automatizados | Média | projeto inteiro |
| 3 | Migração `pending_balance` (005) sem código que a utilize (lógica órfã) | Baixa | `backend/database/migrations/005` |

> **Posição:** é um projeto de **demonstração e estudo** de engenharia full-stack. Não se destina a operar com dinheiro real.
