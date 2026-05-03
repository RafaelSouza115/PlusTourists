package com.plustourists;

import com.plustourists.repository.ConexaoBancoDeDados;
import com.plustourists.log.LogsConexaoBancoDeDados;
import com.plustourists.service.*;
import com.plustourists.model.ListaDeDados;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class Main {

    public static void main(String[] args) {

        ConexaoBancoDeDados conexao = new ConexaoBancoDeDados();
        LogsConexaoBancoDeDados log = new LogsConexaoBancoDeDados(conexao.getJdbcTemplate());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        S3Service s3Service = new S3Service();
        ExcelService excelService = new ExcelService();
        TuristaService turistaService = new TuristaService(conexao, log);
        EventoService eventoService = new EventoService(conexao, log);

        log.inserirLogs(
                LocalDateTime.now(),
                "INICIADO",
                "INFO",
                "INICIO_CARGA",
                "geral",
                "Processo geral iniciado"
        );

        System.out.println("=".repeat(120));
        System.out.println(" INICIANDO PROCESSO...");
        System.out.println("=".repeat(120));

        try {

            // 1. GARANTIR BUCKET
            s3Service.criarBucket();

            // 2. LISTAR ARQUIVOS (debug)
            System.out.println("\n Arquivos no bucket:");
            s3Service.listarArquivos()
                    .forEach(obj -> System.out.println(" - " + obj.key()));

            // 3. BAIXAR + PROCESSAR
            try (
                    InputStream eventosStream = s3Service.baixarArquivo("Excel-unificacao.xlsx");
                    InputStream turistasStream = s3Service.baixarArquivo("chegadas-2025.xlsx");
            ) {

                if (eventosStream == null || turistasStream == null) {
                    throw new RuntimeException("Erro ao baixar arquivos do S3");
                }

                // LER EXCEL
                List<ListaDeDados> eventos = excelService.lerEventos(eventosStream);
                List<ListaDeDados> turistas = excelService.lerTuristas(turistasStream);

                System.out.println(" Arquivos lidos com sucesso!");
                System.out.println("Eventos: " + eventos.size());
                System.out.println("Turistas: " + turistas.size());

                // PROCESSAR
                turistaService.processar(turistas);
                eventoService.processar(eventos);
            }

            log.inserirLogs(
                    LocalDateTime.now(),
                    "SUCESSO",
                    "INFO",
                    "PROCESSO_FINALIZADO",
                    "geral",
                    "Carga finalizada com sucesso"
            );

            System.out.println("\n PROCESSO FINALIZADO COM SUCESSO!");

        } catch (Exception e) {

            log.inserirLogs(
                    LocalDateTime.now(),
                    "ERRO",
                    "ERROR",
                    "PROCESSO_FALHOU",
                    "geral",
                    e.getMessage()
            );

            System.err.println("\n ERRO NO PROCESSO:");
            e.printStackTrace();
        }

        System.out.println("=".repeat(120));
    }
}