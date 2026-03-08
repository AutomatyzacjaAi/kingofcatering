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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      blocked_dates: {
        Row: {
          blocked_date: string
          created_at: string
          id: string
          reason: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
        }
        Relationships: []
      }
      bundle_variants: {
        Row: {
          allergens: string[] | null
          bundle_id: string
          description: string | null
          dietary_tags: string[] | null
          dish_id: string | null
          id: string
          name: string
          price: number
          sort_order: number
        }
        Insert: {
          allergens?: string[] | null
          bundle_id: string
          description?: string | null
          dietary_tags?: string[] | null
          dish_id?: string | null
          id?: string
          name: string
          price?: number
          sort_order?: number
        }
        Update: {
          allergens?: string[] | null
          bundle_id?: string
          description?: string | null
          dietary_tags?: string[] | null
          dish_id?: string | null
          id?: string
          name?: string
          price?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "bundle_variants_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_variants_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          base_price: number
          category_slug: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          long_description: string | null
          min_quantity: number
          name: string
          price_brutto: number
          price_netto: number
          updated_at: string
          vat_rate: number
        }
        Insert: {
          base_price?: number
          category_slug?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          long_description?: string | null
          min_quantity?: number
          name: string
          price_brutto?: number
          price_netto?: number
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          base_price?: number
          category_slug?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          long_description?: string | null
          min_quantity?: number
          name?: string
          price_brutto?: number
          price_netto?: number
          updated_at?: string
          vat_rate?: number
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          city: string | null
          company_address: string | null
          company_city: string | null
          company_name: string | null
          company_postal_code: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          nip: string | null
          notes: string | null
          phone: string
          phone_alt: string | null
          postal_code: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          company_address?: string | null
          company_city?: string | null
          company_name?: string | null
          company_postal_code?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          nip?: string | null
          notes?: string | null
          phone?: string
          phone_alt?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          company_address?: string | null
          company_city?: string | null
          company_name?: string | null
          company_postal_code?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          nip?: string | null
          notes?: string | null
          phone?: string
          phone_alt?: string | null
          postal_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          address: string | null
          auto_confirm: boolean | null
          bank_account: string | null
          company_address_full: string | null
          company_lat: number | null
          company_lng: number | null
          company_name: string | null
          created_at: string
          delivery_price_per_km: number
          email: string | null
          email_notifications: boolean | null
          free_delivery_above_km: number | null
          id: string
          max_delivery_km: number | null
          min_lead_days: number | null
          min_order_value: number | null
          nip: string | null
          phone: string | null
          sms_notifications: boolean | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          auto_confirm?: boolean | null
          bank_account?: string | null
          company_address_full?: string | null
          company_lat?: number | null
          company_lng?: number | null
          company_name?: string | null
          created_at?: string
          delivery_price_per_km?: number
          email?: string | null
          email_notifications?: boolean | null
          free_delivery_above_km?: number | null
          id?: string
          max_delivery_km?: number | null
          min_lead_days?: number | null
          min_order_value?: number | null
          nip?: string | null
          phone?: string | null
          sms_notifications?: boolean | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          auto_confirm?: boolean | null
          bank_account?: string | null
          company_address_full?: string | null
          company_lat?: number | null
          company_lng?: number | null
          company_name?: string | null
          created_at?: string
          delivery_price_per_km?: number
          email?: string | null
          email_notifications?: boolean | null
          free_delivery_above_km?: number | null
          id?: string
          max_delivery_km?: number | null
          min_lead_days?: number | null
          min_order_value?: number | null
          nip?: string | null
          phone?: string | null
          sms_notifications?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      config_group_options: {
        Row: {
          allergens: string[] | null
          dish_id: string | null
          group_id: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          allergens?: string[] | null
          dish_id?: string | null
          group_id: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          allergens?: string[] | null
          dish_id?: string | null
          group_id?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "config_group_options_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_group_options_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "config_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      config_groups: {
        Row: {
          id: string
          max_selections: number
          min_selections: number
          name: string
          set_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          max_selections?: number
          min_selections?: number
          name: string
          set_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          max_selections?: number
          min_selections?: number
          name?: string
          set_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "config_groups_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "configurable_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      configurable_sets: {
        Row: {
          category_slug: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          long_description: string | null
          min_persons: number
          name: string
          price_per_person: number
          updated_at: string
        }
        Insert: {
          category_slug?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          long_description?: string | null
          min_persons?: number
          name: string
          price_per_person?: number
          updated_at?: string
        }
        Update: {
          category_slug?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          long_description?: string | null
          min_persons?: number
          name?: string
          price_per_person?: number
          updated_at?: string
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          cities: string[] | null
          created_at: string
          description: string | null
          free_delivery_above: number | null
          id: string
          is_active: boolean
          min_order_value: number | null
          name: string
          postal_codes: string[] | null
          price: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          cities?: string[] | null
          created_at?: string
          description?: string | null
          free_delivery_above?: number | null
          id?: string
          is_active?: boolean
          min_order_value?: number | null
          name: string
          postal_codes?: string[] | null
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          cities?: string[] | null
          created_at?: string
          description?: string | null
          free_delivery_above?: number | null
          id?: string
          is_active?: boolean
          min_order_value?: number | null
          name?: string
          postal_codes?: string[] | null
          price?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      dish_ingredients: {
        Row: {
          dish_id: string
          id: string
          ingredient_id: string
          quantity: number
        }
        Insert: {
          dish_id: string
          id?: string
          ingredient_id: string
          quantity?: number
        }
        Update: {
          dish_id?: string
          id?: string
          ingredient_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "dish_ingredients_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dish_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
        ]
      }
      dishes: {
        Row: {
          allergens: string[] | null
          category_slug: string | null
          contents: string[] | null
          created_at: string
          description: string | null
          dietary_tags: string[] | null
          icon: string | null
          id: string
          image_url: string | null
          long_description: string | null
          min_quantity: number | null
          name: string
          price_brutto: number
          price_netto: number
          price_per_unit: number | null
          product_type: string
          unit_label: string | null
          updated_at: string
          vat_rate: number
        }
        Insert: {
          allergens?: string[] | null
          category_slug?: string | null
          contents?: string[] | null
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          long_description?: string | null
          min_quantity?: number | null
          name: string
          price_brutto?: number
          price_netto?: number
          price_per_unit?: number | null
          product_type?: string
          unit_label?: string | null
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          allergens?: string[] | null
          category_slug?: string | null
          contents?: string[] | null
          created_at?: string
          description?: string | null
          dietary_tags?: string[] | null
          icon?: string | null
          id?: string
          image_url?: string | null
          long_description?: string | null
          min_quantity?: number | null
          name?: string
          price_brutto?: number
          price_netto?: number
          price_per_unit?: number | null
          product_type?: string
          unit_label?: string | null
          updated_at?: string
          vat_rate?: number
        }
        Relationships: []
      }
      event_category_mappings: {
        Row: {
          category_id: string
          event_type_id: string
          id: string
        }
        Insert: {
          category_id: string
          event_type_id: string
          id?: string
        }
        Update: {
          category_id?: string
          event_type_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_category_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_category_mappings_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
        ]
      }
      event_types: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      extras: {
        Row: {
          category: string
          contents: string[] | null
          created_at: string
          description: string | null
          duration: string | null
          food_cost: number | null
          icon: string | null
          id: string
          image_url: string | null
          long_description: string | null
          name: string
          price: number
          price_brutto: number | null
          price_label: string | null
          price_netto: number | null
          requires_person_count: boolean | null
          sort_order: number
          unit_label: string | null
          updated_at: string
          vat_rate: number | null
        }
        Insert: {
          category?: string
          contents?: string[] | null
          created_at?: string
          description?: string | null
          duration?: string | null
          food_cost?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          long_description?: string | null
          name: string
          price?: number
          price_brutto?: number | null
          price_label?: string | null
          price_netto?: number | null
          requires_person_count?: boolean | null
          sort_order?: number
          unit_label?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Update: {
          category?: string
          contents?: string[] | null
          created_at?: string
          description?: string | null
          duration?: string | null
          food_cost?: number | null
          icon?: string | null
          id?: string
          image_url?: string | null
          long_description?: string | null
          name?: string
          price?: number
          price_brutto?: number | null
          price_label?: string | null
          price_netto?: number | null
          requires_person_count?: boolean | null
          sort_order?: number
          unit_label?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          allergens: string[] | null
          created_at: string
          id: string
          name: string
          price_per_unit: number
          unit: string
          updated_at: string
        }
        Insert: {
          allergens?: string[] | null
          created_at?: string
          id?: string
          name: string
          price_per_unit?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          allergens?: string[] | null
          created_at?: string
          id?: string
          name?: string
          price_per_unit?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_item_sub_items: {
        Row: {
          food_cost_per_unit: number | null
          id: string
          name: string
          order_item_id: string
          quantity: number
          sort_order: number
          unit: string
        }
        Insert: {
          food_cost_per_unit?: number | null
          id?: string
          name: string
          order_item_id: string
          quantity?: number
          sort_order?: number
          unit?: string
        }
        Update: {
          food_cost_per_unit?: number | null
          id?: string
          name?: string
          order_item_id?: string
          quantity?: number
          sort_order?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_item_sub_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          food_cost_per_unit: number | null
          id: string
          item_type: string | null
          name: string
          order_id: string
          price_per_unit: number
          quantity: number
          sort_order: number
          total: number
          unit: string
        }
        Insert: {
          food_cost_per_unit?: number | null
          id?: string
          item_type?: string | null
          name: string
          order_id: string
          price_per_unit?: number
          quantity?: number
          sort_order?: number
          total?: number
          unit?: string
        }
        Update: {
          food_cost_per_unit?: number | null
          id?: string
          item_type?: string | null
          name?: string
          order_id?: string
          price_per_unit?: number
          quantity?: number
          sort_order?: number
          total?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          client_email: string | null
          client_id: string | null
          client_name: string
          client_phone: string | null
          contact_apartment: string | null
          contact_building: string | null
          contact_city: string | null
          contact_street: string | null
          created_at: string
          delivery_address: string | null
          delivery_cost: number
          delivery_zone_id: string | null
          event_date: string | null
          event_type: string | null
          guest_count: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          contact_apartment?: string | null
          contact_building?: string | null
          contact_city?: string | null
          contact_street?: string | null
          created_at?: string
          delivery_address?: string | null
          delivery_cost?: number
          delivery_zone_id?: string | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          contact_apartment?: string | null
          contact_building?: string | null
          contact_city?: string | null
          contact_street?: string | null
          created_at?: string
          delivery_address?: string | null
          delivery_cost?: number
          delivery_zone_id?: string | null
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_zone_id_fkey"
            columns: ["delivery_zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          sort_order: number
        }
        Insert: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sort_order?: number
        }
        Update: {
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
