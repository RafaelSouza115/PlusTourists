var database = require('../database/config');

function nomeMes(colunaData) {
  return `
    CASE MONTH(${colunaData})
      WHEN 1 THEN 'Janeiro'
      WHEN 2 THEN 'Fevereiro'
      WHEN 3 THEN 'Março'
      WHEN 4 THEN 'Abril'
      WHEN 5 THEN 'Maio'
      WHEN 6 THEN 'Junho'
      WHEN 7 THEN 'Julho'
      WHEN 8 THEN 'Agosto'
      WHEN 9 THEN 'Setembro'
      WHEN 10 THEN 'Outubro'
      WHEN 11 THEN 'Novembro'
      WHEN 12 THEN 'Dezembro'
    END
  `;
}

function buscarDadosKpiTuristas(ano, idEstado) {
  var instrucaoSql = `
    SELECT
      pais_top.pais AS maiorPaisEmissor,
      ROUND((pais_top.total_pais / total_estado.total_turistas) * 100, 1) AS percentualMaiorPaisEmissor,
      destino_menos.nome_estado AS destinoMenosVisitado
    FROM (
      SELECT
        p.id_pais,
        p.nome AS pais,
        SUM(rt.quantidade_turistas) AS total_pais
      FROM registro_turismo rt
      JOIN pais_origem p ON p.id_pais = rt.id_pais
      WHERE YEAR(rt.dt_registro) = ?
        AND rt.id_estado = ?
      GROUP BY p.id_pais, p.nome
      ORDER BY total_pais DESC
      LIMIT 1
    ) pais_top
    CROSS JOIN (
      SELECT SUM(quantidade_turistas) AS total_turistas
      FROM registro_turismo
      WHERE YEAR(dt_registro) = ?
        AND id_estado = ?
    ) total_estado
    LEFT JOIN (
      SELECT e.nome_estado
      FROM registro_turismo rt
      JOIN estado e ON e.id_estado = rt.id_estado
      WHERE YEAR(rt.dt_registro) = ?
        AND rt.id_pais = (
          SELECT rt2.id_pais
          FROM registro_turismo rt2
          WHERE YEAR(rt2.dt_registro) = ?
            AND rt2.id_estado = ?
          GROUP BY rt2.id_pais
          ORDER BY SUM(rt2.quantidade_turistas) DESC
          LIMIT 1
        )
      GROUP BY e.id_estado, e.nome_estado
      ORDER BY SUM(rt.quantidade_turistas) ASC
      LIMIT 1
    ) destino_menos ON TRUE;
  `;

  return database.execute(instrucaoSql, [ano, idEstado, ano, idEstado, ano, ano, idEstado]);
}

function buscarMesesMenosTuristas(ano, idEstado) {
  var instrucaoSql = `
    SELECT ${nomeMes('rt.dt_registro')} AS nome_mes
    FROM registro_turismo rt
    WHERE YEAR(rt.dt_registro) = ?
      AND rt.id_estado = ?
    GROUP BY MONTH(rt.dt_registro), nome_mes
    ORDER BY SUM(rt.quantidade_turistas) ASC
    LIMIT 3;
  `;

  return database.execute(instrucaoSql, [ano, idEstado]);
}

function buscarMesTopComEvento(ano, idEstado) {
  var instrucaoSql = `
    SELECT
      mes_top.nome_mes AS mes_mais_visitado,
      (
        SELECT ev.nome_evento
        FROM edicao ed
        JOIN evento ev ON ev.id_evento = ed.id_evento
        JOIN municipio m ON m.id_municipio = ev.id_municipio
        WHERE ed.ano_realizacao = ?
          AND m.id_estado = ?
          AND MONTH(ed.dt_inicio) = mes_top.numero_mes
        ORDER BY COALESCE(ed.publico_atingido, ed.publico_esperado, 0) DESC
        LIMIT 1
      ) AS evento_maior_publico
    FROM (
      SELECT
        MONTH(rt.dt_registro) AS numero_mes,
        ${nomeMes('rt.dt_registro')} AS nome_mes,
        SUM(rt.quantidade_turistas) AS total_turistas
      FROM registro_turismo rt
      WHERE YEAR(rt.dt_registro) = ?
        AND rt.id_estado = ?
      GROUP BY MONTH(rt.dt_registro), nome_mes
      ORDER BY total_turistas DESC
      LIMIT 1
    ) mes_top
    LIMIT 1;
  `;

  return database.execute(instrucaoSql, [ano, idEstado, ano, idEstado]);
}

