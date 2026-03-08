import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type {
  Product, SimpleProduct, ExpandableProduct, ConfigurableProduct,
  ProductVariant, OptionGroup, GroupOption,
  EventType, Category,
} from "@/data/products";
import type {
  ExtraItem, PackagingOption, WaiterServiceOption, PaymentMethod,
} from "@/data/extras";

// ─── Fetch helpers ───────────────────────────────────────────────

async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((c) => ({
    id: c.slug,
    dbId: c.id,
    name: c.name,
    description: c.description ?? "",
  }));
}

async function fetchEventTypes(): Promise<EventType[]> {
  const { data, error } = await supabase
    .from("event_types")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((e) => ({
    id: e.id,
    name: e.name,
  }));
}

export type EventCategoryMapping = { event_type_id: string; category_id: string };

async function fetchEventCategoryMappings(): Promise<EventCategoryMapping[]> {
  const { data, error } = await supabase
    .from("event_category_mappings")
    .select("event_type_id, category_id");
  if (error) throw error;
  return data ?? [];
}

async function fetchProducts(): Promise<Product[]> {
  // Fetch all three types in parallel
  const [dishesRes, bundlesRes, setsRes] = await Promise.all([
    supabase.from("dishes").select("*").order("created_at"),
    supabase
      .from("bundles")
      .select("*, bundle_variants(*)")
      .order("created_at"),
    supabase
      .from("configurable_sets")
      .select("*, config_groups(*, config_group_options(*))")
      .order("created_at"),
  ]);

  if (dishesRes.error) throw dishesRes.error;
  if (bundlesRes.error) throw bundlesRes.error;
  if (setsRes.error) throw setsRes.error;

  const products: Product[] = [];

  // Simple products (dishes)
  for (const d of dishesRes.data ?? []) {
    products.push({
      type: "simple",
      id: d.id,
      name: d.name,
      description: d.description ?? "",
      longDescription: d.long_description ?? undefined,
      image: d.image_url ?? undefined,
      contents: (d.contents as string[]) ?? [],
      allergens: (d.allergens as string[]) ?? [],
      pricePerUnit: Number(d.price_per_unit ?? d.price_brutto),
      unitLabel: d.unit_label ?? "szt.",
      minQuantity: d.min_quantity ?? 1,
      category: d.category_slug ?? "patery",
    } satisfies SimpleProduct);
  }

  // Expandable products (bundles)
  for (const b of bundlesRes.data ?? []) {
    const variants: ProductVariant[] = ((b.bundle_variants as any[]) ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((v: any) => ({
        id: v.id,
        name: v.name,
        description: v.description ?? "",
        price: Number(v.price),
        allergens: (v.allergens as string[]) ?? [],
        dietaryTags: (v.dietary_tags as string[]) ?? [],
      }));

    products.push({
      type: "expandable",
      id: b.id,
      name: b.name,
      description: b.description ?? "",
      longDescription: b.long_description ?? undefined,
      image: b.image_url ?? undefined,
      basePrice: Number(b.base_price),
      minQuantity: b.min_quantity,
      category: b.category_slug ?? "mini",
      variants,
    } satisfies ExpandableProduct);
  }

  // Configurable products (sets)
  for (const s of setsRes.data ?? []) {
    const optionGroups: OptionGroup[] = ((s.config_groups as any[]) ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((g: any) => ({
        id: g.id,
        name: g.name,
        minSelections: g.min_selections,
        maxSelections: g.max_selections,
        options: ((g.config_group_options as any[]) ?? [])
          .sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((o: any) => ({
            id: o.id,
            name: o.name,
            allergens: (o.allergens as string[]) ?? [],
          } satisfies GroupOption)),
      }));

    products.push({
      type: "configurable",
      id: s.id,
      name: s.name,
      description: s.description ?? "",
      longDescription: s.long_description ?? undefined,
      image: s.image_url ?? undefined,
      pricePerPerson: Number(s.price_per_person),
      minPersons: s.min_persons,
      category: s.category_slug ?? "zestawy",
      optionGroups,
    } satisfies ConfigurableProduct);
  }

  return products;
}

async function fetchExtras(): Promise<{
  extraItems: ExtraItem[];
  packagingOptions: PackagingOption[];
  waiterServiceOptions: WaiterServiceOption[];
}> {
  const { data, error } = await supabase
    .from("extras")
    .select("*")
    .order("sort_order");
  if (error) throw error;

  const extraItems: ExtraItem[] = [];
  const packagingOptions: PackagingOption[] = [];
  const waiterServiceOptions: WaiterServiceOption[] = [];

  for (const e of data ?? []) {
    if (e.category === "dodatki") {
      extraItems.push({
        id: e.id,
        name: e.name,
        description: e.description ?? "",
        longDescription: e.long_description ?? undefined,
        image: e.image_url ?? undefined,
        price: Number(e.price),
        unitLabel: e.unit_label ?? "szt.",
        contents: (e.contents as string[]) ?? [],
      });
    } else if (e.category === "pakowanie") {
      packagingOptions.push({
        id: e.id,
        name: e.name,
        description: e.description ?? "",
        longDescription: e.long_description ?? undefined,
        image: e.image_url ?? undefined,
        price: Number(e.price),
        priceLabel: e.price_label ?? (Number(e.price) === 0 ? "W cenie" : `${e.price} zł/os.`),
        requiresPersonCount: e.requires_person_count ?? false,
        icon: e.icon ?? "📦",
        contents: (e.contents as string[]) ?? [],
      });
    } else if (e.category === "obsluga") {
      waiterServiceOptions.push({
        id: e.id,
        name: e.name,
        description: e.description ?? "",
        longDescription: e.long_description ?? undefined,
        image: e.image_url ?? undefined,
        duration: e.duration ?? "4h",
        price: Number(e.price),
        icon: e.icon ?? "👤",
        contents: (e.contents as string[]) ?? [],
      });
    }
  }

  return { extraItems, packagingOptions, waiterServiceOptions };
}

async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description ?? "",
    icon: m.icon ?? "💳",
  }));
}

