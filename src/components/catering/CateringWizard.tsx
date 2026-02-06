import { useCateringOrder } from "@/hooks/useCateringOrder";
import { MobileNav } from "./MobileNav";
import { EventDetails } from "./EventDetails";
import { ProductsStep } from "./ProductsStep";
import { ExtrasStep } from "./ExtrasStep";
import { ContactForm } from "./ContactForm";
import { OrderSummary } from "./OrderSummary";

export function CateringWizard() {
  const {
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
    nextStep,
    prevStep,
    updateOrder,
    resetOrder,
  } = useCateringOrder();

  // Check if can proceed to next step
  const canGoNext = (): boolean => {
    if (currentStep === 0) {
      return !!(order.guestCount > 0 && order.eventType && order.eventDate);
    }
    if (currentStep === 2) {
      // Extras - packaging is required
      return !!order.selectedPackaging;
    }
    if (currentStep === 3) {
      return !!(order.contactName && order.contactEmail && order.contactPhone && order.contactCity && order.contactStreet && order.contactBuildingNumber);
    }
    return true;
  };

  // Get next button label
  const getNextLabel = () => {
    if (currentStep === 0) return "Produkty";
    if (currentStep === 1) return "Dodatki";
    if (currentStep === 2) return "Kontakt";
    if (currentStep === 3) return "Podsumowanie";
    return "Dalej";
  };

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
          />
        );
      case 1:
        return (
          <ProductsStep
            simpleQuantities={order.simpleQuantities}
            expandableQuantities={order.expandableQuantities}
            configurableData={order.configurableData}
            onSimpleQuantityChange={updateSimpleQuantity}
            onExpandableVariantChange={updateExpandableVariant}
            onConfigurableChange={updateConfigurable}
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
          />
        );
      case 4:
        return (
          <OrderSummary
            order={order}
            totalPrice={totalPrice}
            onPaymentMethodChange={(method) => updateOrder({ paymentMethod: method })}
            onSubmit={resetOrder}
            onSimpleQuantityChange={updateSimpleQuantity}
            onExpandableVariantChange={updateExpandableVariant}
            onConfigurableChange={updateConfigurable}
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
      />
      <div className="pb-safe">
        {renderStep()}
      </div>
    </div>
  );
}
