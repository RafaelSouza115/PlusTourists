package school.sptech;

import java.util.List;
import java.util.Map;

public class Main {

    public static void main(String[] args) {

        ConexaoBancoDeDados conexao = new ConexaoBancoDeDados();
        LeituraExcelEventos leituraEventos = new LeituraExcelEventos();
        LeituraExcelTuristas leituraTuristas = new LeituraExcelTuristas();

        List<ListaDeDados> eventos  = leituraEventos.extrairRegistroEvento("Excel-unificacao.xlsx");
        List<ListaDeDados> turistas = leituraTuristas.extrairRegistroTuristas("chegadas-2025.xlsx");

        // ══════════════════════════════════════════════════════════
        // PRÉ-REQUISITO: popula status_plano (PENDENTE, APROVADO, REPROVADO)
        // ══════════════════════════════════════════════════════════
        try {
            conexao.getJdbcTemplate().update(
                    "INSERT IGNORE INTO status_plano (id_status_plano, nome) " +
                            "VALUES (1,'PENDENTE'), (2,'APROVADO'), (3,'REPROVADO')"
            );
            System.out.println("status_plano verificado.");
        } catch (Exception e) {
            System.err.println("Erro em status_plano: " + e.getMessage());
        }

        // ══════════════════════════════════════════════════════════
        // BLOCO 1 — TURISTAS
        //
        // ATENÇÃO: no chegadas-2025.xlsx, a coluna "UF" contém o
        // NOME COMPLETO do estado (ex: "Rio de Janeiro"), não a sigla.
        // Usamos o mapa abaixo para converter nome → sigla (CHAR 2).
        // ══════════════════════════════════════════════════════════
        System.out.println("\n===== Inserindo dados de turistas =====");

        for (ListaDeDados dado : turistas) {
            try {
                String nomeEstado = dado.getUF();
                String siglaUF    = converterNomeParaSigla(nomeEstado);

                // 1. ESTADO - Usamos ON DUPLICATE KEY para evitar erro de UNIQUE
                conexao.getJdbcTemplate().update(
                        "INSERT INTO estado (nome_estado, UF) VALUES (?, ?) " +
                                "ON DUPLICATE KEY UPDATE nome_estado = VALUES(nome_estado)",
                        nomeEstado, siglaUF
                );

                // 2. PAIS_ORIGEM - Garante que o país seja único
                conexao.getJdbcTemplate().update(
                        "INSERT INTO pais_origem (nome) VALUES (?) " +
                                "ON DUPLICATE KEY UPDATE nome = VALUES(nome)",
                        dado.getPais()
                );

                // 3. TIPO_TRANSPORTE
                conexao.getJdbcTemplate().update(
                        "INSERT INTO tipo_transporte (nome_transporte) VALUES (?) " +
                                "ON DUPLICATE KEY UPDATE nome_transporte = VALUES(nome_transporte)",
                        dado.getViaAcesso()
                );

                // Usamos LIMIT 1 para garantir que apenas um ID retorne caso haja duplicatas acidentais
                Integer idEstado = conexao.getJdbcTemplate().queryForObject(
                        "SELECT id_estado FROM estado WHERE UF = ? LIMIT 1",
                        Integer.class, siglaUF
                );
                Integer idPais = conexao.getJdbcTemplate().queryForObject(
                        "SELECT id_pais FROM pais_origem WHERE nome = ? LIMIT 1",
                        Integer.class, dado.getPais()
                );
                Integer idTransporte = conexao.getJdbcTemplate().queryForObject(
                        "SELECT id_transporte FROM tipo_transporte WHERE nome_transporte = ? LIMIT 1",
                        Integer.class, dado.getViaAcesso()
                );

                // Tratamento da Data e Chegadas
                String dataRegistro = dado.getAno() + "-" + converterMesParaNumero(dado.getMes()) + "-01";
                int qtdTuristas = parsarInteiro(dado.getChegadas()) != null ? parsarInteiro(dado.getChegadas()) : 0;

                // 4. REGISTRO_TURISMO
                conexao.getJdbcTemplate().update(
                        "INSERT INTO registro_turismo " +
                                "(data_registro, quantidade_turistas, id_pais, id_transporte, id_estado, id_empresa) " +
                                "VALUES (?, ?, ?, ?, ?, ?)",
                        dataRegistro, qtdTuristas, idPais, idTransporte, idEstado, 1
                );

            } catch (Exception e) {
                System.err.println("Erro turista [" + dado.getUF() + " / " + dado.getPais() + "]: " + e.getMessage());
            }
        }

        System.out.println("Turistas concluidos. Total processado: " + turistas.size());

        // ══════════════════════════════════════════════════════════
        // BLOCO 2 — EVENTOS
        // Ordem de inserção respeita as FKs do banco:
        //   organizador → locall → plano_turistico → evento → edicao
        // ══════════════════════════════════════════════════════════
        System.out.println("\n===== Inserindo dados de eventos =====");

        for (ListaDeDados dado : eventos) {
            try {

                // ── 1. ORGANIZADOR ────────────────────────────────
                // No Excel, responsavelPelaOrganizacao tem limite 10 (coluna 22)
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

                // ── 2. LOCAL ──────────────────────────────────────
                // Usamos id_estado = 1 como padrão (SP, já que os eventos são paulistas).
                String municipio = dado.getMunicipio();
                String regiaoTur = (dado.getRegiaoTuristica() == null) ? "" : dado.getRegiaoTuristica();

                conexao.getJdbcTemplate().update(
                        "INSERT INTO locall (municipio, regiao_turistica, id_estado) " +
                                "SELECT ?, ?, 1 FROM DUAL " +
                                "WHERE NOT EXISTS (" +
                                "  SELECT 1 FROM locall WHERE municipio = ? AND COALESCE(regiao_turistica,'') = ?" +
                                ")",
                        municipio, regiaoTur, municipio, regiaoTur
                );

                Integer idLocal = conexao.getJdbcTemplate().queryForObject(
                        "SELECT id_local FROM locall WHERE municipio = ? AND COALESCE(regiao_turistica,'') = ?",
                        Integer.class, municipio, regiaoTur
                );

                // ── 3. PLANO TURÍSTICO ────────────────────────────
                // Cria um plano novo por evento; status PENDENTE (id=1); id_empresa = 1
                conexao.getJdbcTemplate().update(
                        "INSERT INTO plano_turistico (id_empresa, id_status_plano) VALUES (?, ?)",
                        1, 1
                );
                Integer idPlano = conexao.getJdbcTemplate().queryForObject(
                        "SELECT LAST_INSERT_ID()", Integer.class
                );

                // ── 4. EVENTO ─────────────────────────────────────
                conexao.getJdbcTemplate().update(
                        "INSERT INTO evento " +
                                "(nome_evento, descricao_evento, classificacao_etaria, tipo_evento, tipo_publico, id_local, id_plano) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                        dado.getNomeDoEvento(),
                        dado.getDescricaoDoEvento(),
                        dado.getClassificacaoEtaria(),
                        dado.getTipoDeEvento(),
                        dado.getTipoDePublico(),
                        idLocal,
                        idPlano
                );
                Integer idEvento = conexao.getJdbcTemplate().queryForObject(
                        "SELECT LAST_INSERT_ID()", Integer.class
                );

                // ── 5. EDIÇÃO 2025 ────────────────────────────────
                // publicoEsperado = coluna 18  |  edicao2025 = coluna 19 (público realizado 2025)
                inserirEdicao(conexao,
                        dado.getDataInicialDoEvento(),
                        dado.getDataFinalDoEvento(),
                        dado.getHorarioInicioEvento(),
                        dado.getHorarioFinalevento(),
                        parsarInteiro(dado.getEdicao2025()),       // publico_realizado
                        2025,
                        parsarInteiro(dado.getPublicoEsperado()),  // publico_esperado
                        idEvento,
                        idOrganizador
                );

                // ── 6. EDIÇÃO 2024 ────────────────────────────────
                // Sem datas (evento já passou); só registra o público realizado
                inserirEdicao(conexao,
                        null, null, null, null,
                        parsarInteiro(dado.getEdicao2024()),       // publico_realizado
                        2024,
                        null,
                        idEvento,
                        idOrganizador
                );

            } catch (Exception e) {
                System.err.println("Erro evento [" + dado.getNomeDoEvento() + "]: " + e.getMessage());
                e.printStackTrace();
            }
        }

        System.out.println("Eventos concluidos. Total processado: " + eventos.size());
    }

