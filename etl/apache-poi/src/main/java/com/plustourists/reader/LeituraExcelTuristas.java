package com.plustourists.reader;

import com.plustourists.model.NotificacaoErroService;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.plustourists.model.ListaDeDados;
import com.plustourists.repository.ConexaoBancoDeDados;
import com.plustourists.log.LogsConexaoBancoDeDados;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class LeituraExcelTuristas {
    public List<ListaDeDados> extrairRegistroTuristas(InputStream inputStream) {
        List<ListaDeDados> turistasExtraidos = new ArrayList<>();
        DataFormatter df = new DataFormatter();

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

       ConexaoBancoDeDados conexao = new ConexaoBancoDeDados();
        LogsConexaoBancoDeDados log =
                new LogsConexaoBancoDeDados(conexao.getJdbcTemplate());

        log.inserirLogs(
                LocalDateTime.now(),
                "INICIADO",
                "INFO",
                "ABRIR_ARQUIVO",
                "registro_turismo",
                "Iniciando leitura do arquivo "
        );

        try (
                Workbook workbook = new XSSFWorkbook(inputStream)
        ) {

            System.out.println("Iniciando leitura do arquivo de turistas...");
            System.out.println("-".repeat(180));

            System.out.println(
                    "[" + LocalDateTime.now().format(formatter) + "]" +
                            " | Status: INICIADO" +
                            " | Nível: INFO" +
                            " | Ação: ABRIR_ARQUIVO" +
                            " | Tabela: registro_turismo" +
                            " | Mensagem: Iniciando leitura do arquivo: "
            );

            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                try {
                    if (row.getRowNum() == 0) {
                        printarCabecalho(row);
                        continue;
                    }

                    // Validação de segurança: se a linha estiver totalmente vazia, pula
                    if (row.getCell(1) == null && row.getCell(3) == null) continue;
                    if (row.getRowNum() % 500 == 0) {
                        System.out.println(
                                "[" + LocalDateTime.now().format(formatter) + "]" +
                                        " | Status: PROCESSANDO" +
                                        " | Nível: INFO" +
                                        " | Ação: LEITURA_LOTE" +
                                        " | Tabela: registro_turismo" +
                                        " | Mensagem: " + row.getRowNum() + " linhas processadas"
                        );
                    }

                    // --- Campos de Texto com Tratamento de Célula Vazia e Truncamento --
                    String viaAcesso = extrairTextoSeguro(row.getCell(0), df, 50);
                    String UF = extrairTextoSeguro(row.getCell(1), df, 50);
                    String pais = extrairTextoSeguro(row.getCell(2), df, 50);
                    String mes = extrairTextoSeguro(row.getCell(3), df, 50);
                    String ano = extrairTextoSeguro(row.getCell(4), df, 50);
                    String chegadas = extrairTextoSeguro(row.getCell(5), df, 50);
                    ListaDeDados turistas = new ListaDeDados(
                            viaAcesso,
                            UF,
                            pais,
                            mes,
                            ano,
                            chegadas);
                    turistasExtraidos.add(turistas);

                } catch (Exception e) {
                    NotificacaoErroService erro = new NotificacaoErroService(
                            LocalDateTime.now(),
                            "ERRO",
                            "Erro na linha " + row.getRowNum() + ": " + e.getMessage(),
                            "registro_turismo");
                    erro.notificar();
                    log.inserirLogs(
                            LocalDateTime.now(),
                            "ERRO",
                            "ERRO",
                            "ERRO_LINHA",
                            "registro_turismo",
                            "Erro na linha " + row.getRowNum() + ": " + e.getMessage()
                    );
                }
            }

            System.out.println(
                    "[" + LocalDateTime.now().format(formatter) + "]" +
                            " | Status: SUCESSO" +
                            " | Nível: INFO" +
                            " | Ação: LEITURA_FINALIZADA" +
                            " | Tabela: registro_turismo" +
                            " | Mensagem: Total de registros lidos: " + turistasExtraidos.size()
            );


            System.out.println("\u001B[32mLeitura finalizada!\u001B[0m");
            System.out.println("-".repeat(120));

            log.inserirLogs(
                    LocalDateTime.now(),
                    "SUCESSO",
                    "INFO",
                    "LEITURA_FINALIZADA",
                    "registro_turismo",
                    "Total de registros lidos: " + turistasExtraidos.size()
            );

        } catch (IOException e) {
            System.err.println("Erro ao abrir o arquivo: " + e.getMessage());
            NotificacaoErroService erro = new NotificacaoErroService(
                    LocalDateTime.now(),
                    "ERRO",
                    e.getMessage(),
                    "registro_turismo");
            erro.notificar();
            log.inserirLogs(
                    LocalDateTime.now(),
                    "ERRO",
                    "ERRO",
                    "FALHA_LEITURA",
                    "registro_turismo",
                    e.getMessage()
            );

        } catch (Exception e) {
            System.err.println("Erro inesperado: " + e.getMessage());
            e.printStackTrace();
            NotificacaoErroService erro = new NotificacaoErroService(
                    LocalDateTime.now(),
                    "ERRO",
                    e.getMessage(),
                    "registro_turismo");
            erro.notificar();
            log.inserirLogs(
                    LocalDateTime.now(),
                    "ERRO",
                    "ERRO",
                    "ERRO_GERAL",
                    "registro_turismo",
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

        // Se o nome for maior que o tamanho da caixa (limite)...
        if (valor.length() > limite) {
            // O substring(0, limite) pega só as primeiras letrinhas que cabem.
            return valor.substring(0, limite);
        }

        // 4. Se for pequeno e couber, retornamos ele inteiro
        return valor;
    }

    private void printarCabecalho(Row row) {
        DataFormatter df = new DataFormatter();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        int totalColunas = 5;

        System.out.print(
                "[" + LocalDateTime.now().format(formatter) + "]" +
                        " | Status: PROCESSANDO" +
                        " | Nível: DEBUG" +
                        " | Ação: MAPEAMENTO" +
                        " | Tabela: registro_turismo" +
                        " | Mensagem: " + totalColunas +
                        " colunas detectadas: "
        );

        for (int i = 0; i < totalColunas; i++) {
            System.out.print(df.formatCellValue(row.getCell(i)));

            if (i < totalColunas - 1) {
                System.out.print(" | ");
            }
        }

        System.out.println();
    }

}
