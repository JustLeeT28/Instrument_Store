package com.store.be_api;

import org.springframework.core.env.Environment;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

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
