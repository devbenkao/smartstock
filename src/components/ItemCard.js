import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getColors, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { getExpirationStatus, getDaysUntilExpiration } from '../data/sampleData';

const { width: W } = Dimensions.get('window');
export const CARD_GAP = 12;
export const CARD_H_PAD = 16;
export const CARD_W = (W - CARD_H_PAD * 2 - CARD_GAP) / 2;
export const CARD_H = CARD_W * 1.42;

export default function ItemCard({ item, onPress, isDark, modeColors }) {
  const colors = getColors(isDark);
  const expStatus = getExpirationStatus(item.expirationDate);
  const daysLeft = getDaysUntilExpiration(item.expirationDate);

  const expConfig = {
    expired: { bg: colors.expired, text: colors.expiredText, label: 'Expired', icon: 'warning' },
    critical: { bg: colors.expired, text: colors.expiredText, label: `${daysLeft}d`, icon: 'warning' },
    warning: { bg: colors.critical, text: colors.criticalText, label: `${daysLeft}d`, icon: 'time' },
    good: { bg: colors.good, text: colors.goodText, label: `${daysLeft}d`, icon: null },
    none: { bg: colors.surfaceWarm, text: colors.textTertiary, label: null, icon: null },
  }[expStatus];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={[styles.card, { backgroundColor: colors.surface, width: CARD_W }, SHADOW.card]}
    >
      {/* Image / emoji area */}
      <View style={[styles.imageArea, { backgroundColor: modeColors.itemTint }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        {expConfig.icon && (
          <View style={[styles.expBadge, { backgroundColor: expConfig.bg }]}>
            <Ionicons name={expConfig.icon} size={10} color={expConfig.text} />
            <Text style={[styles.expBadgeText, { color: expConfig.text }]}>
              {expConfig.label}
            </Text>
          </View>
        )}
      </View>

      {/* Text area */}
      <View style={styles.textArea}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.store, { color: colors.textTertiary }]} numberOfLines={1}>
          {item.store}
        </Text>

        <View style={styles.footer}>
          <View style={[styles.qtyChip, { backgroundColor: modeColors.chipBg }]}>
            <Text style={[styles.qty, { color: modeColors.accent }]}>
              {item.quantity}
              <Text style={styles.unit}> {item.unit}</Text>
            </Text>
          </View>
          {expConfig.label && !expConfig.icon && (
            <View style={[styles.expChip, { backgroundColor: expConfig.bg }]}>
              <Text style={[styles.expChipText, { color: expConfig.text }]}>
                {expConfig.label}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    marginBottom: CARD_GAP,
  },
  imageArea: {
    height: CARD_W * 0.72,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emoji: {
    fontSize: 44,
  },
  expBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  expBadgeText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.bold,
  },
  textArea: {
    padding: SPACING.sm + 4,
    gap: 3,
  },
  name: {
    fontSize: FONT.size.sm + 1,
    fontWeight: FONT.weight.semibold,
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  store: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.regular,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs + 2,
    flexWrap: 'wrap',
  },
  qtyChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  qty: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.bold,
  },
  unit: {
    fontWeight: FONT.weight.regular,
  },
  expChip: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  expChipText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.semibold,
  },
});
