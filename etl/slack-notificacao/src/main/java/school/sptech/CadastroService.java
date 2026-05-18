package school.sptech;

import org.json.JSONObject;

import java.io.IOException;
import java.util.Random;

public class CadastroService {

    public static void cadastrarUsuario(String razaoSocial, String email, String codigo) {

        String mensagem = "Olá empresa "+ razaoSocial + "\nSeu código de verificação é: " + codigo;

        EmailService.enviarEmail(email, "Código de Verificação", mensagem);

        JSONObject json = new JSONObject();
        json.put("text", "Novo cadastro!\nEmail: " + email + "\nCódigo: " + codigo);

        try {
            Slack.enviarMensagem(json);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
