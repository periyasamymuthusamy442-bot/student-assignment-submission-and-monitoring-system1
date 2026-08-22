package model;

// Represents one Submission record (loaded from data/submissions.txt)
// status can be: "Pending", "Submitted", or "Overdue"
public class Submission {
    private String assignmentId;
    private String studentId;
    private String status;
    private String submittedAt; // "-" if not submitted yet

    public Submission(String assignmentId, String studentId, String status, String submittedAt) {
        this.assignmentId = assignmentId;
        this.studentId = studentId;
        this.status = status;
        this.submittedAt = submittedAt;
    }

    public String getAssignmentId() { return assignmentId; }
    public String getStudentId() { return studentId; }
    public String getStatus() { return status; }
    public String getSubmittedAt() { return submittedAt; }

    public void setStatus(String status) { this.status = status; }
    public void setSubmittedAt(String submittedAt) { this.submittedAt = submittedAt; }

    public String toFileLine() {
        return assignmentId + "|" + studentId + "|" + status + "|" + submittedAt;
    }
}
