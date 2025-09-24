-- Adicionar colunas para suporte a equipes na tabela participants
ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS participation_type VARCHAR(10) DEFAULT 'solo' CHECK (participation_type IN ('solo', 'team'));

ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS team_id VARCHAR(50);

ALTER TABLE participants 
ADD COLUMN IF NOT EXISTS team_name VARCHAR(100);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_participants_team_id ON participants(team_id);
CREATE INDEX IF NOT EXISTS idx_participants_participation_type ON participants(participation_type);

-- Atualizar participações existentes para serem 'solo'
UPDATE participants SET participation_type = 'solo' WHERE participation_type IS NULL;