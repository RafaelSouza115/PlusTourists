package school.sptech;

import com.github.javafaker.Faker;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class LogsErro {
    public static void main(String[] args) {

        Faker faker = new Faker();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        System.out.println("FALHAS E ERROS");

        for (int i = 0; i < 5; i++) {
            String dataHora = LocalDateTime.now().format(formatter);

            if (i % 2 == 0) {
                String emailTentativa = faker.internet().emailAddress();
                System.err.printf("[%s] STATUS: 401 | NIVEL: ERROR | ACAO: LOGIN | TABELA: funcionario " +
                                "| MSG: Falha na autenticação para o email [%s] |  %n",
                        dataHora, emailTentativa);
            } else {
                int idCidadeInexistente = faker.number().numberBetween(999, 9999);
                System.err.printf("[%s] STATUS: 500 | NIVEL: CRITICAL | ACAO: INSERT | TABELA: registro_turismo " +
                                "| MSG: Violação de FK (id_cidade %d não encontrado) %n",
                        dataHora, idCidadeInexistente);
            } 
        }
    }
}

