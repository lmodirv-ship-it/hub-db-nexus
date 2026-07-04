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
      api_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          name: string
          owner_id: string
          scopes: string[]
          token_hash: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name: string
          owner_id: string
          scopes?: string[]
          token_hash: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          name?: string
          owner_id?: string
          scopes?: string[]
          token_hash?: string
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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip: string | null
          metadata: Json
          owner_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: string | null
          metadata?: Json
          owner_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip?: string | null
          metadata?: Json
          owner_id?: string
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
      clips: {
        Row: {
          created_at: string
          duration_sec: number
          id: string
          metadata: Json
          order_index: number
          owner_id: string
          project_id: string
          source_url: string | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_sec?: number
          id?: string
          metadata?: Json
          order_index?: number
          owner_id: string
          project_id: string
          source_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_sec?: number
          id?: string
          metadata?: Json
          order_index?: number
          owner_id?: string
          project_id?: string
          source_url?: string | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clips_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      deployments: {
        Row: {
          commit_sha: string | null
          created_at: string
          environment_id: string | null
          finished_at: string | null
          id: string
          log: string | null
          owner_id: string
          source: string
          started_at: string
          status: string
          url: string | null
          website_id: string | null
        }
        Insert: {
          commit_sha?: string | null
          created_at?: string
          environment_id?: string | null
          finished_at?: string | null
          id?: string
          log?: string | null
          owner_id: string
          source?: string
          started_at?: string
          status?: string
          url?: string | null
          website_id?: string | null
        }
        Update: {
          commit_sha?: string | null
          created_at?: string
          environment_id?: string | null
          finished_at?: string | null
          id?: string
          log?: string | null
          owner_id?: string
          source?: string
          started_at?: string
          status?: string
          url?: string | null
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployments_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployments_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      environments: {
        Row: {
          branch: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          updated_at: string
          url: string | null
          variables: Json
          website_id: string | null
        }
        Insert: {
          branch?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          updated_at?: string
          url?: string | null
          variables?: Json
          website_id?: string | null
        }
        Update: {
          branch?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
          url?: string | null
          variables?: Json
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "environments_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      external_data_rows: {
        Row: {
          created_at: string
          id: string
          payload: Json
          received_at: string
          row_pk: string
          source_name: string
          table_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          received_at?: string
          row_pk: string
          source_name: string
          table_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          received_at?: string
          row_pk?: string
          source_name?: string
          table_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      external_schema_mirrors: {
        Row: {
          created_at: string
          id: string
          last_sync_at: string
          payload_hash: string | null
          received_at: string
          schema_name: string
          source_name: string
          status: string
          tables_count: number
          tables_snapshot: Json
          target_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_sync_at?: string
          payload_hash?: string | null
          received_at?: string
          schema_name?: string
          source_name: string
          status?: string
          tables_count?: number
          tables_snapshot?: Json
          target_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_sync_at?: string
          payload_hash?: string | null
          received_at?: string
          schema_name?: string
          source_name?: string
          status?: string
          tables_count?: number
          tables_snapshot?: Json
          target_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json
          created_at: string
          id: string
          last_sync_at: string | null
          name: string
          owner_id: string
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          last_sync_at?: string | null
          name: string
          owner_id: string
          provider: string
          status?: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          last_sync_at?: string | null
          name?: string
          owner_id?: string
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          clip_id: string | null
          created_at: string
          error: string | null
          finished_at: string | null
          id: string
          owner_id: string
          payload: Json
          progress: number
          project_id: string | null
          result: Json | null
          started_at: string | null
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          clip_id?: string | null
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          owner_id: string
          payload?: Json
          progress?: number
          project_id?: string | null
          result?: Json | null
          started_at?: string | null
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          clip_id?: string | null
          created_at?: string
          error?: string | null
          finished_at?: string | null
          id?: string
          owner_id?: string
          payload?: Json
          progress?: number
          project_id?: string | null
          result?: Json | null
          started_at?: string | null
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_clip_id_fkey"
            columns: ["clip_id"]
            isOneToOne: false
            referencedRelation: "clips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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
      notifications: {
        Row: {
          body: string | null
          channel: string
          created_at: string
          id: string
          link: string | null
          owner_id: string
          read: boolean
          title: string
        }
        Insert: {
          body?: string | null
          channel?: string
          created_at?: string
          id?: string
          link?: string | null
          owner_id: string
          read?: boolean
          title: string
        }
        Update: {
          body?: string | null
          channel?: string
          created_at?: string
          id?: string
          link?: string | null
          owner_id?: string
          read?: boolean
          title?: string
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
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          owner_id: string
          status: string
          updated_at: string
          website_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          owner_id: string
          status?: string
          updated_at?: string
          website_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          status?: string
          updated_at?: string
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string
          cron: string
          enabled: boolean
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string | null
          owner_id: string
          payload: Json
          target_id: string | null
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cron: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          owner_id: string
          payload?: Json
          target_id?: string | null
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cron?: string
          enabled?: boolean
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          owner_id?: string
          payload?: Json
          target_id?: string | null
          target_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      secrets_vault: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          owner_id: string
          updated_at: string
          value: string
          website_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          owner_id: string
          updated_at?: string
          value: string
          website_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          owner_id?: string
          updated_at?: string
          value?: string
          website_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "secrets_vault_website_id_fkey"
            columns: ["website_id"]
            isOneToOne: false
            referencedRelation: "websites"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          owner_id: string
          preferences: Json
          updated_at: string
        }
        Insert: {
          owner_id: string
          preferences?: Json
          updated_at?: string
        }
        Update: {
          owner_id?: string
          preferences?: Json
          updated_at?: string
        }
        Relationships: []
      }
      site_content: {
        Row: {
          content: Json
          lang: string
          updated_at: string
        }
        Insert: {
          content: Json
          lang: string
          updated_at?: string
        }
        Update: {
          content?: Json
          lang?: string
          updated_at?: string
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
      workspaces: {
        Row: {
          created_at: string
          external_id: string | null
          id: string
          metadata: Json
          name: string
          owner_id: string
          provider: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          external_id?: string | null
          id?: string
          metadata?: Json
          name: string
          owner_id: string
          provider?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          external_id?: string | null
          id?: string
          metadata?: Json
          name?: string
          owner_id?: string
          provider?: string
          updated_at?: string
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
