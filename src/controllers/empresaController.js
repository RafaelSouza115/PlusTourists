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

function apenasNumeros(str) {
    var s = String(str);
    var resultado = "";
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (c >= "0" && c <= "9") resultado += c;
    }
    return resultado;
}

function emailValido(email) {
    var s = String(email).trim();
    if (s.length < 5) return false;
    var idxArroba = -1;
    for (var i = 0; i < s.length; i++) {
        if (s.charAt(i) === "@") {
            if (idxArroba !== -1) return false;
            idxArroba = i;
        }
    }
    if (idxArroba < 1 || idxArroba >= s.length - 1) return false;
    var parteDepois = s.substring(idxArroba + 1);
    var temPonto = false;
    for (var j = 0; j < parteDepois.length; j++) {
        if (parteDepois.charAt(j) === ".") {
            temPonto = true;
            break;
        }
    }
    return temPonto;
}

function validarCadastroEmpresa(req, res, next) {
    var nomeFantasia = req.body.nome_fantasia;
    var cnpj = req.body.cnpj;

    if (!nomeFantasia || String(nomeFantasia).trim() === "") {
        return res.status(400).json({
            mensagem: "Campo nome_fantasia é obrigatório."
        });
    }

    if (!cnpj || String(cnpj).trim() === "") {
        return res.status(400).json({
            mensagem: "Campo CNPJ é obrigatório."
        });
    }

    var apenasNumerosCnpj = apenasNumeros(cnpj);
    if (apenasNumerosCnpj.length !== 14) {
        return res.status(400).json({
            mensagem: "CNPJ deve conter apenas números e ter exatamente 14 dígitos."
        });
    }
  }

function cadastrar(req, res) {
  var razaoSocial = req.body.razaoSocialServer;
  var nomeFantasia = req.body.nomeFantasiaServer;
  var cnpj = req.body.cnpjServer;
  var email = req.body.emailServer;
  var cep = req.body.cepServer;
  var numero = req.body.numeroServer;
  var complemento = req.body.complementoServer;
  var codigoAtivacao = req.body.codigoAtivacaoServer;

  if (!razaoSocial || String(razaoSocial).trim() === "") {
        return res.status(400).json({
            mensagem: "É obrigatório o preenchimento da razão social"
        });
    }

    if (!cnpj || String(cnpj).trim() === "") {
        return res.status(400).json({
            mensagem: "É obrigatório o preenchimento do CNPJ"
        });
    }

    if (!email || String(email).trim() === "") {
        return res.status(400).json({
            mensagem: "Campo email é obrigatório."
        });
    }
    if (!emailValido(email)) {
        return res.status(400).json({
            mensagem: "Preencha o email corretamente."
        });
    }


    var apenasNumerosCnpj = apenasNumeros(cnpj);
    if (apenasNumerosCnpj.length !== 14) {
        return res.status(400).json({
            mensagem: "CNPJ deve conter apenas números e ter exatamente 14 dígitos."
        });
    }

    
  empresaModel.buscarPorCnpj(cnpj).then((resultado) => {
    if (resultado.length > 0) {
      res
        .status(401)
        .json({ mensagem: `Já existe um cadastro vinculado ao cnpj ${cnpj}` });
    } else {
      empresaModel.cadastrar(razaoSocial, nomeFantasia, cnpj, email, cep, numero, complemento, codigoAtivacao).then((resultado) => {
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