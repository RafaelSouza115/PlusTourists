
function mostrarAba(tipo) {

    formEmpresa.style.display = "none";
    formEndereco.style.display = "none";

    document.getElementById(tipo).style.display = "block";

    btnEmpresa.classList.remove("destaque");
    btnEndereco.classList.remove("destaque");

    if (tipo == "formEmpresa") {

        btnEmpresa.classList.add("destaque");

        tituloOverview.innerHTML = "Dados da empresa";

        subtituloOverview.innerHTML ="Mantenha as informações da empresa sempre atualizadas.";

        iconeOverview.className = "fi fi-rr-building icon-perfil";

    } else {

        btnEndereco.classList.add("destaque");

        tituloOverview.innerHTML = "Endereço";

        subtituloOverview.innerHTML ="Mantenha essas informações atualizadas para contato e identificação do seu negócio.";
        
        iconeOverview.className = "fi fi-rr-marker icon-perfil";

    }
}

window.addEventListener("load", buscarDados);

function buscarDados() {
    var idEmpresa = sessionStorage.ID_EMPRESA;

    
    fetch(`/empresas/buscar/${idEmpresa}`)
    .then(res => res.json())
    .then(dados => {

        var empresa = dados[0];
        
        sidebar_nome.innerHTML = empresa.nomeFantasia;
        sidebar_email.innerHTML = empresa.email;

        iptRazaoSocial.value = empresa.razaoSocial;
        iptNomeFantasia.value = empresa.nomeFantasia;
        iptCnpj.value = formatarCNPJ(empresa.cnpj);
        iptEmail.value = empresa.email;
        iptCep.value = formatarCEP(empresa.cep);
        iptComplemento.value = empresa.complemento;
        iptNumero.value = empresa.numero;

        bloquearInputs();
    });

}

function limparErros() {
    erro_razaoSocial.style.display = "none";
    erro_razaoSocial.innerHTML = "";

    erro_cnpj.style.display = "none";
    erro_cnpj.innerHTML = "";

    erro_cep.style.display = "none";
    erro_cep.innerHTML = "";

    erro_email.style.display = "none";
    erro_email.innerHTML = "";

    erro_numero.style.display = "none";
    erro_numero.innerHTML = "";
}

function validarCampos() {
    limparErros(); 

    let valido = true;

    let cnpjLimpo = limparNumero(iptCnpj.value);
    let cepLimpo = limparNumero(iptCep.value);
    let email = iptEmail.value.trim();
    let numero = iptNumero.value.trim();

    if (iptRazaoSocial.value.trim() === "") {
        erro_razaoSocial.style.display = "block";
        erro_razaoSocial.innerHTML = "Razão social é obrigatória.";
        valido = false;
    }

    if (cnpjLimpo.length !== 14) {
        erro_cnpj.style.display = "block";
        erro_cnpj.innerHTML = "CNPJ inválido (deve conter 14 dígitos).";
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

    if (cepLimpo.length !== 8) {
        erro_cep.style.display = "block";
        erro_cep.innerHTML = "CEP inválido (deve conter 8 dígitos).";
        valido = false;
    }

    if (numero === "") {
        erro_numero.style.display = "block";
        erro_numero.innerHTML = "O número é obrigatório.";
        valido = false;
    }

    return valido;
}
function atualizarDados(){

    if (!validarCampos()) {
        return; 
    }

    var idEmpresa = sessionStorage.ID_EMPRESA;

   var dados = {

    razaoSocial: iptRazaoSocial.value,
    nomeFantasia: iptNomeFantasia.value,

    cnpj: limparNumero(iptCnpj.value),
    cep: limparNumero(iptCep.value),

    email: iptEmail.value,
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

    bloquearInputs();

    btn_editar.style.display = "block";
    btn_cancelar.style.display = "none";
    btn_salvar.style.display = "none";

    abrirModal(dadosResposta.mensagem);

}else {

    abrirModal(dadosResposta.mensagem);

}
        
    })
    .catch(function(erro){
        console.log("Erro ao atualizar:", erro);
    });
}

function bloquearInputs(){

    iptRazaoSocial.setAttribute("readonly", true);
    iptNomeFantasia.setAttribute("readonly", true);
    iptCnpj.setAttribute("readonly", true);
    iptEmail.setAttribute("readonly", true);
    iptCep.setAttribute("readonly", true);
    iptComplemento.setAttribute("readonly", true);
    iptNumero.setAttribute("readonly", true);

}

function liberarInputs(){

    iptRazaoSocial.removeAttribute("readonly");
    iptNomeFantasia.removeAttribute("readonly");
    iptCnpj.removeAttribute("readonly");
    iptEmail.removeAttribute("readonly");
    iptCep.removeAttribute("readonly");
    iptComplemento.removeAttribute("readonly");
    iptNumero.removeAttribute("readonly");

}

function habilitarEdicao() {

    liberarInputs();

    btn_editar.style.display = "none";
    btn_cancelar.style.display = "inline-flex";
    btn_salvar.style.display = "inline-flex";

}

function cancelarEdicao() {

    limparErros();

    bloquearInputs();
    
    btn_editar.style.display = "block";
    btn_cancelar.style.display = "none";
    btn_salvar.style.display = "none";

    buscarDados();

}

function formatarCNPJ(cnpj) {

    if (!cnpj) return "";

    cnpj = cnpj.toString().replace(/\D/g, '');

    if (cnpj.length !== 14) return cnpj;

    return cnpj.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
    );
}

function formatarCEP(cep) {

    cep = cep.replace(/\D/g, '');

    return cep.replace(
        /(\d{5})(\d{3})/,
        '$1-$2'
    );

}

function limparNumero(valor) {
    return valor.toString().replace(/\D/g, '');
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

function limparSessao(){

    sessionStorage.clear();

    window.location = "../login.html";
}