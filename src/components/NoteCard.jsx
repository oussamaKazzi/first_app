function NoteCard({ note, onEdit, onDelete, onOpenPosts, isNew }) {
  return (
    <article
      className={`rounded-xl bg-white shadow-lg overflow-hidden transition duration-300 hover:scale-105 ${
        isNew ? 'animate-fadeIn' : ''
      }`}
    >
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-3">{note.title}</h3>
        
        {note.description && (
          <p className="mt-2 text-sm text-slate-600 leading-relaxed mb-3">
            {note.description}
          </p>
        )}

        <p className="text-xs font-medium text-slate-500 mb-4">
          📝 {note.posts?.length ?? 0} {note.posts?.length === 1 ? 'Post' : 'Posts'}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onOpenPosts(note.id)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:bg-blue-700"
          >
            Open Posts
          </button>
          <button
            onClick={() => onEdit(note.id)}
            className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:bg-yellow-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  )
}

export default NoteCard