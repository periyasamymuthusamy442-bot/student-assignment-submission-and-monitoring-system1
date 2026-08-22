FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .

# Download the MongoDB Java driver jars (same 3 jars mentioned in lib/README.txt).
# -f makes curl fail loudly (non-zero exit) on any HTTP error instead of
# silently saving an error page as the jar, which was causing javac to fail
# later with "cannot find symbol" / "package does not exist" errors.
RUN rm -rf lib && mkdir -p lib && \
    curl -fSL -o lib/mongodb-driver-sync-5.9.2.jar https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-sync/5.9.2/mongodb-driver-sync-5.9.2.jar && \
    curl -fSL -o lib/mongodb-driver-core-5.9.2.jar https://repo1.maven.org/maven2/org/mongodb/mongodb-driver-core/5.9.2/mongodb-driver-core-5.9.2.jar && \
    curl -fSL -o lib/bson-5.9.2.jar https://repo1.maven.org/maven2/org/mongodb/bson/5.9.2/bson-5.9.2.jar && \
    ls -la lib/

RUN javac -cp "lib/*" -d out $(find src -name "*.java")

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/out ./out
COPY --from=build /app/lib ./lib
COPY --from=build /app/frontend ./frontend
COPY --from=build /app/data ./data

EXPOSE 8080
CMD ["java", "-cp", "out:lib/*", "Main"]
