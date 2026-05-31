var database = require("../database/config");

async function cadastrar(nome, cpf, email, senha, idEmpresa, nivelAcesso) {
    const instrucaoSql = `
        INSERT INTO funcionario (
            nome,
            cpf,
            email,
            senha,
            nivel_acesso,
            id_empresa
        )
        VALUES (
            '${nome}',
            '${cpf}',
            '${email}',
            '${senha}',
            ${nivelAcesso},
            ${idEmpresa}
        );
    `;

    return database.execute(instrucaoSql);
}

async function listar(idEmpresa) {
    const instrucaoSql = `
        SELECT
            id_funcionario,
            nome,
            cpf,
            email,
            nivel_acesso
        FROM funcionario
        WHERE id_empresa = ${idEmpresa};
    `;

    return database.execute(instrucaoSql);
}

async function buscarPorId(idFuncionario) {
    const instrucaoSql = `
        SELECT
            id_funcionario,
            nome,
            cpf,
            email,
            nivel_acesso
        FROM funcionario
        WHERE id_funcionario = ${idFuncionario};
    `;

    return database.execute(instrucaoSql);
}

async function atualizar(idFuncionario, nome, cpf, email, senha, nivelAcesso) {
    const instrucaoSql = `
        UPDATE funcionario
        SET
            nome = '${nome}',
            cpf = '${cpf}',
            email = '${email}',
            senha = '${senha}',
            nivel_acesso = ${nivelAcesso}
        WHERE id_funcionario = ${idFuncionario};
    `;

    return database.execute(instrucaoSql);
}

async function deletar(idFuncionario) {
    const instrucaoSql = `
        DELETE FROM funcionario
        WHERE id_funcionario = ${idFuncionario};
    `;

    return database.execute(instrucaoSql);
}

async function pesquisar(idEmpresa, pesquisa) {
    const instrucaoSql = `
        SELECT
            id_funcionario,
            nome,
            cpf,
            email,
            nivel_acesso
        FROM funcionario
        WHERE id_empresa = ${idEmpresa}
        AND (
            CAST(id_funcionario AS CHAR) LIKE '%${pesquisa}%'
            OR nome LIKE '%${pesquisa}%'
            OR cpf LIKE '%${pesquisa}%'
            OR email LIKE '%${pesquisa}%'
            OR CAST(nivel_acesso AS CHAR) LIKE '%${pesquisa}%'
        );
    `;

    return database.execute(instrucaoSql);
}

module.exports = {
    cadastrar,
    listar,
    buscarPorId,
    atualizar,
    deletar,
    pesquisar
};
