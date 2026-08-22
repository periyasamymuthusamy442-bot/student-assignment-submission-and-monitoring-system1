package model;

// Represents one Alert/reminder record (loaded from data/alerts.txt)
public class Alert {
    private String studentId;
    private String assignmentId;
    private String message;
    private String dateTime;

    public Alert(String studentId, String assignmentId, String message, String dateTime) {
        this.studentId = studentId;
        this.assignmentId = assignmentId;
        this.message = message;
        this.dateTime = dateTime;
    }

    public String getStudentId() { return studentId; }
    public String getAssignmentId() { return assignmentId; }
    public String getMessage() { return message; }
    public String getDateTime() { return dateTime; }

    public String toFileLine() {
        return studentId + "|" + assignmentId + "|" + message + "|" + dateTime;
    }
}
