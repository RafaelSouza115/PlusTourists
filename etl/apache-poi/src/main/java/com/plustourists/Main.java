package com.plustourists;

import com.plustourists.model.NotificacaoErroService;
import com.plustourists.model.NotificacaoSucessoService;
import com.plustourists.repository.ConexaoBancoDeDados;
import com.plustourists.log.LogsConexaoBancoDeDados;
import com.plustourists.service.*;
import com.plustourists.model.ListaDeDados;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;

public class Main {

    public static void main(String[] args) {
        ConexaoBancoDeDados conexao = new ConexaoBancoDeDados();
        LogsConexaoBancoDeDados log = new LogsConexaoBancoDeDados(conexao.getJdbcTemplate());
        if (args.length == 0) {
            throw new IllegalArgumentException("Modo não informado");
        }
        switch (args[0]) {
            case "ETL":
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
                    String arquivoChegada = null;
                    String arquivoEvento = null;
                    if (args[1].contains("chegada")) {
                        arquivoChegada = args[1];
                    }
                    if (args[1].contains("evento")) {
                        arquivoEvento = args[1];
                    }

                    if (arquivoChegada != null) {
                        try (
                                InputStream turistasStream = s3Service.baixarArquivo(arquivoChegada);
                        ) {
                            if (turistasStream == null) {
                                throw new RuntimeException("Arquivo de chegadas não localizado");
                            }

                            // LER EXCEL
                            List<ListaDeDados> turistas = excelService.lerTuristas(turistasStream);

                            System.out.println(" Arquivos lidos com sucesso!");
                            System.out.println("Turistas: " + turistas.size());

                            // PROCESSAR
                            turistaService.processar(turistas);
                            log.inserirLogs(
                                    LocalDateTime.now(),
                                    "SUCESSO",
                                    "INFO",
                                    "PROCESSO_FINALIZADO",
                                    "Geral",
                                    "Carga finalizada com sucesso"
                            );
                        } catch (IOException e) {
                            throw new RuntimeException("Arquivo de chegadas não localizado");
                        }
                    }
                    if (arquivoEvento != null) {
                        try (
                                InputStream eventosStream = s3Service.baixarArquivo(arquivoEvento);
                        ) {
                            if (eventosStream == null) {
                                throw new RuntimeException("Arquivo de eventos não localizado");
                            }

                            // LER EXCEL
                            List<ListaDeDados> eventos = excelService.lerEventos(eventosStream);

                            System.out.println(" Arquivos lidos com sucesso!");
                            System.out.println("Eventos: " + eventos.size());
                            System.out.println();

                            // PROCESSAR
                            eventoService.processar(eventos);
                            log.inserirLogs(
                                    LocalDateTime.now(),
                                    "SUCESSO",
                                    "INFO",
                                    "PROCESSO_FINALIZADO",
                                    "Geral",
                                    "Carga finalizada com sucesso"
                            );
                        } catch (IOException e) {
                            throw new RuntimeException("Arquivo de eventos não localizado");
                        }
                    }

                    System.out.println("\n PROCESSO FINALIZADO COM SUCESSO!");

                    System.out.println("=".repeat(120));
                    NotificacaoSucessoService sucesso = new NotificacaoSucessoService(
                            LocalDateTime.now(),
                            "INFO",
                            "Carga finalizada com sucesso",
                            args[0]
                    );
                    sucesso.notificar();
                    try {
                        ProcessBuilder processBuilder = new ProcessBuilder("bash", "mover.sh");
                        processBuilder.start();
                    } catch (IOException e) {
                        throw new IOException(e);
                    }
                } catch (RuntimeException | IOException e) {
                    NotificacaoErroService erro = new NotificacaoErroService(LocalDateTime.now(),
                            "ERRO",
                            "Erro durante o processamento: " + e.getMessage(),
                            "Nenhuma");
                    erro.notificar();
                    e.printStackTrace();
                    throw new RuntimeException(
                            "Erro durante processamento: " + e.getMessage(),
                            e
                    );
                }
                break;
            case "Alerta":
                System.out.println("Iniciando alerta");
                AlertaPlanoService alertaService =
                        new AlertaPlanoService(
                                conexao.getJdbcTemplate(),
                                log
                        );

                alertaService.enviarAlertasPendentes();
                break;
            default:
                System.out.println("Modo inválido: " + args[0]);
                throw new IllegalArgumentException(
                        "Modo inválido: " + args[0]
                );
        }
    }
}