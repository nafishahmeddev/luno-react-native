import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../../../providers/ThemeProvider';
import { typography } from '../../../theme/typography';

type ProfileStepProps = {
  name: string;
  onNameChange: (value: string) => void;
};

export function ProfileStep({ name, onNameChange }: ProfileStepProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.prompt}>Tell us your name</Text>
      <TextInput
        value={name}
        onChangeText={onNameChange}
        placeholder="John"
        placeholderTextColor={colors.textMuted + '80'}
        style={styles.nameInput}
        autoCapitalize="words"
        autoCorrect={false}
      />
      <View style={styles.nameUnderline} />

      <View style={styles.noteRow}>
        <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
        <Text style={styles.noteText}>This name is used for your account holder and profile identity.</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: { [key: string]: string }) =>
  StyleSheet.create({
    wrapper: {
      gap: 12,
    },
    prompt: {
      fontFamily: typography.fonts.semibold,
      fontSize: 14,
      color: colors.textMuted,
      letterSpacing: 0.2,
    },
    nameInput: {
      fontFamily: typography.fonts.heading,
      fontSize: 44,
      lineHeight: 48,
      color: colors.text,
      letterSpacing: -1.2,
      paddingHorizontal: 0,
      paddingVertical: 2,
      minHeight: 58,
    },
    nameUnderline: {
      height: 2,
      borderRadius: 999,
      backgroundColor: colors.primary + '66',
      marginTop: -2,
      marginBottom: 8,
    },
    noteRow: {
      marginTop: 4,
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
    noteText: {
      flex: 1,
      fontFamily: typography.fonts.regular,
      fontSize: 12,
      lineHeight: 18,
      color: colors.text,
    },
  });
