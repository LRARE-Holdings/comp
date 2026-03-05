export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      firms: {
        Row: {
          id: string;
          name: string;
          sra_number: string | null;
          size_band: "1-5" | "6-20" | "21-50" | "50+";
          practice_areas: string[];
          role_types: string[];
          subscription_tier: "solo" | "small" | "mid" | "enterprise" | null;
          subscription_status: "trial" | "active" | "cancelled" | "expired";
          trial_ends_at: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["firms"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["firms"]["Insert"]>;
      };
      users: {
        Row: {
          id: string;
          auth_id: string;
          firm_id: string | null;
          email: string;
          full_name: string;
          role: "colp" | "cofa" | "partner" | "associate" | "admin";
          notification_preferences: {
            high_priority: boolean;
            deadlines: boolean;
            weekly_digest: boolean;
            frequency: "immediate" | "daily" | "weekly";
          };
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["users"]["Insert"]>;
      };
      regulatory_updates: {
        Row: {
          id: string;
          title: string;
          raw_content: string;
          summary: string | null;
          impact_level: "high" | "medium" | "low" | "info";
          practice_areas: string[];
          firm_size_relevance: string[];
          deadline: string | null;
          source_url: string;
          sra_reference: string | null;
          publication_date: string;
          status: "draft" | "review" | "published";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["regulatory_updates"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["regulatory_updates"]["Insert"]>;
      };
      actions: {
        Row: {
          id: string;
          firm_id: string;
          regulatory_update_id: string;
          title: string;
          description: string;
          status: "not_started" | "in_progress" | "complete";
          priority: "high" | "medium" | "low";
          deadline: string | null;
          assigned_to: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["actions"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["actions"]["Insert"]>;
      };
      policies: {
        Row: {
          id: string;
          firm_id: string;
          title: string;
          file_url: string;
          parsed_text: string | null;
          section_index: Json | null;
          uploaded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["policies"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["policies"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience types
export type Firm = Database["public"]["Tables"]["firms"]["Row"];
export type User = Database["public"]["Tables"]["users"]["Row"];
export type RegulatoryUpdate = Database["public"]["Tables"]["regulatory_updates"]["Row"];
export type Action = Database["public"]["Tables"]["actions"]["Row"];
export type Policy = Database["public"]["Tables"]["policies"]["Row"];
