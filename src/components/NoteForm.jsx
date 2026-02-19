import { useEffect, useState } from 'react'

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
}

function NoteForm({ onSaveNote, noteBeingEdited, onCancelEdit }) {
  // Keeps all form fields in one state object for simple management.
  const [formValues, setFormValues] = useState(INITIAL_FORM_STATE)

  // Auto-fills form fields when a note is selected for editing.
  useEffect(() => {
    if (noteBeingEdited) {
      setFormValues({
        title: noteBeingEdited.title,
        description: noteBeingEdited.description || '',
      })
      return
    }

    // Resets form when returning to add mode.
    setFormValues(INITIAL_FORM_STATE)
  }, [noteBeingEdited])

  // Generic change handler for all inputs/textarea.
  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: value,
    }))
  }

  // Sends validated data up to App.jsx.
  const handleSubmit = (event) => {
    event.preventDefault()

    const cleanedValues = {
      title: formValues.title.trim(),
      description: formValues.description.trim(),
    }

    if (!cleanedValues.title) {
      return
    }

    onSaveNote(cleanedValues)

    // Clear fields only when we are adding a new note.
    if (!noteBeingEdited) {
      setFormValues(INITIAL_FORM_STATE)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl bg-white p-6 shadow-lg space-y-4"
    >
      <h2 className="text-xl font-semibold text-slate-900">
        {noteBeingEdited ? 'Edit Course' : 'Add New Course'}
      </h2>

      <input
        type="text"
        name="title"
        value={formValues.title}
        onChange={handleChange}
        placeholder="Course title"
        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        required
      />

      <textarea
        name="description"
        value={formValues.description}
        onChange={handleChange}
        placeholder="Write your course description (optional)..."
        rows={4}
        className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className={`rounded-lg px-5 py-2.5 font-medium text-white transition duration-300 ${
            noteBeingEdited
              ? 'bg-yellow-500 hover:bg-yellow-600'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {noteBeingEdited ? 'Update Course' : 'Add Course'}
        </button>

        {noteBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg bg-slate-300 px-5 py-2.5 font-medium text-slate-800 transition duration-300 hover:bg-slate-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

export default NoteForm