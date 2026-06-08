var database = require('../database/config');

function filtroDestino() {
  var intrucaoSql = `
SELECT
  municipio AS municipio,
  id_municipio AS id
FROM municipio;
`;
  return database.execute(intrucaoSql);
}

function filtroFaixaEtaria() {
  var instrucaoSql = `
    SELECT
      classificacao AS classificacao,
      id_classificacao AS id
    FROM classificacao_etaria
    ORDER BY id_classificacao;
  `;

  return database.execute(instrucaoSql);
}

function listar() {
  var instrucaoSql = `
    SELECT
      e.id_evento AS id,
      e.nome_evento AS titulo,
      e.descricao_evento AS descricao,
      m.municipio AS municipio,
      c.classificacao AS classificacao,
      ed.dt_inicio AS dataInicio,
      ed.dt_fim AS dataFinal,
      ed.hr_inicio AS horaInicio,
      ed.hr_final AS horaFinal
    FROM evento AS e
    JOIN municipio AS m
      ON m.id_municipio = e.id_municipio
    JOIN classificacao_etaria AS c
      ON c.id_classificacao = e.id_classificacao
    LEFT JOIN edicao AS ed
      ON ed.id_evento = e.id_evento;
  `;

  return database.execute(instrucaoSql);
}

module.exports = {
  listar,
  filtroDestino,
  filtroFaixaEtaria,
};
