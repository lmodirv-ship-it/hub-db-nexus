export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          database_id: string | null
          id: string
          message: string
          owner_id: string
          read: boolean
          severity: string
          type: string
          website_id: string | null
        }
        Insert: {
          created_at?: string
          database_id?: string | null
          id?: string
          message: string
          owner_id: string
          read?: boolean
          severity?: string
          type: string
          website_id?: string | null
        }
        Update: {
          created_at?: string
          database_id?: string | null
          id?: string
          message?: string
          owner_id?: string
          read?: boolean
          severity?: string
          type?: string
          website_id?: string | null
        }
        Relationships: []
      }
      app_releases: {
        Row: {
          created_at: string
          file_path: string | null
          file_size_bytes: number
          file_type: string
          id: string
          notes: string | null
          owner_id: string
          released_at: string
          status: string
          version_code: number
          version_name: string
          website_id: string
        }
        Insert: {
          created_at?: string
          file_path?: string | null
          file_size_bytes?: number
          file_type?: string
          id?: string
          notes?: string | null
          owner_id: string
          released_at?: string
          status?: string
          version_code?: number
          version_name: string
          website_id: string
        }
        Update: {
          created_at?: string
          file_path?: string | null
          file_size_bytes?: number
          file_type?: string
          id?: string
          notes?: string | null
          owner_id?: string
          released_at?: string
          status?: string
          version_code?: number
          version_name?: string
          website_id?: string
        }
        Relationships: []
      }
      backups: {
        Row: {
          created_at: string
          database_id: string
          id: string
          owner_id: string
          size_mb: number
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          database_id: string
          id?: string
          owner_id: string
          size_mb?: number
          status?: string
          type?: string
        }
        Update: {
          created_at?: string
          database_id?: string
          id?: string
          owner_id?: string
          size_mb?: number
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "backups_database_id_fkey"
            columns: ["database_id"]
            isOneToOne: false
            referencedRelation: "databases"
            referencedColumns: ["id"]
          },
        ]
      }
      databases: {
        Row: {
          backup_schedule: string
          connection_id: string
          created_at: string
          engine: string
          host: string
          id: string
          last_backup: string | null
          last_check_ms: number | null
          last_connection: string | null
          last_error: string | null
          name: string
          next_backup_at: string | null
          owner_id: string
          port: number
          size_mb: number
          status: string
          username: string
          website_id: string | null
        }
        Insert: {
          backup_schedule?: string
          connection_id?: string
          created_at?: string
          engine?: string
          host?: string
          id?: string
          last_backup?: string | null
          last_check_ms?: number | null
          last_connection?: string | null
          last_error?: string | null
          name: string
          next_backup_at?: string | null
          owner_id: string
          port?: number
          size_mb?: number
          status?: string
          username?: string
          website_id?: string | null
        }
        Update: {
          backup_schedule?: string
          connection_id?: string
          created_at?: string
          engine?: string
          host?: string
          id?: string
          last_backup?: string | null
          last_check_ms?: number | null
          last_connection?: string | null
          last_error?: string | null
          name?: string
          next_backup_at?: string | null
          owner_id?: string
          port?: number
          size_mb?: number
          status?: string
          username?: string
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "databases_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          action: string
          created_at: string
          database_id: string | null
          id: string
          owner_id: string
          result: string
          website_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          database_id?: string | null
          id?: string
          owner_id: string
          result?: string
          website_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          database_id?: string | null
          id?: string
          owner_id?: string
          result?: string
          website_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      websites: {
        Row: {
          created_at: string
          domain: string
          id: string
          name: string
          owner_id: string
          status: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          name: string
          owner_id: string
          status?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          name?: string
          owner_id?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
