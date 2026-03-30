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
          tenant_id: string | null
        }
        Insert: {
          blocked_date: string
          created_at?: string
          id?: string
          reason?: string | null
          tenant_id?: string | null
        }
        Update: {
          blocked_date?: string
          created_at?: string
          id?: string
          reason?: string | null
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blocked_dates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          price_on_site: number | null
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
          price_on_site?: number | null
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
          price_on_site?: number | null
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "bundles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          favicon_url: string | null
          free_delivery_above_km: number | null
          id: string
          logo_url: string | null
          max_delivery_km: number | null
          min_lead_days: number | null
          min_order_value: number | null
          nip: string | null
          phone: string | null
          primary_color: string | null
          privacy_policy_url: string | null
          sms_notifications: boolean | null
          tenant_id: string | null
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
          favicon_url?: string | null
          free_delivery_above_km?: number | null
          id?: string
          logo_url?: string | null
          max_delivery_km?: number | null
          min_lead_days?: number | null
          min_order_value?: number | null
          nip?: string | null
          phone?: string | null
          primary_color?: string | null
          privacy_policy_url?: string | null
          sms_notifications?: boolean | null
          tenant_id?: string | null
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
          favicon_url?: string | null
          free_delivery_above_km?: number | null
          id?: string
          logo_url?: string | null
          max_delivery_km?: number | null
          min_lead_days?: number | null
          min_order_value?: number | null
          nip?: string | null
          phone?: string | null
          primary_color?: string | null
          privacy_policy_url?: string | null
          sms_notifications?: boolean | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          multiplier: number
          name: string
          set_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          max_selections?: number
          min_selections?: number
          multiplier?: number
          name: string
          set_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          max_selections?: number
          min_selections?: number
          multiplier?: number
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
          price_per_person_on_site: number | null
          tenant_id: string | null
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
          price_per_person_on_site?: number | null
          tenant_id?: string | null
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
          price_per_person_on_site?: number | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "configurable_sets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dedicated_offer_days: {
        Row: {
          day_date: string
          end_time: string | null
          guest_count: number | null
          id: string
          location: string | null
          offer_id: string
          sort_order: number | null
          start_time: string | null
        }
        Insert: {
          day_date: string
          end_time?: string | null
          guest_count?: number | null
          id?: string
          location?: string | null
          offer_id: string
          sort_order?: number | null
          start_time?: string | null
        }
        Update: {
          day_date?: string
          end_time?: string | null
          guest_count?: number | null
          id?: string
          location?: string | null
          offer_id?: string
          sort_order?: number | null
          start_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dedicated_offer_days_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "dedicated_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      dedicated_offer_items: {
        Row: {
          description: string | null
          id: string
          name: string
          price: number
          section_id: string
          sort_order: number
          source_id: string | null
          source_type: string | null
          unit_label: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          price?: number
          section_id: string
          sort_order?: number
          source_id?: string | null
          source_type?: string | null
          unit_label?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          price?: number
          section_id?: string
          sort_order?: number
          source_id?: string | null
          source_type?: string | null
          unit_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dedicated_offer_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "dedicated_offer_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      dedicated_offer_sections: {
        Row: {
          day_id: string | null
          icon: string | null
          id: string
          name: string
          offer_id: string
          sort_order: number
        }
        Insert: {
          day_id?: string | null
          icon?: string | null
          id?: string
          name: string
          offer_id: string
          sort_order?: number
        }
        Update: {
          day_id?: string | null
          icon?: string | null
          id?: string
          name?: string
          offer_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "dedicated_offer_sections_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "dedicated_offer_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dedicated_offer_sections_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "dedicated_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      dedicated_offer_selections: {
        Row: {
          id: string
          item_id: string
          notes: string | null
          offer_id: string
          quantity: number
          selected: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          item_id: string
          notes?: string | null
          offer_id: string
          quantity?: number
          selected?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          notes?: string | null
          offer_id?: string
          quantity?: number
          selected?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dedicated_offer_selections_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "dedicated_offer_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dedicated_offer_selections_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "dedicated_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      dedicated_offers: {
        Row: {
          arrival_time: string | null
          bride_email: string | null
          bride_first_name: string | null
          bride_last_name: string | null
          bride_phone: string | null
          client_address: string | null
          client_company: string | null
          client_email: string | null
          client_name: string
          client_nip: string | null
          client_phone: string | null
          contact_section_type: string
          coordinator: string | null
          created_at: string
          event_date_end: string | null
          event_date_start: string | null
          event_name: string | null
          groom_email: string | null
          groom_first_name: string | null
          groom_last_name: string | null
          groom_phone: string | null
          guests_adults: number | null
          guests_children_3_12: number | null
          guests_children_under_2: number | null
          guests_subcontractors: number | null
          id: string
          menu_children: number | null
          menu_standard: number | null
          menu_vegetarian: number | null
          notes: string | null
          status: string
          template_id: string | null
          tenant_id: string | null
          token: string
          updated_at: string
          venue: string | null
          wedding_date: string | null
        }
        Insert: {
          arrival_time?: string | null
          bride_email?: string | null
          bride_first_name?: string | null
          bride_last_name?: string | null
          bride_phone?: string | null
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name?: string
          client_nip?: string | null
          client_phone?: string | null
          contact_section_type?: string
          coordinator?: string | null
          created_at?: string
          event_date_end?: string | null
          event_date_start?: string | null
          event_name?: string | null
          groom_email?: string | null
          groom_first_name?: string | null
          groom_last_name?: string | null
          groom_phone?: string | null
          guests_adults?: number | null
          guests_children_3_12?: number | null
          guests_children_under_2?: number | null
          guests_subcontractors?: number | null
          id?: string
          menu_children?: number | null
          menu_standard?: number | null
          menu_vegetarian?: number | null
          notes?: string | null
          status?: string
          template_id?: string | null
          tenant_id?: string | null
          token: string
          updated_at?: string
          venue?: string | null
          wedding_date?: string | null
        }
        Update: {
          arrival_time?: string | null
          bride_email?: string | null
          bride_first_name?: string | null
          bride_last_name?: string | null
          bride_phone?: string | null
          client_address?: string | null
          client_company?: string | null
          client_email?: string | null
          client_name?: string
          client_nip?: string | null
          client_phone?: string | null
          contact_section_type?: string
          coordinator?: string | null
          created_at?: string
          event_date_end?: string | null
          event_date_start?: string | null
          event_name?: string | null
          groom_email?: string | null
          groom_first_name?: string | null
          groom_last_name?: string | null
          groom_phone?: string | null
          guests_adults?: number | null
          guests_children_3_12?: number | null
          guests_children_under_2?: number | null
          guests_subcontractors?: number | null
          id?: string
          menu_children?: number | null
          menu_standard?: number | null
          menu_vegetarian?: number | null
          notes?: string | null
          status?: string
          template_id?: string | null
          tenant_id?: string | null
          token?: string
          updated_at?: string
          venue?: string | null
          wedding_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dedicated_offers_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "offer_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dedicated_offers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_zones_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          price_per_unit_on_site: number | null
          product_type: string
          tenant_id: string | null
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
          price_per_unit_on_site?: number | null
          product_type?: string
          tenant_id?: string | null
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
          price_per_unit_on_site?: number | null
          product_type?: string
          tenant_id?: string | null
          unit_label?: string | null
          updated_at?: string
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "dishes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      event_extras_category_mappings: {
        Row: {
          event_type_id: string
          extras_category_id: string
          id: string
        }
        Insert: {
          event_type_id: string
          extras_category_id: string
          id?: string
        }
        Update: {
          event_type_id?: string
          extras_category_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_extras_category_mappings_event_type_id_fkey"
            columns: ["event_type_id"]
            isOneToOne: false
            referencedRelation: "event_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_extras_category_mappings_extras_category_id_fkey"
            columns: ["extras_category_id"]
            isOneToOne: false
            referencedRelation: "extras_categories"
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
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_types_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      extras: {
        Row: {
          category: string
          contents: string[] | null
          created_at: string
          description: string | null
          duration: string | null
          extras_category_id: string | null
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
          price_on_site: number | null
          requires_person_count: boolean | null
          sort_order: number
          tenant_id: string | null
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
          extras_category_id?: string | null
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
          price_on_site?: number | null
          requires_person_count?: boolean | null
          sort_order?: number
          tenant_id?: string | null
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
          extras_category_id?: string | null
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
          price_on_site?: number | null
          requires_person_count?: boolean | null
          sort_order?: number
          tenant_id?: string | null
          unit_label?: string | null
          updated_at?: string
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "extras_extras_category_id_fkey"
            columns: ["extras_category_id"]
            isOneToOne: false
            referencedRelation: "extras_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extras_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      extras_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string
          id: string
          is_required: boolean
          name: string
          slug: string
          sort_order: number
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_required?: boolean
          name: string
          slug: string
          sort_order?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_required?: boolean
          name?: string
          slug?: string
          sort_order?: number
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "extras_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      extras_set_items: {
        Row: {
          extra_id: string | null
          id: string
          name: string | null
          set_id: string
          sort_order: number | null
        }
        Insert: {
          extra_id?: string | null
          id?: string
          name?: string | null
          set_id: string
          sort_order?: number | null
        }
        Update: {
          extra_id?: string | null
          id?: string
          name?: string | null
          set_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "extras_set_items_extra_id_fkey"
            columns: ["extra_id"]
            isOneToOne: false
            referencedRelation: "extras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extras_set_items_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "extras_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      extras_sets: {
        Row: {
          created_at: string | null
          description: string | null
          extras_category_id: string | null
          id: string
          max_selections: number | null
          min_selections: number | null
          name: string
          price: number | null
          price_on_site: number | null
          sort_order: number | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          extras_category_id?: string | null
          id?: string
          max_selections?: number | null
          min_selections?: number | null
          name: string
          price?: number | null
          price_on_site?: number | null
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          extras_category_id?: string | null
          id?: string
          max_selections?: number | null
          min_selections?: number | null
          name?: string
          price?: number | null
          price_on_site?: number | null
          sort_order?: number | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "extras_sets_extras_category_id_fkey"
            columns: ["extras_category_id"]
            isOneToOne: false
            referencedRelation: "extras_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "extras_sets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
      offer_template_section_items: {
        Row: {
          description: string | null
          id: string
          name: string
          price: number
          section_id: string
          sort_order: number
          source_id: string | null
          source_type: string | null
          unit_label: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          price?: number
          section_id: string
          sort_order?: number
          source_id?: string | null
          source_type?: string | null
          unit_label?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          price?: number
          section_id?: string
          sort_order?: number
          source_id?: string | null
          source_type?: string | null
          unit_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_template_section_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "offer_template_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_template_sections: {
        Row: {
          icon: string | null
          id: string
          name: string
          sort_order: number
          template_id: string
        }
        Insert: {
          icon?: string | null
          id?: string
          name: string
          sort_order?: number
          template_id: string
        }
        Update: {
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_template_sections_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "offer_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_templates: {
        Row: {
          contact_section_type: string
          created_at: string
          description: string | null
          event_type: string | null
          id: string
          name: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          contact_section_type?: string
          created_at?: string
          description?: string | null
          event_type?: string | null
          id?: string
          name: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          contact_section_type?: string
          created_at?: string
          description?: string | null
          event_type?: string | null
          id?: string
          name?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_food_cost_extras: {
        Row: {
          amount: number
          created_at: string
          id: string
          name: string
          order_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          name: string
          order_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          name?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_food_cost_extras_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
          discount: number
          event_date: string | null
          event_type: string | null
          guest_count: number | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          status: string
          tenant_id: string | null
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
          discount?: number
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          status?: string
          tenant_id?: string | null
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
          discount?: number
          event_date?: string | null
          event_type?: string | null
          guest_count?: number | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          status?: string
          tenant_id?: string | null
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
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
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
      platter_items: {
        Row: {
          dish_id: string | null
          id: string
          multiplier: number | null
          name: string | null
          platter_id: string
          sort_order: number | null
        }
        Insert: {
          dish_id?: string | null
          id?: string
          multiplier?: number | null
          name?: string | null
          platter_id: string
          sort_order?: number | null
        }
        Update: {
          dish_id?: string | null
          id?: string
          multiplier?: number | null
          name?: string | null
          platter_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platter_items_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dishes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platter_items_platter_id_fkey"
            columns: ["platter_id"]
            isOneToOne: false
            referencedRelation: "platters"
            referencedColumns: ["id"]
          },
        ]
      }
      platters: {
        Row: {
          category_slug: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          long_description: string | null
          min_quantity: number | null
          name: string
          price_brutto: number | null
          price_netto: number | null
          price_on_site: number | null
          tenant_id: string | null
          unit_label: string | null
          updated_at: string | null
          vat_rate: number | null
        }
        Insert: {
          category_slug?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          long_description?: string | null
          min_quantity?: number | null
          name: string
          price_brutto?: number | null
          price_netto?: number | null
          price_on_site?: number | null
          tenant_id?: string | null
          unit_label?: string | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Update: {
          category_slug?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          long_description?: string | null
          min_quantity?: number | null
          name?: string
          price_brutto?: number | null
          price_netto?: number | null
          price_on_site?: number | null
          tenant_id?: string | null
          unit_label?: string | null
          updated_at?: string | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "platters_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
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
          tenant_id: string | null
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
          tenant_id?: string | null
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
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          max_users: number | null
          name: string
          nip: string | null
          notes: string | null
          phone: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          max_users?: number | null
          name: string
          nip?: string | null
          notes?: string | null
          phone?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          max_users?: number | null
          name?: string
          nip?: string | null
          notes?: string | null
          phone?: string | null
          slug?: string
          updated_at?: string | null
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
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
    }
    Enums: {
      app_role: "super_admin" | "tenant_admin" | "tenant_user"
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
      app_role: ["super_admin", "tenant_admin", "tenant_user"],
    },
  },
} as const
