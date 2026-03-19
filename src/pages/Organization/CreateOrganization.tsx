import React from 'react';
import {
  CreateOrganizationProvider,
  CreateOrganizationContent,
  useCreateOrganizationContext,
} from './CreateOrganization/context';
import CreateOrganizationSidebar from './CreateOrganization/CreateOrganizationSidebar';
import {
  StepDetails,
  StepPlanSelect,
  StepConnectionType,
  StepPosRequests,
  StepOfferAgreement,
  PaymentStep,
} from './CreateOrganization/steps';

function CreateOrganizationLayout() {
  const { currentStep } = useCreateOrganizationContext();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-black">
      <CreateOrganizationSidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto min-w-0">
        {currentStep === 0 && <StepDetails />}
        {currentStep === 1 && <StepPlanSelect />}
        {currentStep === 2 && <StepConnectionType />}
        {currentStep === 3 && <StepPosRequests />}
        {currentStep === 4 && <StepOfferAgreement />}
        {currentStep === 5 && <PaymentStep />}
      </main>
    </div>
  );
}

const CreateOrganization: React.FC = () => {
  return (
    <CreateOrganizationProvider>
      <CreateOrganizationContent>
        <CreateOrganizationLayout />
      </CreateOrganizationContent>
    </CreateOrganizationProvider>
  );
};

export default CreateOrganization;
