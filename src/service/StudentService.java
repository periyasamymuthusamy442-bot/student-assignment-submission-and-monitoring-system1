package service;

import model.Student;
import org.bson.Document;
import util.MongoManager;

import java.util.ArrayList;
import java.util.List;

public class StudentService {

    private static final String COLLECTION = "students";

    // Reads the "students" collection and converts every document into a
    // Student object. Falls back to "Computer Science" if department
    // is missing (covers documents migrated from the old 4-field file format).
    public List<Student> getAllStudents() {
        List<Student> students = new ArrayList<>();

        for (Document doc : MongoManager.readAll(COLLECTION)) {
            String department = doc.getString("department");
            students.add(new Student(
                    doc.getString("studentId"),
                    doc.getString("name"),
                    doc.getString("email"),
                    doc.getString("password"),
                    department == null ? "Computer Science" : department
            ));
        }
        return students;
    }

    public Student getById(String studentId) {
        for (Student s : getAllStudents()) {
            if (s.getStudentId().equalsIgnoreCase(studentId)) {
                return s;
            }
        }
        return null;
    }

    public int getTotalStudents() {
        return getAllStudents().size();
    }

    // Used by the teacher's "Add Student" form. Returns false if a
    // student with this registration number already exists.
    public boolean addStudent(String studentId, String name, String email, String password, String department) {
        if (studentId == null || studentId.trim().isEmpty()) {
            return false;
        }
        if (getById(studentId) != null) {
            return false;
        }

        Student student = new Student(
                studentId.trim(),
                name == null ? "" : name.trim(),
                email == null ? "" : email.trim(),
                password == null ? "" : password.trim(),
                department == null ? "" : department.trim()
        );

        Document doc = new Document("studentId", student.getStudentId())
                .append("name", student.getName())
                .append("email", student.getEmail())
                .append("password", student.getPassword())
                .append("department", student.getDepartment());

        MongoManager.insertOne(COLLECTION, doc);
        return true;
    }
}
