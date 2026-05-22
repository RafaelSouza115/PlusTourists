var database = require("../database/config");

function listar() {
  var instrucaoSql = `SELECT id_empresa, razao_social, CNPJ, codigo_ativacao FROM empresa`;

  return database.execute(instrucaoSql);
}

function cadastrar(razaoSocial, nomeFantasia, cnpj, email, cep, numero, complemento, codigoAtivacao) {
  var instrucaoSql = `
  INSERT INTO empresa (razao_social, nome_fantasia, CNPJ, email_contato, cep, numero, complemento, codigo_ativacao)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `;

  console.log("Executando a instrução SQL: \n" + instrucaoSql);
  return database.execute(instrucaoSql, [razaoSocial, nomeFantasia, cnpj, email, cep, numero, complemento, codigoAtivacao]);
}

function buscarPorCnpj(cnpj) {
  var instrucaoSql = `SELECT * FROM empresa WHERE CNPJ = '${cnpj}'`;

  return database.execute(instrucaoSql);
}

function buscarPorId(idEmpresa) {
    var instrucao = `
        SELECT * FROM empresa WHERE idEmpresa = ${idEmpresa};
    `;
    return database.execute(instrucao);
}

function buscarPorId(idEmpresa) {
    var instrucao = `
        SELECT 
            id_empresa AS idEmpresa,
            nome_fantasia AS nomeFantasia,
            razao_social AS razaoSocial,
            cnpj,
            cep,
            complemento,
            numero,
            email_contato AS email
        FROM empresa
        WHERE id_empresa = ${idEmpresa};
    `;
    return database.execute(instrucao);
}

function atualizar(idEmpresa, dados) {
    var instrucao = `
        UPDATE empresa SET
            nome_fantasia = '${dados.nomeFantasia}',
            razao_social = '${dados.razaoSocial}',
            cnpj = '${dados.cnpj}',
            email_contato = '${dados.email}',
            cep = '${dados.cep}',
            complemento = '${dados.complemento}',
            numero = '${dados.numero}'
        WHERE id_empresa = ${idEmpresa};
    `;
    return database.execute(instrucao);
}

module.exports = {
    listar,
    cadastrar,
    buscarPorCnpj,
    buscarPorId,
    atualizar
}