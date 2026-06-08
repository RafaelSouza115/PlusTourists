package com.plustourists.repository;

import com.plustourists.model.NotificacaoErroService;
import org.apache.commons.dbcp2.BasicDataSource;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDateTime;

public class ConexaoBancoDeDados {

    private final JdbcTemplate jdbcTemplate;
    private final BasicDataSource conexao;

    public ConexaoBancoDeDados() {

        this.conexao = new BasicDataSource();

        // Driver
        conexao.setDriverClassName("com.mysql.cj.jdbc.Driver");

        // Variáveis de ambiente

        String host = System.getenv("DB_HOST");
        String port = System.getenv("DB_PORT");
        String database = System.getenv("DB_NAME");
        String user = System.getenv("DB_USER");
        String password = System.getenv("DB_PASSWORD");


        // URL do banco
        String url = String.format(
                "jdbc:mysql://%s:%s/%s?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
                host, port, database
        );

        conexao.setUrl(url);
        conexao.setUsername(user);
        conexao.setPassword(password);

        this.jdbcTemplate = new JdbcTemplate(conexao);

        try {
            conexao.getConnection();
            System.out.println("Conexão com o banco de dados realizada com sucesso!");
        } catch (Exception e) {
            System.out.println("Erro ao conectar com o banco!");
            NotificacaoErroService erro = new NotificacaoErroService(LocalDateTime.now(),
                    "ERRO",
                    "Erro ao conectar com o banco: " + e.getMessage(),
                    "Nenhuma");
            erro.notificar();
            e.printStackTrace();
        }
    }

    public JdbcTemplate getJdbcTemplate() {
        return jdbcTemplate;
    }

    public BasicDataSource getConexao() {
        return conexao;
    }
}