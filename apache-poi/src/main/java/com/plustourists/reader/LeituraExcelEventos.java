package com.plustourists.reader;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.plustourists.model.ListaDeDados;
import com.plustourists.repository.ConexaoBancoDeDados;
import com.plustourists.log.LogsConexaoBancoDeDados;

import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

public class LeituraExcelEventos {

    public List<ListaDeDados> extrairRegistroEvento(InputStream inputStream) {
        List<ListaDeDados> eventosExtraidos = new ArrayList<>();
        DataFormatter df = new DataFormatter();
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy");
        ConexaoBancoDeDados conexao = new ConexaoBancoDeDados();
        LogsConexaoBancoDeDados log = new LogsConexaoBancoDeDados(conexao.getJdbcTemplate());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");


        log.inserirLogs(
                LocalDateTime.now(),
                "INICIADO",
                "INFO",
                "ABRIR_ARQUIVO",
                "evento",
                "Iniciando leitura do arquivo " + inputStream);

        try (
                InputStream is = inputStream;
                Workbook workbook = new XSSFWorkbook(inputStream)
        ) {
            System.out.println("-".repeat(180));
            System.out.println("Iniciando leitura do arquivo de eventos...");
            System.out.println("-".repeat(180));

            System.out.println(
                    "[" + LocalDateTime.now().format(formatter) + "]" +
                            " | Status: INICIADO" +
                            " | Nível: INFO" +
                            " | Ação: ABRIR_ARQUIVO" +
                            " | Tabela: evento" +
                            " | Mensagem: Iniciando leitura do arquivo: "
            );

            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                try {
                    if (row.getRowNum() == 0) {
                        printarCabecalho(row);
                        continue;
                    }// Validação de segurança: se a linha estiver totalmente vazia, pula
                    if (row.getCell(1) == null && row.getCell(3) == null) continue;
                    if (row.getRowNum() % 500 == 0) {
                        System.out.println(
                                "[" + LocalDateTime.now().format(formatter) + "]" +
                                        " | Status: PROCESSANDO" +
                                        " | Nível: INFO" +
                                        " | Ação: LEITURA_LOTE" +
                                        " | Tabela: evento" +
                                        " | Mensagem: " + row.getRowNum() + " linhas processadas"
                        );
                    }
                    // --- Campos de Texto com Tratamento de Célula Vazia e Truncamento ---
                    String municipio = extrairTextoSeguro(row.getCell(1), df, 100);
                    String regiaoTuristica = extrairTextoSeguro(row.getCell(2), df, 100);
                    String nomeDoEvento = extrairTextoSeguro(row.getCell(3), df, 150);
                    String descricaoDoEvento = extrairTextoSeguro(row.getCell(4), df, 5000); // Texto longo
                    String enderecoDoEvento = extrairTextoSeguro(row.getCell(6), df, 255);
                    String mesDeRealizacaoDoEvento = extrairTextoSeguro(row.getCell(8), df, 45);

                    // --- Datas ---
                    Date dataInicialDoEvento = extrairData(row.getCell(9), sdf);
                    Date dataFinalDoEvento = extrairData(row.getCell(10), sdf);

                    // --- Horários ---
                    LocalDateTime horarioInicioEvento = extrairLocalDateTime(row.getCell(11));
                    LocalDateTime horarioFinalevento = extrairLocalDateTime(row.getCell(12));

                    // --- Outros Campos ---
                    String tipoDeEvento = extrairTextoSeguro(row.getCell(13), df, 100);
                    String tipoDePublico = extrairTextoSeguro(row.getCell(17), df, 100);
                    String publicoEsperado = extrairTextoSeguro(row.getCell(18), df, 45);
                    String edicao2025 = extrairTextoSeguro(row.getCell(19), df, 45);
                    String edicao2024 = extrairTextoSeguro(row.getCell(20), df, 45);

                    // Responsável (Onde estava dando erro de tamanho)
                    String responsavelPelaOrganizacao = extrairTextoSeguro(row.getCell(22), df, 10);

                    String siteDoIngresso = extrairTextoSeguro(row.getCell(23), df, 500);
                    String classificacaoEtaria = extrairTextoSeguro(row.getCell(28), df, 100);

                    ListaDeDados evento = new ListaDeDados(
                            municipio, regiaoTuristica, nomeDoEvento, descricaoDoEvento,
                            enderecoDoEvento, mesDeRealizacaoDoEvento, dataInicialDoEvento,
                            dataFinalDoEvento, horarioInicioEvento, horarioFinalevento,
                            tipoDeEvento, tipoDePublico, edicao2025, edicao2024,
                            publicoEsperado, responsavelPelaOrganizacao, siteDoIngresso,
                            classificacaoEtaria
                    );

                    eventosExtraidos.add(evento);

                } catch (Exception e) {

                    log.inserirLogs(
                            LocalDateTime.now(),
                            "ERRO",
                            "ERRO",
                            "ERRO_LINHA",
                            "evento",
                            "Erro na linha " + row.getRowNum() + ": " + e.getMessage()
                    );
                }
            }

            System.out.println(
                    "[" + LocalDateTime.now().format(formatter) + "]" +
                            " | Status: SUCESSO" +
                            " | Nível: INFO" +
                            " | Ação: LEITURA_FINALIZADA" +
                            " | Tabela: evento" +
                            " | Mensagem: Total de registros lidos: " + eventosExtraidos.size()
            );

            System.out.println("\u001B[32mLeitura finalizada!\u001B[0m");
            System.out.println("-".repeat(180));

            log.inserirLogs(
                    LocalDateTime.now(),
                    "SUCESSO",
                    "INFO",
                    "LEITURA_FINALIZADA",
                    "evento",
                    "Total de registros lidos: " + eventosExtraidos.size()
            );
        } catch (IOException e) {
            System.err.println("Erro ao abrir o arquivo: " + e.getMessage());

            log.inserirLogs(
                    LocalDateTime.now(),
                    "ERRO",
                    "ERRO",
                    "FALHA_LEITURA",
                    "evento",
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
                    "evento",
                    e.getMessage()
            );
        }

        return eventosExtraidos;
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

    private Date extrairData(Cell cell, SimpleDateFormat sdf) {
        if (cell == null || cell.getCellType() == CellType.BLANK) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return cell.getDateCellValue();
            } else if (cell.getCellType() == CellType.STRING) {
                return sdf.parse(cell.getStringCellValue());
            }
        } catch (Exception e) {
            System.err.println("Erro na data - Coluna: " + cell.getColumnIndex());
        }
        return null;
    }

    private LocalDateTime extrairLocalDateTime(Cell cell) {
        if (cell == null || cell.getCellType() == CellType.BLANK) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC) {
                return cell.getLocalDateTimeCellValue();
            }
        } catch (Exception e) {
            // Horários as vezes falham se o formato no Excel for inconsistente
        }
        return null;
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
                        " | Tabela: evento" +
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