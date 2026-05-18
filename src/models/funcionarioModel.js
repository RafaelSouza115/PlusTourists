var database = require("../database/config");

function cadastrar(nome, cpf, email, senha, fkEmpresa) {
    console.log("ACESSEI O USUARIO MODEL \n \n\t\t >> Se aqui der erro de 'Error: connect ECONNREFUSED',\n \t\t >> verifique suas credenciais de acesso ao banco\n \t\t >> e se o servidor de seu BD está rodando corretamente. \n\n function cadastrar():", nome, email, senha, fkEmpresa);
    var instrucao = `
        INSERT INTO funcionario (nome, cpf, email, senha, id_empresa, nivel_acesso)
        VALUES (?, ?, ?, ?, ?, 1);
    `;
    var instrucao2 = `
        UPDATE empresa SET codigo_ativacao = 0 WHERE id_empresa = ?;
    `;

    console.log("Executando a instrução SQL: \n" + instrucao);
    return database.execute(instrucao, [nome, cpf, email, senha, fkEmpresa])
        .then(() => {
            console.log("Executando a instrução SQL: \n" + instrucao2);
            return database.execute(instrucao2, [fkEmpresa])
    });
}

function autenticar(email, senha) {
    var instrucao = `
        SELECT id_funcionario,
               nome,
               cpf,
               email,
               id_empresa AS empresa_ligada
        FROM funcionario
        WHERE email = ? AND senha = ?;
    `;

    return database.execute(instrucao, [email, senha]);
}

function buscarPorId(idFuncionario) {

    var instrucao = `
        SELECT
            id_funcionario,
            nome,
            cpf,
            email,
            nivel_acesso,
            id_empresa
        FROM funcionario
        WHERE id_funcionario = ?;
    `;

    console.log("Executando SQL:");
    console.log(instrucao);

    return database.execute(instrucao, [idFuncionario]);
}

function atualizar(idFuncionario, nome, email, senha) {

    var instrucao = "";
    var parametros = [];

    if (senha) {

        instrucao = `
            UPDATE funcionario
            SET
                nome = ?,
                email = ?,
                senha = ?
            WHERE id_funcionario = ?;
        `;

        parametros = [
            nome,
            email,
            senha,
            idFuncionario
        ];

    } else {

        instrucao = `
            UPDATE funcionario
            SET
                nome = ?,
                email = ?
            WHERE id_funcionario = ?;
        `;

        parametros = [
            nome,
            email,
            idFuncionario
        ];
    }

    console.log("Executando SQL:");
    console.log(instrucao);

    return database.execute(instrucao, parametros);
}

module.exports = {
    cadastrar,
    autenticar,
    buscarPorId,
    atualizar
};
