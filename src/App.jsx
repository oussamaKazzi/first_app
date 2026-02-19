import { useEffect, useMemo, useState } from 'react'
import NoteCard from './components/NoteCard'
import CourseModal from './components/CourseModal'

const API_URL = 'http://localhost:5000'

function App() {
  // Stores all courses, and each course contains a posts array.
  const [courses, setCourses] = useState([])

  // Tracks which course is currently being edited (null means add mode).
  const [editingCourseId, setEditingCourseId] = useState(null)

  // Used to trigger a one-time fade-in animation for newly added course cards.
  const [newlyAddedCourseId, setNewlyAddedCourseId] = useState(null)

  // Tracks which course is open in the posts modal.
  const [activeCourseId, setActiveCourseId] = useState(null)

  // Tracks the post currently being edited inside the selected course.
  const [editingPostId, setEditingPostId] = useState(null)

  // Controls visibility of the quick add course form.
  const [showQuickAddForm, setShowQuickAddForm] = useState(false)

  // Stores temporary course name input.
  const [quickCourseName, setQuickCourseName] = useState('')

  // Returns the full course object currently being edited.
  const courseBeingEdited = useMemo(
    () => courses.find((course) => course.id === editingCourseId) ?? null,
    [courses, editingCourseId],
  )

  // Returns the currently selected course shown in the modal.
  const activeCourse = useMemo(
    () => courses.find((course) => course.id === activeCourseId) ?? null,
    [courses, activeCourseId],
  )

  // Returns the post object currently being edited in modal.
  const postBeingEdited = useMemo(
    () => activeCourse?.posts.find((post) => post.id === editingPostId) ?? null,
    [activeCourse, editingPostId],
  )

  // Loads courses from API once when the app starts.
  useEffect(() => {
    fetchCourses()
  }, [])

  // Fetch all courses from backend
  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_URL}/courses`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  // Clears post edit mode whenever user switches modal course.
  useEffect(() => {
    setEditingPostId(null)
  }, [activeCourseId])

  // Handles both adding a new course and updating an existing course.
  const handleSaveCourse = async (courseData) => {
    if (editingCourseId) {
      try {
        const response = await fetch(`${API_URL}/courses/${editingCourseId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(courseData)
        })
        if (response.ok) {
          const updatedCourse = await response.json()
          setCourses((previousCourses) =>
            previousCourses.map((course) =>
              course.id === editingCourseId ? updatedCourse : course,
            ),
          )
          setEditingCourseId(null)
        }
      } catch (error) {
        console.error('Failed to update course:', error)
      }
      return
    }

    try {
      const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      })
      if (response.ok) {
        const newCourse = await response.json()
        setCourses((previousCourses) => [newCourse, ...previousCourses])
        setNewlyAddedCourseId(newCourse.id)

        // Remove the animation flag after the effect has played.
        setTimeout(() => {
          setNewlyAddedCourseId(null)
        }, 500)
      }
    } catch (error) {
      console.error('Failed to create course:', error)
    }
  }

  // Puts the form into edit mode and auto-fills data through props.
  const handleEditCourse = (courseId) => {
    setEditingCourseId(courseId)
  }

  // Asks the user for confirmation before deleting a course.
  const handleDeleteCourse = async (courseId) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this course and all its posts?',
    )
    if (!isConfirmed) return

    try {
      const response = await fetch(`${API_URL}/courses/${courseId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setCourses((previousCourses) =>
          previousCourses.filter((course) => course.id !== courseId),
        )

        if (editingCourseId === courseId) {
          setEditingCourseId(null)
        }

        if (activeCourseId === courseId) {
          setActiveCourseId(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  // Opens a course modal to manage posts.
  const handleOpenCoursePosts = (courseId) => {
    setActiveCourseId(courseId)
  }

  // Closes modal and resets post editing state.
  const handleCloseCoursePosts = () => {
    setActiveCourseId(null)
    setEditingPostId(null)
  }

  // Adds a post or updates a post inside the selected course.
  const handleSavePost = async (postData) => {
    if (!activeCourseId) return

    if (editingPostId) {
      try {
        const response = await fetch(`${API_URL}/courses/${activeCourseId}/posts/${editingPostId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(postData)
        })
        if (response.ok) {
          const updatedPost = await response.json()
          setCourses((previousCourses) =>
            previousCourses.map((course) => {
              if (course.id !== activeCourseId) return course
              return {
                ...course,
                posts: course.posts.map((post) =>
                  post.id === editingPostId ? updatedPost : post,
                ),
              }
            }),
          )
          setEditingPostId(null)
        }
      } catch (error) {
        console.error('Failed to update post:', error)
      }
      return
    }

    try {
      const response = await fetch(`${API_URL}/courses/${activeCourseId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      })
      if (response.ok) {
        const newPost = await response.json()
        setCourses((previousCourses) =>
          previousCourses.map((course) => {
            if (course.id !== activeCourseId) return course
            return {
              ...course,
              posts: [newPost, ...course.posts],
            }
          }),
        )
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    }
  }

  // Enables post edit mode in modal.
  const handleEditPost = (postId) => {
    setEditingPostId(postId)
  }

  // Deletes a post from selected course after confirmation.
  const handleDeletePost = async (postId) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this post?',
    )
    if (!isConfirmed) return

    try {
      const response = await fetch(`${API_URL}/courses/${activeCourseId}/posts/${postId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setCourses((previousCourses) =>
          previousCourses.map((course) => {
            if (course.id !== activeCourseId) return course
            return {
              ...course,
              posts: course.posts.filter((post) => post.id !== postId),
            }
          }),
        )

        if (editingPostId === postId) {
          setEditingPostId(null)
        }
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  // Creates a new empty course with default values.
  const handleQuickAddCourse = async () => {
    if (!quickCourseName.trim()) return

    const courseData = {
      title: quickCourseName.trim(),
      description: ''
    }

    try {
      const response = await fetch(`${API_URL}/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseData)
      })
      if (response.ok) {
        const newCourse = await response.json()
        setCourses((previousCourses) => [newCourse, ...previousCourses])
        setNewlyAddedCourseId(newCourse.id)
        setQuickCourseName('')
        setShowQuickAddForm(false)

        setTimeout(() => {
          setNewlyAddedCourseId(null)
        }, 500)
      }
    } catch (error) {
      console.error('Failed to create course:', error)
    }
  }

  // Cancels the quick add form.
  const handleCancelQuickAdd = () => {
    setQuickCourseName('')
    setShowQuickAddForm(false)
  }

  // Allows user to cancel post editing in modal.
  const handleCancelPostEdit = () => {
    setEditingPostId(null)
  }

  return (
    <main className="px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            📚 Study Posts
          </h1>
          <p className="mt-2 text-slate-500">
            Create courses and add posts to organize your studies.
          </p>
        </header>

        <div className="mb-8 flex justify-center">
          {!showQuickAddForm ? (
            <button
              onClick={() => setShowQuickAddForm(true)}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition duration-300 hover:bg-blue-700 shadow-lg"
            >
              ➕ Create New Course
            </button>
          ) : (
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg animate-fadeIn">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Create New Course
              </h3>
              <input
                type="text"
                value={quickCourseName}
                onChange={(e) => setQuickCourseName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuickAddCourse()
                  if (e.key === 'Escape') handleCancelQuickAdd()
                }}
                placeholder="Enter course name..."
                autoFocus
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleQuickAddCourse}
                  disabled={!quickCourseName.trim()}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
                <button
                  onClick={handleCancelQuickAdd}
                  className="rounded-lg bg-slate-300 px-5 py-2.5 font-medium text-slate-800 transition duration-300 hover:bg-slate-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <section className="mt-6">
          {courses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-lg">
              No courses yet. Click "Create New Course" to get started, then add posts inside each course.
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mb-4 italic">
                Click "Open Posts" on a course to add, edit, and manage posts.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <NoteCard
                    key={course.id}
                    note={course}
                    onEdit={handleEditCourse}
                    onDelete={handleDeleteCourse}
                    onOpenPosts={handleOpenCoursePosts}
                    isNew={course.id === newlyAddedCourseId}
                  />
                ))}
              </div>
            </>
          )}
        </section>

        {activeCourse && (
          <CourseModal
            course={activeCourse}
            postBeingEdited={postBeingEdited}
            onClose={handleCloseCoursePosts}
            onSavePost={handleSavePost}
            onEditPost={handleEditPost}
            onDeletePost={handleDeletePost}
            onCancelPostEdit={handleCancelPostEdit}
          />
        )}
      </div>
    </main>
  )
}

export default App
