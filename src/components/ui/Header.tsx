import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../providers/ThemeProvider';
import { ThemeColors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export type HeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
};

export function Header({ title, subtitle, showBack, rightAction }: HeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      {/* Left: back btn + title/subtitle */}
      <View style={styles.left}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.75}>
            <Ionicons name="chevron-back" size={20} color={colors.text} />
          </TouchableOpacity>
        )}

      </View>
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {/* Right action */}
      {rightAction ? (
        <View style={styles.rightActionWrap}>{rightAction}</View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: 'transparent',
    gap: 20
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  titleBlock: {
    flex:1,
    gap: 2,
  },
  title: {
    fontFamily: typography.fonts.heading,
    color: colors.text,
    fontSize: 26,
    letterSpacing: -0.8,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: typography.fonts.regular,
    color: colors.textMuted,
    fontSize: 13,
    letterSpacing: 0.1,
  },
  rightActionWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
