CREATE DATABASE plusTourists;
USE plusTourists;

CREATE TABLE empresa (
    id_empresa INT PRIMARY KEY AUTO_INCREMENT,
    nome_fantasia VARCHAR(200), 
    razao_social VARCHAR(200) NOT NULL,
    cnpj CHAR(14) UNIQUE NOT NULL,
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    cep CHAR(9) NOT NULL,
    complemento VARCHAR(50),
    numero CHAR(6) NOT NULL,
    email_contato VARCHAR(150) NOT NULL,
    codigo_ativacao CHAR(6) NOT NULL
);

CREATE TABLE funcionario (
    id_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(11) UNIQUE NOT NULL,
    email VARCHAR(200) NOT NULL,
    senha VARCHAR(20) NOT NULL,
    nivel_acesso INT NOT NULL,
    id_empresa INT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE status_plano (
    id_status_plano INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE plano_turistico (
    id_plano INT PRIMARY KEY AUTO_INCREMENT,
    id_empresa INT NOT NULL,
    orcamento_medio DECIMAL(10,2),
    id_status_plano INT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa),
    FOREIGN KEY (id_status_plano) REFERENCES status_plano(id_status_plano)
);

CREATE TABLE locall (
    id_local INT PRIMARY KEY AUTO_INCREMENT,
    municipio VARCHAR(100) NOT NULL,
    regiao_turistica VARCHAR(100),
    id_estado INT NOT NULL,
    FOREIGN KEY (id_estado) REFERENCES estado(id_estado)
);
CREATE TABLE atividade (
    id_atividade INT PRIMARY KEY AUTO_INCREMENT,
    ordem_no_roteiro INT,
    id_edicao INT NOT NULL,
    id_plano INT NOT NULL,
    FOREIGN KEY (id_edicao) REFERENCES edicao(id_edicao),
    FOREIGN KEY (id_plano) REFERENCES plano_turistico(id_plano)
);

CREATE TABLE edicao (
    id_edicao INT PRIMARY KEY AUTO_INCREMENT,
    data_inicio DATE,
    data_fim DATE,
    horario_inicio TIME,
    horario_final TIME,
    publico_realizado INT,
    ano_referencia INT,
    publico_esperado INT,
    id_evento INT NOT NULL,
    id_organizador INT NOT NULL,
    FOREIGN KEY (id_evento) REFERENCES evento(id_evento),
    FOREIGN KEY (id_organizador) REFERENCES organizador(id_organizador)
);

CREATE TABLE organizador (
    id_organizador INT PRIMARY KEY AUTO_INCREMENT,
    nome_organizador VARCHAR(150) NOT NULL,
    site_compra_ingresso TEXT
);

CREATE TABLE evento (
    id_evento INT PRIMARY KEY AUTO_INCREMENT,
    nome_evento VARCHAR(150) NOT NULL,
    descricao_evento TEXT,
    classificacao_etaria VARCHAR(40),
    tipo_evento VARCHAR(100),
    tipo_publico VARCHAR(45),
    id_local INT NOT NULL,
    FOREIGN KEY (id_local) REFERENCES locall(id_local)
);

CREATE TABLE estado (
    id_estado INT PRIMARY KEY AUTO_INCREMENT,
    nome_estado VARCHAR(100) NOT NULL DEFAULT 'SEM NOME',
    UF CHAR(2) NOT NULL UNIQUE
);

CREATE TABLE pais_origem (
    id_pais INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE tipo_transporte (
    id_transporte INT PRIMARY KEY AUTO_INCREMENT,
    nome_transporte VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE registro_turismo (
    id_registro INT PRIMARY KEY AUTO_INCREMENT,
    data_registro DATE NOT NULL,
    quantidade_turistas INT NOT NULL,
    id_pais INT NOT NULL,
    id_transporte INT NOT NULL,
    id_estado INT NOT NULL,
    id_empresa INT NOT NULL,
    FOREIGN KEY (id_pais) REFERENCES pais_origem(id_pais),
    FOREIGN KEY (id_transporte) REFERENCES tipo_transporte(id_transporte),
    FOREIGN KEY (id_estado) REFERENCES estado(id_estado),
    FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE log (
    id_log INT PRIMARY KEY AUTO_INCREMENT,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    statuss VARCHAR(30),
    nivel VARCHAR(45),
    acao_efetuada VARCHAR(100),
    tabela_afetada VARCHAR(50),
    descricao TEXT
);
INSERT INTO status_plano (nome) VALUES ('Pendente'), ('Aprovado'), ('Rejeitado');
INSERT IGNORE INTO empresa (id_empresa, razao_social, cnpj, cep, numero, email_contato) 
VALUES (1, 'Empresa Padrao', '00000000000000', '00000-000', 'S/N', 'contato@email.com');
insert into funcionario (nome, cpf, email, senha, nivel_acesso, id_empresa) values ('Funcionario Padrão', '00000000000', 'funcionario@email.com', 'senha123', 1, 1);

