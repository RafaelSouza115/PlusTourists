package com.plustourists.service;

import com.plustourists.config.S3Provider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.File;
import java.io.InputStream;
import java.util.List;

public class S3Service {

    private static final String BUCKET_NAME = "plustourists-s3";
    private final S3Client s3Client;

    public S3Service() {
        S3Provider provider = new S3Provider();
        this.s3Client = provider.getS3Client();
    }

    public void criarBucket() {
        try {
            s3Client.createBucket(CreateBucketRequest.builder()
                    .bucket(BUCKET_NAME)
                    .build());

            System.out.println("Bucket criado!");
        } catch (S3Exception e) {
            System.out.println("Bucket já existe ou erro: " + e.awsErrorDetails().errorMessage());
        }
    }

    public void uploadArquivo(String nomeArquivo) {
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
    }

    public List<S3Object> listarArquivos() {
        return s3Client.listObjects(
                ListObjectsRequest.builder()
                        .bucket(BUCKET_NAME)
                        .build()
        ).contents();
    }

    public InputStream baixarArquivo(String key) {
        return s3Client.getObject(
                GetObjectRequest.builder()
                        .bucket(BUCKET_NAME)
                        .key(key)
                        .build()
        );
    }
}