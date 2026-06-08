package com.plustourists.model;

import com.plustourists.service.EmailService;

public class Email {
    public static void enviarEmail(String destinatario, Integer quantidade, String nome) {
        String assunto =
                "[PlusTourists] Planos pendentes para aprovação";

        String corpo = """
                Bom dia, %s
                
                Existem %s planos aguardando aprovação.
                
                Acesse o sistema para análise.
                """
                .formatted(nome, quantidade);

        EmailService.enviar(destinatario, assunto, corpo);
    }
}
