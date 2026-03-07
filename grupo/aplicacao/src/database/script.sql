CREATE DATABASE maisTuristas;
USE maisTuristas;

CREATE TABLE empresa (
    id_empresa INT PRIMARY KEY AUTO_INCREMENT,
    nome_fantasia VARCHAR(200),
    CNPJ CHAR(14) NOT NULL UNIQUE,
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE funcionario (
    id_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(45),
    CPF CHAR(11),
    email VARCHAR(200),
    senha VARCHAR(45),
    empresa_ligada INT,
    CONSTRAINT fkempresaLigada
    FOREIGN KEY (empresa_ligada) REFERENCES empresa(id_empresa)
);

CREATE TABLE viagem (
    id_viagem INT PRIMARY KEY AUTO_INCREMENT,
    via_acesso VARCHAR(45),
    UF CHAR(2),
    mes VARCHAR(45),
    ano CHAR(4),
    chegadas INT
);

/* CREATE TABLE acesso (
    id_acesso INT PRIMARY KEY AUTO_INCREMENT,
    fk_funcionario INT,
    nome_painel VARCHAR(100),
    tem_acesso BOOLEAN DEFAULT FALSE,
    CONSTRAINT fkFuncionarioAcesso 
        FOREIGN KEY (fk_funcionario) REFERENCES funcionario(id_funcionario)
); */