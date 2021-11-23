FROM maven:3.6.0-jdk-11-slim as builder

WORKDIR /app
COPY . .

RUN mvn -f /app/keycloak-theme/pom.xml install

FROM quay.io/keycloak/keycloak:15.0.2
ENV KEYCLOAK_DEFAULT_THEME=cmco
COPY --from=builder /app/keycloak-theme/target/classes /opt/jboss/keycloak/themes/cmco

EXPOSE 8080
