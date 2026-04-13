package school.sptech;

import com.github.javafaker.Faker;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class LogsLeituraECarga {
    public static void main(String[] args) {
        Faker faker = new Faker(new Locale("pt-BR"));
        DateTimeFormatter formatador = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        String tabelaDestino = "registro_chegadas_turismo";

        System.out.println("LOGS DE EXTRAÇÃO: BASE DE DADOS - TURISMO 2025");

        for (int i = 1; i <= 10; i++) {
            String dataHora = LocalDateTime.now().format(formatador);

            if (i == 1) {
                imprimirLog(dataHora, "INICIADO", "INFO", "ABRIR_ARQUIVO", tabelaDestino,
                        "Iniciando leitura do arquivo: base_dados_2025.xlsx");
            }
            else if (i == 2) {
                imprimirLog(dataHora, "PROCESSANDO", "DEBUG", "MAPEAMENTO", tabelaDestino,
                        "Colunas detectadas: Via_de_acesso, UF, nome_pais_correto, mes, ano, Chegadas.");
            }
            else if (i == 3) {
                imprimirLog(dataHora, "ERRO", "ERRO", "VALIDAR_UF", tabelaDestino,
                        "Linha " + i + ": UF inválida encontrada ('" + faker.address().stateAbbr() + "X').");
            }
            else if (i == 4) {
                imprimirLog(dataHora, "SUCESSO", "DEBUG", "LEITURA_PAIS", tabelaDestino,
                        "País verificado: " + faker.address().country() + ".");
            }
            else if (i == 5) {
                imprimirLog(dataHora, "ALERTA", "AVISO", "VALIDAR_ANO", tabelaDestino,
                        "Ano divergente encontrado: '2024'. A base atual é exclusiva de 2025.");
            }
            else if (i == 6) {
                imprimirLog(dataHora, "ERRO", "ERRO", "TIPO_DADO", tabelaDestino,
                        "Coluna 'Chegadas': Esperado mas encontrado '" + faker.commerce().material() + "'.");
            }
            else if (i == 7) {
                imprimirLog(dataHora, "SUCESSO", "INFO", "VIA_ACESSO", tabelaDestino,
                        "Via de acesso identificada: Aérea.");
            }
            else if (i == 8) {
                imprimirLog(dataHora, "ERRO", "ERRO", "VALIDAR_MES", tabelaDestino,
                        "Mês inválido na linha " + i + ": 'Dezembroo' (Erro de digitação).");
            }
            else if (i == 9) {
                imprimirLog(dataHora, "PROCESSANDO", "DEBUG", "PROGRESSO", tabelaDestino,
                        "Lendo lote de dados de 2025: " + faker.number().numberBetween(100, 500) + " registros processados.");
            }
            else {
                imprimirLog(dataHora, "FINALIZADO", "INFO", "FECHAR_RECURSO", tabelaDestino,
                        "Processamento da base 2025 concluído com sucesso.");
            }
        }
    }
        static void imprimirLog(String data, String status, String nivel, String acao, String tabela, String msg) {
        System.out.printf("%s | %s | %s | %s | %s | %s%n",
                data, status, nivel, acao, tabela, msg);
    }
}
