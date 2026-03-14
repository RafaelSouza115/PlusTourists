var express = require("express");
var router = express.Router();

var funcionarioController = require("../controllers/funcionarioController");
var validarCadastro = require("../middlewares/validarCadastro");
var validarLogin = require("../middlewares/validarLogin");

router.post("/cadastrar", validarCadastro.validarCadastroFuncionario, function(req, res) {
    funcionarioController.cadastrar(req, res);
});

router.post("/autenticar", validarLogin.validarLogin, function(req, res) {
    funcionarioController.autenticar(req, res);
});

module.exports = router;