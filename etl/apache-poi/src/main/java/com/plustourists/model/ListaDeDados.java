package com.plustourists.model;

import java.time.LocalDateTime;
import java.util.Date;

public class ListaDeDados {
    //dados eventos
    private String municipio;
    private String regiaoTuristica;
    private String nomeDoEvento;
    private String descricaoDoEvento;
    private String enderecoDoEvento;
    private String mesDeRealizacaoDoEvento;
    private Date dataInicialDoEvento;
    private Date dataFinalDoEvento;
    private LocalDateTime horarioInicioEvento;
    private LocalDateTime horarioFinalevento;
    private String tipoDeEvento;
    private String tipoDePublico;
    private String edicao2025;
    private String edicao2024;
    private String publicoEsperado;
    private String responsavelPelaOrganizacao;
    private String siteDoIngresso;
    private String classificacaoEtaria;

    //dados turistas
    private String viaAcesso;
    private String UF;
    private String pais;
    private String mes;
    private String ano;
    private String chegadas;

    public ListaDeDados(String UF, String municipio, String regiaoTuristica, String nomeDoEvento, String descricaoDoEvento, String enderecoDoEvento, String mesDeRealizacaoDoEvento, Date dataInicialDoEvento, Date dataFinalDoEvento, LocalDateTime horarioInicioEvento, LocalDateTime horarioFinalevento, String tipoDeEvento, String tipoDePublico, String edicao2025, String edicao2024, String publicoEsperado, String responsavelPelaOrganizacao, String siteDoIngresso, String classificacaoEtaria) {
        this.UF = UF;
        this.municipio = municipio;
        this.regiaoTuristica = regiaoTuristica;
        this.nomeDoEvento = nomeDoEvento;
        this.descricaoDoEvento = descricaoDoEvento;
        this.enderecoDoEvento = enderecoDoEvento;
        this.mesDeRealizacaoDoEvento = mesDeRealizacaoDoEvento;
        this.dataInicialDoEvento = dataInicialDoEvento;
        this.dataFinalDoEvento = dataFinalDoEvento;
        this.horarioInicioEvento = horarioInicioEvento;
        this.horarioFinalevento = horarioFinalevento;
        this.tipoDeEvento = tipoDeEvento;
        this.tipoDePublico = tipoDePublico;
        this.edicao2025 = edicao2025;
        this.edicao2024 = edicao2024;
        this.publicoEsperado = publicoEsperado;
        this.responsavelPelaOrganizacao = responsavelPelaOrganizacao;
        this.siteDoIngresso = siteDoIngresso;
        this.classificacaoEtaria = classificacaoEtaria;
    }

