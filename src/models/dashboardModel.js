var database = require('../database/config');

function dadosKPITuristas(ano, nomeEstado) {
  var instrucaoSql = `
    SELECT
        p.nome AS pais_que_mais_envia,
        SUM(rt.quantidade_turistas) AS total_turistas_pais,
        ROUND(
            SUM(rt.quantidade_turistas) * 100.0 /
            (
                SELECT SUM(quantidade_turistas)
                FROM registro_turista
                WHERE YEAR(dt_registro) = ?
                  AND id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?)
            ),
        2) AS percentual_do_total,
        (
            SELECT e.nome_estado
            FROM registro_turista rt2
            JOIN estado e ON e.id_estado = rt2.id_estado
            WHERE rt2.id_pais = (
                SELECT id_pais
                FROM registro_turista
                WHERE YEAR(dt_registro) = ?
                  AND id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?)
                GROUP BY id_pais
                ORDER BY SUM(quantidade_turistas) DESC
                LIMIT 1
            )
              AND YEAR(rt2.dt_registro) = ?
              AND rt2.id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?)
            GROUP BY rt2.id_estado, e.nome_estado
            ORDER BY SUM(rt2.quantidade_turistas) ASC
            LIMIT 1
        ) AS estado_menos_visitado_por_esse_pais
    FROM registro_turista rt
    JOIN pais_origem p ON p.id_pais = rt.id_pais
    WHERE YEAR(rt.dt_registro) = ?
      AND rt.id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?)
    GROUP BY rt.id_pais, p.nome
    ORDER BY total_turistas_pais DESC
    LIMIT 1;
  `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  // A ordem dos ? no SQL determina a ordem do array:
  // 1º ?  → ano         (subquery do percentual)
  // 2º ?  → nomeEstado  (subquery do percentual)
  // 3º ?  → ano         (subquery interna do estado menos visitado)
  // 4º ?  → nomeEstado  (subquery interna do estado menos visitado)
  // 5º ?  → ano         (subquery externa do estado menos visitado)
  // 6º ?  → nomeEstado  (subquery externa do estado menos visitado)
  // 7º ?  → ano         (query principal)
  // 8º ?  → nomeEstado  (query principal)
  return database.execute(instrucaoSql, [
    ano,
    nomeEstado,
    ano,
    nomeEstado,
    ano,
    nomeEstado,
    ano,
    nomeEstado,
  ]);
}

function mesesMenosTuristas(ano, nomeEstado) {
  var instrucaoSql = `
    SELECT
        MIN(CASE WHEN ranking = 1 THEN nome_mes END) AS mes_menos_1,
        MIN(CASE WHEN ranking = 1 THEN total       END) AS total_mes_1,
        MIN(CASE WHEN ranking = 2 THEN nome_mes END) AS mes_menos_2,
        MIN(CASE WHEN ranking = 2 THEN total       END) AS total_mes_2,
        MIN(CASE WHEN ranking = 3 THEN nome_mes END) AS mes_menos_3,
        MIN(CASE WHEN ranking = 3 THEN total       END) AS total_mes_3
    FROM (
        SELECT
            MONTH(rt.dt_registro)                    AS num_mes,
            MONTHNAME(rt.dt_registro)                AS nome_mes,
            SUM(rt.quantidade_turistas)              AS total,
            RANK() OVER (ORDER BY SUM(rt.quantidade_turistas) ASC) AS ranking
        FROM registro_turista rt
        WHERE YEAR(rt.dt_registro) = ?
          AND rt.id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?)
        GROUP BY MONTH(rt.dt_registro), MONTHNAME(rt.dt_registro)
    ) AS ranking_meses
    WHERE ranking <= 3;
  `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.execute(instrucaoSql, [ano, nomeEstado]);
}

