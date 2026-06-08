var database = require("../database/config");

function listarEventos() {
  const instrucaoSql = `
    SELECT * FROM todos_eventos;
    `;
  return database.execute(instrucaoSql);
}

function listarEstados() {
  const instrucaoSql = `
    SELECT * FROM todos_estados;
    `;
  return database.execute(instrucaoSql);
}

function listarMunicipios() {
    const instrucaoSql = `
    SELECT * FROM municipio;
    `;
    return database.execute(instrucaoSql);
}

function criarPlano(nomePlano, dataInicial, dataFinal, idEmpresa, destino) {
  const instrucaoSql = `
    INSERT INTO plano_turistico (nome, dt_inicio, dt_fim, id_empresa, id_status_plano, id_municipio)
    VALUES (?, ?, ?, ?, 1, ?);
    `;
  return database.execute(instrucaoSql, [nomePlano, dataInicial, dataFinal, idEmpresa, destino])
}

function adicionarRoteiro(idPlano, roteiro) {
  let promisses = [];
  for (let i = 0; i < roteiro.length; i++) {
    const instrucaoSql = `
      INSERT INTO roteiro (id_plano, id_evento)
      VALUES (?, ?);
    `;
    promisses.push(database.execute(instrucaoSql,[idPlano, roteiro[i]]));
  }
  return Promise.all(promisses);
}

function listarPlanos(idEmpresa, status) {
    console.log("Empresa: ", idEmpresa)
    console.log("Status: ", status)
    const instrucaoSql = `
    SELECT * FROM buscar_planos WHERE empresa = ? AND idStatus = ?;
    `;
    return database.execute(instrucaoSql, [idEmpresa, status]);
}

function listarDetalhesPlano(idPlano) {
    const instrucaoSql = `
    SELECT * FROM detalhar_plano WHERE idPlano = ?;
    `;
    return database.execute(instrucaoSql,[idPlano]);
}

function validarPlano(idPlano) {
    const instrucaoSql = `
        UPDATE plano_turistico
        SET id_status_plano = 2
        WHERE id_plano = ?;
    `;
    return database.execute(instrucaoSql,[idPlano]);
}

function excluirPlano(idPlano) {
    const excluirRoteiro = `
        DELETE FROM roteiro
        WHERE id_plano = ?;
    `;
    const excluirPlano = `
        DELETE FROM plano_turistico
        WHERE id_plano = ?;
    `;
    return database.execute(excluirRoteiro, [idPlano])
        .then(() => {
            return database.execute(excluirPlano,[idPlano]);
        });
}

module.exports = {
    listarEventos,
    listarEstados,
    criarPlano,
    adicionarRoteiro,
    listarMunicipios,
    listarPlanos,
    listarDetalhesPlano,
    validarPlano,
    excluirPlano
}