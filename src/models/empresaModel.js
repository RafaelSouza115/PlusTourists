var database = require("../database/config");

function listar() {
  var instrucaoSql = `SELECT id_empresa, razao_social, CNPJ, codigo_ativacao FROM empresa`;

  return database.execute(instrucaoSql);
}

module.exports = {
    listar
}