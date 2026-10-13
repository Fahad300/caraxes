// Generated from the Supabase project schema (generate_typescript_types).
// Regenerate after changing a migration instead of editing by hand.
// Helper utility types from the generator are omitted; they're unused here.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.18';
  };
  public: {
    Tables: {
      exercises: {
        Row: {
          category: string | null;
          created_at: string;
          equipment: string | null;
          external_id: string | null;
          force: string | null;
          id: string;
          images: string[];
          instructions: string[];
          level: string | null;
          mechanic: string | null;
          name: string;
          primary_muscles: string[];
          secondary_muscles: string[];
          source: string;
          user_id: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          equipment?: string | null;
          external_id?: string | null;
          force?: string | null;
          id?: string;
          images?: string[];
          instructions?: string[];
          level?: string | null;
          mechanic?: string | null;
          name: string;
          primary_muscles?: string[];
          secondary_muscles?: string[];
          source?: string;
          user_id?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          equipment?: string | null;
          external_id?: string | null;
          force?: string | null;
          id?: string;
          images?: string[];
          instructions?: string[];
          level?: string | null;
          mechanic?: string | null;
          name?: string;
          primary_muscles?: string[];
          secondary_muscles?: string[];
          source?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      food_logs: {
        Row: {
          food_id: string | null;
          id: string;
          kcal: number | null;
          label: string;
          logged_at: string;
          logged_on: string;
          meal_slot: string | null;
          protein_g: number;
          quantity_g: number | null;
          template_id: string | null;
          user_id: string;
        };
        Insert: {
          food_id?: string | null;
          id?: string;
          kcal?: number | null;
          label: string;
          logged_at?: string;
          logged_on: string;
          meal_slot?: string | null;
          protein_g?: number;
          quantity_g?: number | null;
          template_id?: string | null;
          user_id?: string;
        };
        Update: {
          food_id?: string | null;
          id?: string;
          kcal?: number | null;
          label?: string;
          logged_at?: string;
          logged_on?: string;
          meal_slot?: string | null;
          protein_g?: number;
          quantity_g?: number | null;
          template_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'food_logs_food_id_fkey';
            columns: ['food_id'];
            isOneToOne: false;
            referencedRelation: 'foods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'food_logs_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'meal_templates';
            referencedColumns: ['id'];
          },
        ];
      };
      foods: {
        Row: {
          created_at: string;
          external_id: string | null;
          id: string;
          kcal_per_100g: number | null;
          name: string;
          protein_g_per_100g: number;
          serving_g: number | null;
          serving_label: string | null;
          source: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          external_id?: string | null;
          id?: string;
          kcal_per_100g?: number | null;
          name: string;
          protein_g_per_100g?: number;
          serving_g?: number | null;
          serving_label?: string | null;
          source?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          external_id?: string | null;
          id?: string;
          kcal_per_100g?: number | null;
          name?: string;
          protein_g_per_100g?: number;
          serving_g?: number | null;
          serving_label?: string | null;
          source?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      meal_template_items: {
        Row: {
          food_id: string | null;
          id: string;
          kcal: number | null;
          label: string;
          protein_g: number;
          quantity_g: number | null;
          sort_order: number;
          template_id: string;
          user_id: string;
        };
        Insert: {
          food_id?: string | null;
          id?: string;
          kcal?: number | null;
          label: string;
          protein_g?: number;
          quantity_g?: number | null;
          sort_order?: number;
          template_id: string;
          user_id?: string;
        };
        Update: {
          food_id?: string | null;
          id?: string;
          kcal?: number | null;
          label?: string;
          protein_g?: number;
          quantity_g?: number | null;
          sort_order?: number;
          template_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'meal_template_items_food_id_fkey';
            columns: ['food_id'];
            isOneToOne: false;
            referencedRelation: 'foods';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'meal_template_items_template_id_user_id_fkey';
            columns: ['template_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'meal_templates';
            referencedColumns: ['id', 'user_id'];
          },
        ];
      };
      meal_templates: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          user_id?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          protein_target_high_g: number;
          protein_target_low_g: number;
          seeded_at: string | null;
          water_target_ml: number;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          protein_target_high_g?: number;
          protein_target_low_g?: number;
          seeded_at?: string | null;
          water_target_ml?: number;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          protein_target_high_g?: number;
          protein_target_low_g?: number;
          seeded_at?: string | null;
          water_target_ml?: number;
        };
        Relationships: [];
      };
      routine_day_exercises: {
        Row: {
          day_id: string;
          exercise_id: string;
          id: string;
          per_side: boolean;
          phase: string;
          rep_high: number;
          rep_low: number;
          rest_seconds: number | null;
          sort_order: number;
          target_sets: number;
          user_id: string;
        };
        Insert: {
          day_id: string;
          exercise_id: string;
          id?: string;
          per_side?: boolean;
          phase: string;
          rep_high: number;
          rep_low: number;
          rest_seconds?: number | null;
          sort_order?: number;
          target_sets: number;
          user_id?: string;
        };
        Update: {
          day_id?: string;
          exercise_id?: string;
          id?: string;
          per_side?: boolean;
          phase?: string;
          rep_high?: number;
          rep_low?: number;
          rest_seconds?: number | null;
          sort_order?: number;
          target_sets?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'routine_day_exercises_day_id_user_id_fkey';
            columns: ['day_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'routine_days';
            referencedColumns: ['id', 'user_id'];
          },
          {
            foreignKeyName: 'routine_day_exercises_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercises';
            referencedColumns: ['id'];
          },
        ];
      };
      routine_days: {
        Row: {
          cardio_finisher: string | null;
          focus: string | null;
          id: string;
          name: string;
          routine_id: string;
          sort_order: number;
          user_id: string;
          weekday: number | null;
        };
        Insert: {
          cardio_finisher?: string | null;
          focus?: string | null;
          id?: string;
          name: string;
          routine_id: string;
          sort_order?: number;
          user_id?: string;
          weekday?: number | null;
        };
        Update: {
          cardio_finisher?: string | null;
          focus?: string | null;
          id?: string;
          name?: string;
          routine_id?: string;
          sort_order?: number;
          user_id?: string;
          weekday?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'routine_days_routine_id_user_id_fkey';
            columns: ['routine_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'routines';
            referencedColumns: ['id', 'user_id'];
          },
        ];
      };
      routines: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          user_id?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      set_logs: {
        Row: {
          exercise_id: string | null;
          exercise_name: string;
          id: string;
          logged_at: string;
          reps: number | null;
          session_id: string;
          set_number: number;
          user_id: string;
          weight: number | null;
        };
        Insert: {
          exercise_id?: string | null;
          exercise_name: string;
          id?: string;
          logged_at?: string;
          reps?: number | null;
          session_id: string;
          set_number: number;
          user_id?: string;
          weight?: number | null;
        };
        Update: {
          exercise_id?: string | null;
          exercise_name?: string;
          id?: string;
          logged_at?: string;
          reps?: number | null;
          session_id?: string;
          set_number?: number;
          user_id?: string;
          weight?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'set_logs_exercise_id_fkey';
            columns: ['exercise_id'];
            isOneToOne: false;
            referencedRelation: 'exercises';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'set_logs_session_id_user_id_fkey';
            columns: ['session_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'workout_sessions';
            referencedColumns: ['id', 'user_id'];
          },
        ];
      };
      supplement_logs: {
        Row: {
          id: string;
          logged_at: string;
          supplement_id: string;
          taken_on: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          logged_at?: string;
          supplement_id: string;
          taken_on: string;
          user_id?: string;
        };
        Update: {
          id?: string;
          logged_at?: string;
          supplement_id?: string;
          taken_on?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'supplement_logs_supplement_id_user_id_fkey';
            columns: ['supplement_id', 'user_id'];
            isOneToOne: false;
            referencedRelation: 'supplements';
            referencedColumns: ['id', 'user_id'];
          },
        ];
      };
      supplements: {
        Row: {
          dose: string | null;
          id: string;
          is_active: boolean;
          name: string;
          protein_g: number;
          sort_order: number;
          timing: string | null;
          user_id: string;
        };
        Insert: {
          dose?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          protein_g?: number;
          sort_order?: number;
          timing?: string | null;
          user_id?: string;
        };
        Update: {
          dose?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          protein_g?: number;
          sort_order?: number;
          timing?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      water_logs: {
        Row: {
          amount_ml: number;
          id: string;
          logged_at: string;
          logged_on: string;
          user_id: string;
        };
        Insert: {
          amount_ml: number;
          id?: string;
          logged_at?: string;
          logged_on: string;
          user_id?: string;
        };
        Update: {
          amount_ml?: number;
          id?: string;
          logged_at?: string;
          logged_on?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      weight_entries: {
        Row: {
          id: string;
          logged_on: string;
          user_id: string;
          weight_kg: number;
        };
        Insert: {
          id?: string;
          logged_on: string;
          user_id?: string;
          weight_kg: number;
        };
        Update: {
          id?: string;
          logged_on?: string;
          user_id?: string;
          weight_kg?: number;
        };
        Relationships: [];
      };
      workout_sessions: {
        Row: {
          day_name: string;
          ended_at: string | null;
          id: string;
          logged_on: string;
          routine_day_id: string | null;
          started_at: string;
          user_id: string;
        };
        Insert: {
          day_name: string;
          ended_at?: string | null;
          id?: string;
          logged_on: string;
          routine_day_id?: string | null;
          started_at?: string;
          user_id?: string;
        };
        Update: {
          day_name?: string;
          ended_at?: string | null;
          id?: string;
          logged_on?: string;
          routine_day_id?: string | null;
          started_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workout_sessions_routine_day_id_fkey';
            columns: ['routine_day_id'];
            isOneToOne: false;
            referencedRelation: 'routine_days';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      seed_default_data: { Args: { payload: Json }; Returns: undefined };
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { ''?: string }; Returns: string[] };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