async function fetchBlockedDates(): Promise<Date[]> {
  const { data, error } = await supabase
    .from("blocked_dates")
    .select("blocked_date");
  if (error) throw error;
  return (data ?? []).map((d) => new Date(d.blocked_date));
}

export interface DeliveryConfig {
  companyLat: number | null;
  companyLng: number | null;
  pricePerKm: number;
  maxDeliveryKm: number | null;
  freeDeliveryAbove: number | null;
}

async function fetchDeliveryConfig(): Promise<DeliveryConfig> {
  const { data, error } = await supabase
    .from("company_settings")
    .select("company_lat, company_lng, delivery_price_per_km, max_delivery_km, free_delivery_above_km")
    .limit(1)
    .single();
  if (error || !data) {
    return { companyLat: null, companyLng: null, pricePerKm: 3, maxDeliveryKm: null, freeDeliveryAbove: null };
  }
  return {
    companyLat: (data as any).company_lat != null ? Number((data as any).company_lat) : null,
    companyLng: (data as any).company_lng != null ? Number((data as any).company_lng) : null,
    pricePerKm: Number((data as any).delivery_price_per_km) || 3,
    maxDeliveryKm: (data as any).max_delivery_km != null ? Number((data as any).max_delivery_km) : null,
    freeDeliveryAbove: (data as any).free_delivery_above_km != null ? Number((data as any).free_delivery_above_km) : null,
  };
}

// ─── Hook ────────────────────────────────────────────────────────

export function useSupabaseData() {
  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  const eventTypesQuery = useQuery({
    queryKey: ["eventTypes"],
    queryFn: fetchEventTypes,
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });

  const extrasQuery = useQuery({
    queryKey: ["extras"],
    queryFn: fetchExtras,
    staleTime: 5 * 60 * 1000,
  });

  const paymentMethodsQuery = useQuery({
    queryKey: ["paymentMethods"],
    queryFn: fetchPaymentMethods,
    staleTime: 5 * 60 * 1000,
  });

  const blockedDatesQuery = useQuery({
    queryKey: ["blockedDates"],
    queryFn: fetchBlockedDates,
    staleTime: 5 * 60 * 1000,
  });

  const deliveryConfigQuery = useQuery({
    queryKey: ["deliveryConfig"],
    queryFn: fetchDeliveryConfig,
    staleTime: 5 * 60 * 1000,
  });

  const eventCategoryMappingsQuery = useQuery({
    queryKey: ["eventCategoryMappings"],
    queryFn: fetchEventCategoryMappings,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading =
    categoriesQuery.isLoading ||
    eventTypesQuery.isLoading ||
    productsQuery.isLoading ||
    extrasQuery.isLoading ||
    paymentMethodsQuery.isLoading ||
    blockedDatesQuery.isLoading ||
    deliveryConfigQuery.isLoading ||
    eventCategoryMappingsQuery.isLoading;

  return {
    isLoading,
    categories: categoriesQuery.data ?? [],
    eventTypes: eventTypesQuery.data ?? [],
    products: productsQuery.data ?? [],
    extraItems: extrasQuery.data?.extraItems ?? [],
    packagingOptions: extrasQuery.data?.packagingOptions ?? [],
    waiterServiceOptions: extrasQuery.data?.waiterServiceOptions ?? [],
    paymentMethods: paymentMethodsQuery.data ?? [],
    blockedDates: blockedDatesQuery.data ?? [],
    deliveryConfig: deliveryConfigQuery.data ?? { companyLat: null, companyLng: null, pricePerKm: 3, maxDeliveryKm: null, freeDeliveryAbove: null },
    eventCategoryMappings: eventCategoryMappingsQuery.data ?? [],
  };
}
