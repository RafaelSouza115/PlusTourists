window.onload = buscarDados;

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
