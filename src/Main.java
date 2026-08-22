import server.Server;
import util.MongoManager;

// Entry point of the application.
// Run this class to start the whole Student Assignment Tracking System.
public class Main {
    public static void main(String[] args) throws Exception {
        // Connect to MongoDB (mongodb://localhost:27017, db: student_assignment_system).
        // On first run this also migrates any old data/*.txt data (or seeds demo data).
        MongoManager.init();

        // Close the MongoDB connection cleanly when the app is stopped (Ctrl+C etc.)
        Runtime.getRuntime().addShutdownHook(new Thread(MongoManager::close));

        // Render (and most cloud hosts) assign the port via the PORT
        // environment variable. Falls back to 8080 for local development.
        String portEnv = System.getenv("PORT");
        int port = portEnv != null ? Integer.parseInt(portEnv) : 8080;
        Server.start(port);

        System.out.println("Open your browser at: http://localhost:" + port);
    }
}
