package service;

import model.Alert;
import org.bson.Document;
import util.MongoManager;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class AlertService {

    private static final String COLLECTION = "alerts";
    private static final DateTimeFormatter SAVE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<Alert> getAllAlerts() {
        List<Alert> list = new ArrayList<>();

        for (Document doc : MongoManager.readAll(COLLECTION)) {
            list.add(new Alert(
                    doc.getString("studentId"),
                    doc.getString("assignmentId"),
                    doc.getString("message"),
                    doc.getString("dateTime")
            ));
        }
        return list;
    }

    public List<Alert> getAlertsForStudent(String studentId) {
        List<Alert> result = new ArrayList<>();
        for (Alert a : getAllAlerts()) {
            if (a.getStudentId().equalsIgnoreCase(studentId)) {
                result.add(a);
            }
        }
        return result;
    }

    // Called when Admin clicks "Send Alert" for a student who hasn't submitted
    public Alert sendAlert(String studentId, String assignmentId, String message) {
        String now = LocalDateTime.now().format(SAVE_FORMAT);
        Alert alert = new Alert(studentId, assignmentId, message, now);

        Document doc = new Document("studentId", alert.getStudentId())
                .append("assignmentId", alert.getAssignmentId())
                .append("message", alert.getMessage())
                .append("dateTime", alert.getDateTime());

        MongoManager.insertOne(COLLECTION, doc);
        return alert;
    }
}