function mesTopComEvento(ano, nomeEstado) {
  var instrucaoSql = `
    SELECT
        top_mes.nome_mes                             AS mes_mais_visitado,
        top_mes.total                                AS total_turistas,
        ev.nome_evento                               AS evento_maior_publico,
        ed.publico_esperado                          AS publico_esperado,
        ed.dt_inicio                                 AS data_evento,
        m.municipio                                  AS municipio_evento
    FROM (
        SELECT
            MONTH(rt.dt_registro)                    AS num_mes,
            MONTHNAME(rt.dt_registro)                AS nome_mes,
            SUM(rt.quantidade_turistas)              AS total
        FROM registro_turista rt
        WHERE YEAR(rt.dt_registro) = ?
          AND rt.id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?)
        GROUP BY MONTH(rt.dt_registro), MONTHNAME(rt.dt_registro)
        ORDER BY total DESC
        LIMIT 1
    ) AS top_mes
    JOIN edicao ed
        ON MONTH(ed.dt_inicio) = top_mes.num_mes
        AND YEAR(ed.dt_inicio) = ?
    JOIN evento ev
        ON ev.id_evento = ed.id_evento
    JOIN municipio m
        ON m.id_municipio = ev.id_municipio
    JOIN estado e
        ON e.id_estado = m.id_estado
    WHERE e.nome_estado = ?
    ORDER BY ed.publico_esperado DESC
    LIMIT 1;
  `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.execute(instrucaoSql, [ano, nomeEstado, ano, nomeEstado]);
}

function principalViaAcesso(ano, nomeEstado) {
  var instrucaoSql = `
    SELECT
        va.via                                              AS principal_via_acesso,
        SUM(rt.quantidade_turistas)                         AS total_via_principal,
        ROUND(
            SUM(rt.quantidade_turistas) * 100.0 /
            (
                SELECT SUM(quantidade_turistas)
                FROM registro_turista
                WHERE YEAR(dt_registro) = ?
                  AND id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?)
            ),
        2)                                                  AS percentual_via_acesso
    FROM registro_turista rt
    JOIN via_acesso va ON va.id_via = rt.id_via
    WHERE YEAR(rt.dt_registro) = ?
      AND rt.id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?)
    GROUP BY rt.id_via, va.via
    ORDER BY total_via_principal DESC
    LIMIT 1;
  `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.execute(instrucaoSql, [ano, nomeEstado, ano, nomeEstado]);
}

function eventosTuristasPorMes(ano, nomeEstado) {
  var instrucaoSql = `
    SELECT
        MONTH(dt)                    AS num_mes,
        MONTHNAME(dt)                AS nome_mes,
        MAX(total_eventos)           AS total_eventos,
        MAX(total_turistas)          AS total_turistas
    FROM (
        SELECT
            ed.dt_inicio             AS dt,
            COUNT(ed.id_edicao)      AS total_eventos,
            0                        AS total_turistas
        FROM edicao ed
        JOIN evento ev ON ev.id_evento = ed.id_evento
        JOIN municipio m ON m.id_municipio = ev.id_municipio
        JOIN estado e ON e.id_estado = m.id_estado
        WHERE YEAR(ed.dt_inicio) = ?
          AND e.nome_estado = ?
        GROUP BY MONTH(ed.dt_inicio), ed.dt_inicio

        UNION ALL

        SELECT
            rt.dt_registro           AS dt,
            0                        AS total_eventos,
            SUM(rt.quantidade_turistas) AS total_turistas
        FROM registro_turista rt
        WHERE YEAR(rt.dt_registro) = ?
          AND rt.id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?)
        GROUP BY MONTH(rt.dt_registro), rt.dt_registro
    ) AS unificado
    GROUP BY MONTH(dt), MONTHNAME(dt)
    ORDER BY num_mes;
  `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.execute(instrucaoSql, [ano, nomeEstado, ano, nomeEstado]);
}

