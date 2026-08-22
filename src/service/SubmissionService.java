package service;

import model.Assignment;
import model.Submission;
import org.bson.Document;
import util.MongoManager;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class SubmissionService {

    private static final String COLLECTION = "submissions";
    private static final DateTimeFormatter DEADLINE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter SAVE_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public List<Submission> getAllSubmissions() {
        List<Submission> list = new ArrayList<>();

        for (Document doc : MongoManager.readAll(COLLECTION)) {
            list.add(new Submission(
                    doc.getString("assignmentId"),
                    doc.getString("studentId"),
                    doc.getString("status"),
                    doc.getString("submittedAt")
            ));
        }
        return list;
    }

    // Called right after an admin creates a new assignment.
    // Creates one "Pending" submission row per existing student so that
    // every student automatically sees the assignment as Pending.
    public void initSubmissionsForNewAssignment(String assignmentId, List<String> studentIds) {
        for (String studentId : studentIds) {
            Submission s = new Submission(assignmentId, studentId, "Pending", "-");
            Document doc = new Document("assignmentId", s.getAssignmentId())
                    .append("studentId", s.getStudentId())
                    .append("status", s.getStatus())
                    .append("submittedAt", s.getSubmittedAt());
            MongoManager.insertOne(COLLECTION, doc);
        }
    }

    public List<Submission> getByAssignment(String assignmentId) {
        List<Submission> result = new ArrayList<>();
        for (Submission s : getAllSubmissions()) {
            if (s.getAssignmentId().equalsIgnoreCase(assignmentId)) {
                result.add(s);
            }
        }
        return result;
    }

    public List<Submission> getByStudent(String studentId) {
        List<Submission> result = new ArrayList<>();
        for (Submission s : getAllSubmissions()) {
            if (s.getStudentId().equalsIgnoreCase(studentId)) {
                result.add(s);
            }
        }
        return result;
    }

    public Submission getOne(String assignmentId, String studentId) {
        for (Submission s : getAllSubmissions()) {
            if (s.getAssignmentId().equalsIgnoreCase(assignmentId)
                    && s.getStudentId().equalsIgnoreCase(studentId)) {
                return s;
            }
        }
        return null;
    }

    // Works out the status to actually SHOW to the user.
    // The stored value stays "Pending" in the file, but if the deadline
    // has already passed we display "Overdue" instead, without needing
    // a background job.
    public String getDisplayStatus(Submission submission, Assignment assignment) {
        if (submission == null) return "Pending";
        if ("Submitted".equalsIgnoreCase(submission.getStatus())) {
            return "Submitted";
        }
        if (assignment != null && isPastDeadline(assignment)) {
            return "Overdue";
        }
        return "Pending";
    }

    public boolean isPastDeadline(Assignment assignment) {
        try {
            LocalDateTime deadline = LocalDateTime.parse(assignment.getDueDateTime(), DEADLINE_FORMAT);
            return LocalDateTime.now().isAfter(deadline);
        } catch (Exception e) {
            return false;
        }
    }

    // Marks a submission as Done. Returns false if it was already submitted
    // (prevents duplicate submissions), true on success.
    public boolean markAsDone(String assignmentId, String studentId) {
        List<Submission> all = getAllSubmissions();
        boolean found = false;

        for (Submission s : all) {
            if (s.getAssignmentId().equalsIgnoreCase(assignmentId)
                    && s.getStudentId().equalsIgnoreCase(studentId)) {

                if ("Submitted".equalsIgnoreCase(s.getStatus())) {
                    return false; // already submitted, block duplicate
                }
                s.setStatus("Submitted");
                s.setSubmittedAt(LocalDateTime.now().format(SAVE_FORMAT));
                found = true;
                break;
            }
        }

        if (!found) {
            // No row existed yet (e.g. student added after assignment was created)
            Submission s = new Submission(assignmentId, studentId, "Submitted",
                    LocalDateTime.now().format(SAVE_FORMAT));
            all.add(s);
        }

        saveAll(all);
        return true;
    }

    private void saveAll(List<Submission> submissions) {
        List<Document> docs = new ArrayList<>();
        for (Submission s : submissions) {
            docs.add(new Document("assignmentId", s.getAssignmentId())
                    .append("studentId", s.getStudentId())
                    .append("status", s.getStatus())
                    .append("submittedAt", s.getSubmittedAt()));
        }
        MongoManager.replaceAll(COLLECTION, docs);
    }

    public int countSubmitted(String assignmentId) {
        int count = 0;
        for (Submission s : getByAssignment(assignmentId)) {
            if ("Submitted".equalsIgnoreCase(s.getStatus())) count++;
        }
        return count;
    }

    public int countNotSubmitted(String assignmentId) {
        int count = 0;
        for (Submission s : getByAssignment(assignmentId)) {
            if (!"Submitted".equalsIgnoreCase(s.getStatus())) count++;
        }
        return count;
    }

    public int getTotalSubmissions() {
        int count = 0;
        for (Submission s : getAllSubmissions()) {
            if ("Submitted".equalsIgnoreCase(s.getStatus())) count++;
        }
        return count;
    }

    public int getTotalPending() {
        int count = 0;
        for (Submission s : getAllSubmissions()) {
            if (!"Submitted".equalsIgnoreCase(s.getStatus())) count++;
        }
        return count;
    }
}
