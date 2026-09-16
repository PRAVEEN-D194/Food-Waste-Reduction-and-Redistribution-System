package com.foodrescue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
@EnableScheduling
public class FoodRescueApplication {

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(FoodRescueApplication.class, args);
        System.out.println("\n=======================================================");
        System.out.println("  FoodRescue Web Application Started Successfully!  ");
        System.out.println("  Access Dashboard: http://localhost:8080/            ");
        System.out.println("=======================================================\n");
    }

    private static void loadDotenv() {
        File envFile = new File(".env");
        if (!envFile.exists()) {
            return;
        }
        try {
            List<String> lines = Files.readAllLines(envFile.toPath());
            for (String line : lines) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#") || !trimmed.contains("=")) {
                    continue;
                }
                int idx = trimmed.indexOf('=');
                String key = trimmed.substring(0, idx).trim();
                String value = trimmed.substring(idx + 1).trim();
                // Strip quotes if present
                if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1);
                }
                // Set system property if not already set by JVM argument
                if (System.getProperty(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (Exception e) {
            System.err.println("Note: Could not load .env file: " + e.getMessage());
        }
    }
}
