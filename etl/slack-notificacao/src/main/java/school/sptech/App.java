package school.sptech;

public class App {

    public static void main(String[] args) {
        if (args.length < 3) {
            System.out.println("Erro ao receber argumentos " + args.length);
            throw new IndexOutOfBoundsException("Erro ao receber argumentos");
        }
        String razaoSocial = args[0];
        String email = args[1];
        String codigoAtivacao = args[2];
        CadastroService.cadastrarUsuario(razaoSocial, email, codigoAtivacao);
    }
}