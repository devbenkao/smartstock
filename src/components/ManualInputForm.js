import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, SPACING, RADIUS, FONT, SHADOW } from '../theme';

const CATEGORIES = [
  { key: 'fridge', label: 'Fridge', emoji: '🧊' },
  { key: 'pantry', label: 'Pantry', emoji: '🫙' },
  { key: 'supply', label: 'Supply', emoji: '📦' },
];

const UNITS = ['count', 'lbs', 'oz', 'kg', 'g', 'gallon', 'liter', 'bottle', 'box', 'bag', 'can', 'jar', 'pack', 'roll'];

export default function ManualInputForm({ isDark, onSave, onCancel }) {
  const colors = getColors(isDark);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('fridge');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('count');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [expirationDate, setExpirationDate] = useState('');
  const [store, setStore] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [showUnits, setShowUnits] = useState(false);

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave?.({
      id: Date.now().toString(),
      name: name.trim(),
      category,
      quantity,
      unit,
      purchaseDate,
      expirationDate: expirationDate || null,
      store: store.trim(),
      price: price ? parseFloat(price) : null,
      notes: notes.trim(),
      emoji: category === 'fridge' ? '🧊' : category === 'pantry' ? '🫙' : '📦',
    });
  };

  const Label = ({ text }) => (
    <Text style={[styles.label, { color: colors.textTertiary }]}>{text}</Text>
  );

  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.content, { paddingBottom: 60 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category */}
        <Label text="CATEGORY" />
        <View style={styles.catRow}>
          {CATEGORIES.map(cat => {
            const isActive = category === cat.key;
            const mColors = colors[cat.key];
            return (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setCategory(cat.key)}
                activeOpacity={0.75}
                style={[
                  styles.catBtn,
                  {
                    backgroundColor: isActive ? mColors.accentLight : colors.surfaceWarm,
                    borderColor: isActive ? mColors.accent : colors.border,
                    borderWidth: 1.5,
                  },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
                <Text style={[styles.catLabel, { color: isActive ? mColors.accent : colors.textSecondary }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Name */}
        <Label text="ITEM NAME *" />
        <TextInput
          style={inputStyle}
          placeholder="e.g. Whole Milk, Dish Soap..."
          placeholderTextColor={colors.textTertiary}
          value={name}
          onChangeText={setName}
          returnKeyType="next"
        />

        {/* Quantity + Unit */}
        <Label text="QUANTITY" />
        <View style={styles.qtyRow}>
          <View style={[styles.stepper, { borderColor: colors.border, backgroundColor: colors.inputBg }]}>
            <TouchableOpacity onPress={() => setQuantity(q => Math.max(0, q - 1))} style={styles.stepBtn} activeOpacity={0.7}>
              <Ionicons name="remove" size={18} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.stepValue, { color: colors.text }]}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(q => q + 1)} style={styles.stepBtn} activeOpacity={0.7}>
              <Ionicons name="add" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setShowUnits(!showUnits)}
            style={[styles.unitBtn, { borderColor: colors.border, backgroundColor: colors.inputBg }]}
            activeOpacity={0.75}
          >
            <Text style={[styles.unitText, { color: colors.text }]}>{unit}</Text>
            <Ionicons name={showUnits ? 'chevron-up' : 'chevron-down'} size={13} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {showUnits && (
          <View style={[styles.unitDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {UNITS.map(u => (
              <TouchableOpacity
                key={u}
                onPress={() => { setUnit(u); setShowUnits(false); }}
                style={[styles.unitOption, { borderBottomColor: colors.borderLight }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.unitOptionText, { color: u === unit ? colors.primary : colors.text }]}>{u}</Text>
                {u === unit && <Ionicons name="checkmark" size={15} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Dates */}
        <View style={styles.dateRow}>
          <View style={{ flex: 1 }}>
            <Label text="PURCHASED" />
            <TextInput style={inputStyle} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} value={purchaseDate} onChangeText={setPurchaseDate} />
          </View>
          <View style={{ flex: 1 }}>
            <Label text="EXPIRES" />
            <TextInput style={inputStyle} placeholder="YYYY-MM-DD" placeholderTextColor={colors.textTertiary} value={expirationDate} onChangeText={setExpirationDate} />
          </View>
        </View>

        {/* Store */}
        <Label text="STORE / LOCATION" />
        <TextInput style={inputStyle} placeholder="e.g. Whole Foods, Costco..." placeholderTextColor={colors.textTertiary} value={store} onChangeText={setStore} />

        {/* Price */}
        <Label text="PRICE PAID (OPTIONAL)" />
        <View style={[styles.priceWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
          <Text style={[styles.priceCurrency, { color: colors.textSecondary }]}>$</Text>
          <TextInput
            style={[styles.priceInput, { color: colors.text }]}
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Notes */}
        <Label text="NOTES" />
        <TextInput
          style={[inputStyle, { height: 76, paddingTop: SPACING.sm + 2, textAlignVertical: 'top' }]}
          placeholder="Any extra details..."
          placeholderTextColor={colors.textTertiary}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={onCancel}
            style={[styles.cancelBtn, { borderColor: colors.border }]}
            activeOpacity={0.75}
          >
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: canSave ? colors.primary : colors.border }]}
            activeOpacity={0.8}
            disabled={!canSave}
          >
            <Ionicons name="checkmark" size={18} color="#FFF" />
            <Text style={styles.saveText}>Add Item</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: SPACING.lg },
  label: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.semibold,
    letterSpacing: 0.8,
    marginBottom: SPACING.xs + 2,
    marginTop: SPACING.md,
  },
  input: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT.size.md,
  },
  catRow: { flexDirection: 'row', gap: SPACING.sm },
  catBtn: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm + 4, borderRadius: RADIUS.lg, gap: 4 },
  catLabel: { fontSize: FONT.size.sm, fontWeight: FONT.weight.semibold },
  qtyRow: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  stepBtn: { paddingHorizontal: 14, paddingVertical: SPACING.sm + 4 },
  stepValue: { fontSize: FONT.size.lg, fontWeight: FONT.weight.bold, minWidth: 34, textAlign: 'center' },
  unitBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 6,
  },
  unitText: { fontSize: FONT.size.md },
  unitDropdown: { borderRadius: RADIUS.md, borderWidth: 1, marginTop: 4, maxHeight: 180, overflow: 'hidden' },
  unitOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  unitOptionText: { fontSize: FONT.size.md },
  dateRow: { flexDirection: 'row', gap: SPACING.sm },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingLeft: SPACING.md,
  },
  priceCurrency: { fontSize: FONT.size.md, fontWeight: FONT.weight.medium },
  priceInput: { flex: 1, paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.sm, fontSize: FONT.size.md },
  actionRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xl },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
  },
  cancelText: { fontSize: FONT.size.md, fontWeight: FONT.weight.semibold },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  saveText: { color: '#FFF', fontSize: FONT.size.md, fontWeight: FONT.weight.bold },
});
