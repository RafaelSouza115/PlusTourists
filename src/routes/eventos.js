var express = require('express');
var router = express.Router();

var eventosController = require('../controllers/eventosController');

router.get('/listar', function (req, res) {
  eventosController.listar(req, res);
});

router.get('/filtroDestino', function (req, res) {
  eventosController.filtroDestino(req, res);
});

router.get('/filtroFaixaEtaria', function (req, res) {
  eventosController.filtroFaixaEtaria(req, res);
});

module.exports = router;
