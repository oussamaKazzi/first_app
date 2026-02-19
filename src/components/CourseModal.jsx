import { useEffect, useState } from 'react'

const INITIAL_POST_FORM = {
  title: '',
  imageUrl: '',
  description: '',
}

function CourseModal({
  course,
  postBeingEdited,
  onClose,
  onSavePost,
  onEditPost,
  onDeletePost,
  onCancelPostEdit,
}) {
  // Keeps post form values in one object for simpler input handling.
  const [postFormValues, setPostFormValues] = useState(INITIAL_POST_FORM)

  // Tracks which image is being viewed in full size.
  const [viewingImage, setViewingImage] = useState(null)

  // Controls visibility of the add post form.
  const [showPostForm, setShowPostForm] = useState(false)

  // Auto-fill fields when user edits a post.
  useEffect(() => {
    if (postBeingEdited) {
      setPostFormValues({
        title: postBeingEdited.title,
        imageUrl: postBeingEdited.imageUrl,
        description: postBeingEdited.description,
      })
      setShowPostForm(true)
      return
    }

    // Reset form when leaving edit mode.
    setPostFormValues(INITIAL_POST_FORM)
  }, [postBeingEdited])

  // Generic change handler for all post fields.
  const handlePostInputChange = (event) => {
    const { name, value } = event.target
    setPostFormValues((previousValues) => ({
      ...previousValues,
      [name]: value,
    }))
  }

  // Handles file upload - converts image to base64 data URL.
  const handlePostImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setPostFormValues((previousValues) => ({
        ...previousValues,
        imageUrl: e.target?.result || '',
      }))
    }
    reader.readAsDataURL(file)
  }

  // Handles pasting images from clipboard (e.g., screenshots).
  const handlePaste = (event) => {
    const items = event.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile()
        if (!blob) continue

        const reader = new FileReader()
        reader.onload = (e) => {
          setPostFormValues((previousValues) => ({
            ...previousValues,
            imageUrl: e.target?.result || '',
          }))
        }
        reader.readAsDataURL(blob)
        break
      }
    }
  }

  // Save post data (add or update) via parent handlers.
  const handlePostSubmit = (event) => {
    event.preventDefault()

    const cleanedPostValues = {
      title: postFormValues.title.trim(),
      imageUrl: postFormValues.imageUrl.trim(),
      description: postFormValues.description.trim(),
    }

    if (
      !cleanedPostValues.title ||
      !cleanedPostValues.imageUrl ||
      !cleanedPostValues.description
    ) {
      return
    }

    onSavePost(cleanedPostValues)

    // Clear form and hide it after successful save.
    setPostFormValues(INITIAL_POST_FORM)
    setShowPostForm(false)
  }

  // Cancel post edit and reset form in UI.
  const handleCancelEditClick = () => {
    onCancelPostEdit()
    setPostFormValues(INITIAL_POST_FORM)
    setShowPostForm(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-xl bg-white shadow-lg">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{course.title}</h2>
            <p className="text-sm text-slate-500">Manage posts inside this course.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-300"
          >
            Close
          </button>
        </div>

        <div className="space-y-6 p-6">
          {!showPostForm ? (
            <div className="flex justify-center">
              <button
                onClick={() => setShowPostForm(true)}
                className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition duration-300 hover:bg-blue-700 shadow-lg"
              >
                ➕ Add New Post
              </button>
            </div>
          ) : (
            <form
              onSubmit={handlePostSubmit}
              onPaste={handlePaste}
              className="rounded-xl bg-slate-50 p-4 shadow-lg space-y-3 animate-fadeIn"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {postBeingEdited ? 'Edit Post' : 'Add New Post'}
              </h3>

              <input
                type="text"
                name="title"
                value={postFormValues.title}
                onChange={handlePostInputChange}
                placeholder="Post title"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />

              <input
                type="file"
                accept="image/*"
                onChange={handlePostImageUpload}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required={!postBeingEdited || !postFormValues.imageUrl}
              />
              {postFormValues.imageUrl && (
                <div className="mt-3 rounded-lg overflow-hidden shadow-md">
                  <img
                    src={postFormValues.imageUrl}
                    alt="Post preview"
                    onClick={() => setViewingImage(postFormValues.imageUrl)}
                    className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition"
                  />
                </div>
              )}

              <textarea
                name="description"
                value={postFormValues.description}
                onChange={handlePostInputChange}
                placeholder="Write post description..."
                rows={4}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                required
              />

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className={`rounded-lg px-5 py-2.5 text-sm font-medium text-white transition duration-300 ${
                    postBeingEdited
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {postBeingEdited ? 'Update Post' : 'Add Post'}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEditClick}
                  className="rounded-lg bg-slate-300 px-5 py-2.5 text-sm font-medium text-slate-800 transition duration-300 hover:bg-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {course.posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 shadow-lg">
              No posts yet. Add your first post for this course.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {course.posts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-xl bg-white shadow-lg transition duration-300 hover:scale-105"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    onClick={() => setViewingImage(post.imageUrl)}
                    className="h-40 w-full object-cover cursor-pointer hover:opacity-90 transition"
                  />
                  <div className="p-4">
                    <h4 className="text-base font-semibold text-slate-900">{post.title}</h4>
                    <p className="mt-2 text-sm text-slate-600">{post.description}</p>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => onEditPost(post.id)}
                        className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeletePost(post.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox - Full size image viewer */}
      {viewingImage && (
        <div
          onClick={() => setViewingImage(null)}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 cursor-pointer"
        >
          <button
            onClick={() => setViewingImage(null)}
            className="absolute top-4 right-4 rounded-full bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition"
          >
            ✕ Close
          </button>
          <img
            src={viewingImage}
            alt="Full size view"
            onClick={(e) => e.stopPropagation()}
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl cursor-default"
          />
        </div>
      )}
    </div>
  )
}

export default CourseModal