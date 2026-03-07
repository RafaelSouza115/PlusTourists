import com.github.javafaker.Faker;

import java.time.LocalDateTime;

public class log {
    public static void main(String[] args) {

        Faker faker = new Faker();
        String empresa = faker.company().name();

        for(int i = 0; i < 5; i++){

            String usuario = faker.name().username();
            String pagina = faker.app().name();

            System.out.println("Usuario = " + usuario +
                    " | Acao = ACESSO | SistemaDaAplicacao = " + pagina +
                    " | Hora = " + LocalDateTime.now() +
                    " | EmpresaAssociada = " + empresa);
        }
    }
}
