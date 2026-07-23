-- Adiciona a coluna custom_end_date e colunas de duração à tabela competitions
ALTER TABLE competitions
ADD COLUMN custom_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN duration_type VARCHAR(10),
ADD COLUMN duration_value INTEGER,
ADD COLUMN duration_minutes INTEGER;
