var planoModel = require("../models/planoModel");

function listarEventos(req, res) {
  planoModel.listarEventos()
  .then((resultado) => {
    res.status(200).json(resultado);
  })
  .catch((erro) => {
      console.error("Erro ao listar eventos:", erro);
      res.status(500).json({
        mensagem: "Erro ao listar eventos.",
        erro
      });
    })
  ;
}

function listarEstados(req, res) {
  planoModel.listarEstados()
  .then((resultado) => {
    res.status(200).json(resultado);
  })
  .catch((erro) => {
      console.error("Erro ao listar estados:", erro);
      res.status(500).json({
        mensagem: "Erro ao listar estados.",
        erro
      });
    })
  ;
}

function listarMunicipios(req, res) {
    planoModel.listarMunicipios()
    .then((resultado) => {
    res.status(200).json(resultado);
    })
    .catch((erro) => {
      console.error("Erro ao listar municípios:", erro);
      res.status(500).json({
        mensagem: "Erro ao listar municípios.",
        erro
      });
    });
}

function criarPlano(req, res) {
  const nomePlano = req.body.nomePlanoServer;
  const destino = req.body.destinoServer;
  const dataInicial = req.body.dataInicialServer;
  const dataFinal = req.body.dataFinalServer;
  const idEmpresa = req.body.idEmpresaServer;
  const roteiro = req.body.roteiroServer;
  
  console.log(req.body)
  console.log(req.body.nomePlanoServer)

  if (!nomePlano || String(nomePlano).trim() === "") {
    return res.status(400).json({
      mensagem: "O nome do plano é obrigatório."
    });
  }
  if (!destino || String(destino).trim() === "") {
    return res.status(400).json({
      mensagem: "O destino do plano é obrigatório."
    });
  }
  if (!dataInicial || String(dataInicial).trim() === "") {
    return res.status(400).json({
      mensagem: "A data inicial do plano é obrigatória."
    });
  }
  if (!dataFinal || String(dataFinal).trim() === "") {
    return res.status(400).json({
      mensagem: "A data final do plano é obrigatória."
    });
  }
  if (!idEmpresa || idEmpresa == null) {
    return res.status(400).json({
      mensagem: "Erro ao receber o identificador da empresa."
    });
  }
  if (!Array.isArray(roteiro) || roteiro.length === 0) {
    return res.status(400).json({
      mensagem: "Precisa incluir ao menos um evento ao plano."
    })
  }

  planoModel.criarPlano(nomePlano, dataInicial, dataFinal, idEmpresa, destino)
    .then(function (resultado) {
      console.log("Resultado: ", resultado);
      const idPlano = resultado.insertId;
      return planoModel.adicionarRoteiro(idPlano, roteiro)
        .then(function (resultado) {
          res.status(201).json({
            mensagem: "Plano criado com sucesso."
          });
        })
        .catch(function (erro) {
          res.status(500).json({
            mensagem: "Erro ao inserir roteiro: ", erro
          });
        });
    })
    .catch(function (erro) {
      console.log("Erro ao realizar POST: ", erro);
      return res.status(500).json({
        mensagem: "Erro ao criar o plano: ", erro
      });
    });
}

function listarPlanos(req, res) {
    const idEmpresa = req.params.idEmpresa;
    const status = req.params.status;
    if (!idEmpresa) {
        return res.status(400).json({
            mensagem: "Id da empresa não informado."
        });
    }
    if (!status) {
        return res.status(400).json({
            mensagem: "Status não informado."
        });
    }
    planoModel.listarPlanos(idEmpresa, status)
        .then((resultado) => {
            res.status(200).json(resultado);
        })
        .catch((erro) => {
            console.log(erro);
            res.status(500).json({
                mensagem: "Erro ao listar planos."
            });
        });
}

function listarDetalhesPlano(req, res) {
    const idPlano = req.params.idPlano;
    if (!idPlano) {
        return res.status(400).json({
            mensagem: "Id do plano não informado."
        });
    }
    planoModel.listarDetalhesPlano(idPlano)
        .then((resultado) => {
            if (resultado.length == 0) {
                return res.status(404).json({
                    mensagem: "Plano não encontrado."
                });
            }
            const plano = {
                idPlano: resultado[0].idPlano,
                nomePlano: resultado[0].plano,
                destino: resultado[0].destino,
                periodo: resultado[0].periodo,
                duracao: resultado[0].duracao,
                uf: resultado[0].uf,
                inicio: resultado[0].comeco,
                fim: resultado[0].final,
                eventos: []
            };
            resultado.forEach((linha) => {
                plano.eventos.push({
                    idEvento: linha.idEvento,
                    nome: linha.evento,
                    inicioEvento: linha.inicioEvento,
                    fimEvento: linha.fimEvento,
                    classificacao: linha.classificacao
                });
            });
            res.status(200).json(plano);
        })
        .catch((erro) => {
            console.log(erro);
            res.status(500).json({
                mensagem: "Erro ao buscar detalhes do plano."
            });
        });
}

function validarPlano(req, res) {
    const idPlano = req.params.idPlano;
    planoModel.validarPlano(idPlano)
        .then(() => {
            res.status(200).json({
                mensagem: "Plano validado."
            });
        })
        .catch((erro) => {
            console.log(erro);
            res.status(500).json({
                mensagem: "Erro ao validar o plano: ",
                erro});
        });
}

function excluirPlano(req, res) {
    const idPlano = req.params.idPlano;
    planoModel.excluirPlano(idPlano)
        .then(() => {
            res.status(200).json({
                mensagem: "Plano excluído."
            });
        })
        .catch((erro) => {
            console.log(erro);
            res.status(500).json({
                mensagem: "Erro ao excluir o plano: ",
                erro});
        });
}

module.exports = {
    listarEventos,
    listarEstados,
    criarPlano,
    listarMunicipios,
    listarPlanos,
    listarDetalhesPlano,
    validarPlano,
    excluirPlano
};