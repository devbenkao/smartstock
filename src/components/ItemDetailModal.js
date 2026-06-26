import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getColors, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { getExpirationStatus, getDaysUntilExpiration, formatDate } from '../data/sampleData';

const { height: H, width: W } = Dimensions.get('window');
const HERO_H = H * 0.34;
const SHEET_H = H * 0.78;

export default function ItemDetailModal({ item, visible, onClose, isDark, onEdit, onDelete }) {
  const colors = getColors(isDark);
  const slideAnim = useRef(new Animated.Value(SHEET_H)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, damping: 26, stiffness: 260, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SHEET_H, duration: 260, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!item) return null;

  const expStatus = getExpirationStatus(item.expirationDate);
  const daysLeft = getDaysUntilExpiration(item.expirationDate);

  const expCfg = {
    expired: { bg: colors.expired, text: colors.expiredText, label: 'Expired', icon: 'warning' },
    critical: { bg: colors.expired, text: colors.expiredText, label: `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`, icon: 'warning' },
    warning: { bg: colors.critical, text: colors.criticalText, label: `${daysLeft} days left`, icon: 'time-outline' },
    good: { bg: colors.good, text: colors.goodText, label: `${daysLeft} days left`, icon: 'checkmark-circle-outline' },
    none: { bg: colors.surfaceWarm, text: colors.textTertiary, label: 'No expiry date', icon: 'infinite-outline' },
  }[expStatus];

  // Hero gradient per category
  const heroGradients = {
    fridge: isDark ? ['#102030', '#1A3850'] : ['#C8DCFA', '#8CBCE8'],
    pantry: isDark ? ['#201508', '#3A2810'] : ['#F8E8C0', '#ECC878'],
    supply: isDark ? ['#1C1814', '#2E2624'] : ['#E8E0DA', '#D0C4BC'],
  };
  const heroGrad = heroGradients[item.category] || heroGradients.fridge;

  const Chip = ({ icon, label, value, accent }) => (
    <View style={[styles.chip, { backgroundColor: colors.surfaceWarm }]}>
      <Ionicons name={icon} size={14} color={accent || colors.primary} />
      <View>
        <Text style={[styles.chipLabel, { color: colors.textTertiary }]}>{label}</Text>
        <Text style={[styles.chipValue, { color: accent || colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="none">
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
        {/* Hero section */}
        <LinearGradient colors={heroGrad} style={styles.hero}>
          <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
            <Ionicons name="close" size={18} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.heroEmoji}>{item.emoji}</Text>
          <View style={[styles.heroExpBadge, { backgroundColor: expCfg.bg }]}>
            <Ionicons name={expCfg.icon} size={12} color={expCfg.text} />
            <Text style={[styles.heroExpText, { color: expCfg.text }]}>{expCfg.label}</Text>
          </View>
        </LinearGradient>

        {/* White slide-up card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.itemStore, { color: colors.textSecondary }]}>{item.store}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.categoryBadgeText, { color: colors.primary }]}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Text>
            </View>
          </View>

          {/* Chips row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={{ gap: SPACING.sm, paddingHorizontal: SPACING.lg }}>
            <Chip icon="layers-outline" label="Qty" value={`${item.quantity} ${item.unit}`} />
            {item.price && <Chip icon="pricetag-outline" label="Paid" value={`$${item.price.toFixed(2)}`} />}
            <Chip icon="calendar-outline" label="Bought" value={formatDate(item.purchaseDate)} />
            {item.expirationDate && (
              <Chip icon="hourglass-outline" label="Expires" value={formatDate(item.expirationDate)} accent={expCfg.text} />
            )}
          </ScrollView>

          {/* Notes */}
          {item.notes ? (
            <View style={[styles.notesBox, { backgroundColor: colors.surfaceWarm, marginHorizontal: SPACING.lg }]}>
              <Ionicons name="document-text-outline" size={14} color={colors.textTertiary} />
              <Text style={[styles.notesText, { color: colors.textSecondary }]}>{item.notes}</Text>
            </View>
          ) : null}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onEdit}
              activeOpacity={0.8}
              style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
            >
              <Ionicons name="pencil" size={16} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDelete}
              activeOpacity={0.8}
              style={[styles.actionBtnPrimary, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="checkmark" size={16} color="#FFF" />
              <Text style={styles.actionTextPrimary}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20,16,12,0.6)',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_H,
  },
  hero: {
    height: HERO_H,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    width: 32,
    height: 32,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 72,
  },
  heroExpBadge: {
    position: 'absolute',
    bottom: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  heroExpText: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
  },
  card: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: RADIUS.full,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  itemName: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  itemStore: {
    fontSize: FONT.size.md,
    marginTop: 3,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginTop: 4,
  },
  categoryBadgeText: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
  },
  chipsRow: {
    marginBottom: SPACING.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
  },
  chipLabel: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chipValue: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
    marginTop: 1,
  },
  notesBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  notesText: {
    flex: 1,
    fontSize: FONT.size.sm,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  actionText: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semibold,
  },
  actionBtnPrimary: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  actionTextPrimary: {
    color: '#FFF',
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
  },
});
