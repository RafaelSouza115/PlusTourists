var dashboardModel = require("../models/dashboardModel");

function obterParametrosFixos() {
  return {
    ano: 2025,
    idEstado: 25,
    nomeEstado: "São Paulo"
  };
}

function primeiroRegistro(resultado) {
  return resultado && resultado.length > 0 ? resultado[0] : {};
}

function responderErro(res, mensagem, erro) {
  console.error(mensagem, erro);
  res.status(500).json({ mensagem, erro });
}

function obterFiltros(req, res) {
  var filtros = obterParametrosFixos();
  res.status(200).json([{ ano: filtros.ano, nome_estado: filtros.nomeEstado }]);
}

function dadosKpiTuristas(req, res) {
  var filtros = obterParametrosFixos();

  dashboardModel.buscarDadosKpiTuristas(filtros.ano, filtros.idEstado)
    .then((resultado) => res.status(200).json(primeiroRegistro(resultado)))
    .catch((erro) => responderErro(res, "Erro ao buscar KPIs de turistas.", erro));
}

function mesesMenosTuristas(req, res) {
  var filtros = obterParametrosFixos();

  dashboardModel.buscarMesesMenosTuristas(filtros.ano, filtros.idEstado)
    .then((resultado) => {
      res.status(200).json({
        mes_menos_1: resultado[0] ? resultado[0].nome_mes : "Sem dados",
        mes_menos_2: resultado[1] ? resultado[1].nome_mes : "Sem dados",
        mes_menos_3: resultado[2] ? resultado[2].nome_mes : "Sem dados"
      });
    })
    .catch((erro) => responderErro(res, "Erro ao buscar meses com menos turistas.", erro));
}

function mesTopComEvento(req, res) {
  var filtros = obterParametrosFixos();

  dashboardModel.buscarMesTopComEvento(filtros.ano, filtros.idEstado)
    .then((resultado) => res.status(200).json(primeiroRegistro(resultado)))
    .catch((erro) => responderErro(res, "Erro ao buscar mês com mais turistas e evento.", erro));
}

function principalViaAcesso(req, res) {
  var filtros = obterParametrosFixos();

  dashboardModel.buscarPrincipalViaAcesso(filtros.ano, filtros.idEstado)
    .then((resultado) => res.status(200).json(primeiroRegistro(resultado)))
    .catch((erro) => responderErro(res, "Erro ao buscar principal via de acesso.", erro));
}

function eventosTuristasPorMes(req, res) {
  var filtros = obterParametrosFixos();

  dashboardModel.buscarEventosTuristasPorMes(filtros.ano, filtros.idEstado)
    .then((resultado) => res.status(200).json(resultado))
    .catch((erro) => responderErro(res, "Erro ao buscar eventos e turistas por mês.", erro));
}

function normalizarVia(nome) {
  var texto = String(nome || "").toLowerCase();

  if (texto.indexOf("aérea") >= 0 || texto.indexOf("aerea") >= 0) return "aerea";
  if (texto.indexOf("terrestre") >= 0) return "terrestre";
  if (texto.indexOf("marítima") >= 0 || texto.indexOf("maritima") >= 0) return "maritima";
  if (texto.indexOf("fluvial") >= 0) return "fluvial";

  return "outros";
}

function turistasPorViaAcesso(req, res) {
  var filtros = obterParametrosFixos();

  dashboardModel.buscarTuristasPorViaAcesso(filtros.ano, filtros.idEstado)
    .then((resultado) => {
      var totais = {
        aerea: 0,
        terrestre: 0,
        maritima: 0,
        fluvial: 0
      };

      for (var i = 0; i < resultado.length; i++) {
        var chave = normalizarVia(resultado[i].via);

        if (totais[chave] !== undefined) {
          totais[chave] += Number(resultado[i].total) || 0;
        }
      }

      var totalGeral = totais.aerea + totais.terrestre + totais.maritima + totais.fluvial;

      function percentual(valor) {
        if (totalGeral === 0) return 0;
        return Number(((valor / totalGeral) * 100).toFixed(1));
      }

      res.status(200).json({
        total_geral: totalGeral,
        total_aerea: totais.aerea,
        total_terrestre: totais.terrestre,
        total_maritima: totais.maritima,
        total_fluvial: totais.fluvial,
        percentual_aerea: percentual(totais.aerea),
        percentual_terrestre: percentual(totais.terrestre),
        percentual_maritima: percentual(totais.maritima),
        percentual_fluvial: percentual(totais.fluvial)
      });
    })
    .catch((erro) => responderErro(res, "Erro ao buscar turistas por via de acesso.", erro));
}

function completarTop5(resultado) {
  while (resultado.length < 5) {
    resultado.push({
      pais: "Sem dados",
      participacao_percentual: 0,
      estado_mais_1: "Sem dados",
      estado_mais_2: "Sem dados",
      estado_mais_3: "Sem dados",
      estado_menos_1: "Sem dados",
      estado_menos_2: "Sem dados",
      estado_menos_3: "Sem dados",
      mes_mais_visita: "Sem dados",
      mes_menos_visita: "Sem dados"
    });
  }

  return resultado;
}

function top5PaisesCompleto(req, res) {
  var filtros = obterParametrosFixos();

  dashboardModel.buscarTop5PaisesCompleto(filtros.ano, filtros.idEstado)
    .then((paises) => {
      var promessas = paises.map((pais) => {
        return Promise.all([
          dashboardModel.buscarEstadosPorPais(filtros.ano, pais.id_pais, "DESC"),
          dashboardModel.buscarEstadosPorPais(filtros.ano, pais.id_pais, "ASC"),
          dashboardModel.buscarMesPorPais(filtros.ano, pais.id_pais, "DESC"),
          dashboardModel.buscarMesPorPais(filtros.ano, pais.id_pais, "ASC")
        ]).then((detalhes) => {
          var estadosMais = detalhes[0];
          var estadosMenos = detalhes[1];
          var mesMais = detalhes[2][0];
          var mesMenos = detalhes[3][0];

          return {
            pais: pais.pais,
            participacao_percentual: pais.participacao_percentual,
            estado_mais_1: estadosMais[0] ? estadosMais[0].nome_estado : "Sem dados",
            estado_mais_2: estadosMais[1] ? estadosMais[1].nome_estado : "Sem dados",
            estado_mais_3: estadosMais[2] ? estadosMais[2].nome_estado : "Sem dados",
            estado_menos_1: estadosMenos[0] ? estadosMenos[0].nome_estado : "Sem dados",
            estado_menos_2: estadosMenos[1] ? estadosMenos[1].nome_estado : "Sem dados",
            estado_menos_3: estadosMenos[2] ? estadosMenos[2].nome_estado : "Sem dados",
            mes_mais_visita: mesMais ? mesMais.nome_mes : "Sem dados",
            mes_menos_visita: mesMenos ? mesMenos.nome_mes : "Sem dados"
          };
        });
      });

      return Promise.all(promessas);
    })
    .then((resultado) => res.status(200).json(completarTop5(resultado)))
    .catch((erro) => responderErro(res, "Erro ao buscar top 5 países.", erro));
}

module.exports = {
  obterFiltros,
  dadosKpiTuristas,
  mesesMenosTuristas,
  mesTopComEvento,
  principalViaAcesso,
  eventosTuristasPorMes,
  turistasPorViaAcesso,
  top5PaisesCompleto
};
