
function mostrarAba(tipo) {
    document.getElementById("formEmpresa").style.display = "none";
    document.getElementById("formEndereco").style.display = "none";

    document.getElementById(tipo).style.display = "block";
}

window.onload = buscarDados;

var editando = false;

function buscarDados() {
    var idEmpresa = sessionStorage.ID_EMPRESA;

    
    fetch(`/empresas/buscar/${idEmpresa}`)
    .then(res => res.json())
    .then(dados => {

        var empresa = dados[0];

        iptRazaoSocial.value = empresa.razaoSocial;
        iptNomeFantasia.value = empresa.nomeFantasia;
        iptCnpj.value = empresa.cnpj;
        iptEmail.value = empresa.email;
        iptCep.value = empresa.cep;
        iptComplemento.value = empresa.complemento;
        iptNumero.value = empresa.numero;

    });


    bloquearInputs();
}

function atualizarDados(){

    var idEmpresa = sessionStorage.ID_EMPRESA;

    var dados = {

        razaoSocial: iptRazaoSocial.value,
        nomeFantasia: iptNomeFantasia.value,
        cnpj: iptCnpj.value,
        email: iptEmail.value,
        cep: iptCep.value,
        complemento: iptComplemento.value,
        numero: iptNumero.value
    };

    fetch(`/empresas/atualizar/${idEmpresa}`,{

        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)

    })
    .then(async function(resposta) {

        var dadosResposta = await resposta.json();

        if(resposta.ok) {

            alert(dadosResposta.mensagem);

        }else {

            alert(dadosResposta.mensagem);
        }
        
    })
    .catch(function(erro){
        console.log("Erro ao atualizar:", erro);
    });
}

function bloquearInputs(){

    iptRazaoSocial.disabled = true;
    iptNomeFantasia.disabled = true;
    iptCnpj.disabled = true;
    iptEmail.disabled = true;
    iptCep.disabled = true;
    iptComplemento.disabled = true;
    iptNumero.disabled = true;

}

function liberarInputs(){

    iptRazaoSocial.disabled = false;
    iptNomeFantasia.disabled = false;
    iptCnpj.disabled = false;
    iptEmail.disabled = false;
    iptCep.disabled = false;
    iptComplemento.disabled = false;
    iptNumero.disabled = false;
}

function toggleEdicao(botao){

    if(!editando) {
        liberarInputs();
        botao.innerHTML = "Salvar";
        editando = true;
    
    } else {
        atualizarDados();
        bloquearInputs();
        botao.innerHTML = "Atualizar";
        editando = false;
    }
}

function limparSessao(){

    sessionStorage.clear();

    window.location = "../login.html";
}