# 🚀 CodeCraftHub — Course Tracking REST API

Welcome to **CodeCraftHub**! This is a lightweight, beginner-friendly REST API built with **Python** and **Flask**. It is designed to help developers track their learning journey and course goals without the complexity of external databases or authentication systems.

All course information is stored locally in a human-readable `courses.json` file.

---

## 📖 Table of Contents
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Step-by-Step Installation](#-step-by-step-installation)
- [Running the Application](#-running-the-application)
- [API Endpoints Documentation](#-api-endpoints-documentation)
- [Testing the API](#-testing-the-api)
- [Troubleshooting Common Issues](#-troubleshooting-common-issues)
- [What is a REST API? (Beginner Concepts)](#-what-is-a-rest-api-beginner-concepts)

---

## ✨ Features

- **Full CRUD Operations**: Create, Read, Update, and Delete courses easily.
- **Zero-Database Setup**: Automatically creates and manages a local `courses.json` file.
- **Auto-Generated IDs & Timestamps**: Assigns sequential IDs (`1, 2, 3...`) and UTC timestamps on creation.
- **Data Validation & Error Handling**:
  - Requires all necessary fields (`name`, `description`, `target_date`, `status`).
  - Enforces `YYYY-MM-DD` date formatting.
  - Restricts course status to valid stages: `"Not Started"`, `"In Progress"`, and `"Completed"`.
  - Returns clear HTTP status codes (`200`, `201`, `400`, `404`, `500`) with descriptive JSON error messages.
- **Beginner-Friendly Code**: Thoroughly commented code in `app.py`.

---

## 📂 Project Structure

```text
CodeCraftHub/
├── app.py              # Main Flask application containing all routes, validation, and JSON I/O
├── courses.json        # Local JSON database (auto-created on first run)
├── requirements.txt    # Python dependencies list
├── test_api.sh         # Automated test script with 12 test cases
└── README.md           # Comprehensive project guide and documentation
```

### File Explanations:
- **`app.py`**: The heart of the application. Handles incoming web requests, validates inputs, reads/writes from `courses.json`, and returns JSON responses.
- **`courses.json`**: Acts as your persistent data store. It contains an array of course objects formatted in JSON.
- **`requirements.txt`**: Specifies the Python libraries needed (e.g., Flask).
- **`test_api.sh`**: A shell script you can run in your terminal to quickly verify that all API endpoints work as expected.

---

## 💻 Prerequisites

Make sure you have the following installed on your machine:
- **Python 3.8+** (Check by running: `python3 --version` or `python --version`)
- **pip** (Python package installer)
- **cURL** or an API testing tool like **Postman** / **Thunder Client** (VS Code)

---

## 🛠️ Step-by-Step Installation

### 1. Open Your Terminal & Navigate to the Project Folder
```bash
cd /path/to/CodeCraftHub
```

### 2. (Recommended) Create and Activate a Virtual Environment
A virtual environment keeps your project dependencies isolated.

- **On macOS / Linux**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
- **On Windows**:
  ```bash
  python -m venv venv
  venv\Scripts\activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## ▶️ Running the Application

Start the Flask development server by running:

```bash
python3 app.py
```
*(On Windows, run `python app.py`)*

You will see output similar to:
```text
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

> 💡 **Tip:** Keep this terminal window open while interacting with the API. To stop the server, press `Ctrl + C`.

---

## 📡 API Endpoints Documentation

The base URL for all endpoints is: `http://127.0.0.1:5000`

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/courses` | Create a new course | `201 Created` |
| `GET` | `/api/courses` | Get a list of all courses | `200 OK` |
| `GET` | `/api/courses/stats` | Get course statistics (total & breakdown by status) | `200 OK` |
| `GET` | `/api/courses/<id>` | Get a single course by its ID | `200 OK` / `404 Not Found` |
| `PUT` | `/api/courses/<id>` | Update an existing course | `200 OK` / `404 Not Found` |
| `DELETE` | `/api/courses/<id>` | Delete a course by its ID | `200 OK` / `404 Not Found` |

---

### 1. Create a Course (`POST /api/courses`)

#### Request:
- **Headers:** `Content-Type: application/json`
- **Body JSON:**
```json
{
  "name": "Python Mastery",
  "description": "Master advanced Python patterns and clean code.",
  "target_date": "2026-11-15",
  "status": "In Progress"
}
```

#### cURL Example:
```bash
curl -X POST http://127.0.0.1:5000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python Mastery",
    "description": "Master advanced Python patterns and clean code.",
    "target_date": "2026-11-15",
    "status": "In Progress"
  }'
```

#### Successful Response (`201 Created`):
```json
{
  "status": "success",
  "message": "Course created successfully.",
  "data": {
    "id": 1,
    "name": "Python Mastery",
    "description": "Master advanced Python patterns and clean code.",
    "target_date": "2026-11-15",
    "status": "In Progress",
    "created_at": "2026-10-08T20:30:00.000000+00:00"
  }
}
```

---

### 2. Get All Courses (`GET /api/courses`)

#### cURL Example:
```bash
curl http://127.0.0.1:5000/api/courses
```

#### Successful Response (`200 OK`):
```json
{
  "status": "success",
  "count": 1,
  "data": [
    {
      "id": 1,
      "name": "Python Mastery",
      "description": "Master advanced Python patterns and clean code.",
      "target_date": "2026-11-15",
      "status": "In Progress",
      "created_at": "2026-10-08T20:30:00.000000+00:00"
    }
  ]
}
```

---

### 3. Get Specific Course (`GET /api/courses/<id>`)

#### cURL Example:
```bash
curl http://127.0.0.1:5000/api/courses/1
```

#### Successful Response (`200 OK`):
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "Python Mastery",
    "description": "Master advanced Python patterns and clean code.",
    "target_date": "2026-11-15",
    "status": "In Progress",
    "created_at": "2026-10-08T20:30:00.000000+00:00"
  }
}
```

---

### 4. Update a Course (`PUT /api/courses/<id>`)

You can update any field (`name`, `description`, `target_date`, `status`).

#### cURL Example:
```bash
curl -X PUT http://127.0.0.1:5000/api/courses/1 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed"
  }'
```

#### Successful Response (`200 OK`):
```json
{
  "status": "success",
  "message": "Course updated successfully.",
  "data": {
    "id": 1,
    "name": "Python Mastery",
    "description": "Master advanced Python patterns and clean code.",
    "target_date": "2026-11-15",
    "status": "Completed",
    "created_at": "2026-10-08T20:30:00.000000+00:00"
  }
}
```

---

### 5. Delete a Course (`DELETE /api/courses/<id>`)

#### cURL Example:
```bash
curl -X DELETE http://127.0.0.1:5000/api/courses/1
```

#### Successful Response (`200 OK`):
```json
{
  "status": "success",
  "message": "Course with ID 1 has been deleted."
}
```

---

## 🧪 Testing the API

### Option A: Automated Test Script
While the Flask server is running in one terminal, open a second terminal and run:

```bash
bash test_api.sh
```
This executes **12 comprehensive tests** (happy paths, validation errors, invalid dates, invalid status values, and 404 lookups).

### Option B: Using Postman or Thunder Client
1. Set the Request Method (e.g., `POST`, `GET`, `PUT`, `DELETE`).
2. Enter the URL (e.g., `http://127.0.0.1:5000/api/courses`).
3. For `POST` and `PUT`, go to the **Body** tab, select **raw**, and set type to **JSON**.
4. Paste your JSON payload and click **Send**.

---

## ❓ Troubleshooting Common Issues

### 1. `Address already in use` or `Port 5000 is in use`
- **Cause**: Another service (or a previous instance of Flask) is already running on port 5000.
- **Solution**:
  - Close other running Python terminal tabs.
  - Or change the port in `app.py` at the bottom:
    ```python
    app.run(debug=True, host="127.0.0.1", port=5001)
    ```

### 2. `Connection Refused` when running curl
- **Cause**: The Flask server is not currently running.
- **Solution**: Ensure you ran `python3 app.py` and the terminal says `Running on http://127.0.0.1:5000`.

### 3. `400 Bad Request - Missing or empty required field(s)`
- **Cause**: Your `POST` payload is missing one of the required keys: `name`, `description`, `target_date`, or `status`.
- **Solution**: Ensure you include all four fields and that none of them are empty strings.

### 4. `400 Bad Request - Invalid status`
- **Cause**: The `status` field contains a value other than the allowed 3 choices.
- **Solution**: Status must be exactly `"Not Started"`, `"In Progress"`, or `"Completed"` (case-sensitive).

### 5. `courses.json` has invalid JSON syntax
- **Cause**: Manual edits in `courses.json` may have introduced syntax errors (missing commas, quotes, etc.).
- **Solution**: You can reset the database at any time by replacing `courses.json` with `[]` (an empty array).

---

## 🧠 What is a REST API? (Beginner Concepts)

- **REST (Representational State Transfer)** is a set of rules for web services to communicate.
- **HTTP Methods (Verbs)** tell the server what action to perform:
  - **`GET`**: Retrieve data (safe, does not modify data).
  - **`POST`**: Send data to create a new resource.
  - **`PUT`**: Replace/update an existing resource.
  - **`DELETE`**: Remove a resource.
- **HTTP Status Codes**:
  - `200 OK`: Request succeeded.
  - `201 Created`: Resource was successfully created.
  - `400 Bad Request`: Client sent invalid or missing data.
  - `404 Not Found`: The requested resource ID does not exist.
  - `500 Internal Server Error`: An unexpected server error occurred.
