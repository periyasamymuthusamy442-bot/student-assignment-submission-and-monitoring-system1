package service;

import model.Admin;
import model.Student;
import org.bson.Document;
import util.MongoManager;

public class AuthService {

    private static final String COLLECTION = "admins";

    public Admin loginAdmin(String username, String password) {
        for (Document doc : MongoManager.readAll(COLLECTION)) {
            Admin admin = new Admin(
                    doc.getString("adminId"),
                    doc.getString("username"),
                    doc.getString("password")
            );
            if (admin.getUsername().equals(username) && admin.getPassword().equals(password)) {
                return admin;
            }
        }
        return null;
    }

    public Student loginStudent(String studentId, String password) {
        StudentService studentService = new StudentService();
        Student student = studentService.getById(studentId);

        if (student != null && student.getPassword().equals(password)) {
            return student;
        }
        return null;
    }
}