    // ══════════════════════════════════════════════════════════════
    // MÉTODOS AUXILIARES
    // ══════════════════════════════════════════════════════════════

    /**
     * Insere uma edição (ano) de um evento.
     * Para 2024: datas e horários ficam nulos (evento já ocorreu).
     * Para 2025: inclui datas e horários vindos do Excel.
     */
    private static void inserirEdicao(ConexaoBancoDeDados conexao,
                                      java.util.Date dataInicio,
                                      java.util.Date dataFim,
                                      java.time.LocalDateTime horarioInicio,
                                      java.time.LocalDateTime horarioFinal,
                                      Integer publicoRealizado,
                                      int anoReferencia,
                                      Integer publicoEsperado,
                                      Integer idEvento,
                                      Integer idOrganizador) {
        try {
            // java.util.Date → java.sql.Date (necessário para o JDBC/MySQL)
            java.sql.Date sqlInicio = (dataInicio != null) ? new java.sql.Date(dataInicio.getTime()) : null;
            java.sql.Date sqlFim    = (dataFim    != null) ? new java.sql.Date(dataFim.getTime())    : null;

            // LocalDateTime → String "HH:mm" para o tipo TIME do MySQL
            String horaInicio = (horarioInicio != null) ? horarioInicio.toLocalTime().toString() : null;
            String horaFinal  = (horarioFinal  != null) ? horarioFinal.toLocalTime().toString()  : null;

            conexao.getJdbcTemplate().update(
                    "INSERT INTO edicao " +
                            "(data_inicio, data_fim, horario_inicio, horario_final, " +
                            " publico_realizado, ano_referencia, publico_esperado, id_evento, id_organizador) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    sqlInicio, sqlFim, horaInicio, horaFinal,
                    publicoRealizado, anoReferencia, publicoEsperado,
                    idEvento, idOrganizador
            );
        } catch (Exception e) {
            System.err.println("  Erro edicao " + anoReferencia + " (evento id=" + idEvento + "): " + e.getMessage());
        }
    }

