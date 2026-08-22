package model;

// Represents one Assignment record (loaded from data/assignments.txt)
public class Assignment {
    private String assignmentId;
    private String title;
    private String description;
    private String dueDate; // format: yyyy-MM-dd
    private String dueTime; // format: HH:mm

    public Assignment(String assignmentId, String title, String description, String dueDate, String dueTime) {
        this.assignmentId = assignmentId;
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.dueTime = dueTime;
    }

    public String getAssignmentId() { return assignmentId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getDueDate() { return dueDate; }
    public String getDueTime() { return dueTime; }

    // Combines date + time into one string usable for comparison with "now"
    public String getDueDateTime() {
        return dueDate + " " + dueTime;
    }

    public String toFileLine() {
        return assignmentId + "|" + title + "|" + description + "|" + dueDate + "|" + dueTime;
    }
}
