import { createClient } from '@supabase/supabase-js';

// Types
export interface Book {
  id: string;
  title: string;
  author: string;
  created_at: string;
  updated_at: string | null;
}

export interface Note {
  id: string;
  book_id: string;
  note_content: string;
  created_at: string;
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Book-related queries
export async function addBook(title: string, author: string) {
  const { data, error } = await supabase
    .from('books')
    .insert([{ title, author }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Book;
}

export async function fetchBooks() {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Book[];
}

export async function fetchBookById(id: string) {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data as Book;
}

// Note-related queries
export async function fetchNotes(bookId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('book_id', bookId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data as Note[];
}

export async function addNote(bookId: string, noteContent: string) {
  const { data, error } = await supabase
    .from('notes')
    .insert([{ book_id: bookId, note_content: noteContent }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Note;
}

// Delete operations (optional but useful)
export async function deleteBook(id: string) {
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
}

export async function deleteNote(id: string) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
} 