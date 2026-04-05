var database = require("../database/config");

function cadastrar(nome, cpf, email, senha, fkEmpresa) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha, fkEmpresa);
    var instrucao = `
        INSERT INTO funcionario (nome, CPF, email, senha, id_empresa)
        VALUES (?, ?, ?, ?, ?);
    `;

    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.execute(instrucao, [nome, cpf, email, senha, fkEmpresa]);
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
