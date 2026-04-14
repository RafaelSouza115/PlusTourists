package school.sptech;

import com.github.javafaker.Faker;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class LogsAcesso {
    public static void main(String[] args) {

        Faker faker = new Faker();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        String empresa = faker.company().name();

        System.out.println("MONITORAMENTO DE ACESSOS");

        for (int i = 0; i < 5; i++) {

            String nomeFuncionario = faker.name().fullName();
            String emailFuncionario = faker.internet().emailAddress();
            String dataHoraFormatada = LocalDateTime.now().format(formatter);
            String pagina = faker.app().name();


            String mensagem = "DATA: [%s] | FUNCIONARIO: %s | EMAIL: %s " +
                    "| EMPRESA: %s, PÁGINA: %s";

            System.out.println(mensagem.formatted(dataHoraFormatada, nomeFuncionario,
                    emailFuncionario, empresa, pagina));
        }
    }
}
