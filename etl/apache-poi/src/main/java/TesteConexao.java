//package com.plustourists;
//
//import com.plustourists.log.LogsConexaoBancoDeDados;
//import com.plustourists.model.ListaDeDados;
//import com.plustourists.repository.ConexaoBancoDeDados;
//import com.plustourists.service.EventoService;
//import com.plustourists.service.LeituraExcelService;
//
//import java.util.List;
//
//public class TesteConexao {
//
//    public static void main(String[] args) {
//
//        System.out.println("Conexão com o banco de dados realizada com sucesso!");
//
//        ConexaoBancoDeDados conexao = new ConexaoBancoDeDados();
//
//        LogsConexaoBancoDeDados log =
//                new LogsConexaoBancoDeDados(conexao);
//
//        // =========================
//        // LEITURA DO EXCEL
//        // =========================
//
//        LeituraExcelService leituraExcel =
//                new LeituraExcelService(log);
//
//        List<ListaDeDados> eventos =
//                leituraExcel.lerDados();
//
//        System.out.println("Eventos lidos: " + eventos.size());
//
//        // =========================
//        // PROCESSAMENTO ETL
//        // =========================
//
//        EventoService eventoService =
//                new EventoService(conexao, log);
//
//        long inicio = System.currentTimeMillis();
//
//        eventoService.processar(eventos);
//
//        long fim = System.currentTimeMillis();
//
//        System.out.println(
//                "Tempo total: " +
//                        ((fim - inicio) / 1000.0) +
//                        " segundos"
//        );
//    }
//}