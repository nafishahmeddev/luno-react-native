import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { useCreateAccount } from '../../src/features/accounts/hooks/accounts';
import { useCreateCategory } from '../../src/features/categories/hooks/categories';
import { useOnboarding } from '../../src/providers/OnboardingProvider';
import { useSettings } from '../../src/providers/SettingsProvider';
import { useTheme } from '../../src/providers/ThemeProvider';
import { ThemeColors } from '../../src/theme/colors';
import { typography } from '../../src/theme/typography';

type StepId = 'welcome' | 'profile' | 'currency' | 'account';

type StepDefinition = {
  id: StepId;
  eyebrow: string;
  title: string;
  subtitle: string;
};

const STEPS: StepDefinition[] = [
  {
    id: 'welcome',
    eyebrow: 'FINTRACKER SETUP',
    title: 'Build your finance cockpit.',
    subtitle: 'A tighter onboarding, cleaner defaults, and a first account that is actually complete.',
  },
  {
    id: 'profile',
    eyebrow: 'PROFILE',
    title: 'Who is driving this ledger?',
    subtitle: 'Your name anchors account ownership and personal defaults across the app.',
  },
  {
    id: 'currency',
    eyebrow: 'REGION',
    title: 'Choose your operating currency.',
    subtitle: 'This becomes the default in new accounts and transactions until you override it.',
  },
  {
    id: 'account',
    eyebrow: 'FIRST ACCOUNT',
    title: 'Create a real starting account.',
    subtitle: 'Name, holder, account number, color, and opening balance are all captured here.',
  },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'INR', 'AED'] as const;
const ACCOUNT_ICONS = [
  'wallet-outline',
  'card-outline',
  'cash-outline',
  'business-outline',
  'server-outline',
  'diamond-outline',
] as const;
const ACCOUNT_COLORS = ['#6BD498', '#8DECB8', '#3FBF7F', '#F5C451', '#63A4FF', '#FF8A65'] as const;

const toDbColor = (value: string) => Number.parseInt(value.replace('#', ''), 16);

