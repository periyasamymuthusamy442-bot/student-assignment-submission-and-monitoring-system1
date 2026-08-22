package util;

import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

// Runs ONCE, only for collections that are still empty in MongoDB.
// If the old data/*.txt files (from the previous file-based version)
// exist and have data in them, that data is imported so nothing is lost.
// Otherwise, small demo data is inserted so the app isn't empty on first run.
class MigrationUtil {

    private static final String DATA_FOLDER = "data";

    static void migrateIfEmpty(MongoDatabase database) {
        migrateAdmins(database);
        migrateStudents(database);
        migrateAssignments(database);
        migrateSubmissions(database);
        migrateAlerts(database);
    }

    private static void migrateAdmins(MongoDatabase db) {
        if (db.getCollection("admins").countDocuments() > 0) return;

        List<String> lines = readOldFile("admins.txt");
        List<Document> docs = new ArrayList<>();
        for (String line : lines) {
            String[] p = line.split("\\|", -1);
            if (p.length == 3) {
                docs.add(new Document("adminId", p[0]).append("username", p[1]).append("password", p[2]));
            }
        }
        if (docs.isEmpty()) {
            docs.add(new Document("adminId", "A001").append("username", "admin").append("password", "admin123"));
        }
        db.getCollection("admins").insertMany(docs);
        System.out.println("Seeded 'admins' collection (" + docs.size() + " record(s))");
    }

    private static void migrateStudents(MongoDatabase db) {
        if (db.getCollection("students").countDocuments() > 0) return;

        List<String> lines = readOldFile("students.txt");
        List<Document> docs = new ArrayList<>();
        for (String line : lines) {
            String[] p = line.split("\\|", -1);
            if (p.length == 5) {
                docs.add(new Document("studentId", p[0]).append("name", p[1]).append("email", p[2])
                        .append("password", p[3]).append("department", p[4]));
            } else if (p.length == 4) {
                docs.add(new Document("studentId", p[0]).append("name", p[1]).append("email", p[2])
                        .append("password", p[3]).append("department", "Computer Science"));
            }
        }
        if (docs.isEmpty()) {
            docs.add(new Document("studentId", "S001").append("name", "Arun").append("email", "arun@gmail.com")
                    .append("password", "1234").append("department", "Computer Science"));
            docs.add(new Document("studentId", "S002").append("name", "Kumar").append("email", "kumar@gmail.com")
                    .append("password", "1234").append("department", "Computer Science"));
            docs.add(new Document("studentId", "S003").append("name", "Ravi").append("email", "ravi@gmail.com")
                    .append("password", "1234").append("department", "Computer Science"));
        }
        db.getCollection("students").insertMany(docs);
        System.out.println("Seeded 'students' collection (" + docs.size() + " record(s))");
    }

    private static void migrateAssignments(MongoDatabase db) {
        if (db.getCollection("assignments").countDocuments() > 0) return;

        List<String> lines = readOldFile("assignments.txt");
        List<Document> docs = new ArrayList<>();
        for (String line : lines) {
            String[] p = line.split("\\|", -1);
            if (p.length == 5) {
                docs.add(new Document("assignmentId", p[0]).append("title", p[1]).append("description", p[2])
                        .append("dueDate", p[3]).append("dueTime", p[4]));
            }
        }
        if (!docs.isEmpty()) {
            db.getCollection("assignments").insertMany(docs);
            System.out.println("Seeded 'assignments' collection (" + docs.size() + " record(s))");
        }
    }

    private static void migrateSubmissions(MongoDatabase db) {
        if (db.getCollection("submissions").countDocuments() > 0) return;

        List<String> lines = readOldFile("submissions.txt");
        List<Document> docs = new ArrayList<>();
        for (String line : lines) {
            String[] p = line.split("\\|", -1);
            if (p.length == 4) {
                docs.add(new Document("assignmentId", p[0]).append("studentId", p[1])
                        .append("status", p[2]).append("submittedAt", p[3]));
            }
        }
        if (!docs.isEmpty()) {
            db.getCollection("submissions").insertMany(docs);
            System.out.println("Seeded 'submissions' collection (" + docs.size() + " record(s))");
        }
    }

    private static void migrateAlerts(MongoDatabase db) {
        if (db.getCollection("alerts").countDocuments() > 0) return;

        List<String> lines = readOldFile("alerts.txt");
        List<Document> docs = new ArrayList<>();
        for (String line : lines) {
            String[] p = line.split("\\|", -1);
            if (p.length == 4) {
                docs.add(new Document("studentId", p[0]).append("assignmentId", p[1])
                        .append("message", p[2]).append("dateTime", p[3]));
            }
        }
        if (!docs.isEmpty()) {
            db.getCollection("alerts").insertMany(docs);
            System.out.println("Seeded 'alerts' collection (" + docs.size() + " record(s))");
        }
    }

    private static List<String> readOldFile(String fileName) {
        List<String> lines = new ArrayList<>();
        Path filePath = Paths.get(DATA_FOLDER, fileName);
        if (!Files.exists(filePath)) return lines;

        try (BufferedReader reader = new BufferedReader(new FileReader(filePath.toFile()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (!line.trim().isEmpty()) lines.add(line.trim());
            }
        } catch (IOException e) {
            System.out.println("Error reading old file " + fileName + ": " + e.getMessage());
        }
        return lines;
    }
}
