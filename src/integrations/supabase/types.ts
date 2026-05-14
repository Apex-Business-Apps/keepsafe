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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      events: {
        Row: {
          id: number
          name: string
          props: Json | null
          ts: string | null
          user_id: string | null
        }
        Insert: {
          id?: number
          name: string
          props?: Json | null
          ts?: string | null
          user_id?: string | null
        }
        Update: {
          id?: number
          name?: string
          props?: Json | null
          ts?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          barcode: string | null
          brand: string | null
          category: string | null
          created_at: string | null
          id: string
          name: string
          notes: string | null
          price: number | null
          purchase_date: string | null
          recall_match: boolean | null
          recall_url: string | null
          receipt_file_path: string | null
          receipt_photo_url: string | null
          serial_number: string | null
          updated_at: string | null
          user_id: string
          warranty_months: number | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          name: string
          notes?: string | null
          price?: number | null
          purchase_date?: string | null
          recall_match?: boolean | null
          recall_url?: string | null
          receipt_file_path?: string | null
          receipt_photo_url?: string | null
          serial_number?: string | null
          updated_at?: string | null
          user_id: string
          warranty_months?: number | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          price?: number | null
          purchase_date?: string | null
          recall_match?: boolean | null
          recall_url?: string | null
          receipt_file_path?: string | null
          receipt_photo_url?: string | null
          serial_number?: string | null
          updated_at?: string | null
          user_id?: string
          warranty_months?: number | null
        }
        Relationships: []
      }
      item_recall_matches: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          match_reason: string
          match_score: number
          matched_barcode: string | null
          matched_brand_tokens: string[] | null
          matched_model_tokens: string[] | null
          published_date: string | null
          recall_id: number
          source_system: string | null
          source_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          match_reason: string
          match_score: number
          matched_barcode?: string | null
          matched_brand_tokens?: string[] | null
          matched_model_tokens?: string[] | null
          published_date?: string | null
          recall_id: number
          source_system?: string | null
          source_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          match_reason?: string
          match_score?: number
          matched_barcode?: string | null
          matched_brand_tokens?: string[] | null
          matched_model_tokens?: string[] | null
          published_date?: string | null
          recall_id?: number
          source_system?: string | null
          source_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: { auth: string; created_at: string | null; endpoint: string; id: string; p256dh: string; updated_at: string | null; user_id: string }
        Insert: { auth: string; created_at?: string | null; endpoint: string; id?: string; p256dh: string; updated_at?: string | null; user_id: string }
        Update: { auth?: string; created_at?: string | null; endpoint?: string; id?: string; p256dh?: string; updated_at?: string | null; user_id?: string }
        Relationships: []
      }
      rate_limits: {
        Row: { count: number; key: string; reset_at: string; updated_at: string | null }
        Insert: { count?: number; key: string; reset_at: string; updated_at?: string | null }
        Update: { count?: number; key?: string; reset_at?: string; updated_at?: string | null }
        Relationships: []
      }
      recalls: {
        Row: {
          affected_barcodes: string[] | null
          brand: string
          content_fingerprint: string | null
          created_at: string | null
          hazard: string | null
          id: number
          last_seen_at: string | null
          model: string
          normalized_brand_tokens: string[] | null
          normalized_model_tokens: string[] | null
          normalized_name_tokens: string[] | null
          published_date: string | null
          raw_payload: Json | null
          remedy: string | null
          source: string
          source_id: string | null
          source_system: string | null
          source_url: string | null
          title: string
          updated_at: string | null
          url: string
        }
        Insert: {
          affected_barcodes?: string[] | null
          brand: string
          content_fingerprint?: string | null
          created_at?: string | null
          hazard?: string | null
          id?: number
          last_seen_at?: string | null
          model: string
          normalized_brand_tokens?: string[] | null
          normalized_model_tokens?: string[] | null
          normalized_name_tokens?: string[] | null
          published_date?: string | null
          raw_payload?: Json | null
          remedy?: string | null
          source: string
          source_id?: string | null
          source_system?: string | null
          source_url?: string | null
          title: string
          updated_at?: string | null
          url: string
        }
        Update: {
          affected_barcodes?: string[] | null
          brand?: string
          content_fingerprint?: string | null
          created_at?: string | null
          hazard?: string | null
          id?: number
          last_seen_at?: string | null
          model?: string
          normalized_brand_tokens?: string[] | null
          normalized_model_tokens?: string[] | null
          normalized_name_tokens?: string[] | null
          published_date?: string | null
          raw_payload?: Json | null
          remedy?: string | null
          source?: string
          source_id?: string | null
          source_system?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      upc_cache: {
        Row: { barcode: string; cached_at: string | null; lookup_count: number | null; product_data: Json; source: string | null; updated_at: string | null }
        Insert: { barcode: string; cached_at?: string | null; lookup_count?: number | null; product_data: Json; source?: string | null; updated_at?: string | null }
        Update: { barcode?: string; cached_at?: string | null; lookup_count?: number | null; product_data?: Json; source?: string | null; updated_at?: string | null }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource: string | null
          success: boolean | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource?: string | null
          success?: boolean | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      get_activation_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          first_item_at: string
          items_count: number
          last_item_at: string
          user_id: string
        }[]
      }
      get_paid_clicks_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          paid_clicks: number
          week: string
        }[]
      }
      get_pql_metrics: {
        Args: Record<PropertyKey, never>
        Returns: {
          items_count: number
          last_recall_alert_seen: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
