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
        Insert: {
          name: string;
          sra_number?: string | null;
          size_band: "1-5" | "6-20" | "21-50" | "50+";
          practice_areas?: string[];
          role_types?: string[];
          subscription_tier?: "solo" | "small" | "mid" | "enterprise" | null;
          subscription_status?: "trial" | "active" | "cancelled" | "expired";
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Update: {
          name?: string;
          sra_number?: string | null;
          size_band?: "1-5" | "6-20" | "21-50" | "50+";
          practice_areas?: string[];
          role_types?: string[];
          subscription_tier?: "solo" | "small" | "mid" | "enterprise" | null;
          subscription_status?: "trial" | "active" | "cancelled" | "expired";
          trial_ends_at?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
        };
        Relationships: [];
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
        Insert: {
          auth_id: string;
          firm_id?: string | null;
          email: string;
          full_name: string;
          role?: "colp" | "cofa" | "partner" | "associate" | "admin";
          notification_preferences?: {
            high_priority: boolean;
            deadlines: boolean;
            weekly_digest: boolean;
            frequency: "immediate" | "daily" | "weekly";
          };
        };
        Update: {
          auth_id?: string;
          firm_id?: string | null;
          email?: string;
          full_name?: string;
          role?: "colp" | "cofa" | "partner" | "associate" | "admin";
          notification_preferences?: {
            high_priority: boolean;
            deadlines: boolean;
            weekly_digest: boolean;
            frequency: "immediate" | "daily" | "weekly";
          };
        };
        Relationships: [
          {
            foreignKeyName: "users_firm_id_fkey";
            columns: ["firm_id"];
            isOneToOne: false;
            referencedRelation: "firms";
            referencedColumns: ["id"];
          },
        ];
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
        Insert: {
          title: string;
          raw_content: string;
          summary?: string | null;
          impact_level?: "high" | "medium" | "low" | "info";
          practice_areas?: string[];
          firm_size_relevance?: string[];
          deadline?: string | null;
          source_url: string;
          sra_reference?: string | null;
          publication_date: string;
          status?: "draft" | "review" | "published";
        };
        Update: {
          title?: string;
          raw_content?: string;
          summary?: string | null;
          impact_level?: "high" | "medium" | "low" | "info";
          practice_areas?: string[];
          firm_size_relevance?: string[];
          deadline?: string | null;
          source_url?: string;
          sra_reference?: string | null;
          publication_date?: string;
          status?: "draft" | "review" | "published";
        };
        Relationships: [];
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
        Insert: {
          firm_id: string;
          regulatory_update_id: string;
          title: string;
          description?: string;
          status?: "not_started" | "in_progress" | "complete";
          priority?: "high" | "medium" | "low";
          deadline?: string | null;
          assigned_to?: string | null;
          completed_at?: string | null;
        };
        Update: {
          firm_id?: string;
          regulatory_update_id?: string;
          title?: string;
          description?: string;
          status?: "not_started" | "in_progress" | "complete";
          priority?: "high" | "medium" | "low";
          deadline?: string | null;
          assigned_to?: string | null;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "actions_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "actions_firm_id_fkey";
            columns: ["firm_id"];
            isOneToOne: false;
            referencedRelation: "firms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "actions_regulatory_update_id_fkey";
            columns: ["regulatory_update_id"];
            isOneToOne: false;
            referencedRelation: "regulatory_updates";
            referencedColumns: ["id"];
          },
        ];
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
        Insert: {
          firm_id: string;
          title: string;
          file_url: string;
          parsed_text?: string | null;
          section_index?: Json | null;
          uploaded_by: string;
        };
        Update: {
          firm_id?: string;
          title?: string;
          file_url?: string;
          parsed_text?: string | null;
          section_index?: Json | null;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: "policies_firm_id_fkey";
            columns: ["firm_id"];
            isOneToOne: false;
            referencedRelation: "firms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "policies_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      waitlist_leads: {
        Row: {
          id: string;
          email: string;
          source: string;
          created_at: string;
        };
        Insert: {
          email: string;
          source?: string;
        };
        Update: {
          email?: string;
          source?: string;
        };
        Relationships: [];
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
export type WaitlistLead = Database["public"]["Tables"]["waitlist_leads"]["Row"];
