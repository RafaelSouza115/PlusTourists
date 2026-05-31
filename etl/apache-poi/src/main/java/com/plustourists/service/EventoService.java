package com.plustourists.service;

import com.plustourists.model.ListaDeDados;
import com.plustourists.repository.ConexaoBancoDeDados;
import com.plustourists.log.LogsConexaoBancoDeDados;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class EventoService {

    private final ConexaoBancoDeDados conexao;
    private final LogsConexaoBancoDeDados log;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    public EventoService(ConexaoBancoDeDados conexao, LogsConexaoBancoDeDados log) {
        this.conexao = conexao;
        this.log = log;
    }

    public void processar(List<ListaDeDados> eventos) {

        log.inserirLogs(
                LocalDateTime.now(),
                "PROCESSANDO",
                "INFO",
                "INICIO_CARGA_EVENTOS",
                "evento",
                "Iniciando inserção de eventos"
        );

        System.out.println("Inserindo dados de eventos...");
        System.out.println("-".repeat(120));

        for (int i = 0; i < eventos.size(); i++) {

            ListaDeDados dado = eventos.get(i);

            try {

                if (i % 500 == 0 && i != 0) {
                    System.out.println(
                            "[" + LocalDateTime.now().format(formatter) + "]" +
                                    " | PROCESSANDO " + i + "/" + eventos.size()
                    );
                }

                // ──────────────── 1. ORGANIZADOR ────────────────
                String nomeOrg = dado.getResponsavelPelaOrganizacao();
                if (nomeOrg == null || nomeOrg.isBlank()) nomeOrg = "NAO INFORMADO";

                conexao.getJdbcTemplate().update(
                        "INSERT INTO organizador (nome_organizador, site_compra_ingresso) " +
                                "SELECT ?, ? FROM DUAL " +
                                "WHERE NOT EXISTS (SELECT 1 FROM organizador WHERE nome_organizador = ?)",
                        nomeOrg, dado.getSiteDoIngresso(), nomeOrg
                );

                Integer idOrganizador = conexao.getJdbcTemplate().queryForObject(
                        "SELECT id_organizador FROM organizador WHERE nome_organizador = ?",
                        Integer.class, nomeOrg
                );

                // ──────────────── 2. LOCAL ────────────────
                String municipio = dado.getMunicipio();
                String regiao = (dado.getRegiaoTuristica() == null) ? "" : dado.getRegiaoTuristica();

                conexao.getJdbcTemplate().update(
                        "INSERT INTO locall (municipio, regiao_turistica, id_estado) " +
                                "SELECT ?, ?, 1 FROM DUAL " +
                                "WHERE NOT EXISTS (" +
                                "SELECT 1 FROM locall WHERE municipio = ? AND COALESCE(regiao_turistica,'') = ?" +
                                ")",
                        municipio, regiao, municipio, regiao
                );

                Integer idLocal = conexao.getJdbcTemplate().queryForObject(
                        "SELECT id_local FROM locall WHERE municipio = ? AND COALESCE(regiao_turistica,'') = ?",
                        Integer.class, municipio, regiao
                );


                // ──────────────── 3. EVENTO ────────────────
                conexao.getJdbcTemplate().update(
                        "INSERT INTO evento " +
                                "(nome_evento, descricao_evento, classificacao_etaria, tipo_evento, tipo_publico, id_local) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                        dado.getNomeDoEvento(),
                        dado.getDescricaoDoEvento(),
                        dado.getClassificacaoEtaria(),
                        dado.getTipoDeEvento(),
                        dado.getTipoDePublico(),
                        idLocal
                );

                Integer idEvento = conexao.getJdbcTemplate().queryForObject(
                        "SELECT LAST_INSERT_ID()", Integer.class
                );

                // ──────────────── 4. EDIÇÃO 2025 ────────────────
                inserirEdicao(
                        dado.getDataInicialDoEvento(),
                        dado.getDataFinalDoEvento(),
                        dado.getHorarioInicioEvento(),
                        dado.getHorarioFinalevento(),
                        parsarInteiro(dado.getEdicao2025()),
                        2025,
                        parsarInteiro(dado.getPublicoEsperado()),
                        idEvento,
                        idOrganizador
                );

                // ──────────────── 5. EDIÇÃO 2024 ────────────────
                inserirEdicao(
                        null, null, null, null,
                        parsarInteiro(dado.getEdicao2024()),
                        2024,
                        null,
                        idEvento,
                        idOrganizador
                );

            } catch (Exception e) {

                log.inserirLogs(
                        LocalDateTime.now(),
                        "ERRO",
                        "ERROR",
                        "ERRO_EVENTO",
                        "evento",
                        "Evento: " + dado.getNomeDoEvento() + " | " + e.getMessage()
                );

                System.err.println(
                        "[" + LocalDateTime.now().format(formatter) + "] ERRO: " + e.getMessage()
                );
            }
        }

        log.inserirLogs(
                LocalDateTime.now(),
                "FINALIZADO",
                "INFO",
                "PROCESSO_CONCLUIDO",
                "evento",
                "Carga finalizada com sucesso"
        );

        System.out.println("\n Eventos inseridos com sucesso!");
    }

    // =========================
    // MÉTODOS AUXILIARES
    // =========================

    private void inserirEdicao(
            java.util.Date dataInicio,
            java.util.Date dataFim,
            java.time.LocalDateTime horaInicio,
            java.time.LocalDateTime horaFim,
            Integer publicoRealizado,
            int ano,
            Integer publicoEsperado,
            Integer idEvento,
            Integer idOrganizador
    ) {

        try {
            java.sql.Date inicio = (dataInicio != null) ? new java.sql.Date(dataInicio.getTime()) : null;
            java.sql.Date fim = (dataFim != null) ? new java.sql.Date(dataFim.getTime()) : null;

            String hInicio = (horaInicio != null) ? horaInicio.toLocalTime().toString() : null;
            String hFim = (horaFim != null) ? horaFim.toLocalTime().toString() : null;

            conexao.getJdbcTemplate().update(
                    "INSERT INTO edicao " +
                            "(data_inicio, data_fim, horario_inicio, horario_final, publico_realizado, ano_referencia, publico_esperado, id_evento, id_organizador) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    inicio, fim, hInicio, hFim,
                    publicoRealizado, ano, publicoEsperado,
                    idEvento, idOrganizador
            );

        } catch (Exception e) {
            System.err.println("Erro ao inserir edição " + ano + ": " + e.getMessage());
        }
    }

    private Integer parsarInteiro(String valor) {
        if (valor == null || valor.isBlank()) return null;

        try {
            String numeros = valor.replaceAll("[^0-9]", "");
            return numeros.isEmpty() ? null : Integer.parseInt(numeros);
        } catch (Exception e) {
            return null;
        }
    }
}