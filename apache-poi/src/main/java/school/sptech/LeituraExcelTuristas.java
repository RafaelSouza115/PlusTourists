package school.sptech;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class LeituraExcelTuristas {
    public List<ListaDeDados> extrairRegistroTuristas(String nomeArquivo) {
        List<ListaDeDados> turistasExtraidos = new ArrayList<>();
        DataFormatter df = new DataFormatter();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");

        ConexaoBancoDeDados conexao = new ConexaoBancoDeDados();
        LogsConexaoBancoDeDados log =
                new LogsConexaoBancoDeDados(conexao.getJdbcTemplate());

        log.inserirLogs(
                LocalDateTime.now(),
                "INICIADO",
                "INFO",
                "ABRIR_ARQUIVO",
                "turista",
                "Iniciando leitura do arquivo " + nomeArquivo
        );

        try (
                InputStream arquivo = new FileInputStream(nomeArquivo);
                Workbook workbook = new XSSFWorkbook(arquivo)
        ) {

            System.out.printf("Iniciando leitura do arquivo %s%n", nomeArquivo);

            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                try {
                    if (row.getRowNum() == 0) {
                        printarCabecalho(row);
                        continue;
                    }

                    // Validação de segurança: se a linha estiver totalmente vazia, pula
                    if (row.getCell(1) == null && row.getCell(3) == null) continue;

                    System.out.println("Lendo linha " + row.getRowNum());

                    // --- Campos de Texto com Tratamento de Célula Vazia e Truncamento --
                    String viaAcesso = extrairTextoSeguro(row.getCell(0), df, 50);
                    String UF = extrairTextoSeguro(row.getCell(1),df, 50);
                    String pais = extrairTextoSeguro(row.getCell(2),df, 50);
                    String mes = extrairTextoSeguro(row.getCell(3),df, 50);
                    String ano = extrairTextoSeguro(row.getCell(4),df, 50);
                    String chegadas = extrairTextoSeguro(row.getCell(5),df, 50);
                    ListaDeDados turistas = new ListaDeDados(
                            viaAcesso,
                            UF,
                            pais,
                            mes,
                            ano,
                            chegadas);
                    turistasExtraidos.add(turistas);

                } catch (Exception e) {

                    log.inserirLogs(
                            LocalDateTime.now(),
                            "ERRO",
                            "ERRO",
                            "ERRO_LINHA",
                            "turista",
                            "Erro na linha " + row.getRowNum() + ": " + e.getMessage()
                    );
                }
            }

            System.out.println("-".repeat(20));
            System.out.println("Leitura finalizada! Total de registros: " + turistasExtraidos.size());
            System.out.println("-".repeat(20));

            log.inserirLogs(
                    LocalDateTime.now(),
                    "SUCESSO",
                    "INFO",
                    "LEITURA_FINALIZADA",
                    "turista",
                    "Total de registros lidos: " + turistasExtraidos.size()
            );

        } catch (IOException e) {
            System.err.println("Erro ao abrir o arquivo: " + e.getMessage());

            log.inserirLogs(
                    LocalDateTime.now(),
                    "ERRO",
                    "ERRO",
                    "FALHA_LEITURA",
                    "turista",
                    e.getMessage()
            );

        } catch (Exception e) {
            System.err.println("Erro inesperado: " + e.getMessage());
            e.printStackTrace();

            log.inserirLogs(
                    LocalDateTime.now(),
                    "ERRO",
                    "ERRO",
                    "ERRO_GERAL",
                    "turista",
                    e.getMessage()
            );
        }

        return turistasExtraidos;
    }

    private String extrairTextoSeguro(Cell cell, DataFormatter df, int limite) {
        // 1. Primeiro, vemos se a célula existe
        if (cell == null || cell.getCellType() == CellType.BLANK) {
            return "";
        }

        // 2. Pegamos o texto que está lá dentro
        String valor = df.formatCellValue(cell).trim();

        // 3. AQUI ENTRA A TESOURA!
        // Se o nome for maior que o tamanho da caixa (limite)...
        if (valor.length() > limite) {
            // A gente corta o papel para ele caber na caixa!
            // O substring(0, limite) pega só as primeiras letrinhas que cabem.
            return valor.substring(0, limite);
        }

        // 4. Se for pequeno e couber, retornamos ele inteiro
        return valor;
    }

    private void printarCabecalho(Row row) {
        DataFormatter df = new DataFormatter();
        System.out.println("Lendo cabeçalho...");
        for (int i = 0; i < 5; i++) {
            System.out.print("[" + df.formatCellValue(row.getCell(i)) + "] ");
        }
        System.out.println();
    }

}
