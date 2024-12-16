import { fetchBooks, fetchNotes } from '@/lib/db';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Props = {
  params: { id: string }
}

export default async function BookDetails({ params }: Props) {
  const books = await fetchBooks();
  const book = books.find((b) => b.id === params.id);
  const notes = await fetchNotes(params.id);

  if (!book) {
    return <div>Book not found</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{book.title}</h1>
      <p className="text-gray-600 mb-8">by {book.author}</p>

      <div className="space-y-4 mb-8">
        <Link href={`/book/${params.id}/notes`}>
          <Button className="w-full">Take Notes</Button>
        </Link>
        <Link href={`/book/${params.id}/chat`}>
          <Button className="w-full">Chat Mode</Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Notes</h2>
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