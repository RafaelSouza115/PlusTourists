package school.sptech;

public class App {

    public static void main(String[] args) {
        String razaoSocial = args[0];
        String email = args[1];
        String codigoAtivacao = args[2];

        CadastroService.cadastrarUsuario(razaoSocial, email, codigoAtivacao);

    }
}
