var database = require("../database/config");

function cadastrar(nome, cpf, email, senha, empresaLigada) {
    var instrucao = `
        INSERT INTO funcionario (nome, CPF, email, senha, empresa_ligada)
        VALUES (?, ?, ?, ?, ?);
    `;

    return database.execute(instrucao, [nome, cpf, email, senha, empresaLigada]);
}

function autenticar(email, senha) {
    var instrucao = `
        SELECT id_funcionario,
               nome,
               CPF,
               email,
               empresa_ligada
        FROM funcionario
        WHERE email = ? AND senha = ?;
    `;

    return database.execute(instrucao, [email, senha]);
}

module.exports = {
    cadastrar,
    autenticar
};
