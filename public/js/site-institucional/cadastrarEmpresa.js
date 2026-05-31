const { rejects } = require('assert');
const { error } = require('console');
const { resolve } = require('dns');
const { stdout, stderr } = require('process');

function cadastrar() {
  var razaoSocialVar = razaoSocial.value;
  var nomeFantasiaVar = nomeFantasia.value;
  var cnpjVar = cnpj.value;
  var emailVar = email.value;
  var cepVar = cep.value;
  var numeroVar = numero.value;
  var complementoVar = complemento.value;
  var codigoAtivacaoVar = Math.floor(100000 + Math.random() * 900000);

  const modal = document.getElementById('modalEmpresa');
  const campoCodigo = document.getElementById('codigoEmpresa');
  const botaoFechar = document.getElementById('fecharModalEmpresa');

  botaoFechar.addEventListener('click', function () {
    modal.classList.remove('aberto');
  });

  if (razaoSocialVar.trim() == "") {
    razaoSocialInvalida.style.display = "block";
  }

  if (cnpjVar.trim() == "") {
    cnpjInvalido.style.display = "block";
  }

  if (cepVar.trim() == "") {
    cepInvalido.style.display = "block";
  }

  if (numeroVar.trim() == "") {
    numeroInvalido.style.display = "block";
  }

  if (emailVar.trim() == "") {
    emailInvalido.style.display = "block";
  }

  if (nomeFantasiaVar.trim() == "") {
    nomeFantasiaVar = null;
  }

  if (complementoVar.trim() == "") {
    complementoVar = null;
  }

  if (razaoSocialVar.trim() == "" || cnpjVar.trim() == "" || cepVar.trim() == "" || numeroVar.trim() == "") {
    return false;
  }

  fetch("/empresas/cadastrar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      razaoSocialServer: razaoSocialVar,
      nomeFantasiaServer: nomeFantasiaVar,
      cnpjServer: cnpjVar,
      emailServer: emailVar,
      cepServer: cepVar,
      numeroServer: numeroVar,
      complementoServer: complementoVar,
      codigoAtivacaoServer: codigoAtivacaoVar
    }),
  })
    .then(async (resposta) => {
      const data = await resposta.json();
      console.log("resposta: ", resposta);

      if (resposta.ok) {
        campoCodigo.textContent = "Cadastro realizado com sucesso! Em breve disponibilizaremos o código para a criação do primeiro usuário.";
        modal.classList.add('aberto');

      } else {
        throw data.mensagem;
      }
    })
    .catch((err) => {
      campoCodigo.textContent = err;
      modal.classList.add('aberto');
      console.log(`#ERRO:`, err);
    });

  return false;
}