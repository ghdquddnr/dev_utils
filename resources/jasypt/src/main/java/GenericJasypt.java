import org.jasypt.encryption.pbe.PooledPBEStringEncryptor;
import org.jasypt.encryption.pbe.config.SimpleStringPBEConfig;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.security.Security;

/**
 * GenericJasypt CLI Tool
 *
 * Jasypt 암호화/복호화 CLI 도구
 * Bouncy Castle Provider를 사용하여 다양한 알고리즘을 지원합니다.
 *
 * 사용법:
 * java -jar GenericJasypt.jar <mode> <text> <password> <algorithm> <outputType> <poolSize>
 *
 * 예제:
 * java -jar GenericJasypt.jar encrypt "myPlainText" "mySecretKey" "PBEWithSHA256And128BitAES-CBC-BC" "hexadecimal" "1"
 * java -jar GenericJasypt.jar decrypt "ENC(8a2f3b...)" "mySecretKey" "PBEWithSHA256And128BitAES-CBC-BC" "hexadecimal" "1"
 */
public class GenericJasypt {

    public static void main(String[] args) {
        // Bouncy Castle Provider 등록
        Security.addProvider(new BouncyCastleProvider());

        // 인자 개수 검증
        if (args.length < 6) {
            System.err.println("Error: Missing arguments");
            System.err.println("Usage: java -jar GenericJasypt.jar <mode> <text> <password> <algorithm> <outputType> <poolSize>");
            System.err.println("  mode: encrypt | decrypt");
            System.err.println("  text: plain text or encrypted text");
            System.err.println("  password: secret key");
            System.err.println("  algorithm: encryption algorithm (e.g., PBEWithSHA256And128BitAES-CBC-BC)");
            System.err.println("  outputType: hexadecimal | base64");
            System.err.println("  poolSize: 1-10");
            System.exit(1);
            return;
        }

        // 인자 파싱
        String mode = args[0].trim().toLowerCase();
        String text = args[1].trim();
        String password = args[2].trim();
        String algorithm = args[3].trim();
        String outputType = args[4].trim().toLowerCase();
        String poolSizeStr = args[5].trim();

        // 모드 검증
        if (!mode.equals("encrypt") && !mode.equals("decrypt")) {
            System.err.println("Error: Invalid mode. Use 'encrypt' or 'decrypt'");
            System.exit(1);
            return;
        }

        // 출력 타입 검증
        if (!outputType.equals("hexadecimal") && !outputType.equals("base64")) {
            System.err.println("Error: Invalid outputType. Use 'hexadecimal' or 'base64'");
            System.exit(1);
            return;
        }

        // PoolSize 파싱 및 검증
        int poolSize;
        try {
            poolSize = Integer.parseInt(poolSizeStr);
            if (poolSize < 1 || poolSize > 10) {
                System.err.println("Error: Invalid poolSize. Must be between 1 and 10");
                System.exit(1);
                return;
            }
        } catch (NumberFormatException e) {
            System.err.println("Error: Invalid poolSize format. Must be a number");
            System.exit(1);
            return;
        }

        // 빈 입력 검증
        if (text.isEmpty()) {
            System.err.println("Error: Input text is empty");
            System.exit(1);
            return;
        }

        if (password.isEmpty()) {
            System.err.println("Error: Password is empty");
            System.exit(1);
            return;
        }

        try {
            // Jasypt Encryptor 설정
            PooledPBEStringEncryptor encryptor = new PooledPBEStringEncryptor();
            SimpleStringPBEConfig config = new SimpleStringPBEConfig();

            // Bouncy Castle Provider 설정
            config.setProvider(new BouncyCastleProvider());
            config.setPassword(password);
            config.setAlgorithm(algorithm);
            config.setKeyObtentionIterations("1000");
            config.setPoolSize(poolSize);

            // 출력 타입 설정 (hexadecimal 또는 base64)
            if (outputType.equals("hexadecimal")) {
                config.setStringOutputType("hexadecimal");
            } else {
                config.setStringOutputType("base64");
            }

            encryptor.setConfig(config);

            // 암호화 또는 복호화 실행
            String result;
            if (mode.equals("encrypt")) {
                result = encryptor.encrypt(text);
            } else {
                // ENC() 래퍼 제거 (이미 API에서 제거되지만 안전장치로)
                String cleanText = text;
                if (text.startsWith("ENC(") && text.endsWith(")")) {
                    cleanText = text.substring(4, text.length() - 1);
                }
                result = encryptor.decrypt(cleanText);
            }

            // 결과 출력
            System.out.println(result);
            System.exit(0);

        } catch (org.jasypt.exceptions.EncryptionOperationNotPossibleException e) {
            // 복호화 실패 (잘못된 키 또는 알고리즘)
            System.err.println("Error: Decryption failed - Invalid key or algorithm");
            System.err.println("Details: " + e.getMessage());
            System.exit(1);

        } catch (IllegalArgumentException e) {
            // 잘못된 알고리즘 또는 설정
            System.err.println("Error: Invalid algorithm or configuration");
            System.err.println("Details: " + e.getMessage());
            System.exit(1);

        } catch (Exception e) {
            // 기타 예외
            System.err.println("Error: Invalid input format or unexpected error");
            System.err.println("Details: " + e.getMessage());
            e.printStackTrace(System.err);
            System.exit(1);
        }
    }
}
