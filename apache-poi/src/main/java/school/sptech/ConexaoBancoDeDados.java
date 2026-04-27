package school.sptech;


import org.apache.commons.dbcp2.BasicDataSource;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

public class ConexaoBancoDeDados {
    private final JdbcTemplate jdbcTemplate;

    private final BasicDataSource conexao;

    public ConexaoBancoDeDados() {
        BasicDataSource conexao = new BasicDataSource();

        conexao.setDriverClassName("com.mysql.cj.jdbc.Driver");
        String host = System.getenv("DB_HOST");
        conexao.setUrl(
                "jdbc:mysql://" + host + ":3306/plusTourists?rewriteBatchedStatements=true&useSSL=false&allowPublicKeyRetrieval=true"
        );
        conexao.setUsername("root");
        conexao.setPassword("urubu100");

        this.conexao= conexao;
        this.jdbcTemplate = new JdbcTemplate(conexao);
        if(this.jdbcTemplate != null){
            System.out.println("Conexão com o banco de dados realizada com sucesso!");
        }
        else{
            System.out.println("Erro ao conectar com o banco!");
        }
    }

    public JdbcTemplate getJdbcTemplate() {
        return jdbcTemplate;
    }

    public BasicDataSource getConexao() {
        return conexao;
    }
}
