var express = require('express');
var router = express.Router();

var dashboardController = require('../controllers/dashboardController');

router.get('/dados-kpi-turistas', function (req, res) {
  dashboardController.dadosKPITuristas(req, res);
});

router.get('/meses-menos-turistas', function (req, res) {
  dashboardController.mesesMenosTuristas(req, res);
});

router.get('/mes-top-com-evento', function (req, res) {
  dashboardController.mesTopComEvento(req, res);
});

router.get('/principal-via-acesso', function (req, res) {
  dashboardController.principalViaAcesso(req, res);
});

router.get('/eventos-turistas-por-mes', function (req, res) {
  dashboardController.eventosTuristasPorMes(req, res);
});

router.get('/turistas-por-via-acesso', function (req, res) {
  dashboardController.turistasPorViaAcesso(req, res);
});

router.get('/top5-paises-completo', function (req, res) {
  dashboardController.top5PaisesCompleto(req, res);
});

router.get('/selects-ano-estado', function (req, res) {
  dashboardController.selectsAnoEstado(req, res);
});
module.exports = router;
