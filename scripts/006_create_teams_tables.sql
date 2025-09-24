-- Adicionar tabela de equipas
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  max_members INTEGER DEFAULT 5 CHECK (max_members > 0 AND max_members <= 10),
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Adicionar tabela de membros das equipas
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_id, user_id),
  UNIQUE(user_id) -- Um usuário só pode estar em uma equipa
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_teams_total_points ON teams(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);

-- RLS (Row Level Security) para as equipas
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela teams
CREATE POLICY "Teams são visíveis para todos" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Usuários autenticados podem criar equipas" ON teams
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Apenas líderes podem atualizar equipas" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = teams.id 
      AND user_id = auth.uid() 
      AND role = 'leader'
    )
  );

CREATE POLICY "Apenas líderes podem deletar equipas" ON teams
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members 
      WHERE team_id = teams.id 
      AND user_id = auth.uid() 
      AND role = 'leader'
    )
  );

-- Políticas para a tabela team_members
CREATE POLICY "Membros das equipas são visíveis para todos" ON team_members
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem se juntar a equipas" ON team_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem sair das suas equipas" ON team_members
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Líderes podem remover membros" ON team_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM team_members tm 
      WHERE tm.team_id = team_members.team_id 
      AND tm.user_id = auth.uid() 
      AND tm.role = 'leader'
    )
  );

-- Função para atualizar os pontos totais das equipas
CREATE OR REPLACE FUNCTION update_team_total_points()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar pontos da equipa quando um membro é adicionado/removido
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    UPDATE teams 
    SET total_points = (
      SELECT COALESCE(SUM(u.total_points), 0)
      FROM team_members tm
      JOIN users u ON tm.user_id = u.id
      WHERE tm.team_id = COALESCE(NEW.team_id, OLD.team_id)
    ),
    updated_at = now()
    WHERE id = COALESCE(NEW.team_id, OLD.team_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar pontos das equipas
DROP TRIGGER IF EXISTS trigger_update_team_points ON team_members;
CREATE TRIGGER trigger_update_team_points
  AFTER INSERT OR DELETE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_total_points();

-- Função para atualizar pontos das equipas quando os pontos dos usuários mudam
CREATE OR REPLACE FUNCTION update_team_points_on_user_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar pontos de todas as equipas que o usuário pertence
  UPDATE teams 
  SET total_points = (
    SELECT COALESCE(SUM(u.total_points), 0)
    FROM team_members tm
    JOIN users u ON tm.user_id = u.id
    WHERE tm.team_id = teams.id
  ),
  updated_at = now()
  WHERE id IN (
    SELECT team_id 
    FROM team_members 
    WHERE user_id = NEW.id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar pontos das equipas quando pontos dos usuários mudam
DROP TRIGGER IF EXISTS trigger_update_team_points_on_user_change ON users;
CREATE TRIGGER trigger_update_team_points_on_user_change
  AFTER UPDATE OF total_points ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_team_points_on_user_change();