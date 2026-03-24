import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DatabaseProvider } from '@/src/providers/DatabaseProvider';
import { QueryProvider } from '@/src/providers/QueryProvider';
import { OnboardingProvider } from '@/src/providers/OnboardingProvider';
import { SettingsProvider } from '@/src/providers/SettingsProvider';
import { ThemeProvider as CustomThemeProvider } from '@/src/providers/ThemeProvider';
import { 
  useFonts as useBricolageFonts,
  BricolageGrotesque_400Regular, 
  BricolageGrotesque_700Bold 
} from '@expo-google-fonts/bricolage-grotesque';

import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';

import { 
  useFonts as useMonoFonts,
  JetBrainsMono_400Regular, 
  JetBrainsMono_700Bold 
} from '@expo-google-fonts/jetbrains-mono';
import { Text, TextInput } from 'react-native';

const customizeText = () => {
  const customTextProps = {
    style: {
      fontFamily: 'Inter_400Regular',
    }
  };
  // @ts-ignore
  if (Text.defaultProps) { Text.defaultProps.style = customTextProps.style; } else { Text.defaultProps = customTextProps; }
  // @ts-ignore
  if (TextInput.defaultProps) { TextInput.defaultProps.style = customTextProps.style; } else { TextInput.defaultProps = customTextProps; }
};

export const unstable_settings = {
  anchor: '(main)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [bricolageLoaded] = useBricolageFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_700Bold,
  });

  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [monoLoaded] = useMonoFonts({
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  const fontsLoaded = bricolageLoaded && interLoaded && monoLoaded;

  if (!fontsLoaded) return null;

  customizeText();

  return (
    <QueryProvider>
      <DatabaseProvider>
        <SettingsProvider>
          <OnboardingProvider>
            <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <CustomThemeProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(main)" />
                <Stack.Screen name="(onboarding)" />
              </Stack>
              <StatusBar style="auto" />
            </CustomThemeProvider>
          </ThemeProvider>
        </OnboardingProvider>
      </SettingsProvider>
    </DatabaseProvider>
    </QueryProvider>
  );
}
