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
        conexao.setUrl("jdbc:mysql://localhost:3306/plusTourists");
        conexao.setUsername("root");
        conexao.setPassword("La@134dias");

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
