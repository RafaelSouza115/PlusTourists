var funcionarioModel = require('../models/funcionarioModel');

function apenasNumeros(str) {
  var s = String(str);
  var resultado = '';
  for (var i = 0; i < s.length; i++) {
    var c = s.charAt(i);
    if (c >= '0' && c <= '9') resultado += c;
  }
  return resultado;
}

function emailValido(email) {
  var s = String(email).trim();
  if (s.length < 5) return false;
  var idxArroba = -1;
  for (var i = 0; i < s.length; i++) {
    if (s.charAt(i) === '@') {
      if (idxArroba !== -1) return false;
      idxArroba = i;
    }
  }
  if (idxArroba < 1 || idxArroba >= s.length - 1) return false;
  var parteDepois = s.substring(idxArroba + 1);
  var temPonto = false;
  for (var j = 0; j < parteDepois.length; j++) {
    if (parteDepois.charAt(j) === '.') {
      temPonto = true;
      break;
    }
  }
  return temPonto;
}

function senhaForte(senha) {
  if (!senha || typeof senha !== 'string') return false;
  if (senha.length < 8) return false;
  var temNumero = false;
  var temMaiuscula = false;
  var temMinuscula = false;
  var temEspecial = false;
  for (var i = 0; i < senha.length; i++) {
    var c = senha.charAt(i);
    if (c >= '0' && c <= '9') temNumero = true;
    else if (c >= 'A' && c <= 'Z') temMaiuscula = true;
    else if (c >= 'a' && c <= 'z') temMinuscula = true;
    else temEspecial = true;
  }
  return temNumero && temMaiuscula && temMinuscula && temEspecial;
}

function cadastrar(req, res) {
  var nome = req.body.nomeServer;
  var cpf = req.body.cpfServer;
  var email = req.body.emailServer;
  var senha = req.body.senhaServer;
  var fkEmpresa = req.body.fkEmpresaServer;

  if (!nome || String(nome).trim() === '') {
    return res.status(400).json({
      mensagem: 'Campo nome é obrigatório.',
    });
  }

  if (!cpf || String(cpf).trim() === '') {
    return res.status(400).json({
      mensagem: 'Campo CPF é obrigatório.',
    });
  }

  var apenasNumerosCpf = apenasNumeros(cpf);
  if (apenasNumerosCpf.length !== 11) {
    return res.status(400).json({
      mensagem: 'CPF deve conter apenas números e ter exatamente 11 dígitos.',
    });
  }
  req.body.cpf = apenasNumerosCpf;

  if (!email || String(email).trim() === '') {
    return res.status(400).json({
      mensagem: 'Campo email é obrigatório.',
    });
  }
  if (!emailValido(email)) {
    return res.status(400).json({
      mensagem: 'Email inválido.',
    });
  }

  if (!senhaForte(senha)) {
    return res.status(400).json({
      mensagem:
        'Senha deve ter no mínimo 8 caracteres, 1 número, 1 letra maiúscula, 1 letra minúscula e 1 caractere especial.',
    });
  }

  if (fkEmpresa === undefined || fkEmpresa === null || fkEmpresa === '') {
    return res.status(400).json({
      mensagem: 'Código de ativação inválido',
    });
  }
  var idEmpresa = parseInt(fkEmpresa, 10);
  if (Number.isNaN(idEmpresa) || idEmpresa < 1) {
    return res.status(400).json({
      mensagem: 'empresa_ligada deve ser um ID de empresa válido.',
    });
  }

  funcionarioModel
    .cadastrar(nome, cpf, email, senha, fkEmpresa)
    .then(function (resultado) {
      res.status(201).json({
        mensagem: 'Cadastro realizado com sucesso.',
        id_funcionario: resultado.insertId,
      });
    })
    .catch(function (erro) {
      console.error('Erro ao cadastrar funcionário:', erro);
      res.status(500).json({
        mensagem: 'Erro ao cadastrar funcionário.',
        erro,
      });
    });
}

function autenticar(req, res) {
  var email = req.body.email;
  var senha = req.body.senha;

  funcionarioModel
    .autenticar(email, senha)
    .then(function (resultado) {
      if (resultado.length === 1) {
        var funcionario = resultado[0];
        res.status(200).json({
          id_funcionario: funcionario.id_funcionario,
          nome: funcionario.nome,
          cpf: funcionario.cpf,
          email: funcionario.email,
          empresa_ligada: funcionario.empresa_ligada,
          nivel_acesso: funcionario.nivel_acesso,
        });
        console.log('Funcionário autenticado com sucesso.');
      } else {
        res.status(403).json({
          mensagem: 'Email ou senha inválidos.',
        });
      }
    })
    .catch(function (erro) {
      console.error('Erro ao autenticar funcionário:', erro);
      res.status(500).json({
        mensagem: 'Erro ao autenticar funcionário.',
        erro,
      });
    });
}

function buscarPorId(req, res) {
  var idFuncionario = req.params.idFuncionario;

  funcionarioModel
    .buscarPorId(idFuncionario)
    .then(function (resultado) {
      if (resultado.length > 0) {
        res.status(200).json(resultado);
      } else {
        res.status(404).json({
          mensagem: 'Funcionário não encontrado.',
        });
      }
    })
    .catch(function (erro) {
      console.error('Erro ao buscar funcionário:', erro);

      res.status(500).json({
        mensagem: 'Erro ao buscar funcionário.',
        erro,
      });
    });
}

function atualizar(req, res) {
  var idFuncionario = req.params.idFuncionario;

  var nome = req.body.nome;
  var email = req.body.email;
  var senha = req.body.senha;

  if (!nome || String(nome).trim() === '') {
    return res.status(400).json({
      mensagem: 'Campo nome é obrigatório.',
    });
  }

  if (!email || String(email).trim() === '') {
    return res.status(400).json({
      mensagem: 'Campo email é obrigatório.',
    });
  }

  if (!emailValido(email)) {
    return res.status(400).json({
      mensagem: 'Email inválido.',
    });
  }

  if (senha && !senhaForte(senha)) {
    return res.status(400).json({
      mensagem: 'Senha fraca.',
    });
  }

  funcionarioModel
    .atualizar(idFuncionario, nome, email, senha || null)
    .then(function (resultado) {
      res.status(200).json({
        mensagem: 'Dados atualizados com sucesso.',
      });
    })
    .catch(function (erro) {
      console.error('Erro ao atualizar funcionário:', erro);

      res.status(500).json({
        mensagem: 'Erro ao atualizar funcionário.',
        erro,
      });
    });
}

module.exports = {
  cadastrar,
  autenticar,
  buscarPorId,
  atualizar,
};
