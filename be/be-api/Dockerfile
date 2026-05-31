# syntax=docker/dockerfile:1

FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

COPY . .
RUN chmod +x mvnw \
  && ./mvnw -DskipTests clean package

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/target/*.jar /app/app.jar
EXPOSE 8080

CMD ["java", "-jar", "/app/app.jar"]
