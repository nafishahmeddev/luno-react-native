export type OnboardingStepId = 'welcome' | 'profile' | 'currency' | 'account';

export type OnboardingStepDefinition = {
  id: OnboardingStepId;
  eyebrow: string;
  title: string;
  subtitle: string;
};

export type OnboardingFormValues = {
  name: string;
  accountName: string;
  accountHolder: string;
  accountNumber: string;
  openingBalance: string;
};
