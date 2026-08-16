package com.foodrescue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FoodRescueApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodRescueApplication.class, args);
        System.out.println("\n=======================================================");
        System.out.println("  FoodRescue Web Application Started Successfully!  ");
        System.out.println("  Access Dashboard: http://localhost:8080/            ");
        System.out.println("=======================================================\n");
    }
}
