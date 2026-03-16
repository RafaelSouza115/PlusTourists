CREATE DATABASE plusTourists;
USE plusTourists;

-- EMPRESA
CREATE TABLE empresa (
    id_empresa INT AUTO_INCREMENT PRIMARY KEY,
    nome_fantasia VARCHAR(45) NOT NULL,
    CNPJ CHAR(14) NOT NULL UNIQUE,
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- FUNCIONARIO
CREATE TABLE funcionario (
    id_funcionario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    CPF CHAR(11) UNIQUE,
    email VARCHAR(200) NOT NULL,
    senha VARCHAR(20) NOT NULL,
    id_empresa INT NOT NULL,

    CONSTRAINT fk_funcionario_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

-- PAIS DE ORIGEM DOS TURISTAS
CREATE TABLE pais_origem (
    id_pais INT AUTO_INCREMENT PRIMARY KEY,
    nome_pais VARCHAR(100) NOT NULL
);

-- ESTADOS DO BRASIL
CREATE TABLE estado (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    nome_estado VARCHAR(100) NOT NULL,
    sigla CHAR(2)
);

-- CIDADE DESTINO
CREATE TABLE cidade (
    id_cidade INT AUTO_INCREMENT PRIMARY KEY,
    nome_cidade VARCHAR(100) NOT NULL,
    id_estado INT,

    CONSTRAINT fk_cidade_estado
        FOREIGN KEY (id_estado) REFERENCES estado(id_estado)
);

-- TIPO DE TRANSPORTE
CREATE TABLE tipo_transporte (
    id_transporte INT AUTO_INCREMENT PRIMARY KEY,
    nome_transporte VARCHAR(50) NOT NULL
);

-- REGISTRO DE TURISMO (dados históricos)
CREATE TABLE registro_turismo (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    data_registro DATE NOT NULL,
    quantidade_turistas INT NOT NULL,
    id_pais INT NOT NULL,
    id_cidade INT NOT NULL,
    id_transporte INT NOT NULL,
    id_empresa INT NOT NULL,

    CONSTRAINT fk_registro_pais
        FOREIGN KEY (id_pais) REFERENCES pais_origem(id_pais),

    CONSTRAINT fk_registro_cidade
        FOREIGN KEY (id_cidade) REFERENCES cidade(id_cidade),

    CONSTRAINT fk_registro_transporte
        FOREIGN KEY (id_transporte) REFERENCES tipo_transporte(id_transporte),

    CONSTRAINT fk_registro_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

-- PLANO TURISTICO (baseado no wireframe)
CREATE TABLE plano_turistico (
    id_plano INT AUTO_INCREMENT PRIMARY KEY,
    id_empresa INT NOT NULL,
    id_pais INT NOT NULL,
    id_cidade INT NOT NULL,
    plano_sugerido VARCHAR(150),
    duracao_recomendada VARCHAR(50),
    orcamento_medio DECIMAL(10,2),
    estrategia_marketing TEXT,

    CONSTRAINT fk_plano_empresa
        FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),

    CONSTRAINT fk_plano_pais
        FOREIGN KEY (id_pais) REFERENCES pais_origem(id_pais),

    CONSTRAINT fk_plano_cidade
        FOREIGN KEY (id_cidade) REFERENCES cidade(id_cidade)
);

-- EXPERIENCIAS DO PLANO
CREATE TABLE experiencia (
    id_experiencia INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(200) NOT NULL,
    id_plano INT NOT NULL,

    CONSTRAINT fk_experiencia_plano
        FOREIGN KEY (id_plano) REFERENCES plano_turistico(id_plano)
);