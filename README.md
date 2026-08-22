# Student Assignment Submission & Tracking System

A one-day mini project. Frontend: HTML5 + CSS3 + Vanilla JS.
Backend: Core Java (OOP) + MongoDB — no Spring Boot.

## How to Run

**Requirements:**
- JDK 11+ (any recent Java Development Kit)
- MongoDB running locally on the default port (`mongodb://localhost:27017`) — this is the same server MongoDB Compass connects to.
- The MongoDB Java driver jars (see `lib/README.txt` for the 3 jars to download into `lib/`).

1. Start MongoDB on your machine (e.g. run `mongod`, or start the "MongoDB" service from Windows Services / `brew services start mongodb-community` on Mac). You don't need to create the database or collections yourself — the app creates the `student_assignment_system` database and seeds it automatically on first run.
2. Open a terminal in the `StudentAssignmentSystem` folder.
3. Compile (includes the driver jars from `lib/` on the classpath):
   ```
   javac -cp "lib/*" -d out $(find src -name "*.java")
   ```
   (On Windows, use: `javac -cp "lib/*" -d out src\*.java src\model\*.java src\service\*.java src\server\*.java src\util\*.java`)
4. Run (also needs the jars on the classpath):
   ```
   java -cp "out:lib/*" Main
   ```
   (On Windows, use a semicolon instead of a colon: `java -cp "out;lib/*" Main`)
5. Open your browser at: **http://localhost:8080**

The server serves the frontend directly — no separate web server needed.

## Viewing the data in MongoDB Compass

1. Open MongoDB Compass and connect to `mongodb://localhost:27017` (the default — just click "Connect" if it's already filled in).
2. Look for the **`student_assignment_system`** database in the sidebar.
3. Inside it you'll see 5 collections: `admins`, `students`, `assignments`, `submissions`, `alerts` — one per data type the app uses. Every login, new assignment, submission, and alert the app creates shows up here in real time; just click "Refresh" in Compass after an action in the app.

## Demo Logins

| Role    | ID / Username | Password |
|---------|---------------|----------|
| Admin   | admin         | admin123 |
| Student | S001 (Arun)   | 1234     |
| Student | S002 (Kumar)  | 1234     |
| Student | S003 (Ravi)   | 1234     |

## Notes

- All data is stored in MongoDB (database `student_assignment_system`), not in text files. Data survives restarts as long as MongoDB itself is running.
- The old `data/*.txt` files are kept only as a one-time migration source: on the very first run, if a MongoDB collection is empty, the app imports whatever was in the matching `.txt` file (or seeds small demo data if that file was empty too). After that first run, MongoDB is the only source of truth — editing the `.txt` files afterward has no effect.
- `AS001` (S001 already submitted) is preloaded so you can immediately demo the "submitted vs pending" dashboard view.
- Admin → Create Assignment automatically creates a "Pending" row for every existing student.
- Overdue status is computed live by comparing the assignment deadline to the current time — no background job needed.
