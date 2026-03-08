import { useMemo } from "react";
import { useCateringOrder } from "@/hooks/useCateringOrder";
import { useSupabaseData } from "@/hooks/useSupabaseData";
import { submitOrder } from "@/lib/submitOrder";
import { MobileNav } from "./MobileNav";
import { EventDetails } from "./EventDetails";
import { ProductsStep } from "./ProductsStep";
import { ExtrasStep } from "./ExtrasStep";
import { ContactForm } from "./ContactForm";
import { OrderSummary } from "./OrderSummary";

export function CateringWizard() {
  const {
    isLoading,
    categories,
    eventTypes,
    products,
    extrasCategories,
    extraItems,
    packagingOptions,
    waiterServiceOptions,
    paymentMethods,
    blockedDates,
    deliveryConfig,
    eventCategoryMappings,
  } = useSupabaseData();

  const {
    order,
    steps,
    currentStep,
    totalPrice,
    setGuestCount,
    updateSimpleQuantity,
    updateExpandableVariant,
    updateConfigurable,
    updateServingTime,
    updateProductNotes,
    updateExtra,
    updatePackaging,
    updateWaiterService,
    nextStep,
    prevStep,
    updateOrder,
    resetOrder,
  } = useCateringOrder(products, extraItems, packagingOptions, waiterServiceOptions);

  // Filter categories based on selected event type mappings
  const filteredCategories = useMemo(() => {
    if (!order.eventType) return categories;
    const mappedCategoryIds = eventCategoryMappings
      .filter((m) => m.event_type_id === order.eventType)
      .map((m) => m.category_id);
    // If no mappings exist for this event type, show all categories
    if (mappedCategoryIds.length === 0) return categories;
    return categories.filter((c) => c.dbId && mappedCategoryIds.includes(c.dbId));
  }, [order.eventType, eventCategoryMappings, categories]);

  // Filter products to only those in visible categories
  const filteredProducts = useMemo(() => {
    const visibleCategoryIds = new Set(filteredCategories.map((c) => c.id));
    return products.filter((p) => visibleCategoryIds.has(p.category));
  }, [filteredCategories, products]);

  const handleSubmit = async () => {
    await submitOrder(
      order,
      totalPrice,
      products,
      extraItems,
      packagingOptions,
      waiterServiceOptions,
      eventTypes,
    );
  };

  const canGoNext = (): boolean => {
    if (currentStep === 0) {
      return !!(order.guestCount > 0 && order.eventType && order.eventDate);
    }
    if (currentStep === 2) {
      return !!order.selectedPackaging;
    }
    if (currentStep === 3) {
      return !!(order.contactName && order.contactEmail && order.contactPhone && order.contactCity && order.contactStreet && order.contactBuildingNumber);
    }
    return true;
  };

  const getNextLabel = () => {
    if (currentStep === 0) return "Produkty";
    if (currentStep === 1) return "Dodatki";
    if (currentStep === 2) return "Kontakt";
    if (currentStep === 3) return "Podsumowanie";
    return "Dalej";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground text-sm">Ładowanie menu...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <EventDetails
            guestCount={order.guestCount}
            eventType={order.eventType}
            eventDate={order.eventDate}
            eventTime={order.eventTime}
            onGuestCountChange={setGuestCount}
            onEventTypeChange={(type) => updateOrder({ eventType: type })}
            onEventDateChange={(date) => updateOrder({ eventDate: date })}
            onEventTimeChange={(time) => updateOrder({ eventTime: time })}
            eventTypes={eventTypes}
            blockedDates={blockedDates}
          />
        );
      case 1:
        return (
          <ProductsStep
            simpleQuantities={order.simpleQuantities}
            expandableQuantities={order.expandableQuantities}
            configurableData={order.configurableData}
            servingTimes={order.servingTimes}
            productNotes={order.productNotes}
            onSimpleQuantityChange={updateSimpleQuantity}
            onExpandableVariantChange={updateExpandableVariant}
            onConfigurableChange={updateConfigurable}
            onServingTimeChange={updateServingTime}
            onProductNotesChange={updateProductNotes}
            products={filteredProducts}
            categories={filteredCategories}
          />
        );
      case 2:
        return (
          <ExtrasStep
            selectedExtras={order.selectedExtras}
            selectedPackaging={order.selectedPackaging}
            packagingPersonCount={order.packagingPersonCount}
            selectedWaiterService={order.selectedWaiterService}
            waiterCount={order.waiterCount}
            onExtraChange={updateExtra}
            onPackagingChange={updatePackaging}
            onWaiterServiceChange={updateWaiterService}
            guestCount={order.guestCount}
            extraItems={extraItems}
            packagingOptions={packagingOptions}
            waiterServiceOptions={waiterServiceOptions}
          />
        );
      case 3:
        return (
          <ContactForm
            contactName={order.contactName}
            contactEmail={order.contactEmail}
            contactPhone={order.contactPhone}
            contactCity={order.contactCity}
            contactStreet={order.contactStreet}
            contactBuildingNumber={order.contactBuildingNumber}
            contactApartmentNumber={order.contactApartmentNumber}
            notes={order.notes}
            onNameChange={(name) => updateOrder({ contactName: name })}
            onEmailChange={(email) => updateOrder({ contactEmail: email })}
            onPhoneChange={(phone) => updateOrder({ contactPhone: phone })}
            onCityChange={(city) => updateOrder({ contactCity: city })}
            onStreetChange={(street) => updateOrder({ contactStreet: street })}
            onBuildingNumberChange={(num) => updateOrder({ contactBuildingNumber: num })}
            onApartmentNumberChange={(num) => updateOrder({ contactApartmentNumber: num })}
            onNotesChange={(notes) => updateOrder({ notes })}
            deliveryConfig={deliveryConfig}
            orderTotal={totalPrice}
            onDeliveryCalculated={(price, distanceKm) => updateOrder({ deliveryPrice: price })}
          />
        );
      case 4:
        return (
          <OrderSummary
            order={order}
            totalPrice={totalPrice}
            onPaymentMethodChange={(method) => updateOrder({ paymentMethod: method })}
            onSubmit={handleSubmit}
            onResetOrder={resetOrder}
            onSimpleQuantityChange={updateSimpleQuantity}
            onExpandableVariantChange={updateExpandableVariant}
            onConfigurableChange={updateConfigurable}
            products={products}
            categories={categories}
            eventTypes={eventTypes}
            extraItems={extraItems}
            packagingOptions={packagingOptions}
            waiterServiceOptions={waiterServiceOptions}
            paymentMethods={paymentMethods}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = currentStep === 4;

  return (
    <div className="min-h-screen bg-background">
      <MobileNav
        steps={steps}
        currentStep={currentStep}
        totalSteps={steps.length}
        onNext={nextStep}
        onPrev={prevStep}
        canGoNext={canGoNext()}
        nextLabel={getNextLabel()}
        showNav={!isLastStep}
        order={order}
        totalPrice={totalPrice}
        onSimpleQuantityChange={updateSimpleQuantity}
        onExpandableVariantChange={updateExpandableVariant}
        onConfigurableChange={updateConfigurable}
        onExtraChange={updateExtra}
        onPackagingChange={updatePackaging}
        onWaiterServiceChange={updateWaiterService}
        products={products}
        extraItems={extraItems}
        packagingOptions={packagingOptions}
        waiterServiceOptions={waiterServiceOptions}
      />
      <div className="pb-safe">
        {renderStep()}
      </div>
    </div>
  );
}
