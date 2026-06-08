package com.plustourists.service;

import com.plustourists.model.ListaDeDados;
import com.plustourists.model.NotificacaoErroService;
import com.plustourists.repository.ConexaoBancoDeDados;
import com.plustourists.log.LogsConexaoBancoDeDados;

import java.sql.Connection;
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

        Connection conn = null;

        try {
            conn = conexao.getConexao().getConnection();

            conn.setAutoCommit(false);

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

                    if (nomeOrg == null || nomeOrg.isBlank()) {
                        nomeOrg = "NAO INFORMADO";
                    }

                    conexao.getJdbcTemplate().update(
                            "INSERT INTO organizador (nome_organizador, site_compra_ingresso) " +
                                    "SELECT ?, ? FROM DUAL " +
                                    "WHERE NOT EXISTS (SELECT 1 FROM organizador WHERE nome_organizador = ?)",
                            nomeOrg, dado.getSiteDoIngresso(), nomeOrg
                    );

                    Integer idOrganizador =
                            conexao.getJdbcTemplate().queryForObject(
                            "SELECT id_organizador FROM organizador WHERE nome_organizador = ?",
                            Integer.class, nomeOrg
                    );

                    // ──────────────── 2. MUNICIPIO ────────────────

                    String municipio = dado.getMunicipio();
                    String uf = dado.getUF();

                    // Select para buscar municipio corretamente.

                    Integer idEstado = 2;
                    conexao.getJdbcTemplate().queryForObject(
                            "SELECT id_estado FROM estado WHERE uf = ?",
                            Integer.class,
                            uf
                    );

                    conexao.getJdbcTemplate().update(
                            "INSERT INTO municipio " +
                                    "(municipio, id_estado) " +
                                    "SELECT ?, ? FROM DUAL " +
                                    "WHERE NOT EXISTS (" +
                                    "SELECT 1 FROM municipio WHERE municipio = ?)",
                            municipio,
                            idEstado,
                            municipio
                    );

                    Integer idMunicipio = conexao.getJdbcTemplate().queryForObject(
                            "SELECT id_municipio " +
                                    "FROM municipio " +
                                    "WHERE municipio = ?",
                            Integer.class, municipio
                    );


                    conexao.getJdbcTemplate().update(
                            "INSERT INTO municipio " +
                                    "(municipio, id_estado) " +
                                    "SELECT ?, 2 FROM DUAL " +
                                    "WHERE NOT EXISTS (" +
                                    "SELECT 1 FROM municipio WHERE municipio = ?)",
                            municipio, municipio
                    );


                    // =====================================================
                    // 3. CLASSIFICACAO ETARIA
                    // =====================================================

                    String classificacao =
                            dado.getClassificacaoEtaria();

                    if (classificacao == null ||
                            classificacao.isBlank()) {

                        classificacao = "Livre";
                    }

                    conexao.getJdbcTemplate().update(
                            "INSERT INTO classificacao_etaria " +
                                    "(classificacao) " +
                                    "SELECT ? FROM DUAL " +
                                    "WHERE NOT EXISTS (" +
                                    "SELECT 1 FROM classificacao_etaria " +
                                    "WHERE classificacao = ?)",
                            classificacao,
                            classificacao
                    );

                    Integer idClassificacao =
                            conexao.getJdbcTemplate().queryForObject(
                                    "SELECT id_classificacao " +
                                            "FROM classificacao_etaria " +
                                            "WHERE classificacao = ?",
                                    Integer.class,
                                    classificacao
                            );


                    // ──────────────── 4. EVENTO ────────────────
                    conexao.getJdbcTemplate().update(
                            "INSERT INTO evento " +
                                    "(nome_evento, descricao_evento, id_classificacao, id_municipio) " +
                                    "VALUES (?, ?, ?, ?)",
                            dado.getNomeDoEvento(),
                            dado.getDescricaoDoEvento(),
                            idClassificacao,
                            idMunicipio

                    );

                    Integer idEvento = conexao.getJdbcTemplate().queryForObject(
                            "SELECT LAST_INSERT_ID()", Integer.class
                    );

                    // ──────────────── 5. EDIÇÃO 2025 ────────────────

                    inserirEdicao(
                            dado.getDataInicialDoEvento(),
                            dado.getDataFinalDoEvento(),
                            dado.getHorarioInicioEvento(),
                            dado.getHorarioFinalevento(),
                            parsarInteiro(dado.getEdicao2025()),
                            "2025",
                            parsarInteiro(dado.getPublicoEsperado()),
                            idEvento,
                            idOrganizador
                    );

                    // ──────────────── 5. EDIÇÃO 2024 ────────────────
                    inserirEdicao(
                            null, null, null, null,
                            parsarInteiro(dado.getEdicao2024()),
                            "2024",
                            null,
                            idEvento,
                            idOrganizador
                    );

                } catch (Exception e) {

                    conn.rollback(); // <- adiciona isso / ROLLBACK ERRO INTERNO

                    log.inserirLogs(
                            LocalDateTime.now(),
                            "ERRO",
                            "ERROR",
                            "ERRO_EVENTO",
                            "evento",
                            "Evento: " + dado.getNomeDoEvento() + " | " + e.getMessage()
                    );
                    NotificacaoErroService erro = new NotificacaoErroService(LocalDateTime.now(),
                            "ERRO",
                            "Evento: " + dado.getNomeDoEvento() + " | " + e.getMessage(),
                            "evento");
                    erro.notificar();
                    System.err.println(
                            "[" + LocalDateTime.now().format(formatter) + "] ERRO: " + e.getMessage()
                    );
                }
            }

            conn.commit();

            log.inserirLogs(
                    LocalDateTime.now(),
                    "FINALIZADO",
                    "INFO",
                    "PROCESSO_CONCLUIDO",
                    "evento",
                    "Carga finalizada com sucesso"
            );

            System.out.println("\n Eventos inseridos com sucesso!");


        } catch (Exception e) {

            try {

                if (conn != null) {
                    conn.rollback();
                }

            } catch (Exception rollbackErro) {

                System.err.println(rollbackErro.getMessage());
            }

            System.err.println(e.getMessage());

        } finally { // Fecha conexão

            try {
                if (conn != null) {
                    conn.close();
                }

            } catch (Exception e) {
                System.err.println(e.getMessage());
                NotificacaoErroService erro = new NotificacaoErroService(
                        LocalDateTime.now(),
                        "ERRO",
                        e.getMessage(),
                        "evento");
                erro.notificar();
            }
        }
        }

    // =========================
    // MÉTODOS AUXILIARES
    // =========================

    private void inserirEdicao(
            java.util.Date dt_inicio,
            java.util.Date dt_fim,
            java.time.LocalDateTime hr_inicio,
            java.time.LocalDateTime hr_fim,
            Integer publico_atingido,
            String ano_realizacao,
            Integer publico_esperado,
            Integer id_evento,
            Integer id_organizador
    ) {

        try {

            java.sql.Date inicio =
                    (dt_inicio != null)
                            ? new java.sql.Date(dt_inicio.getTime())
                            : null;

            java.sql.Date fim =
                    (dt_fim != null)
                            ? new java.sql.Date(dt_fim.getTime())
                            : null;

            String hInicio =
                    (hr_inicio != null)
                            ? hr_inicio.toLocalTime().toString()
                            : null;

            String hFim =
                    (hr_fim != null)
                            ? hr_fim.toLocalTime().toString()
                            : null;


            conexao.getJdbcTemplate().update(
                    "INSERT INTO edicao " +
                            "(dt_inicio, dt_fim, hr_inicio, hr_fim, publico_atingido, ano_realizacao, publico_esperado, id_evento, id_organizador) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",

                    inicio,
                    fim,
                    hInicio,
                    hFim,
                    publico_atingido,
                    ano_realizacao,
                    publico_esperado,
                    id_evento,
                    id_organizador
            );

        } catch (Exception e) {
            System.err.println("Erro ao inserir edição " + ano_realizacao + ": " + e.getMessage());
            NotificacaoErroService erro = new NotificacaoErroService(
                    LocalDateTime.now(),
                    "ERRO",
                    "Erro ao inserir edição " + ano_realizacao + ": " + e.getMessage(),
                    "evento");
            erro.notificar();
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