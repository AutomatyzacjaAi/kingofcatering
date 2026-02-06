import { useCateringOrder } from "@/hooks/useCateringOrder";
import { MobileNav } from "./MobileNav";
import { EventDetails } from "./EventDetails";
import { CategoryStep } from "./CategoryStep";
import { ContactForm } from "./ContactForm";
import { OrderSummary } from "./OrderSummary";

export function CateringWizard() {
  const {
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
    updateOrder,
    resetOrder,
  } = useCateringOrder();

  // Check if can proceed to next step
  const canGoNext = (): boolean => {
    if (currentStep === 0) {
      return !!(order.guestCount > 0 && order.eventType && order.eventDate);
    }
    if (currentStep === steps.length - 2) {
      return !!(order.contactName && order.contactEmail && order.contactPhone);
    }
    return true;
  };

  // Get next button label
  const getNextLabel = () => {
    if (currentStep === 0) return "Dalej";
    if (currentStep === steps.length - 3) return "Kontakt";
    if (currentStep === steps.length - 2) return "Podsumowanie";
    return "Dalej";
  };

  const renderStep = () => {
    // Step 0: Event Details
    if (currentStep === 0) {
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
    }

    // Last step: Summary
    if (currentStep === steps.length - 1) {
      return (
        <OrderSummary
          order={order}
          totalPrice={totalPrice}
          onSubmit={resetOrder}
        />
      );
    }

    // Second to last: Contact Form
    if (currentStep === steps.length - 2) {
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
    }

    // Category steps
    const categoryId = steps[currentStep].id;
    const categoryProducts = getCurrentCategoryProducts();

    return (
      <CategoryStep
        categoryId={categoryId}
        products={categoryProducts}
        items={order.items}
        guestCount={order.guestCount}
        getSuggestedQuantity={getSuggestedQuantity}
        onQuantityChange={updateItemQuantity}
        onAddWithSuggestion={addProductWithSuggestion}
      />
    );
  };

  const isLastStep = currentStep === steps.length - 1;

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
      />
      <div className="pb-safe">
        {renderStep()}
      </div>
    </div>
  );
}
