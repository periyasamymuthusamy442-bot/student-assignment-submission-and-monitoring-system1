package model;

// Represents one Student record (loaded from data/students.txt)
public class Student {
    private String studentId;
    private String name;
    private String email;
    private String password;
    private String department;

    public Student(String studentId, String name, String email, String password) {
        this(studentId, name, email, password, "Computer Science");
    }

    public Student(String studentId, String name, String email, String password, String department) {
        this.studentId = studentId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.department = (department == null || department.trim().isEmpty())
                ? "Computer Science" : department;
    }

    public String getStudentId() { return studentId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getDepartment() { return department; }

    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setDepartment(String department) { this.department = department; }

    // Converts object back to the pipe-separated line format used in students.txt
    // Format: studentId|name|email|password|department
    public String toFileLine() {
        return studentId + "|" + name + "|" + email + "|" + password + "|" + department;
    }
}
