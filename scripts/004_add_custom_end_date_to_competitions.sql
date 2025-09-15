-- Adiciona a coluna custom_end_date à tabela competitions
ALTER TABLE competitions
ADD COLUMN custom_end_date TIMESTAMP WITH TIME ZONE;
