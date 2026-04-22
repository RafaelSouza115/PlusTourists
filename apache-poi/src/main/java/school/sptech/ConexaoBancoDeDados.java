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
        conexao.setUrl("jdbc:mysql://127.0.0.1:3306/plusTourists");
        conexao.setUsername("cesar");
        conexao.setPassword("urubu100");

        this.conexao= conexao;
        this.jdbcTemplate = new JdbcTemplate(conexao);
        if(this.jdbcTemplate != null){
            System.out.println("Conexão realizada com sucesso!");
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
