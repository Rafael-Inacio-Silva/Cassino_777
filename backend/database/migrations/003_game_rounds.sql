-- Etapa 3: Tabela de rodadas de jogo
CREATE TABLE IF NOT EXISTS game_rounds (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID NOT NULL REFERENCES users(id),
  game_type      VARCHAR(20) NOT NULL DEFAULT 'roulette',
  result         INTEGER NOT NULL,
  bets           JSONB NOT NULL,
  total_bet      DECIMAL(12,2) NOT NULL,
  total_win      DECIMAL(12,2) NOT NULL DEFAULT 0,
  balance_before DECIMAL(12,2) NOT NULL,
  balance_after  DECIMAL(12,2) NOT NULL,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_rounds_user ON game_rounds(user_id);
CREATE INDEX IF NOT EXISTS idx_game_rounds_created ON game_rounds(created_at DESC);
