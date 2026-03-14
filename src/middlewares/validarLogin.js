/**
 * Middlewares de validação para login.
 * Retornam 400 com mensagem em caso de erro; chamam next() quando válido.
 * Sem regex: lógica explícita para formato de email.
 */

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

function validarLogin(req, res, next) {
    var email = req.body.email;
    var senha = req.body.senha;

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

    if (!senha || String(senha).trim() === "") {
        return res.status(400).json({
            mensagem: "Campo senha é obrigatório."
        });
    }

    next();
}

module.exports = {
    validarLogin
};
