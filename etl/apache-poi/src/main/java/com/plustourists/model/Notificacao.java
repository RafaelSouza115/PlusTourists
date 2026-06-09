package com.plustourists.model;

import java.time.LocalDateTime;

public abstract class Notificacao {
    private final LocalDateTime dataHora;
    private final String nivel;
    private final String descricao;

    public Notificacao(LocalDateTime dataHora, String nivel, String descricao) {
        this.dataHora = dataHora;
        this.nivel = nivel;
        this.descricao = descricao;
    }

    public abstract void notificar();

    public LocalDateTime getdataHora() {
        return dataHora;
    }

    public String getnivel() {
        return nivel;
    }

    public String getDescricao() {
        return descricao;
    }
}