function buscarPrincipalViaAcesso(ano, idEstado) {
  var instrucaoSql = `
    SELECT
      v.via AS principal_via_acesso,
      ROUND((SUM(rt.quantidade_turistas) / total_estado.total_turistas) * 100, 1) AS percentual_via_acesso
    FROM registro_turismo rt
    JOIN via_acesso v ON v.id_via = rt.id_via
    CROSS JOIN (
      SELECT SUM(quantidade_turistas) AS total_turistas
      FROM registro_turismo
      WHERE YEAR(dt_registro) = ?
        AND id_estado = ?
    ) total_estado
    WHERE YEAR(rt.dt_registro) = ?
      AND rt.id_estado = ?
    GROUP BY v.id_via, v.via, total_estado.total_turistas
    ORDER BY SUM(rt.quantidade_turistas) DESC
    LIMIT 1;
  `;

  return database.execute(instrucaoSql, [ano, idEstado, ano, idEstado]);
}

function buscarEventosTuristasPorMes(ano, idEstado) {
  var instrucaoSql = `
    SELECT
      turistas.nome_mes,
      COALESCE(eventos.total_eventos, 0) AS total_eventos,
      turistas.total_turistas
    FROM (
      SELECT
        MONTH(rt.dt_registro) AS numero_mes,
        ${nomeMes('rt.dt_registro')} AS nome_mes,
        SUM(rt.quantidade_turistas) AS total_turistas
      FROM registro_turismo rt
      WHERE YEAR(rt.dt_registro) = ?
        AND rt.id_estado = ?
      GROUP BY MONTH(rt.dt_registro), nome_mes
    ) turistas
    LEFT JOIN (
      SELECT
        MONTH(ed.dt_inicio) AS numero_mes,
        COUNT(ed.id_edicao) AS total_eventos
      FROM edicao ed
      JOIN evento ev ON ev.id_evento = ed.id_evento
      JOIN municipio m ON m.id_municipio = ev.id_municipio
      WHERE ed.ano_realizacao = ?
        AND m.id_estado = ?
      GROUP BY MONTH(ed.dt_inicio)
    ) eventos ON eventos.numero_mes = turistas.numero_mes
    ORDER BY turistas.numero_mes;
  `;

  return database.execute(instrucaoSql, [ano, idEstado, ano, idEstado]);
}

function buscarTuristasPorViaAcesso(ano, idEstado) {
  var instrucaoSql = `
    SELECT
      v.via,
      SUM(rt.quantidade_turistas) AS total
    FROM registro_turismo rt
    JOIN via_acesso v ON v.id_via = rt.id_via
    WHERE YEAR(rt.dt_registro) = ?
      AND rt.id_estado = ?
    GROUP BY v.id_via, v.via;
  `;

  return database.execute(instrucaoSql, [ano, idEstado]);
}

function buscarTop5PaisesCompleto(ano, idEstado) {
  var instrucaoSql = `
    SELECT
      p.id_pais,
      p.nome AS pais,
      ROUND((SUM(rt.quantidade_turistas) / total_estado.total_turistas) * 100, 1) AS participacao_percentual
    FROM registro_turismo rt
    JOIN pais_origem p ON p.id_pais = rt.id_pais
    CROSS JOIN (
      SELECT SUM(quantidade_turistas) AS total_turistas
      FROM registro_turismo
      WHERE YEAR(dt_registro) = ?
        AND id_estado = ?
    ) total_estado
    WHERE YEAR(rt.dt_registro) = ?
      AND rt.id_estado = ?
    GROUP BY p.id_pais, p.nome, total_estado.total_turistas
    ORDER BY SUM(rt.quantidade_turistas) DESC
    LIMIT 5;
  `;

  return database.execute(instrucaoSql, [ano, idEstado, ano, idEstado]);
}

function buscarEstadosPorPais(ano, idPais, ordem) {
  var instrucaoSql = `
    SELECT e.nome_estado
    FROM registro_turismo rt
    JOIN estado e ON e.id_estado = rt.id_estado
    WHERE YEAR(rt.dt_registro) = ?
      AND rt.id_pais = ?
    GROUP BY e.id_estado, e.nome_estado
    ORDER BY SUM(rt.quantidade_turistas) ${ordem === 'ASC' ? 'ASC' : 'DESC'}
    LIMIT 3;
  `;

  return database.execute(instrucaoSql, [ano, idPais]);
}

function buscarMesPorPais(ano, idPais, ordem) {
  var instrucaoSql = `
    SELECT ${nomeMes('rt.dt_registro')} AS nome_mes
    FROM registro_turismo rt
    WHERE YEAR(rt.dt_registro) = ?
      AND rt.id_pais = ?
    GROUP BY MONTH(rt.dt_registro), nome_mes
    ORDER BY SUM(rt.quantidade_turistas) ${ordem === 'ASC' ? 'ASC' : 'DESC'}
    LIMIT 1;
  `;

  return database.execute(instrucaoSql, [ano, idPais]);
}

module.exports = {
  buscarDadosKpiTuristas,
  buscarMesesMenosTuristas,
  buscarMesTopComEvento,
  buscarPrincipalViaAcesso,
  buscarEventosTuristasPorMes,
  buscarTuristasPorViaAcesso,
  buscarTop5PaisesCompleto,
  buscarEstadosPorPais,
  buscarMesPorPais,
};
