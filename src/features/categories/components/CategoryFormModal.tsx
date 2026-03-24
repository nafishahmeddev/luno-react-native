import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useTheme } from '../../../providers/ThemeProvider';
import { ThemeColors } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { useCreateCategory, useUpdateCategory } from '../hooks/categories';

import { Category } from '../api/categories';

export type CategoryFormModalProps = {
  visible: boolean;
  onClose: () => void;
  category?: Category;
};

const ICONS = ['grid', 'fast-food', 'cafe', 'car', 'bus', 'airplane', 'home', 'medkit', 'barbell', 'book', 'game-controller', 'gift', 'heart', 'star'];
const COLORS = ['#00FFAA', '#00F0FF', '#8B5CF6', '#EC4899', '#F43F5E', '#EAB308', '#F97316', '#10B981', '#3B82F6', '#64748B'];

export function CategoryFormModal({ visible, onClose, category }: CategoryFormModalProps) {
  const { colors, isDark } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const isEditing = !!category;
  const { mutateAsync: createCategory, isPending: creating } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: updating } = useUpdateCategory();

  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [type, setType] = useState<'CR' | 'DR'>('DR');
  const [icon, setIcon] = useState('grid');
  const [colorHex, setColorHex] = useState(COLORS[0]);

  useEffect(() => {
    if (category && visible) {
      setName(category.name);
      setBudget(category.budget?.toString() || '');
      setType(category.type as 'CR' | 'DR' || 'DR');
      setIcon(typeof category.icon === 'string' ? category.icon : 'grid');
      const hex = '#' + category.color.toString(16).padStart(6, '0').toUpperCase();
      setColorHex(COLORS.includes(hex) ? hex : hex);
    } else if (visible) {
      setName('');
      setBudget('');
      setType('DR');
      setIcon('grid');
      setColorHex(COLORS[0]);
    }
  }, [category, visible]);

  const handleSave = async () => {
    if (!name) return alert("Category Name is required");

    try {
      if (isEditing) {
        await updateCategory({
          id: category.id,
          data: {
            name,
            budget: parseFloat(budget) || 0,
            type,
            icon,
            color: parseInt(colorHex.replace('#', '0x')),
          }
        });
      } else {
        await createCategory({
          name,
          icon,
          type,
          color: parseInt(colorHex.replace('#', '0x')),
          budget: parseFloat(budget) || 0,
          expense: 0,
        });
      }
      onClose();
    } catch {
      alert("Failed to save category.");
    }
  };

  const isPending = creating || updating;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.dismissArea} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>
          <BlurView
            intensity={Platform.OS === 'ios' ? 60 : 90}
            tint={isDark ? 'dark' : 'light'}
            experimentalBlurMethod={"dimezisBlurView"}
            style={StyleSheet.absoluteFillObject}
          />
          {Platform.OS === 'android' && <View style={[StyleSheet.absoluteFillObject, { backgroundColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)' }]} pointerEvents="none" />}

          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Category' : 'New Category'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close-circle" size={28} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
            <Input label="Category Name" value={name} onChangeText={setName} placeholder="e.g. Groceries, Rent" />
            <Input label="Monthly Budget (Optional)" value={budget} onChangeText={setBudget} placeholder="0.00" keyboardType="decimal-pad" />

            <Text style={styles.sectionLabel}>Category Type {isEditing && "(Locked)"}</Text>
            <View style={[styles.typeRow, isEditing && { opacity: 0.6 }]}>
              <Button
                title="Expense (DR)"
                variant={type === 'DR' ? 'danger' : 'outline'}
                onPress={() => !isEditing && setType('DR')}
                style={styles.typeBtn}
                disabled={isEditing && type !== 'DR'}
              />
              <Button
                title="Income (CR)"
                variant={type === 'CR' ? 'success' : 'outline'}
                onPress={() => !isEditing && setType('CR')}
                style={styles.typeBtn}
                disabled={isEditing && type !== 'CR'}
              />
            </View>

            <Text style={styles.sectionLabel}>Select Icon</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll} contentContainerStyle={styles.pickerContent}>
              {ICONS.map((i) => (
                <TouchableOpacity key={i} style={[styles.pickerItem, icon === i && styles.pickerSelected]} onPress={() => setIcon(i)}>
                  <Ionicons name={i as any} size={24} color={icon === i ? colors.primary : colors.textMuted} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>Select Color</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll} contentContainerStyle={styles.pickerContent}>
              {COLORS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorItem, { backgroundColor: c }, colorHex === c && styles.colorSelected]}
                  onPress={() => setColorHex(c)}
                />
              ))}
            </ScrollView>

            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={styles.footer}>
            <Button title="Save Category" onPress={handleSave} isLoading={isPending} style={{ width: '100%' }} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background === '#000000' ? 'rgba(20,20,20,0.8)' : 'rgba(255,255,255,0.8)',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '85%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  closeButton: { padding: 4 },
  headerTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.5,
  },
  formContainer: { padding: 24 },
  sectionLabel: {
    fontFamily: typography.fonts.monoBold,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    opacity: 0.6,
  },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  typeBtn: { flex: 1 },
  pickerScroll: { marginBottom: 8 },
  pickerContent: { paddingRight: 20 },
  pickerItem: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface + '80', borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, paddingHorizontal: 16, marginRight: 12, minWidth: 64 },
  pickerSelected: { borderColor: colors.primary, backgroundColor: colors.primary + '15' },
  colorItem: { width: 44, height: 44, borderRadius: 22, marginRight: 12, borderWidth: 2, borderColor: 'transparent' },
  colorSelected: { borderColor: colors.text, transform: [{ scale: 1.1 }] },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: 'transparent',
  },
});
