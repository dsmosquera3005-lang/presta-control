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
      advisor_daily_base: {
        Row: {
          advisor_id: string
          base_amount: number
          created_at: string
          date: string
          id: string
          manual_adjustment: number
          notes: string | null
          updated_at: string
        }
        Insert: {
          advisor_id: string
          base_amount?: number
          created_at?: string
          date?: string
          id?: string
          manual_adjustment?: number
          notes?: string | null
          updated_at?: string
        }
        Update: {
          advisor_id?: string
          base_amount?: number
          created_at?: string
          date?: string
          id?: string
          manual_adjustment?: number
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          id: boolean
          interest_rate: number
          updated_at: string
        }
        Insert: {
          id?: boolean
          interest_rate?: number
          updated_at?: string
        }
        Update: {
          id?: boolean
          interest_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      cash_transfers: {
        Row: {
          amount: number
          created_at: string
          from_advisor: string
          id: string
          notes: string | null
          responded_at: string | null
          status: string
          to_advisor: string
          transfer_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_advisor: string
          id?: string
          notes?: string | null
          responded_at?: string | null
          status?: string
          to_advisor: string
          transfer_date?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_advisor?: string
          id?: string
          notes?: string | null
          responded_at?: string | null
          status?: string
          to_advisor?: string
          transfer_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      change_requests: {
        Row: {
          admin_notes: string | null
          client_id: string | null
          created_at: string
          id: string
          loan_id: string | null
          payload: Json
          payment_id: string | null
          reason: string | null
          request_type: Database["public"]["Enums"]["change_request_type"]
          requested_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["change_request_status"]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          loan_id?: string | null
          payload?: Json
          payment_id?: string | null
          reason?: string | null
          request_type: Database["public"]["Enums"]["change_request_type"]
          requested_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["change_request_status"]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          loan_id?: string | null
          payload?: Json
          payment_id?: string | null
          reason?: string | null
          request_type?: Database["public"]["Enums"]["change_request_type"]
          requested_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["change_request_status"]
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          birth_date: string | null
          cedula: string
          cedula_back_url: string | null
          cedula_front_url: string | null
          created_at: string
          created_by: string
          email: string | null
          full_name: string
          home_address: string | null
          id: string
          payment_proof_url: string | null
          phone: string | null
          profile_photo_url: string | null
          references_info: string | null
          status: Database["public"]["Enums"]["client_status"]
          updated_at: string
          utility_bill_url: string | null
          work_address: string | null
        }
        Insert: {
          birth_date?: string | null
          cedula: string
          cedula_back_url?: string | null
          cedula_front_url?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          full_name: string
          home_address?: string | null
          id?: string
          payment_proof_url?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          references_info?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          utility_bill_url?: string | null
          work_address?: string | null
        }
        Update: {
          birth_date?: string | null
          cedula?: string
          cedula_back_url?: string | null
          cedula_front_url?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          full_name?: string
          home_address?: string | null
          id?: string
          payment_proof_url?: string | null
          phone?: string | null
          profile_photo_url?: string | null
          references_info?: string | null
          status?: Database["public"]["Enums"]["client_status"]
          updated_at?: string
          utility_bill_url?: string | null
          work_address?: string | null
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          last_read_at: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          last_read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          amount: number
          client_id: string
          created_at: string
          created_by: string
          expected_amount: number
          id: string
          interest_paid: number | null
          loan_date: string
          mora_waived: boolean
          notes: string | null
          payment_date: string
          renewed_from: string | null
          status: Database["public"]["Enums"]["loan_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          client_id: string
          created_at?: string
          created_by: string
          expected_amount: number
          id?: string
          interest_paid?: number | null
          loan_date?: string
          mora_waived?: boolean
          notes?: string | null
          payment_date: string
          renewed_from?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          created_at?: string
          created_by?: string
          expected_amount?: number
          id?: string
          interest_paid?: number | null
          loan_date?: string
          mora_waived?: boolean
          notes?: string | null
          payment_date?: string
          renewed_from?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_renewed_from_fkey"
            columns: ["renewed_from"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          message_type: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id: string
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          advisor_id: string
          amount: number
          client_id: string
          created_at: string
          id: string
          loan_id: string
          notes: string | null
          payment_date: string
          payment_type: string
        }
        Insert: {
          advisor_id: string
          amount: number
          client_id: string
          created_at?: string
          id?: string
          loan_id: string
          notes?: string | null
          payment_date?: string
          payment_type: string
        }
        Update: {
          advisor_id?: string
          amount?: number
          client_id?: string
          created_at?: string
          id?: string
          loan_id?: string
          notes?: string | null
          payment_date?: string
          payment_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          blocked_until: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          blocked_until?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          updated_at?: string
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_participant: {
        Args: { _conv_id: string; _user_id: string }
        Returns: boolean
      }
      is_user_active: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "asesor"
      change_request_status: "pending" | "approved" | "rejected"
      change_request_type:
        | "update_client"
        | "increase_loan"
        | "decrease_loan"
        | "waive_mora"
        | "delete_payment"
        | "delete_loan"
        | "delete_client"
      client_status: "activo" | "en_aviso" | "sacado"
      loan_status: "activo" | "pagado" | "vencido"
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
      app_role: ["admin", "asesor"],
      change_request_status: ["pending", "approved", "rejected"],
      change_request_type: [
        "update_client",
        "increase_loan",
        "decrease_loan",
        "waive_mora",
        "delete_payment",
        "delete_loan",
        "delete_client",
      ],
      client_status: ["activo", "en_aviso", "sacado"],
      loan_status: ["activo", "pagado", "vencido"],
    },
  },
} as const
