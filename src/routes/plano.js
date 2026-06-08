var express = require("express");
var router = express.Router();

var planoController = require("../controllers/planoController");

router.get("/listarEventos", function (req, res) {
  planoController.listarEventos(req, res);
});

router.get("/listarEstados", function (req, res) {
  planoController.listarEstados(req, res);
});

router.get("/listarMunicipios", function (req, res) {
  planoController.listarMunicipios(req, res);
});

router.post("/criar", function (req, res) {
  planoController.criarPlano(req, res);
});

router.get("/listarPlanos/:idEmpresa/:status", function (req, res) {
  planoController.listarPlanos(req, res);
});

router.get("/detalhes/:idPlano", function (req, res) {
    planoController.listarDetalhesPlano(req, res);
});

router.put("/validar/:idPlano", function (req, res) {
    planoController.validarPlano(req, res);
});

router.delete("/excluir/:idPlano", function (req, res) {
    planoController.excluirPlano(req, res);
});

module.exports = router;