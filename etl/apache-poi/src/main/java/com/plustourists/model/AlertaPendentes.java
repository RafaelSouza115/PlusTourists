package com.plustourists.model;

public class AlertaPendentes {
    private String email;
    private String nome;
    private String razaoSocial;
    private Integer qtdPendentes;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String nomeFantasia) {
        this.razaoSocial = razaoSocial;
    }

    public Integer getQtdPendentes() {
        return qtdPendentes;
    }

    public void setQtdPendentes(Integer qtdPendentes) {
        this.qtdPendentes = qtdPendentes;
    }
}
