package server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import model.*;
import service.*;
import util.JsonUtil;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

// Simple built-in Java HTTP server (no Spring Boot).
// Serves the frontend static files AND exposes /api/* REST-like endpoints.
public class Server {

    private static final AuthService authService = new AuthService();
    private static final StudentService studentService = new StudentService();
    private static final AssignmentService assignmentService = new AssignmentService();
    private static final SubmissionService submissionService = new SubmissionService();
    private static final AlertService alertService = new AlertService();

    public static void start(int port) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(port), 0);

        // ---- API endpoints ----
        server.createContext("/api/login", Server::handleLogin);
        // Dedicated admin login endpoint used by login.js
        server.createContext("/api/admin/login", Server::handleAdminLogin);
        server.createContext("/api/assignments", Server::handleAssignments);
        server.createContext("/api/submissions", Server::handleSubmissions);
        server.createContext("/api/alerts", Server::handleAlerts);
        server.createContext("/api/dashboard", Server::handleDashboard);
        server.createContext("/api/students", Server::handleStudents);

        // ---- Static frontend files ----
        server.createContext("/", Server::handleStatic);

        server.setExecutor(null);
        server.start();
        System.out.println("Server running at http://localhost:" + port);
    }

    // ================== STATIC FILE SERVING ==================
    private static void handleStatic(HttpExchange ex) throws IOException {
        String path = ex.getRequestURI().getPath();
        if (path.equals("/")) path = "/index.html";

        Path filePath = Paths.get("frontend" + path);
        if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
            String notFound = "404 Not Found";
            ex.sendResponseHeaders(404, notFound.length());
            ex.getResponseBody().write(notFound.getBytes(StandardCharsets.UTF_8));
            ex.close();
            return;
        }

        String contentType = "text/plain";
        if (path.endsWith(".html")) contentType = "text/html";
        else if (path.endsWith(".css")) contentType = "text/css";
        else if (path.endsWith(".js")) contentType = "application/javascript";

        byte[] bytes = Files.readAllBytes(filePath);
        ex.getResponseHeaders().set("Content-Type", contentType);
        ex.sendResponseHeaders(200, bytes.length);
        ex.getResponseBody().write(bytes);
        ex.close();
    }

    // ================== /api/login ==================
    private static void handleLogin(HttpExchange ex) throws IOException {
        if (!ex.getRequestMethod().equalsIgnoreCase("POST")) {
            sendJson(ex, 405, "{\"success\":false,\"message\":\"Method not allowed\"}");
            return;
        }

        Map<String, String> body = JsonUtil.parseFlat(readBody(ex));
        String role = body.getOrDefault("role", "");
        String username = body.getOrDefault("username", "");
        String password = body.getOrDefault("password", "");

        if (role.equalsIgnoreCase("admin")) {
            Admin admin = authService.loginAdmin(username, password);
            if (admin != null) {
                sendJson(ex, 200, "{" + JsonUtil.pair("success", true) + ","
                        + JsonUtil.pair("role", "admin") + ","
                        + JsonUtil.pair("id", admin.getAdminId()) + ","
                        + JsonUtil.pair("name", admin.getUsername()) + "}");
            } else {
                sendJson(ex, 200, "{" + JsonUtil.pair("success", false) + ","
                        + JsonUtil.pair("message", "Invalid admin credentials") + "}");
            }
        } else if (role.equalsIgnoreCase("student")) {
            Student student = authService.loginStudent(username, password);
            if (student != null) {
                sendJson(ex, 200, "{" + JsonUtil.pair("success", true) + ","
                        + JsonUtil.pair("role", "student") + ","
                        + JsonUtil.pair("id", student.getStudentId()) + ","
                        + JsonUtil.pair("name", student.getName()) + ","
                        + JsonUtil.pair("email", student.getEmail()) + ","
                        + JsonUtil.pair("department", student.getDepartment()) + "}");
            } else {
                sendJson(ex, 200, "{" + JsonUtil.pair("success", false) + ","
                        + JsonUtil.pair("message", "Invalid student credentials") + "}");
            }
        } else {
            sendJson(ex, 200, "{" + JsonUtil.pair("success", false) + ","
                    + JsonUtil.pair("message", "Invalid role") + "}");
        }
    }

    // ================== /api/admin/login ==================
    // Supports the frontend request: POST /api/admin/login
    private static void handleAdminLogin(HttpExchange ex) throws IOException {
        if (!ex.getRequestMethod().equalsIgnoreCase("POST")) {
            sendJson(ex, 405,
                    "{\"success\":false,\"message\":\"Method not allowed\"}");
            return;
        }

        Map<String, String> body = JsonUtil.parseFlat(readBody(ex));

        String username = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "");

        if (username.isEmpty() || password.isEmpty()) {
            sendJson(ex, 400,
                    "{\"success\":false,\"message\":\"Username and password are required\"}");
            return;
        }

        Admin admin = authService.loginAdmin(username, password);

        if (admin != null) {
            sendJson(ex, 200,
                    "{"
                    + JsonUtil.pair("success", true) + ","
                    + JsonUtil.pair("role", "admin") + ","
                    + JsonUtil.pair("id", admin.getAdminId()) + ","
                    + JsonUtil.pair("name", admin.getUsername())
                    + "}");
        } else {
            sendJson(ex, 401,
                    "{"
                    + JsonUtil.pair("success", false) + ","
                    + JsonUtil.pair("message", "Invalid admin credentials")
                    + "}");
        }
    }

    // ================== /api/assignments ==================
    private static void handleAssignments(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();

        if (method.equalsIgnoreCase("GET")) {
            List<Assignment> assignments = assignmentService.getAllAssignments();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < assignments.size(); i++) {
                Assignment a = assignments.get(i);
                if (i > 0) sb.append(",");
                sb.append("{")
                  .append(JsonUtil.pair("assignmentId", a.getAssignmentId())).append(",")
                  .append(JsonUtil.pair("title", a.getTitle())).append(",")
                  .append(JsonUtil.pair("description", a.getDescription())).append(",")
                  .append(JsonUtil.pair("dueDate", a.getDueDate())).append(",")
                  .append(JsonUtil.pair("dueTime", a.getDueTime()))
                  .append("}");
            }
            sb.append("]");
            sendJson(ex, 200, sb.toString());

        } else if (method.equalsIgnoreCase("POST")) {
            Map<String, String> body = JsonUtil.parseFlat(readBody(ex));
            String title = body.getOrDefault("title", "");
            String description = body.getOrDefault("description", "");
            String dueDate = body.getOrDefault("dueDate", "");
            String dueTime = body.getOrDefault("dueTime", "");

            Assignment created = assignmentService.createAssignment(title, description, dueDate, dueTime);

            // Auto-create a "Pending" submission row for every existing student
            List<String> studentIds = new ArrayList<>();
            for (Student s : studentService.getAllStudents()) studentIds.add(s.getStudentId());
            submissionService.initSubmissionsForNewAssignment(created.getAssignmentId(), studentIds);

            sendJson(ex, 200, "{" + JsonUtil.pair("success", true) + ","
                    + JsonUtil.pair("assignmentId", created.getAssignmentId()) + "}");
        } else {
            sendJson(ex, 405, "{\"success\":false}");
        }
    }

    // ================== /api/submissions ==================
    private static void handleSubmissions(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();

        if (method.equalsIgnoreCase("GET")) {
            Map<String, String> query = parseQuery(ex.getRequestURI());
            String studentId = query.getOrDefault("studentId", "");

            List<Assignment> assignments = assignmentService.getAllAssignments();
            StringBuilder sb = new StringBuilder("[");
            boolean first = true;
            for (Assignment a : assignments) {
                Submission sub = submissionService.getOne(a.getAssignmentId(), studentId);
                String status = submissionService.getDisplayStatus(sub, a);
                if (!first) sb.append(",");
                sb.append("{")
                  .append(JsonUtil.pair("assignmentId", a.getAssignmentId())).append(",")
                  .append(JsonUtil.pair("title", a.getTitle())).append(",")
                  .append(JsonUtil.pair("description", a.getDescription())).append(",")
                  .append(JsonUtil.pair("dueDate", a.getDueDate())).append(",")
                  .append(JsonUtil.pair("dueTime", a.getDueTime())).append(",")
                  .append(JsonUtil.pair("status", status))
                  .append("}");
                first = false;
            }
            sb.append("]");
            sendJson(ex, 200, sb.toString());

        } else if (method.equalsIgnoreCase("POST")) {
            Map<String, String> body = JsonUtil.parseFlat(readBody(ex));
            String assignmentId = body.getOrDefault("assignmentId", "");
            String studentId = body.getOrDefault("studentId", "");

            boolean ok = submissionService.markAsDone(assignmentId, studentId);
            if (ok) {
                sendJson(ex, 200, "{" + JsonUtil.pair("success", true) + ","
                        + JsonUtil.pair("message", "Assignment submitted successfully!") + "}");
            } else {
                sendJson(ex, 200, "{" + JsonUtil.pair("success", false) + ","
                        + JsonUtil.pair("message", "Already submitted") + "}");
            }
        } else {
            sendJson(ex, 405, "{\"success\":false}");
        }
    }

    // ================== /api/alerts ==================
    private static void handleAlerts(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();

        if (method.equalsIgnoreCase("GET")) {
            Map<String, String> query = parseQuery(ex.getRequestURI());
            String studentId = query.getOrDefault("studentId", "");

            List<Alert> alerts = alertService.getAlertsForStudent(studentId);
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < alerts.size(); i++) {
                Alert a = alerts.get(i);
                if (i > 0) sb.append(",");
                sb.append("{")
                  .append(JsonUtil.pair("assignmentId", a.getAssignmentId())).append(",")
                  .append(JsonUtil.pair("message", a.getMessage())).append(",")
                  .append(JsonUtil.pair("dateTime", a.getDateTime()))
                  .append("}");
            }
            sb.append("]");
            sendJson(ex, 200, sb.toString());

        } else if (method.equalsIgnoreCase("POST")) {
            Map<String, String> body = JsonUtil.parseFlat(readBody(ex));
            String studentId = body.getOrDefault("studentId", "");
            String assignmentId = body.getOrDefault("assignmentId", "");
            String message = body.getOrDefault("message", "");

            alertService.sendAlert(studentId, assignmentId, message);
            sendJson(ex, 200, "{" + JsonUtil.pair("success", true) + "}");
        } else {
            sendJson(ex, 405, "{\"success\":false}");
        }
    }

    // ================== /api/students ==================
    // GET  -> list every registered student (used by the teacher dashboard)
    // POST -> add a new student (used by the teacher's "Add Student" form)
    private static void handleStudents(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod();

        if (method.equalsIgnoreCase("GET")) {
            List<Student> students = studentService.getAllStudents();
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < students.size(); i++) {
                Student s = students.get(i);
                if (i > 0) sb.append(",");
                sb.append("{")
                  .append(JsonUtil.pair("id", s.getStudentId())).append(",")
                  .append(JsonUtil.pair("name", s.getName())).append(",")
                  .append(JsonUtil.pair("email", s.getEmail())).append(",")
                  .append(JsonUtil.pair("department", s.getDepartment()))
                  .append("}");
            }
            sb.append("]");
            sendJson(ex, 200, sb.toString());

        } else if (method.equalsIgnoreCase("POST")) {
            Map<String, String> body = JsonUtil.parseFlat(readBody(ex));

            String studentId = body.getOrDefault("id", body.getOrDefault("studentId", "")).trim();
            String name = body.getOrDefault("name", "").trim();
            String email = body.getOrDefault("email", "").trim();
            String password = body.getOrDefault("password", "").trim();
            String department = body.getOrDefault("department", "").trim();

            if (studentId.isEmpty() || name.isEmpty() || password.isEmpty()) {
                sendJson(ex, 400, "{" + JsonUtil.pair("success", false) + ","
                        + JsonUtil.pair("message", "Registration number, name and password are required") + "}");
                return;
            }

            boolean added = studentService.addStudent(studentId, name, email, password, department);

            if (added) {
                sendJson(ex, 200, "{" + JsonUtil.pair("success", true) + ","
                        + JsonUtil.pair("id", studentId) + ","
                        + JsonUtil.pair("name", name) + ","
                        + JsonUtil.pair("department",
                                department.isEmpty() ? "Computer Science" : department) + "}");
            } else {
                sendJson(ex, 200, "{" + JsonUtil.pair("success", false) + ","
                        + JsonUtil.pair("message", "A student with that registration number already exists") + "}");
            }

        } else {
            sendJson(ex, 405, "{\"success\":false}");
        }
    }

    // ================== /api/dashboard ==================
    private static void handleDashboard(HttpExchange ex) throws IOException {
        int totalStudents = studentService.getTotalStudents();
        int totalAssignments = assignmentService.getTotalAssignments();
        int totalSubmissions = submissionService.getTotalSubmissions();
        int totalPending = submissionService.getTotalPending();

        List<Assignment> assignments = assignmentService.getAllAssignments();
        StringBuilder table = new StringBuilder("[");
        for (int i = 0; i < assignments.size(); i++) {
            Assignment a = assignments.get(i);
            int submitted = submissionService.countSubmitted(a.getAssignmentId());
            int notSubmitted = submissionService.countNotSubmitted(a.getAssignmentId());

            // Build list of pending student names for this assignment
            List<String> pendingNames = new ArrayList<>();
            for (Submission s : submissionService.getByAssignment(a.getAssignmentId())) {
                if (!"Submitted".equalsIgnoreCase(s.getStatus())) {
                    Student st = studentService.getById(s.getStudentId());
                    if (st != null) pendingNames.add(st.getStudentId() + ":" + st.getName());
                }
            }

            if (i > 0) table.append(",");
            table.append("{")
                 .append(JsonUtil.pair("assignmentId", a.getAssignmentId())).append(",")
                 .append(JsonUtil.pair("title", a.getTitle())).append(",")
                 .append(JsonUtil.pair("dueDate", a.getDueDate())).append(",")
                 .append(JsonUtil.pair("dueTime", a.getDueTime())).append(",")
                 .append(JsonUtil.pair("submitted", submitted)).append(",")
                 .append(JsonUtil.pair("notSubmitted", notSubmitted)).append(",")
                 .append("\"pendingStudents\":\"").append(String.join(";", pendingNames)).append("\"")
                 .append("}");
        }
        table.append("]");

        String json = "{"
                + JsonUtil.pair("totalStudents", totalStudents) + ","
                + JsonUtil.pair("totalAssignments", totalAssignments) + ","
                + JsonUtil.pair("totalSubmissions", totalSubmissions) + ","
                + JsonUtil.pair("totalPending", totalPending) + ","
                + "\"assignments\":" + table
                + "}";
        sendJson(ex, 200, json);
    }

    // ================== Helpers ==================
    private static String readBody(HttpExchange ex) throws IOException {
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        byte[] buffer = new byte[1024];
        int length;
        while ((length = ex.getRequestBody().read(buffer)) != -1) {
            result.write(buffer, 0, length);
        }
        return result.toString(StandardCharsets.UTF_8);
    }

    private static Map<String, String> parseQuery(URI uri) {
        Map<String, String> result = new HashMap<>();
        String query = uri.getRawQuery();
        if (query == null) return result;
        for (String pair : query.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                result.put(kv[0], URLDecoderSafe(kv[1]));
            }
        }
        return result;
    }

    private static String URLDecoderSafe(String value) {
        try {
            return java.net.URLDecoder.decode(value, "UTF-8");
        } catch (Exception e) {
            return value;
        }
    }

    private static void sendJson(HttpExchange ex, int statusCode, String json) throws IOException {
        ex.getResponseHeaders().set("Content-Type", "application/json");
        // Allow the frontend to be opened directly without CORS issues during testing
        ex.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(statusCode, bytes.length);
        ex.getResponseBody().write(bytes);
        ex.close();
    }
}
