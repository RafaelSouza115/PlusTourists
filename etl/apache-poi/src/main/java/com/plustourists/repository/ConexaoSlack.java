package com.plustourists.repository;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ConexaoSlack {
    private static HttpClient client = HttpClient.newHttpClient();
    private static final String url = System.getenv("SLACK_ETL");

    public static void enviarNotificacao(String content) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder(URI.create(url))
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(content))
                .build();
        HttpResponse<String> response =
                client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println(response.statusCode());
        System.out.println(response.body());
    }
}
