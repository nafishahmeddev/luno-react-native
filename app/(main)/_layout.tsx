import React from 'react';
import { Stack, Redirect } from 'expo-router'; // Refreshing layout resolution
import { useOnboarding } from '../../src/providers/OnboardingProvider';

export default function StackLayout() {
  const { hasOnboarded } = useOnboarding();

  if (!hasOnboarded) {
    return <Redirect href="/(onboarding)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}
