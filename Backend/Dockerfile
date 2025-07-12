FROM maven:3-eclipse-temurin-23 AS build
COPY . .
RUN mvn clean package -DskipTests
FROM eclipse-temurin:23.0.2_7-jdk-alpine
COPY --from=build /target/*.jar demo.jar
EXPOSE 8080
ENTRYPOINT [ "java","-jar","demo.jar" ]