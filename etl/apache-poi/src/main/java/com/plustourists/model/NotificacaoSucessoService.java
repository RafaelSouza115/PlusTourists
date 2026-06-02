package com.plustourists.model;

import com.plustourists.repository.ConexaoSlack;

import java.io.IOException;
import java.time.LocalDateTime;

public class NotificacaoSucessoService extends Notificacao {
    private final String nome;

    public NotificacaoSucessoService(LocalDateTime dataHora, String nivel, String descricao, String nome) {
        super(dataHora, nivel, descricao);
        this.nome = nome;
    }

    @Override
    public void notificar() {
        String mensagem =
                "{\"text\":\"" +
                        getdataHora() + " [" + getnivel() + "]\\n" +
                        "Finalizado o processamento da base: " + nome + "\\n" +
                        getDescricao() +
                        "\"}";
        try {
            ConexaoSlack.enviarNotificacao(mensagem);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
