import { useCateringOrder } from "@/hooks/useCateringOrder";
import { ProgressBar } from "./ProgressBar";
import { EventDetails } from "./EventDetails";
import { CategoryStep } from "./CategoryStep";
import { ContactForm } from "./ContactForm";
import { OrderSummary } from "./OrderSummary";
import { categories } from "@/data/products";

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
    goToStep,
    updateOrder,
    resetOrder,
  } = useCateringOrder();

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
          onNext={nextStep}
        />
      );
    }

    // Last step: Summary
    if (currentStep === steps.length - 1) {
      return (
        <OrderSummary
          order={order}
          totalPrice={totalPrice}
          onPrev={prevStep}
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
          onNext={nextStep}
          onPrev={prevStep}
        />
      );
    }

    // Category steps (1 through length-3)
    const categoryId = steps[currentStep].id;
    const categoryProducts = getCurrentCategoryProducts();
    const isLastCategory = currentStep === steps.length - 3;

    return (
      <CategoryStep
        categoryId={categoryId}
        products={categoryProducts}
        items={order.items}
        guestCount={order.guestCount}
        getSuggestedQuantity={getSuggestedQuantity}
        onQuantityChange={updateItemQuantity}
        onAddWithSuggestion={addProductWithSuggestion}
        onNext={nextStep}
        onPrev={prevStep}
        totalPrice={totalPrice}
        isLastCategory={isLastCategory}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <ProgressBar
        steps={steps}
        currentStep={currentStep}
        onStepClick={goToStep}
        getItemsCountForCategory={getItemsCountForCategory}
      />
      {renderStep()}
    </div>
  );
}
