#!/usr/bin/env bash

# ==============================================================================
# CodeCraftHub API Test Script
# Usage: Ensure Flask app is running (python3 app.py), then run: bash test_api.sh
# ==============================================================================

BASE_URL="http://127.0.0.1:5000/api/courses"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_step() {
  echo -e "\n${BLUE}=================================================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}=================================================================${NC}"
}

# 1. HAPPY PATH: Create First Course
print_step "TEST 1: [POST] Create a new course (Python Mastery)"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Python Mastery",
    "description": "Learn advanced Python patterns and clean code.",
    "target_date": "2026-11-15",
    "status": "In Progress"
  }' | json_pp 2>/dev/null || cat

# 2. HAPPY PATH: Create Second Course
print_step "TEST 2: [POST] Create a second course (Flask REST APIs)"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Flask REST APIs",
    "description": "Build robust APIs with Flask and JSON storage.",
    "target_date": "2026-12-01",
    "status": "Not Started"
  }' | json_pp 2>/dev/null || cat

# 3. HAPPY PATH: Get All Courses
print_step "TEST 3: [GET] Retrieve all courses"
curl -s "$BASE_URL" | json_pp 2>/dev/null || cat

# 4. HAPPY PATH: Get Single Course by ID
print_step "TEST 4: [GET] Retrieve course with ID 1"
curl -s "$BASE_URL/1" | json_pp 2>/dev/null || cat

# 5. HAPPY PATH: Update Course
print_step "TEST 5: [PUT] Update course ID 1 to Completed"
curl -s -X PUT "$BASE_URL/1" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed"
  }' | json_pp 2>/dev/null || cat

# 5b. HAPPY PATH: Get Course Statistics
print_step "TEST 5b: [GET] Retrieve course statistics (Total & Breakdown by status)"
curl -s "$BASE_URL/stats" | json_pp 2>/dev/null || cat

# 6. ERROR CASE: Missing Required Field
print_step "TEST 6: [POST Error] Missing 'target_date' field"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Incomplete Course",
    "description": "No target date provided.",
    "status": "Not Started"
  }' | json_pp 2>/dev/null || cat

# 7. ERROR CASE: Invalid Status Value
print_step "TEST 7: [POST Error] Invalid status value ('Almost Done')"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Docker Basics",
    "description": "Learn containerization.",
    "target_date": "2026-10-30",
    "status": "Almost Done"
  }' | json_pp 2>/dev/null || cat

# 8. ERROR CASE: Invalid Date Format
print_step "TEST 8: [POST Error] Invalid date format ('31-12-2026' instead of 'YYYY-MM-DD')"
curl -s -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SQL Fundamentals",
    "description": "Database queries and joins.",
    "target_date": "31-12-2026",
    "status": "Not Started"
  }' | json_pp 2>/dev/null || cat

# 9. ERROR CASE: Non-existent Course on GET
print_step "TEST 9: [GET Error] Request non-existent course (ID: 9999)"
curl -s "$BASE_URL/9999" | json_pp 2>/dev/null || cat

# 10. ERROR CASE: Non-existent Course on PUT
print_step "TEST 10: [PUT Error] Update non-existent course (ID: 9999)"
curl -s -X PUT "$BASE_URL/9999" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed"
  }' | json_pp 2>/dev/null || cat

# 11. HAPPY PATH: Delete Course
print_step "TEST 11: [DELETE] Delete course with ID 2"
curl -s -X DELETE "$BASE_URL/2" | json_pp 2>/dev/null || cat

# 12. ERROR CASE: Delete Already Deleted / Non-existent Course
print_step "TEST 12: [DELETE Error] Delete non-existent course (ID: 2 again)"
curl -s -X DELETE "$BASE_URL/2" | json_pp 2>/dev/null || cat

echo -e "\n${GREEN}All test cases executed!${NC}\n"
