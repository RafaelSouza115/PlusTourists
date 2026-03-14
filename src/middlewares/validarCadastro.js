/**
 * Middlewares de validação para cadastro de empresa e funcionário.
 * Retornam 400 com mensagem em caso de erro; chamam next() quando válido.
 * Sem regex: lógica explícita com loops; empresa_ligada validada via FOREIGN KEY (consulta ao banco).
 */

var database = require("../database/config");

// --- Helpers sem regex ---

function apenasNumeros(str) {
    var s = String(str);
    var resultado = "";
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        if (c >= "0" && c <= "9") resultado += c;
    }
    return resultado;
}

function emailValido(email) {
    var s = String(email).trim();
    if (s.length < 5) return false;
    var idxArroba = -1;
    for (var i = 0; i < s.length; i++) {
        if (s.charAt(i) === "@") {
            if (idxArroba !== -1) return false;
            idxArroba = i;
        }
    }
    if (idxArroba < 1 || idxArroba >= s.length - 1) return false;
    var parteDepois = s.substring(idxArroba + 1);
    var temPonto = false;
    for (var j = 0; j < parteDepois.length; j++) {
        if (parteDepois.charAt(j) === ".") {
            temPonto = true;
            break;
        }
    }
    return temPonto;
}

function senhaForte(senha) {
    if (!senha || typeof senha !== "string") return false;
    if (senha.length < 8) return false;
    var temNumero = false;
    var temMaiuscula = false;
    var temMinuscula = false;
    var temEspecial = false;
    for (var i = 0; i < senha.length; i++) {
        var c = senha.charAt(i);
        if (c >= "0" && c <= "9") temNumero = true;
        else if (c >= "A" && c <= "Z") temMaiuscula = true;
        else if (c >= "a" && c <= "z") temMinuscula = true;
        else temEspecial = true;
    }
    return temNumero && temMaiuscula && temMinuscula && temEspecial;
}

// --- Empresa ---

function validarCadastroEmpresa(req, res, next) {
    var nomeFantasia = req.body.nome_fantasia;
    var cnpj = req.body.cnpj;

    if (!nomeFantasia || String(nomeFantasia).trim() === "") {
        return res.status(400).json({
            mensagem: "Campo nome_fantasia é obrigatório."
        });
    }
3

    if (!cnpj || String(cnpj).trim() === "") {
        return res.status(400).json({
            mensagem: "Campo CNPJ é obrigatório."
        });
    }

    var apenasNumerosCnpj = apenasNumeros(cnpj);
    if (apenasNumerosCnpj.length !== 14) {
        return res.status(400).json({
            mensagem: "CNPJ deve conter apenas números e ter exatamente 14 dígitos."
        });
    }

    req.body.cnpj = apenasNumerosCnpj;
    next();
}

// --- Funcionário ---

function validarCadastroFuncionario(req, res, next) {
    var nome = req.body.nome;
    var cpf = req.body.cpf;
    var email = req.body.email;
    var senha = req.body.senha;
    var empresaLigada = req.body.empresa_ligada;

    if (!nome || String(nome).trim() === "") {
        return res.status(400).json({
            mensagem: "Campo nome é obrigatório."
        });
    }

    if (!cpf || String(cpf).trim() === "") {
        return res.status(400).json({
            mensagem: "Campo CPF é obrigatório."
        });
    }

    var apenasNumerosCpf = apenasNumeros(cpf);
    if (apenasNumerosCpf.length !== 11) {
        return res.status(400).json({
            mensagem: "CPF deve conter apenas números e ter exatamente 11 dígitos."
        });
    }
    req.body.cpf = apenasNumerosCpf;

    if (!email || String(email).trim() === "") {
        return res.status(400).json({
            mensagem: "Campo email é obrigatório."
        });
    }
    if (!emailValido(email)) {
        return res.status(400).json({
            mensagem: "Email inválido."
        });
    }

    if (!senhaForte(senha)) {
        return res.status(400).json({
            mensagem: "Senha deve ter no mínimo 8 caracteres, 1 número, 1 letra maiúscula, 1 letra minúscula e 1 caractere especial."
        });
    }

    if (empresaLigada === undefined || empresaLigada === null || empresaLigada === "") {
        return res.status(400).json({
            mensagem: "Campo empresa_ligada é obrigatório."
        });
    }
    var idEmpresa = parseInt(empresaLigada, 10);
    if (Number.isNaN(idEmpresa) || idEmpresa < 1) {
        return res.status(400).json({
            mensagem: "empresa_ligada deve ser um ID de empresa válido."
        });
    }

    // Validação FOREIGN KEY: verificar se a empresa existe no banco
    database.execute("SELECT id_empresa FROM empresa WHERE id_empresa = ?", [idEmpresa])
        .then(function (rows) {
            if (rows.length === 0) {
                return res.status(400).json({
                    mensagem: "empresa_ligada não existe na base (foreign key inválida)."
                });
            }
            req.body.empresa_ligada = idEmpresa;
            next();
        })
        .catch(function (erro) {
            console.error("Erro ao validar empresa_ligada:", erro);
            res.status(500).json({
                mensagem: "Erro ao validar vínculo com empresa."
            });
        });
}

module.exports = {
    validarCadastroEmpresa,
    validarCadastroFuncionario
};
