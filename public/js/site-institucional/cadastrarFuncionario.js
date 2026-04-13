    let empresasCadastradas = [];
    function cadastrar() {
        var nomeVar = nomeCompleto.value;
        var cpfVar = cpf.value;
        var emailVar = email.value;
        var codigoEmpresaVar = codigoEmpresa.value;
        var senhaVar = senha.value;
        var confirmarSenhaVar = confirmarSenha.value;
        var fkEmpresaVar = null;

        if (nomeVar == "" ||
            cpfVar == "" ||
            emailVar == "" ||
            codigoEmpresaVar == "" ||
            senhaVar == "" ||
            confirmarSenhaVar == "") {
                alert("Preencha corretamente todos os campos")
                return false;
            }
            for (let i = 0; i < empresasCadastradas.length; i++) {
                console.log("Empresa: " + empresasCadastradas[i].codigo_ativacao + empresasCadastradas[i].id_empresa);
                if (empresasCadastradas[i].codigo_ativacao == codigoEmpresaVar) {
                    fkEmpresaVar = empresasCadastradas[i].id_empresa
                    console.log("Código de ativação válido.");
                    break;
                }
            }

        fetch("/funcionarios/cadastrarFuncionario", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nomeServer: nomeVar,
                cpfServer: cpfVar,
                emailServer: emailVar,
                senhaServer: senhaVar,
                fkEmpresaServer: fkEmpresaVar
            }),
        })
            .then(function (resposta) {
                console.log("resposta: ", resposta);

                if (resposta.ok) {
                    setTimeout(() => {
                        window.location = "login.html";
                    }, "2000");

                } else {
                    throw "Houve um erro ao tentar realizar o cadastro!";
                }
            })
            .catch(function (resposta) {
                console.log(`#ERRO: ${resposta}`);
            });
        return false;
    }

    function listar() {
        fetch("/empresas/listar", {
            method: "GET",
        })
            .then(function (resposta) {
                resposta.json().then((empresas) => {
                    empresas.forEach((empresa) => {
                        empresasCadastradas.push(empresa);

                        console.log("listaEmpresasCadastradas")
                        console.log(empresasCadastradas[0].codigo_ativacao)
                    });
                });
            })
            .catch(function (resposta) {
                console.log(`#ERRO: ${resposta}`);
            });
    }