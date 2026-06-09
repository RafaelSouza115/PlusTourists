package com.plustourists.service;

import com.plustourists.log.LogsConexaoBancoDeDados;
import com.plustourists.model.AlertaPendentes;
import com.plustourists.model.Email;
import com.plustourists.repository.ConexaoSlackAlertas;
import org.springframework.jdbc.core.JdbcTemplate;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

public class AlertaPlanoService {
    private final JdbcTemplate jdbcTemplate;
    private final LogsConexaoBancoDeDados log;

    public AlertaPlanoService(JdbcTemplate jdbcTemplate, LogsConexaoBancoDeDados log) {
        this.jdbcTemplate = jdbcTemplate;
        this.log = log;
    }

    public void enviarSlack(Integer quantidade) throws IOException, InterruptedException {

        String mensagem = """
        {
          "text":"Alertas enviados para %s aprovadores"
        }
        """.formatted(quantidade);
        ConexaoSlackAlertas.enviarAlerta(mensagem);
    }

    public void enviarAlertasPendentes() {
        String sql = "SELECT * FROM planos_pendentes_aprovacao";
        List<AlertaPendentes> alertas = jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {
                    AlertaPendentes alerta = new AlertaPendentes();

                    alerta.setEmail(rs.getString("email"));
                    alerta.setNome(rs.getString("nome"));
                    alerta.setRazaoSocial(rs.getString("razao_social"));
                    alerta.setQtdPendentes(rs.getInt("qtd_planos_pendentes"));

                    return alerta;
                }
        );
        for (AlertaPendentes alerta : alertas) {
            try{
                System.out.println(alerta.getEmail() + " " + alerta.getQtdPendentes() + " " + alerta.getNome());
                Email.enviarEmail(alerta.getEmail(), alerta.getQtdPendentes(), alerta.getNome());
            } catch (Exception e) {
                System.out.println("Erro ao enviar email para " + alerta.getEmail());
                e.printStackTrace();
            }
        }
        try {
            enviarSlack(alertas.size());
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
        log.inserirLogs(
                LocalDateTime.now(),
                "SUCESSO",
                "INFO",
                "ENVIO_ALERTA",
                "nenhuma",
                "Alertas enviados para " + alertas.size() + " aprovadores"
        );
    }
}
