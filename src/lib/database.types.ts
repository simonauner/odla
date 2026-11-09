// Genererad från Supabase-schemat (public) och nedbantad till tabellerna.
// Generera om efter schemaändringar: `npx supabase gen types typescript --project-id haiidlamhbdgfugosykm`.

type Table<Row, Insert, Rel = []> = { Row: Row; Insert: Insert; Update: Partial<Insert>; Relationships: Rel };

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.18" };
  public: {
    Tables: {
      profiles: Table<
        { id: string; display_name: string | null; zone: number | null; created_at: string },
        { id: string; display_name?: string | null; zone?: number | null; created_at?: string }
      >;
      seasons: Table<
        { id: string; user_id: string; year: number; zone: number; last_frost: string | null; created_at: string },
        {
          id?: string;
          user_id: string;
          year: number;
          zone: number;
          last_frost?: string | null;
          created_at?: string;
        }
      >;
      plantings: Table<
        {
          id: string;
          season_id: string;
          user_id: string;
          crop_id: string;
          variety: string | null;
          quantity: number | null;
          location: string | null;
          notes: string | null;
          created_at: string;
        },
        {
          id?: string;
          season_id: string;
          user_id: string;
          crop_id: string;
          variety?: string | null;
          quantity?: number | null;
          location?: string | null;
          notes?: string | null;
          created_at?: string;
        },
        [
          {
            foreignKeyName: "plantings_season_id_fkey";
            columns: ["season_id"];
            isOneToOne: false;
            referencedRelation: "seasons";
            referencedColumns: ["id"];
          },
        ]
      >;
      task_logs: Table<
        {
          id: string;
          planting_id: string;
          user_id: string;
          step_key: string;
          status: string;
          done_on: string;
          note: string | null;
          created_at: string;
        },
        {
          id?: string;
          planting_id: string;
          user_id: string;
          step_key: string;
          status?: string;
          done_on: string;
          note?: string | null;
          created_at?: string;
        },
        [
          {
            foreignKeyName: "task_logs_planting_id_fkey";
            columns: ["planting_id"];
            isOneToOne: false;
            referencedRelation: "plantings";
            referencedColumns: ["id"];
          },
        ]
      >;
      photos: Table<
        {
          id: string;
          planting_id: string;
          user_id: string;
          storage_path: string;
          taken_on: string;
          caption: string | null;
          created_at: string;
        },
        {
          id?: string;
          planting_id: string;
          user_id: string;
          storage_path: string;
          taken_on?: string;
          caption?: string | null;
          created_at?: string;
        },
        [
          {
            foreignKeyName: "photos_planting_id_fkey";
            columns: ["planting_id"];
            isOneToOne: false;
            referencedRelation: "plantings";
            referencedColumns: ["id"];
          },
        ]
      >;
      evaluations: Table<
        {
          planting_id: string;
          user_id: string;
          rating: number | null;
          harvest_kg: number | null;
          went_well: string | null;
          do_differently: string | null;
          updated_at: string;
        },
        {
          planting_id: string;
          user_id: string;
          rating?: number | null;
          harvest_kg?: number | null;
          went_well?: string | null;
          do_differently?: string | null;
          updated_at?: string;
        },
        [
          {
            foreignKeyName: "evaluations_planting_id_fkey";
            columns: ["planting_id"];
            isOneToOne: true;
            referencedRelation: "plantings";
            referencedColumns: ["id"];
          },
        ]
      >;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Row<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
