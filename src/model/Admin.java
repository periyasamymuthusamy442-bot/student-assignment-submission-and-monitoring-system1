package model;

// Represents one Admin record (loaded from data/admins.txt)
public class Admin {
    private String adminId;
    private String username;
    private String password;

    public Admin(String adminId, String username, String password) {
        this.adminId = adminId;
        this.username = username;
        this.password = password;
    }

    public String getAdminId() { return adminId; }
    public String getUsername() { return username; }
    public String getPassword() { return password; }

    public String toFileLine() {
        return adminId + "|" + username + "|" + password;
    }
}