function turistasPorViaAcesso(ano, nomeEstado) {
  var instrucaoSql = `
    SELECT
        SUM(rt.quantidade_turistas)                                    AS total_geral,

        SUM(CASE WHEN va.via = 'Aérea'      THEN rt.quantidade_turistas ELSE 0 END) AS total_aerea,
        ROUND(SUM(CASE WHEN va.via = 'Aérea'      THEN rt.quantidade_turistas ELSE 0 END) * 100.0 / SUM(rt.quantidade_turistas), 1) AS percentual_aerea,

        SUM(CASE WHEN va.via = 'Terrestre'  THEN rt.quantidade_turistas ELSE 0 END) AS total_terrestre,
        ROUND(SUM(CASE WHEN va.via = 'Terrestre'  THEN rt.quantidade_turistas ELSE 0 END) * 100.0 / SUM(rt.quantidade_turistas), 1) AS percentual_terrestre,

        SUM(CASE WHEN va.via = 'Marítima'   THEN rt.quantidade_turistas ELSE 0 END) AS total_maritima,
        ROUND(SUM(CASE WHEN va.via = 'Marítima'   THEN rt.quantidade_turistas ELSE 0 END) * 100.0 / SUM(rt.quantidade_turistas), 1) AS percentual_maritima,

        SUM(CASE WHEN va.via = 'Fluvial'    THEN rt.quantidade_turistas ELSE 0 END) AS total_fluvial,
        ROUND(SUM(CASE WHEN va.via = 'Fluvial'    THEN rt.quantidade_turistas ELSE 0 END) * 100.0 / SUM(rt.quantidade_turistas), 1) AS percentual_fluvial

    FROM registro_turista rt
    JOIN via_acesso va ON va.id_via = rt.id_via
    WHERE YEAR(rt.dt_registro) = ?
      AND rt.id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?);
  `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.execute(instrucaoSql, [ano, nomeEstado]);
}

