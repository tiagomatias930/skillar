-- Adiciona colunas de duração à tabela competitions
ALTER TABLE competitions
ADD COLUMN duration_type VARCHAR(10),
ADD COLUMN duration_value INTEGER,
ADD COLUMN duration_minutes INTEGER;
