var express = require("express");
var router = express.Router();

var empresaController = require("../controllers/empresaController");

router.get("/listar", function (req, res) {
  empresaController.listar(req, res);
});

router.post("/cadastrar", function (req, res) {
    empresaController.cadastrar(req, res);
});

router.get("/buscar", function (req, res) {
    empresaController.buscarPorCnpj(req, res);
});

router.get("/buscar/:idEmpresa", function (req, res) {
    empresaController.buscarPorId(req, res);
});

router.put("/atualizar/:idEmpresa", function (req, res) {
    empresaController.atualizar(req, res);
});

module.exports = router;