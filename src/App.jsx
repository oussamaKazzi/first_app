import { useEffect, useMemo, useState } from 'react'
import NoteCard from './components/NoteCard'
import CourseModal from './components/CourseModal'

const STORAGE_KEY = 'study-notes-app-data'

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

  // Loads courses from localStorage once when the app starts.
  useEffect(() => {
    const savedCourses = localStorage.getItem(STORAGE_KEY)
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses))
    }
  }, [])

  // Saves courses to localStorage whenever courses change.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
  }, [courses])

  // Clears post edit mode whenever user switches modal course.
  useEffect(() => {
    setEditingPostId(null)
  }, [activeCourseId])

  // Handles both adding a new course and updating an existing course.
  const handleSaveCourse = (courseData) => {
    if (editingCourseId) {
      setCourses((previousCourses) =>
        previousCourses.map((course) =>
          course.id === editingCourseId ? { ...course, ...courseData } : course,
        ),
      )
      setEditingCourseId(null)
      return
    }

    const courseToAdd = {
      id: Date.now().toString(),
      ...courseData,
      posts: [],
    }

    setCourses((previousCourses) => [courseToAdd, ...previousCourses])
    setNewlyAddedCourseId(courseToAdd.id)

    // Remove the animation flag after the effect has played.
    setTimeout(() => {
      setNewlyAddedCourseId(null)
    }, 500)
  }

  // Puts the form into edit mode and auto-fills data through props.
  const handleEditCourse = (courseId) => {
    setEditingCourseId(courseId)
  }

  // Asks the user for confirmation before deleting a course.
  const handleDeleteCourse = (courseId) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this course and all its posts?',
    )
    if (!isConfirmed) return

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
  const handleSavePost = (postData) => {
    if (!activeCourseId) return

    if (editingPostId) {
      setCourses((previousCourses) =>
        previousCourses.map((course) => {
          if (course.id !== activeCourseId) return course
          return {
            ...course,
            posts: course.posts.map((post) =>
              post.id === editingPostId ? { ...post, ...postData } : post,
            ),
          }
        }),
      )
      setEditingPostId(null)
      return
    }

    const postToAdd = {
      id: (Date.now() + Math.random()).toString(),
      ...postData,
    }

    setCourses((previousCourses) =>
      previousCourses.map((course) => {
        if (course.id !== activeCourseId) return course
        return {
          ...course,
          posts: [postToAdd, ...course.posts],
        }
      }),
    )
  }

  // Enables post edit mode in modal.
  const handleEditPost = (postId) => {
    setEditingPostId(postId)
  }

  // Deletes a post from selected course after confirmation.
  const handleDeletePost = (postId) => {
    const isConfirmed = window.confirm(
      'Are you sure you want to delete this post?',
    )
    if (!isConfirmed) return

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

  // Creates a new empty course with default values.
  const handleQuickAddCourse = () => {
    if (!quickCourseName.trim()) return

    const courseToAdd = {
      id: Date.now().toString(),
      title: quickCourseName.trim(),
      description: '',
      posts: [],
    }

    setCourses((previousCourses) => [courseToAdd, ...previousCourses])
    setNewlyAddedCourseId(courseToAdd.id)
    setQuickCourseName('')
    setShowQuickAddForm(false)

    setTimeout(() => {
      setNewlyAddedCourseId(null)
    }, 500)
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
