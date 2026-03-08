import { supabase } from "@/integrations/supabase/client";
import type { CateringOrder } from "@/hooks/useCateringOrder";
import type { Product } from "@/data/products";
import type { ExtraItem, PackagingOption, WaiterServiceOption } from "@/data/extras";

export async function submitOrder(
  order: CateringOrder,
  totalPrice: number,
  products: Product[],
  extraItems: ExtraItem[],
  packagingOptions: PackagingOption[],
  waiterServiceOptions: WaiterServiceOption[],
  eventTypes: { id: string; name: string }[],
): Promise<string> {
  // Generate order number
  const now = new Date();
  const orderNumber = `KC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;

  const eventType = eventTypes.find((e) => e.id === order.eventType);

  // Insert order
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      status: "Nowe",
      amount: totalPrice,
      client_name: order.contactName,
      client_email: order.contactEmail,
      client_phone: order.contactPhone,
      contact_city: order.contactCity,
      contact_street: order.contactStreet,
      contact_building: order.contactBuildingNumber,
      contact_apartment: order.contactApartmentNumber,
      event_date: order.eventDate || null,
      event_type: eventType?.name || order.eventType,
      guest_count: order.guestCount,
      notes: order.notes || "",
      payment_method: order.paymentMethod,
      delivery_address: `${order.contactStreet} ${order.contactBuildingNumber}${order.contactApartmentNumber ? `/${order.contactApartmentNumber}` : ""}, ${order.contactCity}`,
      delivery_zone_id: order.deliveryZoneId || null,
      delivery_cost: order.deliveryPrice || 0,
    })
    .select("id")
    .single();

  if (orderError) throw orderError;
  const orderId = orderData.id;

  // Build order items
  const orderItems: {
    order_id: string;
    name: string;
    quantity: number;
    price_per_unit: number;
    total: number;
    unit: string;
    item_type: string;
    sort_order: number;
  }[] = [];

  let sortOrder = 0;

  // Simple products
  for (const [productId, qty] of Object.entries(order.simpleQuantities)) {
    if (qty > 0) {
      const product = products.find((p) => p.id === productId);
      if (product && product.type === "simple") {
        orderItems.push({
          order_id: orderId,
          name: product.name,
          quantity: qty,
          price_per_unit: product.pricePerUnit,
          total: product.pricePerUnit * qty,
          unit: product.unitLabel,
          item_type: "simple",
          sort_order: sortOrder++,
        });
      }
    }
  }

  // Expandable products (variants)
  for (const [productId, variants] of Object.entries(order.expandableQuantities)) {
    const product = products.find((p) => p.id === productId);
    if (product && product.type === "expandable") {
      for (const [variantId, qty] of Object.entries(variants)) {
        if (qty > 0) {
          const variant = product.variants.find((v) => v.id === variantId);
          if (variant) {
            orderItems.push({
              order_id: orderId,
              name: `${product.name} — ${variant.name}`,
              quantity: qty,
              price_per_unit: variant.price,
              total: variant.price * qty,
              unit: "szt.",
              item_type: "expandable",
              sort_order: sortOrder++,
            });
          }
        }
      }
    }
  }

  // Configurable products
  for (const [productId, data] of Object.entries(order.configurableData)) {
    if (data.quantity > 0) {
      const product = products.find((p) => p.id === productId);
      if (product && product.type === "configurable") {
        orderItems.push({
          order_id: orderId,
          name: product.name,
          quantity: data.quantity,
          price_per_unit: product.pricePerPerson,
          total: product.pricePerPerson * data.quantity,
          unit: "os.",
          item_type: "configurable",
          sort_order: sortOrder++,
        });
      }
    }
  }

  // Extras
  for (const [extraId, qty] of Object.entries(order.selectedExtras)) {
    if (qty > 0) {
      const extra = extraItems.find((e) => e.id === extraId);
      if (extra) {
        orderItems.push({
          order_id: orderId,
          name: extra.name,
          quantity: qty,
          price_per_unit: extra.price,
          total: extra.price * qty,
          unit: extra.unitLabel,
          item_type: "extra",
          sort_order: sortOrder++,
        });
      }
    }
  }

  // Packaging
  if (order.selectedPackaging) {
    const packaging = packagingOptions.find((p) => p.id === order.selectedPackaging);
    if (packaging) {
      orderItems.push({
        order_id: orderId,
        name: packaging.name,
        quantity: packaging.price > 0 ? order.packagingPersonCount : 1,
        price_per_unit: packaging.price,
        total: packaging.price * (packaging.price > 0 ? order.packagingPersonCount : 1),
        unit: packaging.price > 0 ? "os." : "szt.",
        item_type: "packaging",
        sort_order: sortOrder++,
      });
    }
  }

  // Waiter service
  if (order.selectedWaiterService) {
    const service = waiterServiceOptions.find((s) => s.id === order.selectedWaiterService);
    if (service) {
      orderItems.push({
        order_id: orderId,
        name: service.name,
        quantity: order.waiterCount,
        price_per_unit: service.price,
        total: service.price * order.waiterCount,
        unit: "szt.",
        item_type: "waiter",
        sort_order: sortOrder++,
      });
    }
  }

  if (orderItems.length > 0) {
    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;
  }

  return orderNumber;
}
