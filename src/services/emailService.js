const { exec } = require('child_process');
const path = require('path');


function enviarCodigo(razaoSocial, email, codigoAtivacao) {
    return new Promise((resolve, reject) => {
        const caminhoJar = path.join(
            __dirname, '../../etl/slack-notificacao/target/slack-notificacao-1.0-SNAPSHOT.jar'
        );
        exec(
            `java -jar "${caminhoJar}" ${razaoSocial} ${email} ${codigoAtivacao}`,
            (erro, stdout, stderr) => {
                if (erro) {
                    reject(erro);
                    return;
                }
                resolve(stdout);

            }
        );
    });

}
module.exports = {
    enviarCodigo
};