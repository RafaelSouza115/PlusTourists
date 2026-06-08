package com.plustourists.model;

import com.plustourists.repository.ConexaoSlack;

import java.io.IOException;
import java.time.LocalDateTime;

public class NotificacaoErroService extends Notificacao {
    private String tabelaAfetada;

    public NotificacaoErroService(LocalDateTime dataHora, String status, String descricao, String tabelaAfetada) {
        super(dataHora, status, descricao);
        this.tabelaAfetada = tabelaAfetada;
    }

    @Override
    public void notificar() {
        String mensagem =
                "{\"text\":\"" +
                        getdataHora() + " [" + getnivel() + "]\\n" +
                        "Erro na tabela: " + tabelaAfetada + "\\n" +
                        getDescricao() +
                        "\"}";
        try {
            ConexaoSlack.enviarNotificacao(mensagem);
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
