var gerenciarFuncionarioModel = require("../models/gerenciarFuncionarioModel");

async function listar(req, res) {
    try {
        const { idEmpresa, idFuncionario } = req.query;

        if (idFuncionario) {
            const resultado = await gerenciarFuncionarioModel.buscarPorId(idFuncionario);
            return res.status(200).json(resultado);
        }

        if (!idEmpresa) {
            return res.status(400).json({ mensagem: "ID da empresa não informado." });
        }

        const resultado = await gerenciarFuncionarioModel.listar(idEmpresa);

        if (resultado.length > 0) {
            return res.status(200).json(resultado);
        } else {
            return res.status(204).send("Nenhum funcionário encontrado!");
        }

    } catch (erro) {
        console.log("Erro ao listar usuários:", erro);
        return res.status(500).json({ mensagem: "Erro interno", erro: erro.sqlMessage });
    }
}

async function cadastrar(req, res) {
    try {
        const { nome, CPF, email, senha, idEmpresa, idNivelAcesso } = req.body;

        console.log(idEmpresa + ' - ' + idNivelAcesso);
        if (!nome || !email || !senha || !idEmpresa || !idNivelAcesso) {
            return res.status(400).json({ mensagem: "Todos os campos são obrigatórios!" });
        }

        const resultado = await gerenciarFuncionarioModel.cadastrar(nome, CPF, email, senha, idEmpresa, idNivelAcesso);

        return res.status(201).json(resultado);

    } catch (erro) {
        console.log("Houve um erro ao realizar o cadastro! Erro: ", erro);
        return res.status(500).json({ mensagem: "Erro ao cadastrar", erro: erro.sqlMessage });
    }
}

async function atualizar(req, res) {
    try {
        const { idFuncionario, nome, CPF, email, senha, idNivelAcesso } = req.body;

        if (!idFuncionario) {
            return res.status(400).json({ mensagem: "ID do funcionário não informado." });
        }

        const resultado = await gerenciarFuncionarioModel.atualizar(idFuncionario, nome, CPF, email, senha, idNivelAcesso);

        return res.status(201).json(resultado);

    } catch (erro) {
        console.log("Erro ao atualizar usuário:", erro);
        return res.status(500).json({ mensagem: "Erro interno", erro: erro.sqlMessage });
    }
}

async function deletar(req, res) {
    try {
        const { idFuncionario } = req.query;

        if (!idFuncionario) {
            return res.status(400).json({ mensagem: "ID do funcionário não informado." });
        }

        const resultado = await gerenciarFuncionarioModel.deletar(idFuncionario);
        return res.status(200).json(resultado);

    } catch (erro) {
        console.log("Erro ao deletar usuário:", erro);
        return res.status(500).json({ mensagem: "Erro interno", erro: erro.sqlMessage });
    }
}

async function pesquisar(req, res) {
    try {
        const { idEmpresa, pesquisa } = req.query;

        if (!idEmpresa) {
            return res.status(400).json({ mensagem: "ID da empresa não informado." });
        }

        const resultado = await gerenciarFuncionarioModel.pesquisar(idEmpresa, pesquisa);
        return res.status(200).json(resultado);

    } catch (erro) {
        console.log("Erro ao pesquisar usuário:", erro);
        return res.status(500).json({ mensagem: "Erro interno", erro: erro.sqlMessage });
    }
}

module.exports = {
    cadastrar,
    atualizar,
    listar,
    deletar,
    pesquisar
}