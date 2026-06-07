var eventosModel = require('../models/eventosModel');

async function filtroDestino(req, res) {
  try {
    const resultado = await eventosModel.filtroDestino();

    return res.status(200).json(resultado);
  } catch (erro) {
    console.log('Erro ao listar destinos:', erro);
    return res.status(500).json({ mensagem: 'Erro interno', erro: erro.sqlMessage });
  }
}

async function listar(req, res) {
  try {
    const resultado = await eventosModel.listar();

    if (resultado.length > 0) {
      return res.status(200).json(resultado);
    } else {
      return res.status(204).send('Nenhum evento encontrado!');
    }
  } catch (erro) {
    console.log('Erro ao listar eventos:', erro);
    return res.status(500).json({ mensagem: 'Erro interno', erro: erro.sqlMessage });
  }
}

async function filtroFaixaEtaria(req, res) {
  try {
    const resultado = await eventosModel.filtroFaixaEtaria();
    return res.status(200).json(resultado);
  } catch (erro) {
    console.log('Erro ao listar faixas etárias:', erro);
    return res.status(500).json({ mensagem: 'Erro interno', erro: erro.sqlMessage });
  }
}

module.exports = {
  listar,
  filtroDestino,
  filtroFaixaEtaria,
};