function top5PaisesCompleto(ano, nomeEstado) {
  var instrucaoSql = `
    SELECT
        p.id_pais,
        p.nome                                                  AS pais,
        SUM(rt.quantidade_turistas)                             AS total_pais,
        ROUND(
            SUM(rt.quantidade_turistas) * 100.0 /
            (
                SELECT SUM(quantidade_turistas)
                FROM registro_turista
                WHERE YEAR(dt_registro) = ?
                  AND id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?)
            ),
        1)                                                      AS participacao_percentual,

        (
            SELECT e2.nome_estado FROM registro_turista rt2
            JOIN estado e2 ON e2.id_estado = rt2.id_estado
            WHERE YEAR(rt2.dt_registro) = ? AND rt2.id_pais = p.id_pais
            GROUP BY rt2.id_estado, e2.nome_estado
            ORDER BY SUM(rt2.quantidade_turistas) DESC LIMIT 1 OFFSET 0
        )                                                       AS estado_mais_1,
        (
            SELECT e2.nome_estado FROM registro_turista rt2
            JOIN estado e2 ON e2.id_estado = rt2.id_estado
            WHERE YEAR(rt2.dt_registro) = ? AND rt2.id_pais = p.id_pais
            GROUP BY rt2.id_estado, e2.nome_estado
            ORDER BY SUM(rt2.quantidade_turistas) DESC LIMIT 1 OFFSET 1
        )                                                       AS estado_mais_2,
        (
            SELECT e2.nome_estado FROM registro_turista rt2
            JOIN estado e2 ON e2.id_estado = rt2.id_estado
            WHERE YEAR(rt2.dt_registro) = ? AND rt2.id_pais = p.id_pais
            GROUP BY rt2.id_estado, e2.nome_estado
            ORDER BY SUM(rt2.quantidade_turistas) DESC LIMIT 1 OFFSET 2
        )                                                       AS estado_mais_3,

        (
            SELECT e2.nome_estado FROM registro_turista rt2
            JOIN estado e2 ON e2.id_estado = rt2.id_estado
            WHERE YEAR(rt2.dt_registro) = ? AND rt2.id_pais = p.id_pais
            GROUP BY rt2.id_estado, e2.nome_estado
            ORDER BY SUM(rt2.quantidade_turistas) ASC LIMIT 1 OFFSET 0
        )                                                       AS estado_menos_1,
        (
            SELECT e2.nome_estado FROM registro_turista rt2
            JOIN estado e2 ON e2.id_estado = rt2.id_estado
            WHERE YEAR(rt2.dt_registro) = ? AND rt2.id_pais = p.id_pais
            GROUP BY rt2.id_estado, e2.nome_estado
            ORDER BY SUM(rt2.quantidade_turistas) ASC LIMIT 1 OFFSET 1
        )                                                       AS estado_menos_2,
        (
            SELECT e2.nome_estado FROM registro_turista rt2
            JOIN estado e2 ON e2.id_estado = rt2.id_estado
            WHERE YEAR(rt2.dt_registro) = ? AND rt2.id_pais = p.id_pais
            GROUP BY rt2.id_estado, e2.nome_estado
            ORDER BY SUM(rt2.quantidade_turistas) ASC LIMIT 1 OFFSET 2
        )                                                       AS estado_menos_3,

        (
            SELECT MONTHNAME(rt2.dt_registro) FROM registro_turista rt2
            WHERE YEAR(rt2.dt_registro) = ? AND rt2.id_pais = p.id_pais
            GROUP BY MONTH(rt2.dt_registro), MONTHNAME(rt2.dt_registro)
            ORDER BY SUM(rt2.quantidade_turistas) DESC LIMIT 1
        )                                                       AS mes_mais_visita,

        (
            SELECT MONTHNAME(rt2.dt_registro) FROM registro_turista rt2
            WHERE YEAR(rt2.dt_registro) = ? AND rt2.id_pais = p.id_pais
            GROUP BY MONTH(rt2.dt_registro), MONTHNAME(rt2.dt_registro)
            ORDER BY SUM(rt2.quantidade_turistas) ASC LIMIT 1
        )                                                       AS mes_menos_visita

    FROM registro_turista rt
    JOIN pais_origem p ON p.id_pais = rt.id_pais
    WHERE YEAR(rt.dt_registro) = ?
      AND rt.id_estado = (SELECT id_estado FROM estado WHERE nome_estado = ?)
    GROUP BY rt.id_pais, p.id_pais, p.nome
    ORDER BY total_pais DESC
    LIMIT 5;
  `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);

  // Ordem dos ? no array:
  // 1,2   → subquery do percentual (ano, nomeEstado)
  // 3     → ano (estado_mais_1)
  // 4     → ano (estado_mais_2)
  // 5     → ano (estado_mais_3)
  // 6     → ano (estado_menos_1)
  // 7     → ano (estado_menos_2)
  // 8     → ano (estado_menos_3)
  // 9     → ano (mes_mais_visita)
  // 10    → ano (mes_menos_visita)
  // 11,12 → filtro principal (ano, nomeEstado)
  return database.execute(instrucaoSql, [
    ano,
    nomeEstado, // percentual
    ano, // estado_mais_1
    ano, // estado_mais_2
    ano, // estado_mais_3
    ano, // estado_menos_1
    ano, // estado_menos_2
    ano, // estado_menos_3
    ano, // mes_mais_visita
    ano, // mes_menos_visita
    ano,
    nomeEstado, // filtro principal
  ]);
}

function selectsAnoEstado() {
  var instrucaoSql = `
    SELECT DISTINCT YEAR(dt_registro) AS ano
    FROM registro_turista
    ORDER BY ano DESC;
    
    select nome_estado from estado order by nome_estado;
    `;

  console.log('Executando a instrução SQL: \n' + instrucaoSql);
  return database.execute(instrucaoSql);
}

module.exports = {
  dadosKPITuristas,
  mesesMenosTuristas,
  mesTopComEvento,
  principalViaAcesso,
  eventosTuristasPorMes,
  turistasPorViaAcesso,
  top5PaisesCompleto,
  selectsAnoEstado,
};
