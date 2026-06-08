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

        if (funcionario.nivel_acesso == 1) {

            cargo = "Gerente";

        } else if (funcionario.nivel_acesso == 2) {

            cargo = "Analista Sênior";

        } else if (funcionario.nivel_acesso == 3) {

            cargo = "Analista";

        } else if (funcionario.nivel_acesso == 4) {

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
    icone_senha.style.display = "block";
    btn_cancelar.style.display = "inline-flex";
    btn_salvar.style.display = "inline-flex";
}

function mostrarErro(elemento, mensagem) {
    elemento.style.visibility = "visible";
    elemento.innerHTML = mensagem;
}

function limparErros() {

   erro_nome.style.display = "none";
    erro_nome.innerHTML = "";

    erro_email.style.display = "none";
    erro_email.innerHTML = "";

    erro_senha.style.display = "none";
    erro_senha.innerHTML = "";
}

function validarCampos() {

    limparErros();

    let valido = true;

    let nome = input_nome.value.trim();
    let email = input_email.value.trim();
    let senha = input_senha.value;

    if (nome === "") {
        erro_nome.style.display = "block";
        erro_nome.innerHTML = "O nome é obrigatório.";
        valido = false;
    }

    if (nome !== "" && nome.length < 3) {
        erro_nome.style.display = "block";
        erro_nome.innerHTML = "O nome deve ter pelo menos 3 caracteres.";
        valido = false;
    }

    if (email === "") {
        erro_email.style.display = "block";
        erro_email.innerHTML = "O e-mail é obrigatório.";
        valido = false;
    } else if (!email.includes("@") || !email.includes(".")) {
        erro_email.style.display = "block";
        erro_email.innerHTML = "Digite um e-mail válido.";
        valido = false;
    }

    if (senha !== "") {

        let senhaForte =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!senhaForte.test(senha)) {
            erro_senha.style.display = "block";
            erro_senha.innerHTML =
                "A senha deve ter 8+ caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 símbolo.";
            valido = false;
        }
    }

    return valido;
}

function atualizarDados() {

    if (!validarCampos()) return;

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

        btn_editar.style.display = "block";

        btn_cancelar.style.display = "none";
        btn_salvar.style.display = "none";

        abrirModal(dados.mensagem);

    } else {

        abrirModal(dados.mensagem);

    }

})
    .catch(function(erro) {

        console.log(erro);

    });
}

function cancelarEdicao() {

    buscarDados();

    limparErros();

    input_nome.setAttribute("readonly", true);
    input_email.setAttribute("readonly", true);
    input_senha.setAttribute("readonly", true);

    btn_editar.style.display = "block";

    btn_cancelar.style.display = "none";
    btn_salvar.style.display = "none";

    icone_senha.style.display = "none";
    input_senha.type = "password";
    icone_senha.className = "fi fi-rr-eye";
}

function formatarCPF(cpf) {

    cpf = cpf.replace(/\D/g, '');

    return cpf.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
    );
}

function alternarSenha() {

    if (input_senha.type === "password") {

        input_senha.type = "text";
        icone_senha.className = "fi fi-rr-eye-crossed";

    } else {

        input_senha.type = "password";
        icone_senha.className = "fi fi-rr-eye";

    }
}

function abrirModal(mensagem) {
    textoModal.innerHTML = mensagem;
    modalMensagem.classList.add("aberto");
}

function fecharModal() {
    modalMensagem.classList.remove("aberto");
}

document
    .getElementById("fecharModal")
    .addEventListener("click", fecharModal);

function limparSessao() {

    sessionStorage.clear();

    window.location = "../login.html";

}