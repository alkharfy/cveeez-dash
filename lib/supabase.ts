import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: "Admin" | "Manager" | "Designer"
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: "Admin" | "Manager" | "Designer"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: "Admin" | "Manager" | "Designer"
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          client: string | null
          description: string | null
          start_date: string | null
          end_date: string | null
          status: "Active" | "Completed" | "On Hold" | "Cancelled"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          client?: string | null
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: "Active" | "Completed" | "On Hold" | "Cancelled"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          client?: string | null
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          status?: "Active" | "Completed" | "On Hold" | "Cancelled"
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: "In Progress" | "Completed" | "Pending" | "Cancelled"
          priority: "Low" | "Medium" | "High" | "Urgent"
          due_date: string | null
          assigned_user_id: string | null
          project_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: "In Progress" | "Completed" | "Pending" | "Cancelled"
          priority?: "Low" | "Medium" | "High" | "Urgent"
          due_date?: string | null
          assigned_user_id?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: "In Progress" | "Completed" | "Pending" | "Cancelled"
          priority?: "Low" | "Medium" | "High" | "Urgent"
          due_date?: string | null
          assigned_user_id?: string | null
          project_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
    }
  }
}
