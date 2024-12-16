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
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables:", {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
  throw new Error("Supabase configuration is missing. Please check your environment variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Book-related queries
export async function addBook(title: string, author: string) {
  console.log("Adding book to Supabase:", { title, author });
  
  try {
    const { data, error } = await supabase
      .from('books')
      .insert([{ title, author }])
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding book:", error);
      throw new Error(error.message);
    }

    console.log("Successfully added book:", data);
    return data as Book;
  } catch (error) {
    console.error("Error in addBook function:", error);
    throw error;
  }
}

export async function fetchBooks() {
  console.log("Fetching all books from Supabase");
  
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error fetching books:", error);
      throw new Error(error.message);
    }

    console.log("Successfully fetched books:", data);
    return data as Book[];
  } catch (error) {
    console.error("Error in fetchBooks function:", error);
    throw error;
  }
}

export async function fetchBookById(id: string) {
  console.log("Fetching book by ID:", id);
  
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Supabase error fetching book by ID:", error);
      throw new Error(error.message);
    }

    console.log("Successfully fetched book:", data);
    return data as Book;
  } catch (error) {
    console.error("Error in fetchBookById function:", error);
    throw error;
  }
}

// Note-related queries
export async function fetchNotes(bookId: string) {
  console.log("Fetching notes for book:", bookId);
  
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('book_id', bookId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase error fetching notes:", error);
      throw new Error(error.message);
    }

    console.log("Successfully fetched notes:", data);
    return data as Note[];
  } catch (error) {
    console.error("Error in fetchNotes function:", error);
    throw error;
  }
}

export async function addNote(bookId: string, noteContent: string) {
  console.log("Adding note for book:", { bookId, noteContent });
  
  try {
    const { data, error } = await supabase
      .from('notes')
      .insert([{ book_id: bookId, note_content: noteContent }])
      .select()
      .single();

    if (error) {
      console.error("Supabase error adding note:", error);
      throw new Error(error.message);
    }

    console.log("Successfully added note:", data);
    return data as Note;
  } catch (error) {
    console.error("Error in addNote function:", error);
    throw error;
  }
}

// Delete operations
export async function deleteBook(id: string) {
  console.log("Deleting book:", id);
  
  try {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Supabase error deleting book:", error);
      throw new Error(error.message);
    }

    console.log("Successfully deleted book:", id);
    return true;
  } catch (error) {
    console.error("Error in deleteBook function:", error);
    throw error;
  }
}

export async function deleteNote(id: string) {
  console.log("Deleting note:", id);
  
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Supabase error deleting note:", error);
      throw new Error(error.message);
    }

    console.log("Successfully deleted note:", id);
    return true;
  } catch (error) {
    console.error("Error in deleteNote function:", error);
    throw error;
  }
} 