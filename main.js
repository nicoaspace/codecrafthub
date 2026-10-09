import './style.css'

const API_URL = 'http://localhost:5000/api/courses'

let courses = []
let editingId = null
let isLoading = false
let message = null

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed']

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function statusBadgeClass(status) {
  if (status === 'Completed') return 'badge-completed'
  if (status === 'In Progress') return 'badge-progress'
  return 'badge-not-started'
}

function showMessage(type, text) {
  message = { type, text }
  render()
  if (type === 'success') {
    setTimeout(() => {
      if (message && message.text === text) {
        message = null
        render()
      }
    }, 4000)
  }
}

function renderForm() {
  const isEditing = editingId !== null
  const editingCourse = isEditing ? courses.find((c) => c.id === editingId) : null

  return `
    <div class="form-card">
      <h2>${isEditing ? 'Edit Course' : 'Add New Course'}</h2>
      <form id="courseForm" class="course-form">
        <div class="form-group">
          <label for="name">Course Name <span class="required">*</span></label>
          <input
            type="text"
            id="name"
            name="name"
            placeholder="e.g. Introduction to JavaScript"
            value="${editingCourse ? escapeHtml(editingCourse.name) : ''}"
            required
          />
        </div>
        <div class="form-group">
          <label for="description">Description <span class="required">*</span></label>
          <textarea
            id="description"
            name="description"
            placeholder="Briefly describe the course content..."
            rows="3"
            required
          >${editingCourse ? escapeHtml(editingCourse.description) : ''}</textarea>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="target_date">Target Date <span class="required">*</span></label>
            <input
              type="date"
              id="target_date"
              name="target_date"
              value="${editingCourse ? editingCourse.target_date || '' : ''}"
              required
            />
          </div>
          <div class="form-group">
            <label for="status">Status <span class="required">*</span></label>
            <select id="status" name="status" required>
              ${STATUS_OPTIONS.map(
                (s) =>
                  `<option value="${s}" ${editingCourse && editingCourse.status === s ? 'selected' : !editingCourse && s === 'Not Started' ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary" ${isLoading ? 'disabled' : ''}>
            ${isEditing ? 'Update Course' : 'Add Course'}
          </button>
          ${isEditing ? '<button type="button" id="cancelEditBtn" class="btn btn-secondary">Cancel</button>' : ''}
        </div>
      </form>
    </div>
  `
}

function renderTable() {
  if (isLoading && courses.length === 0) {
    return `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading courses...</p>
      </div>
    `
  }

  if (courses.length === 0) {
    return `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
        <h3>No courses yet</h3>
        <p>Add your first course to get started on your learning journey!</p>
      </div>
    `
  }

  const rows = courses
    .map(
      (course) => `
      <tr data-id="${course.id}">
        <td class="course-name">${escapeHtml(course.name || '')}</td>
        <td class="course-desc">${escapeHtml(course.description || '')}</td>
        <td class="course-date">${formatDate(course.target_date)}</td>
        <td>
          <span class="status-badge ${statusBadgeClass(course.status)}">${escapeHtml(course.status || 'Not Started')}</span>
        </td>
        <td class="course-created">${formatDate(course.created_at)}</td>
        <td class="course-actions">
          <button class="btn-icon btn-edit" data-action="edit" data-id="${course.id}" title="Edit course">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </button>
          <button class="btn btn-danger" onclick="handleDelete(${course.id})" ${isLoading ? 'disabled' : ''}>Remove</button>
        </td>
      </tr>
    `
    )
    .join('')

  return `
    <div class="table-wrapper">
      <table class="course-table">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Description</th>
            <th>Target Date</th>
            <th>Status</th>
            <th>Created</th>
            <th class="actions-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `
}

function renderMessage() {
  if (!message) return ''
  return `
    <div class="alert alert-${message.type}">
      <span>${escapeHtml(message.text)}</span>
      <button class="alert-close" onclick="this.parentElement.remove()" aria-label="Dismiss">&times;</button>
    </div>
  `
}

function render() {
  const app = document.querySelector('#app')
  app.innerHTML = `
    <header class="app-header">
      <div class="header-content">
        <div class="header-logo">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <h1>CodeCraftHub</h1>
        </div>
        <p class="header-subtitle">Your Learning Management Platform</p>
      </div>
    </header>

    <main class="app-main">
      ${renderMessage()}
      <section class="form-section">
        ${renderForm()}
      </section>
      <section class="table-section">
        <div class="section-header">
          <h2>Your Courses</h2>
          ${courses.length > 0 ? `<span class="course-count">${courses.length} ${courses.length === 1 ? 'course' : 'courses'}</span>` : ''}
        </div>
        ${renderTable()}
      </section>
    </main>

    <footer class="app-footer">
      <p>&copy; 2026 CodeCraftHub &mdash; Manage your learning journey with ease.</p>
    </footer>
  `

  attachEventListeners()
}

function attachEventListeners() {
  const form = document.querySelector('#courseForm')
  if (form) {
    form.addEventListener('submit', handleSubmit)
  }

  const cancelBtn = document.querySelector('#cancelEditBtn')
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      editingId = null
      render()
    })
  }

  document.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id)
      editingId = id
      render()
      document.querySelector('#courseForm')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  })

  document.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id)
      handleDelete(id)
    })
  })
}

