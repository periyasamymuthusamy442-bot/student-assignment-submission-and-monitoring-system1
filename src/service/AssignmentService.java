package service;

import model.Assignment;
import org.bson.Document;
import util.MongoManager;

import java.util.ArrayList;
import java.util.List;

public class AssignmentService {

    private static final String COLLECTION = "assignments";

    public List<Assignment> getAllAssignments() {
        List<Assignment> assignments = new ArrayList<>();

        for (Document doc : MongoManager.readAll(COLLECTION)) {
            assignments.add(new Assignment(
                    doc.getString("assignmentId"),
                    doc.getString("title"),
                    doc.getString("description"),
                    doc.getString("dueDate"),
                    doc.getString("dueTime")
            ));
        }
        return assignments;
    }

    public Assignment getById(String assignmentId) {
        for (Assignment a : getAllAssignments()) {
            if (a.getAssignmentId().equalsIgnoreCase(assignmentId)) {
                return a;
            }
        }
        return null;
    }

    // Creates a new assignment with an auto-generated ID like AS001, AS002...
    public Assignment createAssignment(String title, String description, String dueDate, String dueTime) {
        List<Assignment> existing = getAllAssignments();
        int nextNumber = existing.size() + 1;
        String newId = String.format("AS%03d", nextNumber);

        // Guard against duplicate IDs if assignments were ever deleted manually
        while (getById(newId) != null) {
            nextNumber++;
            newId = String.format("AS%03d", nextNumber);
        }

        Assignment assignment = new Assignment(newId, title, description, dueDate, dueTime);

        Document doc = new Document("assignmentId", assignment.getAssignmentId())
                .append("title", assignment.getTitle())
                .append("description", assignment.getDescription())
                .append("dueDate", assignment.getDueDate())
                .append("dueTime", assignment.getDueTime());

        MongoManager.insertOne(COLLECTION, doc);
        return assignment;
    }

    public int getTotalAssignments() {
        return getAllAssignments().size();
    }
}
