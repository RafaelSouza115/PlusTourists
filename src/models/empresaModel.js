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

module.exports = {
    listar,
    cadastrar,
    buscarPorCnpj
}