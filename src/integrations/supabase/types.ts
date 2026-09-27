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
      admin_audit_log: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          details: Json
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: []
      }
      ai_invocation_events: {
        Row: {
          created_at: string
          id: string
          identifier_hash: string
          outcome: string
          request_kind: string
          run_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          identifier_hash: string
          outcome: string
          request_kind: string
          run_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          identifier_hash?: string
          outcome?: string
          request_kind?: string
          run_id?: string | null
        }
        Relationships: []
      }
      ai_usage_events: {
        Row: {
          created_at: string
          id: string
          request_kind: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          request_kind: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          request_kind?: string
          user_id?: string | null
        }
        Relationships: []
      }
      assessment_examples: {
        Row: {
          activity_ar: string
          activity_en: string
          created_at: string
          description_ar: string
          description_en: string
          gate_state: Json
          id: string
          is_published: boolean
          isic_code: string
          risk_tier: string
          scores: Json
          sector_key: string
          sort_order: number
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          activity_ar: string
          activity_en: string
          created_at?: string
          description_ar: string
          description_en: string
          gate_state: Json
          id?: string
          is_published?: boolean
          isic_code: string
          risk_tier: string
          scores: Json
          sector_key: string
          sort_order?: number
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          activity_ar?: string
          activity_en?: string
          created_at?: string
          description_ar?: string
          description_en?: string
          gate_state?: Json
          id?: string
          is_published?: boolean
          isic_code?: string
          risk_tier?: string
          scores?: Json
          sector_key?: string
          sort_order?: number
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_result_snapshots: {
        Row: {
          created_at: string
          id: string
          ineligible: boolean
          inputs: Json
          level: string
          methodology_version: string
          reference_code: string
          run_id: string | null
          score: number
          source: string
          verdict: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ineligible?: boolean
          inputs: Json
          level: string
          methodology_version: string
          reference_code?: string
          run_id?: string | null
          score: number
          source: string
          verdict?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ineligible?: boolean
          inputs?: Json
          level?: string
          methodology_version?: string
          reference_code?: string
          run_id?: string | null
          score?: number
          source?: string
          verdict?: string | null
        }
        Relationships: []
      }
      assessment_objections: {
        Row: {
          created_at: string
          email: string
          id: string
          preferred_language: string
          reason: string
          reference_code: string
          requester_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          preferred_language?: string
          reason: string
          reference_code: string
          requester_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          preferred_language?: string
          reason?: string
          reference_code?: string
          requester_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_requests: {
        Row: {
          activity: string
          assessment_type: string
          client_name: string
          consent_version: string
          consented_at: string
          country: string | null
          created_at: string
          email: string
          id: string
          notes: string | null
          organization_name: string
          phone: string | null
          preferred_language: string
          reference_code: string
          sector: string
          status: string
          updated_at: string
        }
        Insert: {
          activity: string
          assessment_type: string
          client_name: string
          consent_version?: string
          consented_at?: string
          country?: string | null
          created_at?: string
          email: string
          id?: string
          notes?: string | null
          organization_name: string
          phone?: string | null
          preferred_language?: string
          reference_code?: string
          sector: string
          status?: string
          updated_at?: string
        }
        Update: {
          activity?: string
          assessment_type?: string
          client_name?: string
          consent_version?: string
          consented_at?: string
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          notes?: string | null
          organization_name?: string
          phone?: string | null
          preferred_language?: string
          reference_code?: string
          sector?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_results: {
        Row: {
          activity_name: string
          assessment_mode: string
          created_at: string
          gate_state: Json
          id: string
          is_eligible: boolean
          notes: string | null
          organization_name: string | null
          owner_user_id: string | null
          reference_code: string
          result_band: string
          risk_tier: string
          scores: Json
          sector_key: string
          verdict: string
          weighted_score: number
        }
        Insert: {
          activity_name: string
          assessment_mode: string
          created_at?: string
          gate_state: Json
          id?: string
          is_eligible: boolean
          notes?: string | null
          organization_name?: string | null
          owner_user_id?: string | null
          reference_code?: string
          result_band: string
          risk_tier: string
          scores: Json
          sector_key: string
          verdict: string
          weighted_score: number
        }
        Update: {
          activity_name?: string
          assessment_mode?: string
          created_at?: string
          gate_state?: Json
          id?: string
          is_eligible?: boolean
          notes?: string | null
          organization_name?: string | null
          owner_user_id?: string | null
          reference_code?: string
          result_band?: string
          risk_tier?: string
          scores?: Json
          sector_key?: string
          verdict?: string
          weighted_score?: number
        }
        Relationships: []
      }
      brand_settings: {
        Row: {
          id: string
          is_public: boolean
          label_ar: string
          label_en: string
          setting_key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          is_public?: boolean
          label_ar: string
          label_en: string
          setting_key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          is_public?: boolean
          label_ar?: string
          label_en?: string
          setting_key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      classification_standard_revisions: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          id: string
          note: string | null
          snapshot: Json
          standard_id: string
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          snapshot: Json
          standard_id: string
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          id?: string
          note?: string | null
          snapshot?: Json
          standard_id?: string
        }
        Relationships: []
      }
      classification_standards: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          level: string
          node_key: string
          published_at: string | null
          published_snapshot: Json | null
          published_version: number | null
          requirements: Json
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sources: Json
          status: string
          summary_ar: string
          summary_en: string | null
          title_ar: string
          title_en: string | null
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          level: string
          node_key: string
          published_at?: string | null
          published_snapshot?: Json | null
          published_version?: number | null
          requirements?: Json
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sources?: Json
          status?: string
          summary_ar: string
          summary_en?: string | null
          title_ar: string
          title_en?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          level?: string
          node_key?: string
          published_at?: string | null
          published_snapshot?: Json | null
          published_version?: number | null
          requirements?: Json
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sources?: Json
          status?: string
          summary_ar?: string
          summary_en?: string | null
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: []
      }
      content_revisions: {
        Row: {
          change_note: string | null
          created_at: string
          id: string
          section_id: string | null
          snapshot: Json
        }
        Insert: {
          change_note?: string | null
          created_at?: string
          id?: string
          section_id?: string | null
          snapshot: Json
        }
        Update: {
          change_note?: string | null
          created_at?: string
          id?: string
          section_id?: string | null
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "content_revisions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "standard_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      eligibility_gate_checks: {
        Row: {
          check_key: string
          created_at: string
          guidance_ar: string | null
          guidance_en: string | null
          id: string
          is_published: boolean
          label_ar: string
          label_en: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          check_key: string
          created_at?: string
          guidance_ar?: string | null
          guidance_en?: string | null
          id?: string
          is_published?: boolean
          label_ar: string
          label_en: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          check_key?: string
          created_at?: string
          guidance_ar?: string | null
          guidance_en?: string | null
          id?: string
          is_published?: boolean
          label_ar?: string
          label_en?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          id: string
          job_title: string | null
          organization: string | null
          preferences: Json
          preferred_language: string
          specialty: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id: string
          job_title?: string | null
          organization?: string | null
          preferences?: Json
          preferred_language?: string
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          id?: string
          job_title?: string | null
          organization?: string | null
          preferences?: Json
          preferred_language?: string
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      standard_sections: {
        Row: {
          body_ar: string
          body_en: string
          content_version: number
          created_at: string
          id: string
          is_published: boolean
          review_status: string
          reviewed_at: string | null
          reviewed_by: string | null
          section_key: string
          sort_order: number
          title_ar: string
          title_en: string
          translated_at: string | null
          translation_status: string
          updated_at: string
        }
        Insert: {
          body_ar: string
          body_en: string
          content_version?: number
          created_at?: string
          id?: string
          is_published?: boolean
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          section_key: string
          sort_order?: number
          title_ar: string
          title_en: string
          translated_at?: string | null
          translation_status?: string
          updated_at?: string
        }
        Update: {
          body_ar?: string
          body_en?: string
          content_version?: number
          created_at?: string
          id?: string
          is_published?: boolean
          review_status?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          section_key?: string
          sort_order?: number
          title_ar?: string
          title_en?: string
          translated_at?: string | null
          translation_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      submission_throttle: {
        Row: {
          created_at: string
          hits: number
          id: string
          identifier: string
          scope: string
          window_start: string
        }
        Insert: {
          created_at?: string
          hits?: number
          id?: string
          identifier: string
          scope: string
          window_start?: string
        }
        Update: {
          created_at?: string
          hits?: number
          id?: string
          identifier?: string
          scope?: string
          window_start?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      register_submission_attempt: {
        Args: {
          _identifier: string
          _limit: number
          _scope: string
          _window_seconds: number
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "reviewer" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "reviewer", "user"],
    },
  },
} as const
