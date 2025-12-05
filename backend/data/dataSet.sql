CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    senha VARCHAR(200) NOT NULL,
    
    data_criacao TIMESTAMP NOT NULL DEFAULT NOW()
);

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

CREATE TABLE simulacoes (

    id SERIAL PRIMARY KEY,

    id_projeto INTEGER NOT NULL,


    nome_produto VARCHAR(255) NOT NULL,
    demanda_anual NUMERIC(10, 2) NOT NULL,
    custo_pedido NUMERIC(10, 2) NOT NULL,
    custo_manutencao NUMERIC(10, 2) NOT NULL,
    lote_atual_empresa NUMERIC(10, 2),

    lote_otimo_calculado NUMERIC(10, 2) NOT NULL,
    custo_total_atual NUMERIC(10, 2),
    custo_total_otimo NUMERIC(10, 2) NOT NULL,
    economia_anual NUMERIC(10, 2),

    data_simulacao TIMESTAMP DEFAULT NOW(),

    
    CONSTRAINT fk_simulacao_projeto
        FOREIGN KEY (id_projeto)
        REFERENCES projeto (id_grupo)
        ON DELETE CASCADE
);

