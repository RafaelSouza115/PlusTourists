DROP DATABASE plusTourists;

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
    nome VARCHAR(100) NOT NULL,
    dt_inicio DATE NOT NULL,
    dt_fim DATE NOT NULL,
    id_empresa INT NOT NULL,
    id_status_plano INT NOT NULL,
    id_municipio INT NOT NULL,
    FOREIGN KEY (id_empresa) REFERENCES empresa (id_empresa),
    FOREIGN KEY (id_status_plano) REFERENCES status_plano (id_status_plano),
    FOREIGN KEY (id_municipio) REFERENCES municipio (id_municipio)
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
    id_roteiro INT AUTO_INCREMENT,
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
        'Agencia Brasil Turismo LTDA',
        'Brasil Turismo',
        '11111111111112',
        'contato@brasilturismo.com',
        '01000-000',
        '100',
        'Sala 10',
        null
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
        'Jonas',
        '00000000000',
        'jonas@brasilturismo.com',
        'senha123',
        1,
        1
    ),
    (
        'Pedro',
        '00000000000',
        'pedro@brasilturismo.com',
        'senha123',
        2,
        1
    ),
    (
        'Anna',
        '00000000000',
        'anna@brasilturismo.com',
        'senha123',
        3,
        1
    );

CREATE VIEW planos_pendentes_aprovacao AS
SELECT e.id_empresa, e.razao_social, f.nome, f.email, COUNT(p.id_plano) AS qtd_planos_pendentes
FROM
    empresa e
    JOIN funcionario f ON f.id_empresa = e.id_empresa
    JOIN plano_turistico p ON p.id_empresa = e.id_empresa
    JOIN status_plano sp ON sp.id_status_plano = p.id_status_plano
WHERE
    sp.nome = 'Pendente'
    AND f.nivel_acesso = 1
GROUP BY
    e.id_empresa,
    e.razao_social,
    f.nome,
    f.email
HAVING
    COUNT(p.id_plano) > 0;

CREATE VIEW todos_estados AS
SELECT id_estado, nome_estado
FROM estado
ORDER BY uf ASC;

CREATE VIEW todos_municipios AS
SELECT mu.id_municipio, mu.municipio, e.uf
FROM municipio mu
    JOIN estado e ON e.id_estado = mu.id_estado;

CREATE VIEW todos_eventos AS
SELECT ev.id_evento, ev.nome_evento, mu.id_municipio, e.id_estado
FROM
    evento ev
    JOIN municipio mu ON mu.id_municipio = ev.id_municipio
    JOIN estado e ON mu.id_estado = e.id_estado;

CREATE VIEW criacao_roteiro AS
SELECT r.id_roteiro, pl.id_plano, e.id_empresa
FROM
    roteiro r
    JOIN plano_turistico pl ON pl.id_plano = r.id_plano
    JOIN empresa e ON e.id_empresa = pl.id_empresa;

CREATE VIEW buscar_planos AS
SELECT
    pl.id_empresa empresa,
    pl.id_plano idPlano,
    pl.nome plano,
    mu.municipio destino,
    es.uf uf,
    DATEDIFF(pl.dt_fim, pl.dt_inicio) duracao,
    CONCAT(
        DATE_FORMAT(pl.dt_inicio, '%b'),
        ' - ',
        DATE_FORMAT(pl.dt_fim, '%b')
    ) periodo,
    DATE_FORMAT(pl.dt_inicio, '%d/%b/%y') inicio,
    DATE_FORMAT(pl.dt_fim, '%d/%b/%y') fim,
    pl.id_status_plano idStatus
FROM
    plano_turistico pl
    JOIN municipio mu ON mu.id_municipio = pl.id_municipio
    JOIN estado es ON es.id_estado = mu.id_estado;

CREATE VIEW detalhar_plano AS
SELECT
    pl.id_plano idPlano,
    pl.nome plano,
    DATEDIFF(pl.dt_fim, pl.dt_inicio) duracao,
    CONCAT(
        DATE_FORMAT(pl.dt_inicio, '%b'),
        ' - ',
        DATE_FORMAT(pl.dt_fim, '%b')
    ) periodo,
    DATE_FORMAT(pl.dt_inicio, '%d/%m/%y') inicio,
    DATE_FORMAT(pl.dt_fim, '%d/%m/%y') fim,
    DATE_FORMAT(pl.dt_inicio, '%d/%b/%y') comeco,
    DATE_FORMAT(pl.dt_fim, '%d/%b/%y') final,
    mu.municipio destino,
    es.uf uf,
    ev.id_evento idEvento,
    ev.nome_evento evento,
    DATE_FORMAT(ed.dt_inicio, '%d/%m/%y') inicioEvento,
    DATE_FORMAT(ed.dt_fim, '%d/%m/%y') fimEvento,
    ce.classificacao classificacao
FROM
    plano_turistico pl
    JOIN municipio mu ON mu.id_municipio = pl.id_municipio
    JOIN estado es ON es.id_estado = mu.id_estado
    JOIN roteiro ro ON ro.id_plano = pl.id_plano
    JOIN evento ev ON ev.id_evento = ro.id_evento
    JOIN classificacao_etaria ce ON ce.id_classificacao = ev.id_classificacao
    LEFT JOIN (
        SELECT e1.*
        FROM edicao e1
            INNER JOIN (
                SELECT id_evento, MAX(dt_inicio) ultima_data
                FROM edicao
                GROUP BY
                    id_evento
            ) e2 ON e1.id_evento = e2.id_evento
            AND e1.dt_inicio = e2.ultima_data
    ) ed ON ed.id_evento = ev.id_evento
ORDER BY ev.id_evento;