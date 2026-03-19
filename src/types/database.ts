export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      admins_profile: {
        Row: {
          id: string
          role: 'superadmin' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          role?: 'superadmin' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'superadmin' | 'admin'
          created_at?: string
        }
      }
      buses: {
        Row: {
          id: string
          plate: string
          model: string
          manufacturer: string
          order_number: string
          route_id: string | null
          documents: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          plate: string
          model: string
          manufacturer: string
          order_number: string
          route_id?: string | null
          documents?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          plate?: string
          model?: string
          manufacturer?: string
          order_number?: string
          route_id?: string | null
          documents?: Json | null
          created_at?: string
        }
      }
      conductors: {
        Row: {
          id: string // 11 digits
          name: string
          age: number
          phone: string
          email: string
          bus_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          name: string
          age: number
          phone: string
          email: string
          bus_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          age?: number
          phone?: string
          email?: string
          bus_id?: string | null
          created_at?: string
        }
      }
      routes: {
        Row: {
          id: string
          name: string
          code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          created_at?: string
        }
      }
      stops: {
        Row: {
          id: string
          route_id: string
          name: string
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          route_id: string
          name: string
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          route_id?: string
          name?: string
          order_index?: number
          created_at?: string
        }
      }
      pqrs: {
        Row: {
          id: string
          code: string
          user_name: string
          user_email: string
          subject: string
          description: string
          status: 'recibido' | 'en_tramite' | 'resuelto'
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          user_name: string
          user_email: string
          subject: string
          description: string
          status?: 'recibido' | 'en_tramite' | 'resuelto'
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          user_name?: string
          user_email?: string
          subject?: string
          description?: string
          status?: 'recibido' | 'en_tramite' | 'resuelto'
          created_at?: string
        }
      }
    }
  }
}