function escapeHtml(str) {
  if (str === null || str === undefined) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getFormData() {
  const name = document.querySelector('#name').value.trim()
  const description = document.querySelector('#description').value.trim()
  const target_date = document.querySelector('#target_date').value
  const status = document.querySelector('#status').value
  return { name, description, target_date, status }
}

function validateForm(data) {
  if (!data.name) return 'Course name is required.'
  if (!data.description) return 'Description is required.'
  if (!data.target_date) return 'Target date is required.'
  if (!STATUS_OPTIONS.includes(data.status)) return 'Please select a valid status.'
  return null
}

async function fetchCourses() {
  isLoading = true
  render()
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`Failed to fetch courses (HTTP ${res.status})`)
    const data = await res.json()
    courses = Array.isArray(data) ? data : data.courses || []
  } catch (err) {
    showMessage('error', `Could not load courses: ${err.message}`)
    courses = []
  } finally {
    isLoading = false
    render()
  }
}

async function handleSubmit(e) {
  e.preventDefault()
  const data = getFormData()

  const error = validateForm(data)
  if (error) {
    showMessage('error', error)
    return
  }

  isLoading = true
  render()

  try {
    if (editingId !== null) {
      const res = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `Failed to update course (HTTP ${res.status})`)
      }
      const updated = await res.json()
      const idx = courses.findIndex((c) => c.id === editingId)
      if (idx !== -1) courses[idx] = { ...courses[idx], ...updated }
      editingId = null
      showMessage('success', 'Course updated successfully!')
    } else {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `Failed to create course (HTTP ${res.status})`)
      }
      const created = await res.json()
      courses.push(created)
      showMessage('success', 'Course added successfully!')
    }
  } catch (err) {
    showMessage('error', err.message)
  } finally {
    isLoading = false
    render()
  }
}

async function handleDelete(id) {
  const course = courses.find((c) => c.id === id)
  if (!course) return

  if (!confirm(`Are you sure you want to delete "${course.name}"? This cannot be undone.`)) {
    return
  }

  isLoading = true
  render()

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}))
      throw new Error(errBody.error || `Failed to delete course (HTTP ${res.status})`)
    }
    courses = courses.filter((c) => c.id !== id)
    if (editingId === id) editingId = null
    showMessage('success', 'Course deleted successfully!')
  } catch (err) {
    showMessage('error', err.message)
  } finally {
    isLoading = false
    render()
  }
}

window.handleDelete = handleDelete

render()
fetchCourses()
