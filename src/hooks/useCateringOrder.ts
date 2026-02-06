import { useState, useMemo, useCallback } from "react";
import { products, type Product, type SimpleProduct, type ExpandableProduct, type ConfigurableProduct } from "@/data/products";
import { packagingOptions, waiterServiceOptions, extraItems } from "@/data/extras";

export type OrderItem = {
  productId: string;
  quantity: number;
  suggestedQuantity: number;
};

export type CateringOrder = {
  guestCount: number;
  eventType: string;
  eventDate: string;
  eventTime: string;
  // Products
  simpleQuantities: Record<string, number>;
  expandableQuantities: Record<string, Record<string, number>>;
  configurableData: Record<string, { quantity: number; options: Record<string, string[]> }>;
  // Extras
  selectedExtras: Record<string, number>;
  selectedPackaging: string | null;
  packagingPersonCount: number;
  selectedWaiterService: string | null;
  waiterCount: number;
  // Legacy items for backward compatibility
  items: Record<string, OrderItem>;
  // Contact
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactCity: string;
  contactStreet: string;
  contactBuildingNumber: string;
  contactApartmentNumber: string;
  notes: string;
  // Payment
  paymentMethod: string;
};

const initialOrder: CateringOrder = {
  guestCount: 50,
  eventType: "",
  eventDate: "",
  eventTime: "",
  simpleQuantities: {},
  expandableQuantities: {},
  configurableData: {},
  selectedExtras: {},
  selectedPackaging: null,
  packagingPersonCount: 0,
  selectedWaiterService: null,
  waiterCount: 1,
  items: {},
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  contactCity: "",
  contactStreet: "",
  contactBuildingNumber: "",
  contactApartmentNumber: "",
  notes: "",
  paymentMethod: "",
};

export function useCateringOrder() {
  const [order, setOrder] = useState<CateringOrder>(initialOrder);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = useMemo(
    () => [
      { id: "event", name: "Wydarzenie", icon: "📋" },
      { id: "products", name: "Produkty", icon: "🍽️" },
      { id: "extras", name: "Dodatki", icon: "✨" },
      { id: "contact", name: "Kontakt", icon: "📧" },
      { id: "summary", name: "Podsumowanie", icon: "✅" },
    ],
    []
  );

  // Calculate total price
  const totalPrice = useMemo(() => {
    let total = 0;
    
    // Simple products
    for (const [productId, qty] of Object.entries(order.simpleQuantities)) {
      if (qty > 0) {
        const product = products.find(p => p.id === productId);
        if (product && product.type === "simple") {
          total += product.pricePerUnit * qty;
        }
      }
    }
    
    // Expandable products
    for (const [productId, variants] of Object.entries(order.expandableQuantities)) {
      const product = products.find(p => p.id === productId);
      if (product && product.type === "expandable") {
        for (const [variantId, qty] of Object.entries(variants)) {
          if (qty > 0) {
            const variant = product.variants.find(v => v.id === variantId);
            if (variant) {
              total += variant.price * qty;
            }
          }
        }
      }
    }
    
    // Configurable products
    for (const [productId, data] of Object.entries(order.configurableData)) {
      if (data.quantity > 0) {
        const product = products.find(p => p.id === productId);
        if (product && product.type === "configurable") {
          total += product.pricePerPerson * data.quantity;
        }
      }
    }

    // Extras
    for (const [extraId, qty] of Object.entries(order.selectedExtras)) {
      if (qty > 0) {
        const extra = extraItems.find((e) => e.id === extraId);
        if (extra) {
          total += extra.price * qty;
        }
      }
    }

    // Packaging
    if (order.selectedPackaging) {
      const packaging = packagingOptions.find(p => p.id === order.selectedPackaging);
      if (packaging && packaging.price > 0) {
        total += packaging.price * order.packagingPersonCount;
      }
    }

    // Waiter service
    if (order.selectedWaiterService) {
      const service = waiterServiceOptions.find(s => s.id === order.selectedWaiterService);
      if (service) {
        total += service.price * order.waiterCount;
      }
    }
    
    return total;
  }, [order.simpleQuantities, order.expandableQuantities, order.configurableData, order.selectedExtras, order.selectedPackaging, order.packagingPersonCount, order.selectedWaiterService, order.waiterCount]);

  // Simple product quantity change
  const updateSimpleQuantity = useCallback((productId: string, quantity: number) => {
    setOrder((prev) => ({
      ...prev,
      simpleQuantities: {
        ...prev.simpleQuantities,
        [productId]: quantity,
      },
    }));
  }, []);

  // Expandable product variant quantity change
  const updateExpandableVariant = useCallback((productId: string, variantId: string, quantity: number) => {
    setOrder((prev) => ({
      ...prev,
      expandableQuantities: {
        ...prev.expandableQuantities,
        [productId]: {
          ...(prev.expandableQuantities[productId] || {}),
          [variantId]: quantity,
        },
      },
    }));
  }, []);

  // Configurable product change
  const updateConfigurable = useCallback((
    productId: string, 
    quantity: number, 
    groupId?: string, 
    optionIds?: string[]
  ) => {
    setOrder((prev) => {
      const currentData = prev.configurableData[productId] || { quantity: 0, options: {} };
      
      const newData = {
        quantity,
        options: groupId && optionIds 
          ? { ...currentData.options, [groupId]: optionIds }
          : currentData.options,
      };
      
      return {
        ...prev,
        configurableData: {
          ...prev.configurableData,
          [productId]: newData,
        },
      };
    });
  }, []);

  // Extras handlers
  const updateExtra = useCallback((extraId: string, quantity: number) => {
    setOrder((prev) => ({
      ...prev,
      selectedExtras: {
        ...prev.selectedExtras,
        [extraId]: quantity,
      },
    }));
  }, []);

  const updatePackaging = useCallback((packagingId: string, personCount: number) => {
    setOrder((prev) => ({
      ...prev,
      selectedPackaging: packagingId,
      packagingPersonCount: personCount,
    }));
  }, []);

  const updateWaiterService = useCallback((serviceId: string | null, count: number) => {
    setOrder((prev) => ({
      ...prev,
      selectedWaiterService: serviceId,
      waiterCount: count,
    }));
  }, []);

  // Legacy: update item quantity (for cart drawer compatibility)
  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (product?.type === "simple") {
      updateSimpleQuantity(productId, quantity);
    }
  }, [updateSimpleQuantity]);

  const setGuestCount = useCallback((count: number) => {
    setOrder((prev) => ({ ...prev, guestCount: count }));
  }, []);

  const updateOrder = useCallback((updates: Partial<CateringOrder>) => {
    setOrder((prev) => ({ ...prev, ...updates }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  const getSuggestedQuantity = useCallback(
    (product: Product): number => {
      if (product.type === "simple") {
        return Math.max(1, Math.ceil(order.guestCount / 8));
      }
      if (product.type === "expandable") {
        return product.minQuantity;
      }
      if (product.type === "configurable") {
        return Math.max(product.minPersons, order.guestCount);
      }
      return 1;
    },
    [order.guestCount]
  );

  const resetOrder = useCallback(() => {
    setOrder(initialOrder);
    setCurrentStep(0);
  }, []);

  return {
    order,
    steps,
    currentStep,
    totalPrice,
    setGuestCount,
    updateSimpleQuantity,
    updateExpandableVariant,
    updateConfigurable,
    updateExtra,
    updatePackaging,
    updateWaiterService,
    updateItemQuantity,
    getSuggestedQuantity,
    nextStep,
    prevStep,
    goToStep,
    updateOrder,
    resetOrder,
  };
}