    public ListaDeDados(String viaAcesso, String UF, String pais, String mes, String ano, String chegadas) {
        this.viaAcesso = viaAcesso;
        this.UF = UF;
        this.pais = pais;
        this.mes = mes;
        this.ano = ano;
        this.chegadas = chegadas;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getRegiaoTuristica() {
        return regiaoTuristica;
    }

    public void setRegiaoTuristica(String regiaoTuristica) {
        this.regiaoTuristica = regiaoTuristica;
    }

    public String getNomeDoEvento() {
        return nomeDoEvento;
    }

    public void setNomeDoEvento(String nomeDoEvento) {
        this.nomeDoEvento = nomeDoEvento;
    }

    public String getDescricaoDoEvento() {
        return descricaoDoEvento;
    }

    public void setDescricaoDoEvento(String descricaoDoEvento) {
        this.descricaoDoEvento = descricaoDoEvento;
    }

    public String getEnderecoDoEvento() {
        return enderecoDoEvento;
    }

    public void setEnderecoDoEvento(String enderecoDoEvento) {
        this.enderecoDoEvento = enderecoDoEvento;
    }

    public String getMesDeRealizacaoDoEvento() {
        return mesDeRealizacaoDoEvento;
    }

    public void setMesDeRealizacaoDoEvento(String mesDeRealizacaoDoEvento) {
        this.mesDeRealizacaoDoEvento = mesDeRealizacaoDoEvento;
    }

    public Date getDataInicialDoEvento() {
        return dataInicialDoEvento;
    }

    public void setDataInicialDoEvento(Date dataInicialDoEvento) {
        this.dataInicialDoEvento = dataInicialDoEvento;
    }

    public Date getDataFinalDoEvento() {
        return dataFinalDoEvento;
    }

    public void setDataFinalDoEvento(Date dataFinalDoEvento) {
        this.dataFinalDoEvento = dataFinalDoEvento;
    }

    public LocalDateTime getHorarioInicioEvento() {
        return horarioInicioEvento;
    }

    public void setHorarioInicioEvento(LocalDateTime horarioInicioEvento) {
        this.horarioInicioEvento = horarioInicioEvento;
    }

    public LocalDateTime getHorarioFinalevento() {
        return horarioFinalevento;
    }

    public void setHorarioFinalevento(LocalDateTime horarioFinalevento) {
        this.horarioFinalevento = horarioFinalevento;
    }

    public String getTipoDeEvento() {
        return tipoDeEvento;
    }

    public void setTipoDeEvento(String tipoDeEvento) {
        this.tipoDeEvento = tipoDeEvento;
    }

    public String getTipoDePublico() {
        return tipoDePublico;
    }

    public void setTipoDePublico(String tipoDePublico) {
        this.tipoDePublico = tipoDePublico;
    }

    public String getEdicao2025() {
        return edicao2025;
    }

    public void setEdicao2025(String edicao2025) {
        this.edicao2025 = edicao2025;
    }

    public String getEdicao2024() {
        return edicao2024;
    }

    public void setEdicao2024(String edicao2024) {
        this.edicao2024 = edicao2024;
    }

    public String getPublicoEsperado() {
        return publicoEsperado;
    }

    public void setPublicoEsperado(String publicoEsperado) {
        this.publicoEsperado = publicoEsperado;
    }

    public String getResponsavelPelaOrganizacao() {
        return responsavelPelaOrganizacao;
    }

    public void setResponsavelPelaOrganizacao(String responsavelPelaOrganizacao) {
        this.responsavelPelaOrganizacao = responsavelPelaOrganizacao;
    }

    public String getSiteDoIngresso() {
        return siteDoIngresso;
    }

    public void setSiteDoIngresso(String siteDoIngresso) {
        this.siteDoIngresso = siteDoIngresso;
    }

    public String getClassificacaoEtaria() {
        return classificacaoEtaria;
    }

    public void setClassificacaoEtaria(String classificacaoEtaria) {
        this.classificacaoEtaria = classificacaoEtaria;
    }

    public String getViaAcesso() {
        return viaAcesso;
    }

    public void setViaAcesso(String viaAcesso) {
        this.viaAcesso = viaAcesso;
    }

    public String getUF() {
        return UF;
    }

    public void setUF(String UF) {
        this.UF = UF;
    }

    public String getPais() {
        return pais;
    }

    public void setPais(String pais) {
        this.pais = pais;
    }

    public String getMes() {
        return mes;
    }

    public void setMes(String mes) {
        this.mes = mes;
    }

    public String getAno() {
        return ano;
    }

    public void setAno(String ano) {
        this.ano = ano;
    }

    public String getChegadas() {
        return chegadas;
    }

    public void setChegadas(String chegadas) {
        this.chegadas = chegadas;
    }

    @Override
    public String toString() {
        return "ListaDeDados{" +
                "municipio='" + municipio + '\'' +
                ", regiaoTuristica='" + regiaoTuristica + '\'' +
                ", nomeDoEvento='" + nomeDoEvento + '\'' +
                ", descricaoDoEvento='" + descricaoDoEvento + '\'' +
                ", enderecoDoEvento='" + enderecoDoEvento + '\'' +
                ", mesDeRealizacaoDoEvento='" + mesDeRealizacaoDoEvento + '\'' +
                ", dataInicialDoEvento=" + dataInicialDoEvento +
                ", dataFinalDoEvento=" + dataFinalDoEvento +
                ", horarioInicioEvento=" + horarioInicioEvento +
                ", horarioFinalevento=" + horarioFinalevento +
                ", tipoDeEvento='" + tipoDeEvento + '\'' +
                ", tipoDePublico='" + tipoDePublico + '\'' +
                ", edicao2025=" + edicao2025 +
                ", edicao2024=" + edicao2024 +
                ", publicoEsperado=" + publicoEsperado +
                ", responsavelPelaOrganizacao='" + responsavelPelaOrganizacao + '\'' +
                ", siteDoIngresso='" + siteDoIngresso + '\'' +
                ", classificacaoEtaria='" + classificacaoEtaria + '\'' +
                '}';
    }
}
