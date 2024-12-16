import { fetchBooks, fetchNotes } from '@/lib/db';
import CameraCapture from './CameraCapture';

type Props = {
  params: { id: string }
}

export default async function NotesPage({ params }: Props) {
  const books = await fetchBooks();
  const book = books.find((b) => b.id === params.id);
  const notes = await fetchNotes(params.id);

  if (!book) {
    return <div>Book not found</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Take Notes: {book.title}</h1>
      
      {/* Camera component */}
      <CameraCapture bookId={params.id} />

      {/* Notes list */}
      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-semibold">Previous Notes</h2>
        {notes.length === 0 ? (
          <p className="text-gray-500">No notes yet. Start taking notes!</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="p-4 border rounded-lg">
              <p>{note.note_content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 