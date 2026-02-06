import { useState, useMemo, useCallback } from "react";
import { products, categories, type Product } from "@/data/products";

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
  items: Record<string, OrderItem>;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
};

const initialOrder: CateringOrder = {
  guestCount: 50,
  eventType: "",
  eventDate: "",
  eventTime: "",
  items: {},
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  notes: "",
};

export function useCateringOrder() {
  const [order, setOrder] = useState<CateringOrder>(initialOrder);
  const [currentStep, setCurrentStep] = useState(0);

  // Steps: Event Details + 6 categories + Contact Form + Summary
  const steps = useMemo(
    () => [
      { id: "event", name: "Wydarzenie", icon: "📋" },
      ...categories.map((cat) => ({ id: cat.id, name: cat.name, icon: cat.icon })),
      { id: "contact", name: "Kontakt", icon: "📧" },
      { id: "summary", name: "Podsumowanie", icon: "✅" },
    ],
    []
  );

  // Calculate suggested quantity based on guest count
  const getSuggestedQuantity = useCallback(
    (product: Product) => {
      return Math.ceil(order.guestCount * product.portionsPerPerson);
    },
    [order.guestCount]
  );

  // Get products for current category step
  const getCurrentCategoryProducts = useCallback(() => {
    if (currentStep === 0 || currentStep >= steps.length - 2) return [];
    const categoryId = steps[currentStep].id;
    return products.filter((p) => p.category === categoryId);
  }, [currentStep, steps]);

  // Update guest count and recalculate suggestions
  const setGuestCount = useCallback((count: number) => {
    setOrder((prev) => ({
      ...prev,
      guestCount: count,
      // Reset items when guest count changes significantly
      items: Object.fromEntries(
        Object.entries(prev.items).map(([productId, item]) => {
          const product = products.find((p) => p.id === productId);
          if (!product) return [productId, item];
          const suggestedQuantity = Math.ceil(count * product.portionsPerPerson);
          return [
            productId,
            {
              ...item,
              suggestedQuantity,
              // Only update quantity if it was at suggested level
              quantity: item.quantity === item.suggestedQuantity ? suggestedQuantity : item.quantity,
            },
          ];
        })
      ),
    }));
  }, []);

  // Add or update item quantity
  const updateItemQuantity = useCallback(
    (productId: string, quantity: number) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      setOrder((prev) => {
        const suggestedQuantity = Math.ceil(prev.guestCount * product.portionsPerPerson);

        if (quantity <= 0) {
          const { [productId]: _, ...rest } = prev.items;
          return { ...prev, items: rest };
        }

        return {
          ...prev,
          items: {
            ...prev.items,
            [productId]: {
              productId,
              quantity,
              suggestedQuantity,
            },
          },
        };
      });
    },
    []
  );

  // Add product with suggested quantity
  const addProductWithSuggestion = useCallback(
    (productId: string) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      const suggestedQuantity = getSuggestedQuantity(product);
      updateItemQuantity(productId, suggestedQuantity);
    },
    [getSuggestedQuantity, updateItemQuantity]
  );

  // Calculate total price
  const totalPrice = useMemo(() => {
    return Object.values(order.items).reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return total;
      return total + product.pricePerPortion * item.quantity;
    }, 0);
  }, [order.items]);

  // Get items count per category
  const getItemsCountForCategory = useCallback(
    (categoryId: string) => {
      return Object.values(order.items).filter((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product?.category === categoryId;
      }).length;
    },
    [order.items]
  );

  // Navigation
  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

  // Update order fields
  const updateOrder = useCallback((updates: Partial<CateringOrder>) => {
    setOrder((prev) => ({ ...prev, ...updates }));
  }, []);

  // Reset order
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
    updateItemQuantity,
    addProductWithSuggestion,
    getSuggestedQuantity,
    getCurrentCategoryProducts,
    getItemsCountForCategory,
    nextStep,
    prevStep,
    goToStep,
    updateOrder,
    resetOrder,
  };
}
