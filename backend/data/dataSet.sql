CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    senha VARCHAR(200) NOT NULL,
    
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =========================================
-- 2. TABELA DE GRUPOS
-- Cada usuário pode ter vários grupos
-- Ex.: "Estoque", "Finanças", "Pedidos", etc.
-- =========================================
CREATE TABLE grupos (
    id_grupo SERIAL PRIMARY KEY,

    id_usuario INTEGER NOT NULL,
    nome_grupo VARCHAR(120) NOT NULL,
    descricao TEXT,

    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios (id_usuario)
        ON DELETE CASCADE
);

-- =========================================
-- 3. TABELA DE ITENS DO GRUPO
-- Aqui entram os parâmetros usados nos cálculos,
-- como D, S, H do EOQ ou qualquer variável futura.
-- =========================================
CREATE TABLE itens (
    id_item SERIAL PRIMARY KEY,

    id_grupo INTEGER NOT NULL,
    nome_item VARCHAR(120) NOT NULL,
    descricao TEXT,

    -- Campos genéricos para armazenar parâmetros
    valor1 NUMERIC(12,4),
    valor2 NUMERIC(12,4),
    valor3 NUMERIC(12,4),

    data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),

    FOREIGN KEY (id_grupo)
        REFERENCES grupos (id_grupo)
        ON DELETE CASCADE
);