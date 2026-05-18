CREATE DATABASE IF NOT EXISTS plusTourists;

USE plusTourists;

CREATE TABLE empresa (
    id_empresa INT PRIMARY KEY AUTO_INCREMENT,
    razao_social VARCHAR(200) NOT NULL,
    nome_fantasia VARCHAR(200),
    cnpj CHAR(14) UNIQUE NOT NULL,
    email_contato VARCHAR(150) NOT NULL,
    cep CHAR(9) NOT NULL,
    numero CHAR(8) NOT NULL,
    complemento VARCHAR(100),
    codigo_ativacao CHAR(6),
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE funcionario (
    id_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(11) UNIQUE NOT NULL,
    email VARCHAR(200) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    nivel_acesso INT NOT NULL,
    id_empresa INT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa)
);

CREATE TABLE log(
    id_log INT PRIMARY KEY AUTO_INCREMENT,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    statuss VARCHAR(30),
    nivel VARCHAR(45),
    acao_efetuada VARCHAR(100),
    tabela_afetada VARCHAR(50),
    descricao TEXT
);

CREATE TABLE pais_origem (
    id_pais INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE estado (
    id_estado INT PRIMARY KEY AUTO_INCREMENT,
    nome_estado VARCHAR(100) NOT NULL DEFAULT 'SEM NOME',
    UF CHAR(2) NOT NULL UNIQUE
);

CREATE TABLE via_acesso (
    id_via INT PRIMARY KEY AUTO_INCREMENT,
    via VARCHAR(50)
);

CREATE TABLE municipio (
    id_municipio INT PRIMARY KEY AUTO_INCREMENT,
    municipio VARCHAR(200) NOT NULL,
    id_estado INT NOT NULL,
    FOREIGN KEY (id_estado) REFERENCES estado (id_estado)
);

CREATE TABLE status_plano (
    id_status_plano INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE classificacao_etaria (
    id_classificacao INT PRIMARY KEY AUTO_INCREMENT,
    classificacao VARCHAR(100) NOT NULL
);

CREATE TABLE plano_turistico (
    id_plano INT PRIMARY KEY AUTO_INCREMENT,
    dt_inicio DATE NOT NULL,
    dt_fim DATE NOT NULL,
    id_empresa INT NOT NULL,
    id_status_plano INT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa),
    FOREIGN KEY (id_status_plano) REFERENCES status_plano (id_status_plano)
);

CREATE TABLE evento (
    id_evento INT PRIMARY KEY AUTO_INCREMENT,
    nome_evento VARCHAR(200) NOT NULL,
    descricao_evento TEXT,
    id_municipio INT NOT NULL,
    id_classificacao INT NOT NULL,
    FOREIGN KEY (id_municipio) REFERENCES municipio (id_municipio),
    Foreign Key (id_classificacao) REFERENCES classificacao_etaria (id_classificacao)
);

CREATE TABLE roteiro (
    id_roteiro INT,
    id_plano INT,
    id_evento INT,
    Foreign Key (id_plano) REFERENCES plano_turistico (id_plano),
    Foreign Key (id_evento) REFERENCES evento (id_evento),
    CONSTRAINT pk_roteiro PRIMARY KEY (
        id_roteiro,
        id_plano,
        id_evento
    )
);

CREATE TABLE organizador (
    id_organizador INT PRIMARY KEY AUTO_INCREMENT,
    nome_organizador VARCHAR(200) NOT NULL,
    site_compra_ingresso TEXT
);

CREATE TABLE edicao (
    id_edicao INT PRIMARY KEY AUTO_INCREMENT,
    dt_inicio DATE,
    dt_fim DATE,
    hr_inicio TIME,
    hr_final TIME,
    ano_realizacao CHAR(4),
    publico_esperado INT,
    publico_atingido INT,
    id_evento INT NOT NULL,
    id_organizador INT NOT NULL,
    FOREIGN KEY (id_evento) REFERENCES evento (id_evento),
    FOREIGN KEY (id_organizador) REFERENCES organizador (id_organizador)
);

INSERT INTO
    status_plano (nome)
VALUES ('Pendente'),
    ('Aprovado'),
    ('Rejeitado');

INSERT INTO
    empresa (
        id_empresa,
        nome_fantasia,
        razao_social,
        cnpj,
        cep,
        numero,
        email_contato,
        codigo_ativacao
    )
VALUES (
        1,
        '+Tourists',
        'PlusTourists LTDA',
        '00000000000000',
        '00000-000',
        'S/N',
        'contato@plustourists.com',
        'touris'
    );

INSERT INTO
    funcionario (
        nome,
        cpf,
        email,
        senha,
        nivel_acesso,
        id_empresa
    )
VALUES (
        'Anna',
        '00000000000',
        'anna@plustourists.com',
        'senha123',
        1,
        1
    );