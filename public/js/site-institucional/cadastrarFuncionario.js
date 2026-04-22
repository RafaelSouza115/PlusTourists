let empresasCadastradas = [];
var validarSenha = false;
function cadastrar() {
    var nomeVar = nomeCompleto.value;
    var cpfVar = cpf.value;
    var emailVar = email.value;
    var codigoEmpresaVar = codigoAtivacao.value;
    var senhaVar = senha.value;
    var confirmarSenhaVar = confirmarSenha.value;
    var fkEmpresaVar = null;

    const modal = document.getElementById('modalEmpresa');
    const campoCodigo = document.getElementById('codigoEmpresa');
    const botaoFechar = document.getElementById('fecharModalEmpresa');

    botaoFechar.addEventListener('click', function () {
        modal.classList.remove('aberto');
    });

    if (nomeVar.trim() == "") {
        nomeInvalido.style.display = "block";
    }

    if (cpfVar.trim() == "") {
        cpfInvalido.style.display = "block";
    }

    if (emailVar.trim() == "") {
        emailInvalido.style.display = "block";
    }

    if (confirmarSenhaVar.trim() == "") {
        repetirSenhaInvalida.innerHTML = "Digite novamente sua senha";
        repetirSenhaInvalida.style.display = "block";
    }

    if (confirmarSenhaVar != senhaVar) {
        repetirSenhaInvalida.innerHTML = "As senhas precisam ser iguais";
        repetirSenhaInvalida.style.display = "block";
    }

    if (nomeVar.trim() == "" || cpfVar.trim() == "" || emailVar.trim() == "" || !validarSenha || confirmarSenhaVar != senhaVar) {
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
        .then(async (resposta) => {
            const data = await resposta.json();
            console.log("resposta: ", resposta);

            if (resposta.ok) {
                campoCodigo.textContent = "Cadastro realizado com sucesso! Você será redirecionado para a página de acesso.";
                modal.classList.add('aberto');
                setTimeout(() => {
                    window.location = "login.html";
                }, 3000);

            } else {
                throw new Error(data.mensagem);
            }
        })
        .catch(async (err) => {
            console.log("campoCodigo:", campoCodigo);
            console.log("modal:", modal);
            campoCodigo.textContent = err.message;
            modal.classList.add('aberto');
            console.log("#ERRO:", err);
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

function validar() {
    let validar = senha.value;
    let validarMaiuscula = false;
    let validarMinuscula = false;
    let validarNumero = false;
    let validarEspecial = false;
    let maiuscula = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P",
        "A", "S", "D", "F", "G", "H", "J", "K", "L", "Ç", "Z", "X",
        "C", "V", "B", "N", "M"];
    let minuscula = ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p",
        "a", "s", "d", "f", "g", "h", "j", "k", "l", "ç", "z", "x",
        "c", "v", "b", "n", "m"];
    let numero = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let especial = ["!", "@", "_", "$", "%", "&", "*", ".", "/",
        "#", "?"];
    for (let i = 0; i < maiuscula.length; i++) {
        if (validar.includes(maiuscula[i])) {
            validarMaiuscula = true;
            break;
        } else {
            validarMaiuscula = false;
        }
    }
    for (let i = 0; i < minuscula.length; i++) {
        if (validar.includes(minuscula[i])) {
            validarMinuscula = true;
            break;
        } else {
            validarMinuscula = false;
        }
    }
    for (let i = 0; i < numero.length; i++) {
        if (validar.includes(numero[i])) {
            validarNumero = true;
            break;
        } else {
            validarNumero = false;
        }
    }
    for (let i = 0; i < especial.length; i++) {
        if (validar.includes(especial[i])) {
            validarEspecial = true;
            break;
        } else {
            validarEspecial = false;
        }
    }
    if (validarMaiuscula && validarMinuscula && validarNumero && validarEspecial) {
        validarSenha = true;
        senhaInvalida.innerHTML = '';
        senhaInvalida.style.display = "block";
    } else {
        validarSenha = false;
        senhaInvalida.innerHTML = 'Deve conter 8 caracteres ou mais, 1 letra maiúscula, 1 letra minúscula, 1 numero e 1 caractere especial';
        senhaInvalida.style.display = "block";
    }
}