    /**
     * Converte string de público para Integer.
     * Aceita "10.000", "10000", "SEM INFO", "" → null se inválido.
     */
    private static Integer parsarInteiro(String valor) {
        if (valor == null || valor.isBlank()) return null;
        try {
            String apenasNumeros = valor.replaceAll("[^0-9]", "");
            return apenasNumeros.isEmpty() ? null : Integer.parseInt(apenasNumeros);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Converte nome do mês em português → "MM" com zero à esquerda.
     * O Excel de turistas usa o nome completo: "Janeiro", "Fevereiro", etc.
     */
    private static String converterMesParaNumero(String mes) {
        if (mes == null || mes.isBlank()) return "01";
        return switch (mes.trim().toLowerCase()) {
            case "janeiro"   -> "01";
            case "fevereiro" -> "02";
            case "março"     -> "03";
            case "abril"     -> "04";
            case "maio"      -> "05";
            case "junho"     -> "06";
            case "julho"     -> "07";
            case "agosto"    -> "08";
            case "setembro"  -> "09";
            case "outubro"   -> "10";
            case "novembro"  -> "11";
            case "dezembro"  -> "12";
            default          -> "01";
        };
    }

    /**
     * Converte o NOME COMPLETO do estado (como vem no Excel de turistas)
     * para a sigla de 2 letras exigida pelo banco (UF CHAR(2)).
     *
     * O Excel usa a coluna como "UF" mas armazena o nome por extenso.
     */
    private static String converterNomeParaSigla(String nomeEstado) {
        if (nomeEstado == null || nomeEstado.isBlank()) return "??";
        return switch (nomeEstado.trim()) {
            case "Acre"                -> "AC";
            case "Alagoas"             -> "AL";
            case "Amapá"               -> "AP";
            case "Amazonas"            -> "AM";
            case "Bahia"               -> "BA";
            case "Ceará"               -> "CE";
            case "Distrito Federal"    -> "DF";
            case "Espírito Santo"      -> "ES";
            case "Goiás"               -> "GO";
            case "Maranhão"            -> "MA";
            case "Mato Grosso"         -> "MT";
            case "Mato Grosso do Sul"  -> "MS";
            case "Minas Gerais"        -> "MG";
            case "Pará"                -> "PA";
            case "Paraíba"             -> "PB";
            case "Paraná"              -> "PR";
            case "Pernambuco"          -> "PE";
            case "Piauí"               -> "PI";
            case "Rio de Janeiro"      -> "RJ";
            case "Rio Grande do Norte" -> "RN";
            case "Rio Grande do Sul"   -> "RS";
            case "Rondônia"            -> "RO";
            case "Roraima"             -> "RR";
            case "Santa Catarina"      -> "SC";
            case "São Paulo"           -> "SP";
            case "Sergipe"             -> "SE";
            case "Tocantins"           -> "TO";
            default                    -> nomeEstado.length() >= 2
                    ? nomeEstado.substring(0, 2).toUpperCase()
                    : "??";
        };
    }
}