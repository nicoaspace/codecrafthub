import datetime
import json
import os
from flask import Flask, jsonify, request

app = Flask(__name__)

# File path for storing course data
DATA_FILE = os.path.join(os.path.dirname(__file__), "courses.json")

# Set of allowed status values
VALID_STATUSES = {"Not Started", "In Progress", "Completed"}


# ============================================================================
# HELPER FUNCTIONS: JSON File Storage & Validation
# ============================================================================

def init_storage():
    """
    Ensure courses.json exists. If not, create it with an empty list.
    """
    if not os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump([], f, indent=2)
        except OSError as err:
            app.logger.error(f"Failed to initialize storage file: {err}")


def load_courses():
    """
    Read all courses from courses.json.
    Returns a list of course dictionaries.
    Raises IOError/json.JSONDecodeError on failure.
    """
    init_storage()
    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, OSError) as err:
        app.logger.error(f"Error reading {DATA_FILE}: {err}")
        raise IOError(f"Could not read database file: {err}")


def save_courses(courses):
    """
    Write the entire list of courses back to courses.json.
    Raises IOError on failure.
    """
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(courses, f, indent=2)
    except OSError as err:
        app.logger.error(f"Error writing to {DATA_FILE}: {err}")
        raise IOError(f"Could not write to database file: {err}")


def validate_date(date_str):
    """
    Helper function to validate date format (YYYY-MM-DD).
    Returns True if valid, False otherwise.
    """
    try:
        datetime.datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except (ValueError, TypeError):
        return False


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.route("/api/courses", methods=["GET"])
def get_all_courses():
    """
    Endpoint: GET /api/courses
    Description: Retrieve all stored courses.
    Response: List of course objects with HTTP 200 OK.
    """
    try:
        courses = load_courses()
        return jsonify({
            "status": "success",
            "count": len(courses),
            "data": courses
        }), 200
    except IOError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/courses/stats", methods=["GET"])
def get_course_stats():
    """
    Endpoint: GET /api/courses/stats
    Description: Return statistics about courses (total and count by status).
    Response: JSON statistics object with HTTP 200 OK.
    """
    try:
        courses = load_courses()
        total_courses = len(courses)

        # Count occurrences of each status
        status_counts = {
            "Not Started": 0,
            "In Progress": 0,
            "Completed": 0
        }

        for course in courses:
            status = course.get("status")
            if status in status_counts:
                status_counts[status] += 1
            else:
                status_counts[status] = status_counts.get(status, 0) + 1

        return jsonify({
            "status": "success",
            "total_courses": total_courses,
            "by_status": status_counts
        }), 200
    except IOError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/courses/<int:course_id>", methods=["GET"])
def get_course_by_id(course_id):
    """
    Endpoint: GET /api/courses/<id>
    Description: Retrieve a specific course by its unique numeric ID.
    Response: Course object with HTTP 200 OK, or HTTP 404 if not found.
    """
    try:
        courses = load_courses()
    except IOError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    # Search for course matching course_id
    course = next((c for c in courses if c["id"] == course_id), None)
    if not course:
        return jsonify({
            "status": "error",
            "message": f"Course with ID {course_id} not found."
        }), 404

    return jsonify({
        "status": "success",
        "data": course
    }), 200


