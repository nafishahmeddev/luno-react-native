import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { ThemeColors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export type HeaderProps = {
  title: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
};

export function Header({ title, showBack, rightAction }: HeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {showBack ? (
        <TouchableOpacity onPress={() => router.back()} style={styles.actionBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.actionPlaceholder} />
      )}

      <Text style={styles.title}>{title}</Text>

      {rightAction ? (
        <View style={styles.actionBtn}>{rightAction}</View>
      ) : (
        <View style={styles.actionPlaceholder} />
      )}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  title: {
    fontFamily: typography.fonts.heading,
    color: colors.text,
    fontSize: typography.sizes.xl,
    letterSpacing: -0.5,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionPlaceholder: {
    width: 40,
  },
});
