var dashboardModel = require('../models/dashboardModel');

function dadosKPITuristas(req, res) {
  var ano = req.query.ano || '2024';
  var nomeEstado = req.query.nomeEstado || 'São Paulo';

  dashboardModel
    .dadosKPITuristas(ano, nomeEstado)
    .then((resultado) => {
      var kpi = resultado[0] || {};

      res.status(200).json({
        maiorPaisEmissor: kpi.pais_que_mais_envia || null,
        percentualMaiorPaisEmissor: kpi.percentual_do_total || 0,
        destinoMenosVisitado: kpi.estado_menos_visitado_por_esse_pais || null,
      });
    })
    .catch((erro) => {
      console.error('Erro ao obter dados KPI de turistas:', erro);
      res.status(500).json({
        mensagem: 'Erro ao obter dados KPI de turistas.',
        erro,
      });
    });
}

function mesesMenosTuristas(req, res) {
  var ano = req.query.ano || '2024';
  var nomeEstado = req.query.nomeEstado || 'São Paulo';

  dashboardModel
    .mesesMenosTuristas(ano, nomeEstado)
    .then((resultado) => {
      var kpi = resultado[0] || {};

      res.status(200).json({
        mes_menos_1: kpi.mes_menos_1 || null,
        total_mes_1: kpi.total_mes_1 || 0,
        mes_menos_2: kpi.mes_menos_2 || null,
        total_mes_2: kpi.total_mes_2 || 0,
        mes_menos_3: kpi.mes_menos_3 || null,
        total_mes_3: kpi.total_mes_3 || 0,
      });
    })
    .catch((erro) => {
      console.error('Erro ao obter dados KPI de turistas:', erro);
      res.status(500).json({
        mensagem: 'Erro ao obter dados KPI de turistas.',
        erro,
      });
    });
}

function mesTopComEvento(req, res) {
  var ano = req.query.ano || '2024';
  var nomeEstado = req.query.nomeEstado || 'São Paulo';

  dashboardModel
    .mesTopComEvento(ano, nomeEstado)
    .then((resultado) => {
      var kpi = resultado[0] || {};

      res.status(200).json({
        mes_mais_visitado: kpi.mes_mais_visitado || null,
        total_turistas: kpi.total_turistas || 0,
        evento_maior_publico: kpi.evento_maior_publico || null,
        publico_esperado: kpi.publico_esperado || 0,
        data_evento: kpi.data_evento || null,
        municipio_evento: kpi.municipio_evento || null,
      });
    })
    .catch((erro) => {
      console.error('Erro ao obter dados KPI de turistas:', erro);
      res.status(500).json({
        mensagem: 'Erro ao obter dados KPI de turistas.',
        erro,
      });
    });
}

function principalViaAcesso(req, res) {
  var ano = req.query.ano || '2025';
  var nomeEstado = req.query.nomeEstado || 'São Paulo';

  dashboardModel
    .principalViaAcesso(ano, nomeEstado)
    .then((resultado) => {
      var kpi = resultado[0] || {};

      res.status(200).json({
        principal_via_acesso: kpi.principal_via_acesso || null,
        percentual_via_acesso: kpi.percentual_via_acesso || 0,
      });
    })
    .catch((erro) => {
      console.error('Erro ao obter dados KPI de turistas:', erro);
      res.status(500).json({
        mensagem: 'Erro ao obter dados KPI de turistas.',
        erro,
      });
    });
}

function eventosTuristasPorMes(req, res) {
  var ano = req.query.ano || '2025';
  var nomeEstado = req.query.nomeEstado || 'São Paulo';

  dashboardModel
    .eventosTuristasPorMes(ano, nomeEstado)
    .then((resultado) => {
      var kpi = resultado[0] || {};

      res.status(200).json(resultado);
    })
    .catch((erro) => {
      console.error('Erro ao obter dados Grafico numero de eventos / turistas:', erro);
      res.status(500).json({
        mensagem: 'Erro ao obter dados Grafico numero de eventos / turistas.',
        erro,
      });
    });
}

function turistasPorViaAcesso(req, res) {
  var ano = req.query.ano || '2025';
  var nomeEstado = req.query.nomeEstado || 'São Paulo';

  dashboardModel
    .turistasPorViaAcesso(ano, nomeEstado)
    .then((resultado) => {
      var kpi = resultado[0] || {};

      res.status(200).json({
        total_geral: kpi.total_geral || 0,
        total_aerea: kpi.total_aerea || 0,
        percentual_aerea: kpi.percentual_aerea || 0,
        total_terrestre: kpi.total_terrestre || 0,
        percentual_terrestre: kpi.percentual_terrestre || 0,
        total_maritima: kpi.total_maritima || 0,
        percentual_maritima: kpi.percentual_maritima || 0,
        total_fluvial: kpi.total_fluvial || 0,
        percentual_fluvial: kpi.percentual_fluvial || 0,
      });
    })
    .catch((erro) => {
      console.error('Erro ao obter dados Grafico numero de turistas por via de acesso:', erro);
      res.status(500).json({
        mensagem: 'Erro ao obter dados Grafico numero de turistas por via de acesso.',
        erro,
      });
    });
}

function top5PaisesCompleto(req, res) {
  var ano = req.query.ano || '2025';
  var nomeEstado = req.query.nomeEstado || 'São Paulo';

  dashboardModel
    .top5PaisesCompleto(ano, nomeEstado)
    .then((resultado) => {
      res.status(200).json(resultado);
    })
    .catch((erro) => {
      console.error('Erro ao obter dados do top 5 países:', erro);
      res.status(500).json({
        mensagem: 'Erro ao obter dados do top 5 países.',
        erro,
      });
    });
}

// function selectsAnoEstado(req, res) {
//   dashboardModel
//     .selectsAnoEstado()
//     .then((resultado) => {
//       res.status(200).json(resultado);
//     })
//     .catch((erro) => {
//       console.error('Erro ao obter dados de anos e estados:', erro);
//       res.status(500).json({
//         mensagem: 'Erro ao obter dados de anos e estados.',
//         erro,
//       });
//     });
// }

module.exports = {
  dadosKPITuristas,
  mesesMenosTuristas,
  mesTopComEvento,
  principalViaAcesso,
  eventosTuristasPorMes,
  turistasPorViaAcesso,
  top5PaisesCompleto,
  // selectsAnoEstado,
};
