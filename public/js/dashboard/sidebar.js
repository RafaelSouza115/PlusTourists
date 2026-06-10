window.onload = function () {
  buscarDados();
  verificarPermissoes();
};
console.log(sessionStorage.NIVEL_ACESSO);
function buscarDados() {
  var idFuncionario = sessionStorage.ID_FUNCIONARIO;

  fetch(`/funcionarios/buscar/${idFuncionario}`)
    .then(function (resposta) {
      return resposta.json();
      console.log('resposta: ', resposta);
    })
    .then(function (dados) {
      console.log(dados);

      var funcionario = dados[0];

      sidebar_nome.innerHTML = funcionario.nome;
      sidebar_email.innerHTML = funcionario.email;
    })
    .catch(function (erro) {
      console.log(erro);
    });
}

function verificarPermissoes(funcionario) {
  if (sessionStorage.NIVEL_ACESSO == 1) {
    document.getElementById('menu_empresa').style.display = 'flex';

    document.getElementById('menu_funcionarios').style.display = 'flex';
  }
}

function limparSessao() {
  sessionStorage.clear();

  window.location = '../login.html';
}
