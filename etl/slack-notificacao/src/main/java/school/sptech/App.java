package school.sptech;

public class App {

    public static void main(String[] args) {
        String razaoSocial = "Igor";
        String email = "igor.reis@sptech.school";
        String codigoAtivacao = "1234565";

        CadastroService.cadastrarUsuario(razaoSocial, email, codigoAtivacao);

    }
}
