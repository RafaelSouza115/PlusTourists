window.onload = buscarDados;

function buscarDados() {

    var idFuncionario = sessionStorage.ID_FUNCIONARIO;

    fetch(`/funcionarios/buscar/${idFuncionario}`)
    .then(function(resposta) {

        return resposta.json();

    })
    .then(function(dados) {

        console.log(dados);

        var funcionario = dados[0];

        input_nome.value = funcionario.nome;
        input_email.value = funcionario.email;
        input_cpf.value = formatarCPF(funcionario.cpf);

        input_senha.placeholder = "********";

        sidebar_nome.innerHTML = funcionario.nome;
        sidebar_email.innerHTML = funcionario.email;

        var cargo = "";

        if (funcionario.nivel_acesso == 0) {

            cargo = "Gerente";

        } else if (funcionario.nivel_acesso == 1) {

            cargo = "Analista Sênior";

        } else if (funcionario.nivel_acesso == 2) {

            cargo = "Analista";

        } else if (funcionario.nivel_acesso == 3) {

            cargo = "Empresa PlusTourists";

        }

        cargo_funcionario.innerHTML = cargo;

    })
    .catch(function(erro) {

        console.log(erro);

    });
}

function habilitarEdicao() {

    input_nome.removeAttribute("readonly");
    input_email.removeAttribute("readonly");
    input_senha.removeAttribute("readonly");

    input_senha.value = "";

    btn_editar.style.display = "none";

    btn_cancelar.style.display = "inline-flex";
    btn_salvar.style.display = "inline-flex";
}

function atualizarDados() {

    var idFuncionario = sessionStorage.ID_FUNCIONARIO;

    var nomeVar = input_nome.value;
    var emailVar = input_email.value;
    var senhaVar = input_senha.value;

    fetch(`/funcionarios/atualizar/${idFuncionario}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            nome: nomeVar,
            email: emailVar,
            senha: senhaVar

        })

    })
    .then(async function(resposta) {

    var dados = await resposta.json();

    if (resposta.ok) {

        sidebar_nome.innerHTML = nomeVar;
        sidebar_email.innerHTML = emailVar;

        input_nome.setAttribute("readonly", true);
        input_email.setAttribute("readonly", true);
        input_senha.setAttribute("readonly", true);

        input_senha.value = "";
        input_senha.placeholder = "********";

        btn_editar.style.display = "inline-flex";

        btn_cancelar.style.display = "none";
        btn_salvar.style.display = "none";

        alert(dados.mensagem);

    } else {

        alert(dados.mensagem);

    }

})
    .catch(function(erro) {

        console.log(erro);

    });
}

function cancelarEdicao() {

    buscarDados();

    input_nome.setAttribute("readonly", true);
    input_email.setAttribute("readonly", true);
    input_senha.setAttribute("readonly", true);

    btn_editar.style.display = "inline-flex";

    btn_cancelar.style.display = "none";
    btn_salvar.style.display = "none";
}

function formatarCPF(cpf) {

    cpf = cpf.replace(/\D/g, '');

    return cpf.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
    );
}

function limparSessao() {

    sessionStorage.clear();

    window.location = "../login.html";

}