@app.route("/api/courses", methods=["POST"])
def create_course():
    """
    Endpoint: POST /api/courses
    Description: Add a new course.
    Required Body JSON Fields:
      - name (string)
      - description (string)
      - target_date (string formatted as YYYY-MM-DD)
      - status (string: "Not Started", "In Progress", or "Completed")
    Response: Newly created course object with HTTP 201 Created.
    """
    # Parse request payload as JSON
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid JSON format or missing request body."
        }), 400

    # 1. Validate required fields presence and non-emptiness
    required_fields = ["name", "description", "target_date", "status"]
    missing = [f for f in required_fields if f not in data or str(data[f]).strip() == ""]
    if missing:
        return jsonify({
            "status": "error",
            "message": f"Missing or empty required field(s): {', '.join(missing)}"
        }), 400

    name = str(data["name"]).strip()
    description = str(data["description"]).strip()
    target_date = str(data["target_date"]).strip()
    status = str(data["status"]).strip()

    # 2. Validate status value
    if status not in VALID_STATUSES:
        return jsonify({
            "status": "error",
            "message": f"Invalid status '{status}'. Must be one of: {sorted(list(VALID_STATUSES))}"
        }), 400

    # 3. Validate target_date format (YYYY-MM-DD)
    if not validate_date(target_date):
        return jsonify({
            "status": "error",
            "message": "Invalid 'target_date' format. Expected format is YYYY-MM-DD (e.g., 2026-12-31)."
        }), 400

    try:
        courses = load_courses()

        # Generate auto-incremented ID starting from 1
        new_id = max([c["id"] for c in courses], default=0) + 1

        # Current ISO 8601 timestamp
        now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()

        new_course = {
            "id": new_id,
            "name": name,
            "description": description,
            "target_date": target_date,
            "status": status,
            "created_at": now_utc
        }

        courses.append(new_course)
        save_courses(courses)

        return jsonify({
            "status": "success",
            "message": "Course created successfully.",
            "data": new_course
        }), 201

    except IOError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/courses/<int:course_id>", methods=["PUT"])
def update_course(course_id):
    """
    Endpoint: PUT /api/courses/<id>
    Description: Update an existing course.
    Body JSON Fields (all optional, but at least one must be provided):
      - name (string)
      - description (string)
      - target_date (string formatted as YYYY-MM-DD)
      - status (string: "Not Started", "In Progress", or "Completed")
    Response: Updated course object with HTTP 200 OK.
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "Invalid JSON format or missing request body."
        }), 400

    try:
        courses = load_courses()
    except IOError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    # Find the target course
    course = next((c for c in courses if c["id"] == course_id), None)
    if not course:
        return jsonify({
            "status": "error",
            "message": f"Course with ID {course_id} not found."
        }), 404

    # Validate status if provided
    if "status" in data:
        status = str(data["status"]).strip()
        if status not in VALID_STATUSES:
            return jsonify({
                "status": "error",
                "message": f"Invalid status '{status}'. Must be one of: {sorted(list(VALID_STATUSES))}"
            }), 400
        course["status"] = status

    # Validate target_date if provided
    if "target_date" in data:
        target_date = str(data["target_date"]).strip()
        if not validate_date(target_date):
            return jsonify({
                "status": "error",
                "message": "Invalid 'target_date' format. Expected format is YYYY-MM-DD (e.g., 2026-12-31)."
            }), 400
        course["target_date"] = target_date

    # Update name and description if provided
    if "name" in data:
        name = str(data["name"]).strip()
        if not name:
            return jsonify({"status": "error", "message": "'name' cannot be empty."}), 400
        course["name"] = name

    if "description" in data:
        desc = str(data["description"]).strip()
        if not desc:
            return jsonify({"status": "error", "message": "'description' cannot be empty."}), 400
        course["description"] = desc

    try:
        save_courses(courses)
        return jsonify({
            "status": "success",
            "message": "Course updated successfully.",
            "data": course
        }), 200
    except IOError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/courses/<int:course_id>", methods=["DELETE"])
def delete_course(course_id):
    """
    Endpoint: DELETE /api/courses/<id>
    Description: Delete an existing course by its ID.
    Response: Success message with HTTP 200 OK, or HTTP 404 if not found.
    """
    try:
        courses = load_courses()
    except IOError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

    # Filter out the target course
    updated_courses = [c for c in courses if c["id"] != course_id]

    if len(updated_courses) == len(courses):
        return jsonify({
            "status": "error",
            "message": f"Course with ID {course_id} not found."
        }), 404

    try:
        save_courses(updated_courses)
        return jsonify({
            "status": "success",
            "message": f"Course with ID {course_id} has been deleted."
        }), 200
    except IOError as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ============================================================================
# RUN SERVER
# ============================================================================

if __name__ == "__main__":
    # Ensure courses.json is ready on launch
    init_storage()
    print("\n- CodeCraftHub API is starting...")
    print(f"- Data will be stored in: {DATA_FILE}")
    print("- API will be available at: http://localhost:5000\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
