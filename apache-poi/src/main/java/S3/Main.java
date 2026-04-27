package S3;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.List;

public class Main {

    private static final String BUCKET_NAME = "turistsbucket";

    public static void main(String[] args) {

        S3Provider provider = new S3Provider();
        S3Client s3Client = provider.getS3Client();

        // 1. Criar bucket (com tratamento)
        try {
            s3Client.createBucket(CreateBucketRequest.builder()
                    .bucket(BUCKET_NAME)
                    .build());

            System.out.println("Bucket criado com sucesso!");
        } catch (S3Exception e) {
            System.out.println("Bucket já existe ou erro: " + e.awsErrorDetails().errorMessage());
        }

        // 2. Upload dos arquivos
        uploadArquivo(s3Client, "chegadas-2025.xlsx");
        uploadArquivo(s3Client, "excel-unificacao.xlsx");

        // 3. Listar objetos
        List<S3Object> objects = s3Client.listObjects(
                ListObjectsRequest.builder()
                        .bucket(BUCKET_NAME)
                        .build()
        ).contents();

        System.out.println("\nArquivos no bucket:");
        for (S3Object object : objects) {
            System.out.println(" - " + object.key());
        }

        // 4. Baixar arquivos
        for (S3Object object : objects) {
            downloadArquivo(s3Client, object.key());
        }

        s3Client.close();
    }

    private static void uploadArquivo(S3Client s3Client, String nomeArquivo) {
        try {
            File file = new File(nomeArquivo);

            if (!file.exists()) {
                System.out.println("Arquivo não encontrado: " + nomeArquivo);
                return;
            }

            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(BUCKET_NAME)
                            .key(nomeArquivo)
                            .build(),
                    RequestBody.fromFile(file)
            );

            System.out.println("Upload feito: " + nomeArquivo);

        } catch (Exception e) {
            System.out.println("Erro ao fazer upload: " + nomeArquivo);
            e.printStackTrace();
        }
    }

    private static void downloadArquivo(S3Client s3Client, String key) {
        try {
            InputStream objectContent = s3Client.getObject(
                    GetObjectRequest.builder()
                            .bucket(BUCKET_NAME)
                            .key(key)
                            .build(),
                    ResponseTransformer.toInputStream()
            );

            File destino = new File("download-" + key);

            Files.copy(objectContent, destino.toPath(), StandardCopyOption.REPLACE_EXISTING);

            System.out.println("Download feito: " + destino.getName());

        } catch (Exception e) {
            System.out.println("Erro ao baixar: " + key);
            e.printStackTrace();
        }
    }
}