const parseAmount = (value: string) => {
  const normalized = value.replace(',', '.').replace(/[^0-9.]/g, '');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const { completeOnboarding } = useOnboarding();
  const { updateProfile } = useSettings();
  const { mutateAsync: createAccount, isPending: accountPending } = useCreateAccount();
  const { mutateAsync: createCategory, isPending: categoryPending } = useCreateCategory();

  const [stepIndex, setStepIndex] = React.useState(0);
  const currentStep = STEPS[stepIndex];

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [defaultCurrency, setDefaultCurrency] = React.useState<string>('USD');
  const [accountName, setAccountName] = React.useState('Main Wallet');
  const [accountHolder, setAccountHolder] = React.useState('');
  const [accountNumber, setAccountNumber] = React.useState('');
  const [openingBalance, setOpeningBalance] = React.useState('0');
  const [accountIcon, setAccountIcon] = React.useState<string>(ACCOUNT_ICONS[0]);
  const [accountColor, setAccountColor] = React.useState<string>(ACCOUNT_COLORS[0]);
  const accountPreviewLabel = accountName.trim() || 'Main Wallet';
  const accountHolderLabel = accountHolder.trim() || name.trim() || 'Account Holder';

  React.useEffect(() => {
    if (!accountHolder.trim() && name.trim()) {
      setAccountHolder(name.trim());
    }
  }, [name, accountHolder]);

  const isPending = accountPending || categoryPending;

  const validateStep = () => {
    if (currentStep.id === 'profile' && !name.trim()) {
      Alert.alert('Missing name', 'Enter your name to continue.');
      return false;
    }

    if (currentStep.id === 'account') {
      if (!accountName.trim()) {
        Alert.alert('Missing account name', 'Enter a name for your first account.');
        return false;
      }
      if (!accountHolder.trim()) {
        Alert.alert('Missing holder name', 'Enter the holder name for this account.');
        return false;
      }
      if (!accountNumber.trim()) {
        Alert.alert('Missing account number', 'Enter an account number or identifier.');
        return false;
      }
    }

    return true;
  };

  const seedCategories = async () => {
    const defaults = [
      { name: 'Salary', icon: 'cash-outline', color: toDbColor(colors.success), type: 'CR' as const, budget: 0, expense: 0 },
      { name: 'Freelance', icon: 'sparkles-outline', color: toDbColor(colors.primary), type: 'CR' as const, budget: 0, expense: 0 },
      { name: 'Groceries', icon: 'basket-outline', color: toDbColor('#F5C451'), type: 'DR' as const, budget: 0, expense: 0 },
      { name: 'Transport', icon: 'car-outline', color: toDbColor('#63A4FF'), type: 'DR' as const, budget: 0, expense: 0 },
      { name: 'Bills', icon: 'receipt-outline', color: toDbColor('#FF8A65'), type: 'DR' as const, budget: 0, expense: 0 },
    ];

    for (const category of defaults) {
      await createCategory(category);
    }
  };

  const finalizeSetup = async () => {
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        defaultCurrency,
      });

      await createAccount({
        name: accountName.trim(),
        holderName: accountHolder.trim(),
        accountNumber: accountNumber.trim(),
        icon: accountIcon.replace('-outline', ''),
        color: toDbColor(accountColor),
        isDefault: true,
        currency: defaultCurrency,
        balance: parseAmount(openingBalance),
        income: 0,
        expense: 0,
      });

      await seedCategories();
      await completeOnboarding();
      router.replace('/(main)');
    } catch {
      Alert.alert('Setup failed', 'Could not initialize your workspace. Please try again.');
    }
  };

  const handleContinue = async () => {
    if (!validateStep()) {
      return;
    }

    if (stepIndex === STEPS.length - 1) {
      await finalizeSetup();
      return;
    }

    setStepIndex((current) => current + 1);
  };

  const renderWelcome = () => (
    <View style={styles.heroPanel}>
      <View style={styles.heroBadge}>
        <Ionicons name="sparkles-outline" size={16} color={colors.background} />
        <Text style={styles.heroBadgeText}>LOCAL-FIRST MONEY OS</Text>
      </View>

      <Text style={styles.heroTitle}>FINTRACKER.</Text>
      <Text style={styles.heroBody}>
        Clean structure, fast capture, and a calm ledger. This setup keeps the first-run flow aligned with the rest of the app instead of feeling like a separate product.
      </Text>

      <View style={styles.heroStatsRow}>
        <View style={styles.heroStatCard}>
          <Text style={styles.heroStatLabel}>DEFAULTS</Text>
          <Text style={styles.heroStatValue}>PROFILE + CURRENCY</Text>
        </View>
        <View style={styles.heroStatCard}>
          <Text style={styles.heroStatLabel}>BOOTSTRAP</Text>
          <Text style={styles.heroStatValue}>ACCOUNT + CATEGORIES</Text>
        </View>
      </View>
    </View>
  );

  const renderProfile = () => (
    <View style={styles.formStack}>
      <View style={styles.formSectionCard}>
        <Text style={styles.formSectionEyebrow}>IDENTITY</Text>
        <Input label="Full Name" placeholder="Ahmed Khan" value={name} onChangeText={setName} />
      </View>

      <View style={styles.formSectionCard}>
        <Text style={styles.formSectionEyebrow}>CONTACT</Text>
        <Input label="Email" placeholder="Optional" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <View style={styles.formFieldSpacer} />
        <Input label="Phone" placeholder="Optional" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </View>

      <View style={styles.infoStrip}>
        <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
        <Text style={styles.infoStripText}>This name is used to prefill your first account holder.</Text>
      </View>
    </View>
  );

  const renderCurrency = () => (
    <View style={styles.formStack}>
      <View style={styles.selectionHero}>
        <Text style={styles.selectionHeroLabel}>SELECTED DEFAULT</Text>
        <Text style={styles.selectionHeroValue}>{defaultCurrency}</Text>
        <Text style={styles.selectionHeroSubtext}>Used for new accounts and as the initial transaction currency.</Text>
      </View>

      <View style={styles.formSectionCard}>
        <Text style={styles.formSectionEyebrow}>CURRENCY LIST</Text>
        <View style={styles.currencyWrap}>
          {CURRENCIES.map((currency) => {
            const selected = currency === defaultCurrency;
            return (
              <TouchableOpacity
                key={currency}
                style={[styles.currencyChip, selected && styles.currencyChipActive]}
                onPress={() => setDefaultCurrency(currency)}
                activeOpacity={0.9}
              >
                <Text style={[styles.currencyChipText, selected && styles.currencyChipTextActive]}>{currency}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  const renderAccount = () => (
    <View style={styles.formStack}>
      <View style={[styles.accountPreviewCard, { borderColor: accountColor + '55' }] }>
        <View style={[styles.accountPreviewIconWrap, { backgroundColor: accountColor + '24' }]}>
          <Ionicons name={accountIcon as any} size={20} color={accountColor} />
        </View>
        <View style={styles.accountPreviewCopy}>
          <Text style={styles.accountPreviewName}>{accountPreviewLabel}</Text>
          <Text style={styles.accountPreviewMeta}>{accountHolderLabel} • {defaultCurrency}</Text>
        </View>
        <Text style={styles.accountPreviewBalance}>{parseAmount(openingBalance).toFixed(2)}</Text>
      </View>

      <View style={styles.formSectionCard}>
        <Text style={styles.formSectionEyebrow}>ACCOUNT DETAILS</Text>
        <Input label="Account Name" placeholder="Main Wallet" value={accountName} onChangeText={setAccountName} />
        <View style={styles.formFieldSpacer} />
        <Input label="Holder Name" placeholder="Account holder" value={accountHolder} onChangeText={setAccountHolder} />
        <View style={styles.formFieldSpacer} />
        <Input label="Account Number" placeholder="IBAN / Last 4 / Wallet ID" value={accountNumber} onChangeText={setAccountNumber} />
        <View style={styles.formFieldSpacer} />
        <Input
          label={`Opening Balance (${defaultCurrency})`}
          placeholder="0.00"
          value={openingBalance}
          onChangeText={setOpeningBalance}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.formSectionCard}>
        <View style={styles.selectorSection}>
          <Text style={styles.selectorLabel}>ACCOUNT ICON</Text>
          <View style={styles.iconWrap}>
            {ACCOUNT_ICONS.map((iconName) => {
              const selected = accountIcon === iconName;
              return (
                <TouchableOpacity
                  key={iconName}
                  style={[styles.iconChip, selected && styles.iconChipActive]}
                  onPress={() => setAccountIcon(iconName)}
                  activeOpacity={0.9}
                >
                  <Ionicons name={iconName} size={18} color={selected ? colors.background : colors.text} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.selectorSection}>
          <Text style={styles.selectorLabel}>ACCOUNT COLOR</Text>
          <View style={styles.colorWrap}>
            {ACCOUNT_COLORS.map((swatch) => {
              const selected = accountColor === swatch;
              return (
                <TouchableOpacity
                  key={swatch}
                  style={[styles.colorChip, { backgroundColor: swatch }, selected && styles.colorChipActive]}
                  onPress={() => setAccountColor(swatch)}
                  activeOpacity={0.9}
                >
                  {selected ? <Ionicons name="checkmark" size={14} color="#000100" /> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep.id) {
      case 'welcome':
        return renderWelcome();
      case 'profile':
        return renderProfile();
      case 'currency':
        return renderCurrency();
      case 'account':
        return renderAccount();
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <View style={[styles.bgCircle, { top: -70, left: -70, width: 280, height: 280, backgroundColor: colors.primary + '26' }]} />
        <View style={[styles.bgCircle, { top: 240, right: -120, width: 360, height: 360, backgroundColor: colors.primary + '18' }]} />
        <View style={[styles.bgCircle, { bottom: -110, left: 30, width: 320, height: 320, backgroundColor: colors.secondary + '10' }]} />
      </View>

      <BlurView
        blurAmount={Platform.OS === 'ios' ? 70 : 92}
        blurType={isDark ? 'dark' : 'light'}
        style={StyleSheet.absoluteFillObject}
      />
      {Platform.OS === 'android' ? (
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.background + '76' }]} pointerEvents="none" />
      ) : null}

      <KeyboardAvoidingView style={styles.keyboardWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            {stepIndex > 0 ? (
              <TouchableOpacity style={styles.headerBackButton} onPress={() => setStepIndex((current) => current - 1)} activeOpacity={0.9}>
                <Ionicons name="chevron-back" size={18} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <View style={styles.headerBackPlaceholder} />
            )}

            <Text style={styles.brand}>FINTRACKER.</Text>

            <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>{stepIndex + 1}/{STEPS.length}</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            {STEPS.map((step, index) => (
              <View key={step.id} style={[styles.progressDot, index <= stepIndex && styles.progressDotActive]} />
            ))}
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.stepMeta}>
            <Text style={styles.eyebrow}>{currentStep.eyebrow}</Text>
            <Text style={styles.stepTitle}>{currentStep.title}</Text>
            <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>
          </View>

          <View style={styles.contentCard}>{renderStepContent()}</View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={stepIndex === STEPS.length - 1 ? 'Launch Fintracker' : 'Continue'}
            onPress={handleContinue}
            size="lg"
            isLoading={isPending}
            style={styles.primaryAction}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    keyboardWrap: {
      flex: 1,
    },
    bgCircle: {
      position: 'absolute',
      borderRadius: 999,
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 12,
      gap: 14,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerBackButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary + '22',
    },
    headerBackPlaceholder: {
      width: 42,
      height: 42,
    },
    brand: {
      fontFamily: typography.fonts.heading,
      fontSize: 30,
      color: colors.text,
      letterSpacing: -1,
      textAlign: 'center',
    },
    stepPill: {
      minWidth: 42,
      height: 42,
      borderRadius: 21,
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary + '22',
    },
    stepPillText: {
      fontFamily: typography.fonts.semibold,
      fontSize: 11,
      color: colors.text,
      letterSpacing: 0.4,
    },
    progressTrack: {
      flexDirection: 'row',
      gap: 8,
    },
    progressDot: {
      flex: 1,
      height: 6,
      borderRadius: 999,
      backgroundColor: colors.surface,
    },
    progressDotActive: {
      backgroundColor: colors.primary,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 18,
      paddingBottom: 24,
      flexGrow: 1,
    },
    stepMeta: {
      marginBottom: 18,
    },
    eyebrow: {
      fontFamily: typography.fonts.semibold,
      fontSize: 11,
      color: colors.primary,
      letterSpacing: 1.5,
      marginBottom: 10,
    },
    stepTitle: {
      fontFamily: typography.fonts.heading,
      fontSize: 34,
      lineHeight: 36,
      color: colors.text,
      letterSpacing: -1.1,
    },
    stepSubtitle: {
      marginTop: 10,
      fontFamily: typography.fonts.regular,
      fontSize: 14,
      lineHeight: 22,
      color: colors.textMuted,
      maxWidth: 320,
    },
    contentCard: {
      borderRadius: 24,
      padding: 16,
      backgroundColor: Platform.OS === 'android' ? colors.background + 'D8' : colors.surface,
      borderWidth: 1,
      borderColor: Platform.OS === 'android' ? colors.primary + '20' : colors.text + '12',
      minHeight: 420,
      shadowColor: '#000000',
      shadowOpacity: Platform.OS === 'android' ? 0 : 0.14,
      shadowRadius: Platform.OS === 'android' ? 0 : 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: Platform.OS === 'android' ? 0 : 6,
    },
    heroPanel: {
      flex: 1,
      justifyContent: 'space-between',
      minHeight: 380,
    },
    heroBadge: {
      alignSelf: 'flex-start',
      height: 34,
      borderRadius: 999,
      paddingHorizontal: 12,
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    heroBadgeText: {
      fontFamily: typography.fonts.semibold,
      fontSize: 11,
      color: colors.background,
      letterSpacing: 0.8,
    },
    heroTitle: {
      marginTop: 18,
      fontFamily: typography.fonts.heading,
      fontSize: 44,
      lineHeight: 46,
      color: colors.text,
      letterSpacing: -1.6,
    },
    heroBody: {
      marginTop: 14,
      fontFamily: typography.fonts.regular,
      fontSize: 15,
      lineHeight: 24,
      color: colors.textMuted,
      maxWidth: 320,
    },
    heroStatsRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 24,
    },
    heroStatCard: {
      flex: 1,
      borderRadius: 18,
      backgroundColor: colors.background + 'C8',
      padding: 14,
      borderWidth: 1,
      borderColor: colors.text + '10',
    },
    heroStatLabel: {
      fontFamily: typography.fonts.semibold,
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1.1,
      marginBottom: 8,
    },
    heroStatValue: {
      fontFamily: typography.fonts.semibold,
      fontSize: 13,
      color: colors.text,
      lineHeight: 18,
    },
    formStack: {
      gap: 14,
    },
    formSectionCard: {
      borderRadius: 18,
      padding: 14,
      backgroundColor: colors.background + 'B8',
      borderWidth: 1,
      borderColor: colors.primary + '16',
    },
    formSectionEyebrow: {
      fontFamily: typography.fonts.semibold,
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1.2,
      marginBottom: 12,
    },
    formFieldSpacer: {
      height: 12,
    },
    infoStrip: {
      minHeight: 46,
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.primary + '12',
      borderWidth: 1,
      borderColor: colors.primary + '26',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    infoStripText: {
      flex: 1,
      fontFamily: typography.fonts.regular,
      fontSize: 12,
      lineHeight: 18,
      color: colors.text,
    },
    selectionHero: {
      borderRadius: 18,
      padding: 16,
      backgroundColor: colors.primary + '16',
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    selectionHeroLabel: {
      fontFamily: typography.fonts.semibold,
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1.2,
      marginBottom: 8,
    },
    selectionHeroValue: {
      fontFamily: typography.fonts.heading,
      fontSize: 30,
      color: colors.text,
      letterSpacing: -0.8,
    },
    selectionHeroSubtext: {
      marginTop: 6,
      fontFamily: typography.fonts.regular,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textMuted,
    },
    currencyWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    currencyChip: {
      minWidth: '22%',
      height: 42,
      borderRadius: 999,
      paddingHorizontal: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background + 'B8',
      borderWidth: 1,
      borderColor: colors.text + '10',
    },
    currencyChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    currencyChipText: {
      fontFamily: typography.fonts.semibold,
      fontSize: 13,
      color: colors.text,
    },
    currencyChipTextActive: {
      color: colors.background,
    },
    selectorSection: {
      marginTop: 2,
    },
    selectorLabel: {
      fontFamily: typography.fonts.semibold,
      fontSize: 10,
      color: colors.textMuted,
      letterSpacing: 1.3,
      marginBottom: 10,
    },
    iconWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    accountPreviewCard: {
      minHeight: 86,
      borderRadius: 20,
      padding: 14,
      backgroundColor: colors.background + 'CC',
      borderWidth: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    accountPreviewIconWrap: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    accountPreviewCopy: {
      flex: 1,
      paddingRight: 10,
    },
    accountPreviewName: {
      fontFamily: typography.fonts.headingRegular,
      fontSize: 18,
      color: colors.text,
      letterSpacing: -0.3,
    },
    accountPreviewMeta: {
      marginTop: 4,
      fontFamily: typography.fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
    },
    accountPreviewBalance: {
      fontFamily: typography.fonts.amountBold,
      fontSize: 16,
      color: colors.text,
    },
    },
    iconChip: {
      width: 46,
      height: 46,
    },
    primaryAction: {
      width: '100%',
      borderWidth: 2,
      borderColor: colors.text,
      transform: [{ scale: 1.08 }],
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: Platform.OS === 'ios' ? 18 : 24,
      paddingTop: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
      height: 54,
      paddingHorizontal: 16,
      borderRadius: 18,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.text + '10',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    backButtonText: {
      fontFamily: typography.fonts.semibold,
      fontSize: 14,
      color: colors.text,
    },
    backButtonPlaceholder: {
      width: 72,
    },
    primaryAction: {
      flex: 1,
    },
  });
