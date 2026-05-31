package com.plustourists.service;

import com.plustourists.model.ListaDeDados;
import com.plustourists.repository.ConexaoBancoDeDados;
import com.plustourists.log.LogsConexaoBancoDeDados;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class TuristaService {

    private final ConexaoBancoDeDados conexao;
    private final LogsConexaoBancoDeDados log;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public TuristaService(ConexaoBancoDeDados conexao, LogsConexaoBancoDeDados log) {
        this.conexao = conexao;
        this.log = log;
    }

    public void processar(List<ListaDeDados> turistas) {

        log.inserirLogs(
                LocalDateTime.now(),
                "PROCESSANDO",
                "INFO",
                "INICIO_CARGA_TURISTAS",
                "registro_turismo",
                "Iniciando inserção de turistas"
        );

        System.out.println("Inserindo dados de turistas...");
        System.out.println("-".repeat(120));

        Map<String, Integer> cacheEstados = new HashMap<>();
        Map<String, Integer> cachePaises = new HashMap<>();
        Map<String, Integer> cacheTransportes = new HashMap<>();

        String sql = "INSERT INTO registro_turismo (data_registro, quantidade_turistas, id_pais, id_transporte, id_estado, id_empresa) VALUES (?, ?, ?, ?, ?, ?)";

        List<Object[]> batch = new ArrayList<>();

        for (int i = 0; i < turistas.size(); i++) {

            ListaDeDados dado = turistas.get(i);

            try {

                if (i % 500 == 0 && i != 0) {
                    System.out.println(
                            "[" + LocalDateTime.now().format(formatter) + "]" +
                                    " | PROCESSANDO " + i + "/" + turistas.size()
                    );
                }

                String nomeEstado = dado.getUF() != null ? dado.getUF().trim() : "Desconhecido";
                String siglaUF = converterNomeParaSigla(nomeEstado);

                String nomePais = dado.getPais() != null ? dado.getPais().trim() : "Desconhecido";
                String transporte = dado.getViaAcesso() != null ? dado.getViaAcesso().trim() : "Outros";

                // ──────────────── ESTADO ────────────────
                if (!cacheEstados.containsKey(siglaUF)) {

                    conexao.getJdbcTemplate().update(
                            "INSERT INTO estado (nome_estado, UF) VALUES (?, ?) " +
                                    "ON DUPLICATE KEY UPDATE nome_estado = VALUES(nome_estado)",
                            nomeEstado, siglaUF
                    );

                    Integer id = conexao.getJdbcTemplate().queryForObject(
                            "SELECT id_estado FROM estado WHERE UF = ? LIMIT 1",
                            Integer.class,
                            siglaUF
                    );

                    cacheEstados.put(siglaUF, id);
                }

                // ──────────────── PAIS ────────────────
                if (!cachePaises.containsKey(nomePais)) {

                    conexao.getJdbcTemplate().update(
                            "INSERT INTO pais_origem (nome) VALUES (?) " +
                                    "ON DUPLICATE KEY UPDATE nome = VALUES(nome)",
                            nomePais
                    );

                    Integer id = conexao.getJdbcTemplate().queryForObject(
                            "SELECT id_pais FROM pais_origem WHERE nome = ? LIMIT 1",
                            Integer.class,
                            nomePais
                    );

                    cachePaises.put(nomePais, id);
                }

                // ──────────────── TRANSPORTE ────────────────
                if (!cacheTransportes.containsKey(transporte)) {

                    conexao.getJdbcTemplate().update(
                            "INSERT INTO tipo_transporte (nome_transporte) VALUES (?) " +
                                    "ON DUPLICATE KEY UPDATE nome_transporte = VALUES(nome_transporte)",
                            transporte
                    );

                    Integer id = conexao.getJdbcTemplate().queryForObject(
                            "SELECT id_transporte FROM tipo_transporte WHERE nome_transporte = ? LIMIT 1",
                            Integer.class,
                            transporte
                    );

                    cacheTransportes.put(transporte, id);
                }

                // ──────────────── DADOS FINAIS ────────────────
                String dataRegistro = dado.getAno() + "-" + converterMesParaNumero(dado.getMes()) + "-01";

                Integer qtd = parsarInteiro(dado.getChegadas());
                int quantidade = (qtd != null) ? qtd : 0;

                batch.add(new Object[]{
                        dataRegistro,
                        quantidade,
                        cachePaises.get(nomePais),
                        cacheTransportes.get(transporte),
                        cacheEstados.get(siglaUF),
                        1
                });

                // batch insert
                if (batch.size() >= 1000) {
                    conexao.getJdbcTemplate().batchUpdate(sql, batch);
                    batch.clear();
                }

            } catch (Exception e) {

                log.inserirLogs(
                        LocalDateTime.now(),
                        "ERRO",
                        "ERROR",
                        "ERRO_TURISTA",
                        "registro_turismo",
                        "UF: " + dado.getUF() + " | País: " + dado.getPais() + " | " + e.getMessage()
                );

                System.err.println(
                        "[" + LocalDateTime.now().format(formatter) + "] ERRO: " + e.getMessage()
                );
            }
        }

        if (!batch.isEmpty()) {
            conexao.getJdbcTemplate().batchUpdate(sql, batch);
        }

        log.inserirLogs(
                LocalDateTime.now(),
                "SUCESSO",
                "INFO",
                "INSERCAO_FINALIZADA",
                "registro_turismo",
                "Total inserido: " + turistas.size()
        );

        System.out.println("\n Turistas inseridos com sucesso!");
    }

    // =========================
    // MÉTODOS AUXILIARES
    // =========================

    private Integer parsarInteiro(String valor) {
        if (valor == null || valor.isBlank()) return null;

        try {
            String numeros = valor.replaceAll("[^0-9]", "");
            return numeros.isEmpty() ? null : Integer.parseInt(numeros);
        } catch (Exception e) {
            return null;
        }
    }

    private String converterMesParaNumero(String mes) {
        if (mes == null || mes.isBlank()) return "01";

        return switch (mes.trim().toLowerCase()) {
            case "janeiro" -> "01";
            case "fevereiro" -> "02";
            case "março" -> "03";
            case "abril" -> "04";
            case "maio" -> "05";
            case "junho" -> "06";
            case "julho" -> "07";
            case "agosto" -> "08";
            case "setembro" -> "09";
            case "outubro" -> "10";
            case "novembro" -> "11";
            case "dezembro" -> "12";
            default -> "01";
        };
    }

    private String converterNomeParaSigla(String nomeEstado) {
        if (nomeEstado == null || nomeEstado.isBlank()) return "??";

        return switch (nomeEstado.trim()) {
            case "Acre" -> "AC";
            case "Alagoas" -> "AL";
            case "Amapá" -> "AP";
            case "Amazonas" -> "AM";
            case "Bahia" -> "BA";
            case "Ceará" -> "CE";
            case "Distrito Federal" -> "DF";
            case "Espírito Santo" -> "ES";
            case "Goiás" -> "GO";
            case "Maranhão" -> "MA";
            case "Mato Grosso" -> "MT";
            case "Mato Grosso do Sul" -> "MS";
            case "Minas Gerais" -> "MG";
            case "Pará" -> "PA";
            case "Paraíba" -> "PB";
            case "Paraná" -> "PR";
            case "Pernambuco" -> "PE";
            case "Piauí" -> "PI";
            case "Rio de Janeiro" -> "RJ";
            case "Rio Grande do Norte" -> "RN";
            case "Rio Grande do Sul" -> "RS";
            case "Rondônia" -> "RO";
            case "Roraima" -> "RR";
            case "Santa Catarina" -> "SC";
            case "São Paulo" -> "SP";
            case "Sergipe" -> "SE";
            case "Tocantins" -> "TO";
            default -> nomeEstado.length() >= 2
                    ? nomeEstado.substring(0, 2).toUpperCase()
                    : "??";
        };
    }
}