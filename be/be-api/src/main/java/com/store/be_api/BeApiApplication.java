package com.store.be_api;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.env.Environment;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;

@SpringBootApplication
public class BeApiApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();
        for (DotenvEntry entry : dotenv.entries()) {
            if (System.getenv(entry.getKey()) == null && System.getProperty(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        }
        System.out.println("DB_URL=" + System.getenv("DB_URL"));
        System.out.println("SPRING_DATASOURCE_URL=" + System.getenv("SPRING_DATASOURCE_URL"));
        SpringApplication.run(BeApiApplication.class, args);
    }

    @Bean
    CommandLineRunner printEnv(Environment env) {
        return args -> {
            System.out.println("URL = " + env.getProperty("spring.datasource.url"));
            System.out.println("USER = " + env.getProperty("spring.datasource.username"));
        };
    }
}
