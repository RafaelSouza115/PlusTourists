package school.sptech;

import S3.S3Provider;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {

    public static void main(String[] args) {

        ConexaoBancoDeDados conexao = new ConexaoBancoDeDados();
        LeituraExcelEventos leituraEventos = new LeituraExcelEventos();
        LeituraExcelTuristas leituraTuristas = new LeituraExcelTuristas();
        LogsConexaoBancoDeDados log = new LogsConexaoBancoDeDados(conexao.getJdbcTemplate());
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

        log.inserirLogs(
                LocalDateTime.now(),
                "INICIADO",
                "INFO",
                "INICIO_CARGA",
                "registro_turismo e evento",
                "Processo geral de leitura e carga iniciado"
        );

        System.out.println("-".repeat(180));
        System.out.println(
                "[" + LocalDateTime.now().format(formatter) + "]" +
                        " | Status: INICIADO" +
                        " | Nível: INFO" +
                        " | Ação: INICIO_CARGA" +
                        " | Tabela: registro_turismo e evento" +
                        " | Mensagem: Processo geral de leitura e carga iniciado"
        );
        System.out.println("-".repeat(180));


        S3Provider s3 = new S3Provider();

        InputStream eventosStream = s3.baixarArquivo("excel-unificacao.xlsx");
        InputStream turistasStream = s3.baixarArquivo("chegadas-2025.xlsx");

        List<ListaDeDados> eventos =
                leituraEventos.extrairRegistroEvento(eventosStream);

        List<ListaDeDados> turistas =
                leituraTuristas.extrairRegistroTuristas(turistasStream);

        log.inserirLogs(
                LocalDateTime.now(),
                "SUCESSO",
                "INFO",
                "PLANILHAS_PROCESSADAS",
                "registro_turismo",
                "Leitura concluída. Registros carregados - Eventos: " + eventos.size() + " | Turistas: " + turistas.size()
        );

        // ══════════════════════════════════════════════════════════
        // PRÉ-REQUISITO: popula status_plano (PENDENTE, APROVADO, REPROVADO)
        // ══════════════════════════════════════════════════════════
        try {
            conexao.getJdbcTemplate().update(
                    "INSERT IGNORE INTO status_plano (id_status_plano, nome) " +
                            "VALUES (1,'PENDENTE'), (2,'APROVADO'), (3,'REPROVADO')"
            );
            System.out.println(
                    "[" + LocalDateTime.now().format(formatter) + "]" +
                            " | Status: SUCESSO" +
                            " | Nível: INFO" +
                            " | Ação: VALIDACAO_CONCLUIDA" +
                            " | Tabela: status_plano" +
                            " | Mensagem: status_plano verificado."
            );

            } catch (Exception e) {
            System.err.println(
                    "[" + LocalDateTime.now().format(formatter) + "]" +
                            " | Status: ERRO" +
                            " | Nível: ERROR" +
                            " | Ação: VALIDACAO_FALHOU" +
                            " | Tabela: status_plano" +
                            " | Mensagem: Erro em status_plano: " + e.getMessage()
            );
        }

        // ══════════════════════════════════════════════════════════
        // BLOCO 1 — TURISTAS
        //
        // ATENÇÃO: no chegadas-2025.xlsx, a coluna "UF" contém o
        // NOME COMPLETO do estado (ex: "Rio de Janeiro"), não a sigla.
        // Usamos o mapa abaixo para converter nome → sigla (CHAR 2).
        // ══════════════════════════════════════════════════════════
        log.inserirLogs(
                LocalDateTime.now(),
                "PROCESSANDO",
                "INFO",
                "INICIO_CARGA_TURISTAS",
                "registro_turismo",
                "Iniciando inserção de turistas"
        );

       // System.out.println("\n===== Inserindo dados de turistas =====");
        System.out.println("-".repeat(180));
        System.out.println("Inserindo dados de turistas");
        System.out.println("-".repeat(180));

        System.out.println(
                "[" + LocalDateTime.now().format(formatter) + "]" +
                        " | Status: INICIADO" +
                        " | Nível: INFO" +
                        " | Ação: INSERÇÃO_ARQUIVO" +
                        " | Tabela: registro_turismo" +
                        " | Mensagem: Iniciando inserção dos dados de turistas de um total de " + turistas.size() + " linhas"
        );

        Map<String, Integer> cacheEstados = new HashMap<>();
        Map<String, Integer> cachePaises = new HashMap<>();
        Map<String, Integer> cacheTransporte = new HashMap<>();

        String sqlTurista = "INSERT INTO registro_turismo (data_registro, quantidade_turistas, id_pais, id_transporte, id_estado, id_empresa) VALUES (?, ?, ?, ?, ?, ?)";
        List<Object[]> batchTuristas = new ArrayList<>();

        for (int i = 0; i < turistas.size(); i++) {
            ListaDeDados dado = turistas.get(i);

            if (i % 500 == 0 && i != 0) {
                System.out.println(
                        "[" + LocalDateTime.now().format(formatter) + "]" +
                                " | Status: PROCESSANDO" +
                                " | Nível: INFO" +
                                " | Ação: INSERÇÃO_LOTE" +
                                " | Tabela: registro_turismo" +
                                " | Mensagem: " + i + " linhas inseridas"
                );
            }

            try {
                // Limpeza de dados básica para evitar erros de busca
                String nomeEstado = dado.getUF() != null ? dado.getUF().trim() : "Desconhecido";
                String siglaUF    = converterNomeParaSigla(nomeEstado);
                String nomePais   = dado.getPais() != null ? dado.getPais().trim() : "Desconhecido";
                String viaAcesso  = dado.getViaAcesso() != null ? dado.getViaAcesso().trim() : "Outros";

                // --- 1. ESTADO ---
                if (!cacheEstados.containsKey(siglaUF)) {
                    conexao.getJdbcTemplate().update(
                            "INSERT INTO estado (nome_estado, UF) VALUES (?, ?) ON DUPLICATE KEY UPDATE nome_estado = VALUES(nome_estado)",
                            nomeEstado, siglaUF
                    );
                    Integer id = conexao.getJdbcTemplate().queryForObject("SELECT id_estado FROM estado WHERE UF = ? LIMIT 1", Integer.class, siglaUF);
                    cacheEstados.put(siglaUF, id);
                }

                // --- 2. PAIS ---
                if (!cachePaises.containsKey(nomePais)) {
                    conexao.getJdbcTemplate().update(
                            "INSERT INTO pais_origem (nome) VALUES (?) ON DUPLICATE KEY UPDATE nome = VALUES(nome)",
                            nomePais
                    );
                    Integer id = conexao.getJdbcTemplate().queryForObject("SELECT id_pais FROM pais_origem WHERE nome = ? LIMIT 1", Integer.class, nomePais);
                    cachePaises.put(nomePais, id);
                }

                // --- 3. TRANSPORTE ---
                if (!cacheTransporte.containsKey(viaAcesso)) {
                    conexao.getJdbcTemplate().update(
                            "INSERT INTO tipo_transporte (nome_transporte) VALUES (?) ON DUPLICATE KEY UPDATE nome_transporte = VALUES(nome_transporte)",
                            viaAcesso
                    );
                    Integer id = conexao.getJdbcTemplate().queryForObject("SELECT id_transporte FROM tipo_transporte WHERE nome_transporte = ? LIMIT 1", Integer.class, viaAcesso);
                    cacheTransporte.put(viaAcesso, id);
                }

                // Preparação dos dados finais
                String dataRegistro = dado.getAno() + "-" + converterMesParaNumero(dado.getMes()) + "-01";
                Integer qtd = parsarInteiro(dado.getChegadas());
                int qtdTuristas = (qtd != null) ? qtd : 0;

                batchTuristas.add(new Object[]{
                        dataRegistro,
                        qtdTuristas,
                        cachePaises.get(nomePais),
                        cacheTransporte.get(viaAcesso),
                        cacheEstados.get(siglaUF),
                        1
                });

                // Batch Update
                if (batchTuristas.size() >= 1000) {
                    conexao.getJdbcTemplate().batchUpdate(sqlTurista, batchTuristas);
                    batchTuristas.clear();
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
                        "[" + LocalDateTime.now().format(formatter) + "]" +
                                " | Status: ERRO" +
                                " | Nível: ERROR" +
                                " | Ação: ERRO_TURISTA" +
                                " | Tabela: registro_turismo" +
                                " | Descrição: UF: " + dado.getUF() + " | País: " + dado.getPais() +
                                " | Mensagem: Erro na linha " + i + ": " + e.getMessage()
                );
            }
        }

        if (!batchTuristas.isEmpty()) {
            conexao.getJdbcTemplate().batchUpdate(sqlTurista, batchTuristas);
        }

        System.out.println(
                "[" + LocalDateTime.now().format(formatter) + "]" +
                        " | Status: SUCESSO" +
                        " | Nível: INFO" +
                        " | Ação: INSERÇÃO_FINALIZADA" +
                        " | Tabela: registro_turismo" +
                        " | Mensagem: Total de registros inseridos: " + turistas.size()
        );


        System.out.println("\u001B[32mInserção finalizada!\u001B[0m");
        System.out.println("-".repeat(180));

        log.inserirLogs(
                LocalDateTime.now(),
                "SUCESSO",
                "INFO",
                "INSERÇÃO_FINALIZADA",
                "registro_turismo",
                "Total inserido: " + turistas.size()
        );

        // ══════════════════════════════════════════════════════════
        // BLOCO 2 — EVENTOS
        // Ordem de inserção respeita as FKs do banco:
        //   organizador → locall → plano_turistico → evento → edicao
        // ══════════════════════════════════════════════════════════

        log.inserirLogs(
                LocalDateTime.now(),
                "PROCESSANDO",
                "INFO",
                "INSERÇÃO_LOTE",
                "evento",
                "Iniciando inserção de eventos"
        );

        System.out.println("Inserindo dados de eventos...");
        System.out.println("-".repeat(180));

        System.out.println(
                "[" + LocalDateTime.now().format(formatter) + "]" +
                        " | Status: INICIADO" +
                        " | Nível: INFO" +
                        " | Ação: INSERÇÃO_ARQUIVO" +
                        " | Tabela: evento" +
                        " | Mensagem: Iniciando inserção dos dados de eventos de um total de " + eventos.size() + " linhas"
        );

        for (int i = 0; i < eventos.size(); i++) {
            ListaDeDados dado = eventos.get(i);

            try {

                if (i % 500 == 0 && i != 0) {
                    System.out.println(
                            "[" + LocalDateTime.now().format(formatter) + "]" +
                                    " | Status: PROCESSANDO" +
                                    " | Nível: INFO" +
                                    " | Ação: LEITURA_LOTE" +
                                    " | Tabela: evento" +
                                    " | Mensagem: " + i + " de " + eventos.size() + " linhas processadas"
                    );
                }

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

                log.inserirLogs(
                        LocalDateTime.now(),
                        "ERRO",
                        "ERROR",
                        "ERRO_EVENTO",
                        "evento",
                        "Evento: " + dado.getNomeDoEvento() +
                                " | " + e.getMessage()
                );

                System.err.println("Erro evento [" + dado.getNomeDoEvento() + "]: " + e.getMessage());
                e.printStackTrace();
            }
        }

        log.inserirLogs(
                LocalDateTime.now(),
                "FINALIZADO",
                "INFO",
                "PROCESSO_CONCLUIDO",
                "evento",
                "Carga completa finalizada com sucesso"
        );

        System.out.println(
                "[" + LocalDateTime.now().format(formatter) + "]" +
                        " | Status: SUCESSO" +
                        " | Nível: INFO" +
                        " | Ação: INSERÇÃO_FINALIZADA" +
                        " | Tabela: evento" +
                        " | Mensagem: Total de registros inseridos: " + eventos.size()
        );


        System.out.println("\u001B[32mInserção finalizada!\u001B[0m");
        System.out.println("-".repeat(180));
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