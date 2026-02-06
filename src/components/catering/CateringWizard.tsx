import { useCateringOrder } from "@/hooks/useCateringOrder";
import { MobileNav } from "./MobileNav";
import { EventDetails } from "./EventDetails";
import { ProductsStep } from "./ProductsStep";
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
      return !!(order.contactName && order.contactEmail && order.contactPhone);
    }
    return true;
  };

  // Get next button label
  const getNextLabel = () => {
    if (currentStep === 0) return "Produkty";
    if (currentStep === 1) return "Kontakt";
    if (currentStep === 2) return "Podsumowanie";
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
          <ContactForm
            contactName={order.contactName}
            contactEmail={order.contactEmail}
            contactPhone={order.contactPhone}
            notes={order.notes}
            onNameChange={(name) => updateOrder({ contactName: name })}
            onEmailChange={(email) => updateOrder({ contactEmail: email })}
            onPhoneChange={(phone) => updateOrder({ contactPhone: phone })}
            onNotesChange={(notes) => updateOrder({ notes })}
          />
        );
      case 3:
        return (
          <OrderSummary
            order={order}
            totalPrice={totalPrice}
            onSubmit={resetOrder}
          />
        );
      default:
        return null;
    }
  };

  const isLastStep = currentStep === 3;

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
      />
      <div className="pb-safe">
        {renderStep()}
      </div>
    </div>
  );
}
