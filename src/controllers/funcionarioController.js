var funcionarioModel = require("../models/funcionarioModel");

function cadastrar(req, res) {
    var nome = req.body.nome;
    var cpf = req.body.cpf;
    var email = req.body.email;
    var senha = req.body.senha;
    var empresaLigada = req.body.empresa_ligada;

    funcionarioModel.cadastrar(nome, cpf, email, senha, empresaLigada)
        .then(function (resultado) {
            res.status(201).json({
                mensagem: "Funcionário cadastrado com sucesso.",
                id_funcionario: resultado.insertId
            });
        })
        .catch(function (erro) {
            console.error("Erro ao cadastrar funcionário:", erro);
            res.status(500).json({
                mensagem: "Erro ao cadastrar funcionário.",
                erro
            });
        });
}

function autenticar(req, res) {
    var email = req.body.email;
    var senha = req.body.senha;

    funcionarioModel.autenticar(email, senha)
        .then(function (resultado) {
            if (resultado.length === 1) {
                var funcionario = resultado[0];
                res.status(200).json({
                    id_funcionario: funcionario.id_funcionario,
                    nome: funcionario.nome,
                    cpf: funcionario.CPF,
                    email: funcionario.email,
                    empresa_ligada: funcionario.empresa_ligada
                });
                console.log("Funcionário autenticado com sucesso.");
            } else {
                res.status(403).json({
                    mensagem: "Email ou senha inválidos."
                });
            }
        })
        .catch(function (erro) {
            console.error("Erro ao autenticar funcionário:", erro);
            res.status(500).json({
                mensagem: "Erro ao autenticar funcionário.",
                erro
            });
        });
}

module.exports = {
    cadastrar,
    autenticar
};
