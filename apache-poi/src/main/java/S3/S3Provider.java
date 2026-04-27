package S3;

import software.amazon.awssdk.auth.credentials.AwsCredentialsProvider;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.core.sync.ResponseTransformer;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;

import java.io.InputStream;

public class S3Provider {

    private final AwsCredentialsProvider credentials;

    public S3Provider() {
        this.credentials = DefaultCredentialsProvider.create();
    }

    public S3Client getS3Client() {
        return S3Client.builder()
                .region(Region.US_EAST_1)
                .credentialsProvider(credentials)
                .build();
    }

    public InputStream baixarArquivo(String key) {
        S3Client s3Client = getS3Client();

        return s3Client.getObject(
                GetObjectRequest.builder()
                        .bucket("turistsbucket")
                        .key(key)
                        .build(),
                ResponseTransformer.toInputStream()
        );
    }
}
