var razaoSocial = '';
var nomeFantasia = '';
var cnpj = '';
var email = '';
var cep = '';
var complemento = '';
var numero = '';

function empresa() {
    buttons.innerHTML = '<button class="destaque" id="btnEmpresa" onclick="empresa()"><p>Dados da Empresa</p></button><button id="btnEndereco" onclick="endereco()"><p>Endereço</p></button>';
    title.innerHTML = 'Dados da Empresa';
    inp.innerHTML = '<div class="iptOpt"><p>Razão Social</p><input type="text" id="iptRazaoSocial" placeholder="Ex: PlusTourists LTDA"></div><div class="iptOpt"><p>Nome Fantasia</p><input type="text" id="iptNomeFantasia" placeholder="Ex: PlusTourists"></div><div class="iptOpt"><p>CNPJ</p><input type="text" id="iptCnpj" placeholder="00.000.000/0000-000" maxlength="14"></div><div class="iptOpt"><p>E-mail responsável</p><input type="text" id="iptEmail" placeholder="contato@empresa.com.br"></div>';
    iptRazaoSocial.value = razaoSocial;
    iptNomeFantasia.value = nomeFantasia;
    iptCnpj.value = cnpj
    iptEmail.value = email;
    cep = iptCep.value;
    complemento = iptComplemento.value;
    numero = iptNumero.value;
}

function endereco() {
    buttons.innerHTML = '<button id="btnEmpresa" onclick="empresa()"><p>Dados da Empresa</p></button><button class="destaque" id="btnEndereco" onclick="endereco()"><p>Endereço</p></button>';
    title.innerHTML = 'Endereço';
    inp.innerHTML = '<div class="iptOpt"><p>CEP</p><input type="text" id="iptCep" placeholder="00000-000" maxlength="8"></div><div class="iptOpt"><p>complemento</p><input type="text" id="iptComplemento" placeholder="Sala 01"></div><div class="iptOpt"><p>Número</p><input type="text" id="iptNumero" placeholder="10" maxlength="6"></div>';
    iptCep.value = cep;
    iptComplemento.value = complemento;
    iptNumero.value = numero;
    razaoSocial = iptRazaoSocial.value;
    nomeFantasia = iptNomeFantasia.value;
    cnpj = iptCnpj.value;
    email = iptEmail.value;
}