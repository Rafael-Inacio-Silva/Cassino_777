-- Etapa 1: Tabela de usuários
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(100)    NOT NULL,
  email         VARCHAR(255)    UNIQUE NOT NULL,
  cpf           VARCHAR(11)     UNIQUE NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  balance       DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
  is_active     BOOLEAN         NOT NULL DEFAULT true,
  created_at    TIMESTAMP       NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_cpf   ON users(cpf);

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
