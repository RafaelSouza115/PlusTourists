var empresaModel = require("../models/empresaModel");

function listar(req, res) {
  empresaModel.listar().then((resultado) => {
    res.status(200).json(resultado);
  });
}

function buscarPorCnpj(req, res) {
  var cnpj = req.query.cnpj;

  empresaModel.buscarPorCnpj(cnpj).then((resultado) => {
    res.status(200).json(resultado);
  });
}

function cadastrar(req, res) {
  var razaoSocial = req.body.razaoSocialServer;
  var nomeFantasia = req.body.nomeFantasiaServer;
  var cnpj = req.body.cnpjServer;
  var cep = req.body.cepServer;
  var numero = req.body.numeroServer;
  var complemento = req.body.complementoServer;
  var codigoAtivacao = req.body.codigoAtivacaoServer;

  empresaModel.buscarPorCnpj(cnpj).then((resultado) => {
    if (resultado.length > 0) {
      res
        .status(401)
        .json({ mensagem: `Já existe um cadastro vinculado ao cnpj ${cnpj}` });
    } else {
      empresaModel.cadastrar(razaoSocial, nomeFantasia, cnpj, cep, numero, complemento, codigoAtivacao).then((resultado) => {
        res.status(201).json(resultado);
      });
    }
  });
}

module.exports = {
    listar,
    cadastrar,
    buscarPorCnpj
};