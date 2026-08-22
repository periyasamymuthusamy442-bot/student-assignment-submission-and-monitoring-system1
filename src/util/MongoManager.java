package util;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.bson.Document;

import java.util.ArrayList;
import java.util.List;

// Single reusable class that handles ALL MongoDB read/write operations
// for the project. Every service class uses this instead of talking to
// MongoDB directly (avoids duplication) — same role FileManager used to play.
//
// Connects to a LOCAL MongoDB instance (the one MongoDB Compass also
// connects to) at mongodb://localhost:27017
// Single reusable class that handles ALL MongoDB read/write operations
// for the project. Every service class uses this instead of talking to
// MongoDB directly (avoids duplication) — same role FileManager used to play.
//
// Reads the connection string from the MONGODB_URI environment variable
// (set this on Render to your MongoDB Atlas connection string). If it's
// not set, falls back to a local MongoDB instance for local development
// (the same one MongoDB Compass connects to) at mongodb://localhost:27017
public class MongoManager {

    private static final String CONNECTION_STRING =
            System.getenv("MONGODB_URI") != null
                    ? System.getenv("MONGODB_URI")
                    : "mongodb://localhost:27017";
    private static final String DATABASE_NAME = "student_assignment_system";

    private static MongoClient client;
    private static MongoDatabase database;

    // Opens the connection to MongoDB. Call once, right when the app starts.
    public static void init() {
        client = MongoClients.create(CONNECTION_STRING);
        database = client.getDatabase(DATABASE_NAME);
        System.out.println("Connected to MongoDB -> database: " + DATABASE_NAME);

        // If this is the very first run, load in the old demo data (or
        // migrate whatever was in the old data/*.txt files) so nothing
        // is lost when switching from file storage to MongoDB.
        MigrationUtil.migrateIfEmpty(database);
    }

    public static MongoCollection<Document> getCollection(String collectionName) {
        return database.getCollection(collectionName);
    }

    // Reads every document in a collection.
    // (Same purpose FileManager.readLines() used to serve.)
    public static List<Document> readAll(String collectionName) {
        List<Document> docs = new ArrayList<>();
        for (Document doc : getCollection(collectionName).find()) {
            docs.add(doc);
        }
        return docs;
    }

    // Inserts a single new document.
    // (Same purpose FileManager.appendLine() used to serve.)
    public static void insertOne(String collectionName, Document doc) {
        getCollection(collectionName).insertOne(doc);
    }

    // Wipes the collection and re-inserts the full list.
    // (Same purpose FileManager.rewriteFile() used to serve — used when
    // updating an existing record, e.g. changing a submission's status.)
    public static void replaceAll(String collectionName, List<Document> docs) {
        MongoCollection<Document> collection = getCollection(collectionName);
        collection.deleteMany(new Document());
        if (!docs.isEmpty()) {
            collection.insertMany(docs);
        }
    }

    public static long count(String collectionName) {
        return getCollection(collectionName).countDocuments();
    }

    public static void close() {
        if (client != null) client.close();
    }
}
