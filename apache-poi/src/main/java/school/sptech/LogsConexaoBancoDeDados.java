package school.sptech;

import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;

public class LogsConexaoBancoDeDados {

    private JdbcTemplate jdbc;

    public LogsConexaoBancoDeDados(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void inserirLogs(LocalDateTime dataHora, String status, String nivel,
                            String acaoEfetuada, String tabelaAfetada, String descricao) {
        String sql = """
                INSERT INTO log (data_hora, statuss, nivel, acao_efetuada, tabela_afetada, descricao)
                VALUES (?, ?, ?, ?, ?, ?)
                """;

        jdbc.update(sql, dataHora, status, nivel, acaoEfetuada, tabelaAfetada, descricao);
    }
}
