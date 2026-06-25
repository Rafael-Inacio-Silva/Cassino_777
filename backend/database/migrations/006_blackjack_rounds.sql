-- Etapa 6: rodadas de blackjack (estado da mão ativa + auditoria)
-- O estado completo (incl. shoe embaralhado no servidor) fica em `state` JSONB,
-- nunca exposto ao cliente além das cartas reveladas. Uma rodada 'active' por
-- jogador por vez; ao terminar vira 'finished' e o resultado também é gravado
-- em game_rounds (game_type='blackjack') para alimentar o GGR do admin.
CREATE TABLE IF NOT EXISTS blackjack_rounds (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id),
  status         VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','finished')),
  state          JSONB NOT NULL,
  base_bet       DECIMAL(12,2) NOT NULL,
  total_bet      DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_win      DECIMAL(12,2) NOT NULL DEFAULT 0,
  outcome        VARCHAR(30),
  balance_before DECIMAL(12,2) NOT NULL,
  balance_after  DECIMAL(12,2),
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Garante no máximo uma rodada ativa por jogador
CREATE UNIQUE INDEX IF NOT EXISTS idx_bj_one_active_per_user
  ON blackjack_rounds(user_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_bj_user_created
  ON blackjack_rounds(user_id, created_at DESC);

CREATE TRIGGER trg_blackjack_rounds_updated_at
  BEFORE UPDATE ON blackjack_rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
