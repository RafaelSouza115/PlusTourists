// var ambiente_processo = process.env.AMBIENTE_PROCESSO || 'producao';

// var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
// require("dotenv").config({ path: caminho_env });

var ambiente_processo = 'producao';

var caminho_env = ambiente_processo === 'producao' ? '.env' : '.env.dev';
// Acima, temos o uso do operador ternário para definir o caminho do arquivo .env
// A sintaxe do operador ternário é: condição ? valor_se_verdadeiro : valor_se_falso

require('dotenv').config({ path: caminho_env });

var express = require('express');
var cors = require('cors');
var path = require('path');
var PORTA_APP = process.env.APP_PORT;
var HOST_APP = process.env.APP_HOST;

var app = express();

var funcionarioRouter = require('./src/routes/funcionario');
var empresaRouter = require('./src/routes/empresa');
var planoRouter = require('./src/routes/plano');
var dashboardRouter = require('./src/routes/dashboard');
var gerenciarFuncionarioRouter = require('./src/routes/gerenciarFuncionario');
var eventosRouter = require('./src/routes/eventos');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/funcionarios', funcionarioRouter);
app.use('/empresas', empresaRouter);
app.use('/planos', planoRouter);
app.use('/dashboard', dashboardRouter);
app.use('/gerenciar-funcionario', gerenciarFuncionarioRouter);
app.use('/eventos', eventosRouter);

app.post('/perguntar', async (req, res) => {
  const pergunta = req.body.pergunta;
  try {
    const resultado = await gerarResposta(pergunta);
    res.json({ resultado });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

async function gerarResposta(mensagem) {
  try {
    const modeloIA = chatIA.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Em um paragráfo responda: ${mensagem}`,
    });
    const resposta = (await modeloIA).text;
    return resposta;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

app.listen(PORTA_APP, function () {
  console.log(`
    ##   ##  ######   #####             ####       ##     ######     ##              ##  ##    ####    ######  
    ##   ##  ##       ##  ##            ## ##     ####      ##      ####             ##  ##     ##         ##  
    ##   ##  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##        ##   
    ## # ##  ####     #####    ######   ##  ##   ######     ##     ######   ######   ##  ##     ##       ##    
    #######  ##       ##  ##            ##  ##   ##  ##     ##     ##  ##            ##  ##     ##      ##     
    ### ###  ##       ##  ##            ## ##    ##  ##     ##     ##  ##             ####      ##     ##      
    ##   ##  ######   #####             ####     ##  ##     ##     ##  ##              ##      ####    ######  
                                                                                                  
    Servidor do seu site já está rodando! Acesse: http://${HOST_APP}:${PORTA_APP}
    Ambiente: ${process.env.AMBIENTE_PROCESSO}
    `);
});
