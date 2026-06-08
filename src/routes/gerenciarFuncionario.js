var express = require("express");
var router = express.Router();

var gerenciarFuncionarioController = require("../controllers/gerenciarFuncionarioController");

router.get("/listar", function(req, res) {
    gerenciarFuncionarioController.listar(req, res);
});

router.get("/deletar", function(req, res) {
    gerenciarFuncionarioController.deletar(req, res);
});

router.get("/pesquisar", function(req, res) {
    gerenciarFuncionarioController.pesquisar(req, res);
});

router.post("/cadastrar", function(req, res) {
    gerenciarFuncionarioController.cadastrar(req, res);
});

router.post("/atualizar", function(req, res) {
    gerenciarFuncionarioController.atualizar(req, res);
});

module.exports = router;