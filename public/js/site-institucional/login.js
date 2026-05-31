function autenticar() {
    const ipt_email = document.getElementById("email").value;
    const ipt_senha = document.getElementById("senha").value;
    const modal = document.getElementById('modalEmpresa');
    const campoCodigo = document.getElementById('codigoEmpresa');
    const botaoFechar = document.getElementById('fecharModalEmpresa');
    botaoFechar.addEventListener('click', function () {
        modal.classList.remove('aberto');
    });

    fetch("/funcionarios/autenticar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }, body: JSON.stringify({
            email: ipt_email,
            senha: ipt_senha
        })
    })
        .then(async (res) => {
            console.log("Validando cadastro...")
            const data = await res.json();
            console.log("resposta: ", res);

            if (res.ok) {
                console.log(res);

                sessionStorage.ID_FUNCIONARIO = data.id_funcionario;
                sessionStorage.NOME_FUNCIONARIO = data.nome;
                sessionStorage.EMAIL_FUNCIONARIO = data.email;
                sessionStorage.NIVEL_ACESSO = data.nivel_acesso;
                sessionStorage.ID_EMPRESA = data.empresa_ligada;
                window.location = "../dashboard/index.html";
            } else {
                throw data.mensagem;
            }
        })
        .catch((err) => {
            campoCodigo.textContent = err;
            modal.classList.add('aberto');
            console.log(`#ERRO:`, err);
        });
    return;
}