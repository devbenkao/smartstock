import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  StyleSheet,
  useColorScheme,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors, SPACING, RADIUS, FONT, SHADOW, NAV_BOTTOM_INSET } from '../theme';
import { INVENTORY_ITEMS, getExpirationStatus, getDaysUntilExpiration, formatDate } from '../data/sampleData';

const { width: W } = Dimensions.get('window');

function StatCard({ value, label, icon, color, bg, isDark }) {
  const colors = getColors(isDark);
  return (
    <View style={[styles.statCard, { backgroundColor: bg || colors.surface }, SHADOW.card]}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '18' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function SectionCard({ title, children, isDark }) {
  const colors = getColors(isDark);
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.surface }, SHADOW.card]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function SettingRow({ icon, iconBg, label, sub, value, onValueChange, onPress, isDark, isLast }) {
  const colors = getColors(isDark);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.settingRow, { borderBottomColor: colors.borderLight, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth }]}
    >
      <View style={[styles.settingIconWrap, { backgroundColor: iconBg || colors.surfaceWarm }]}>
        <Ionicons name={icon} size={17} color={colors.textSecondary} />
      </View>
      <View style={styles.settingMid}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        {sub && <Text style={[styles.settingSub, { color: colors.textSecondary }]}>{sub}</Text>}
      </View>
      {typeof value === 'boolean' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor={Platform.OS === 'android' ? '#FFF' : undefined}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {typeof value === 'string' && (
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>
          )}
          <Ionicons name="chevron-forward" size={15} color={colors.textTertiary} />
        </View>
      )}
    </TouchableOpacity>
  );
}

function ExpiringRow({ item, isDark, isLast }) {
  const colors = getColors(isDark);
  const status = getExpirationStatus(item.expirationDate);
  const days = getDaysUntilExpiration(item.expirationDate);
  const isUrgent = status === 'expired' || status === 'critical';
  const badge = status === 'expired' ? 'Expired' : `${days}d`;
  const badgeBg = isUrgent ? colors.expired : colors.critical;
  const badgeText = isUrgent ? colors.expiredText : colors.criticalText;

  return (
    <View style={[styles.expiringRow, { borderBottomColor: colors.borderLight, borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth }]}>
      <View style={[styles.expiringEmojiBg, { backgroundColor: isUrgent ? colors.expired : colors.critical }]}>
        <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.expiringName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.expiringStore, { color: colors.textSecondary }]}>{item.store}</Text>
      </View>
      <View style={[styles.expiringBadge, { backgroundColor: badgeBg }]}>
        <Text style={[styles.expiringBadgeText, { color: badgeText }]}>{badge}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);

  const [notif, setNotif] = useState(true);
  const [digest, setDigest] = useState(false);
  const [units, setUnits] = useState('imperial');

  const stats = useMemo(() => {
    const total = INVENTORY_ITEMS.length;
    const attention = INVENTORY_ITEMS.filter(i => {
      const s = getExpirationStatus(i.expirationDate);
      return s === 'critical' || s === 'expired' || s === 'warning';
    }).length;
    const lowStock = INVENTORY_ITEMS.filter(i => i.quantity <= 1).length;
    return { total, attention, lowStock };
  }, []);

  const attentionItems = useMemo(() =>
    INVENTORY_ITEMS
      .filter(i => {
        const s = getExpirationStatus(i.expirationDate);
        return s !== 'none' && s !== 'good';
      })
      .sort((a, b) => (getDaysUntilExpiration(a.expirationDate) ?? 999) - (getDaysUntilExpiration(b.expirationDate) ?? 999))
      .slice(0, 4),
  []);

  const catCounts = {
    fridge: INVENTORY_ITEMS.filter(i => i.category === 'fridge').length,
    pantry: INVENTORY_ITEMS.filter(i => i.category === 'pantry').length,
    supply: INVENTORY_ITEMS.filter(i => i.category === 'supply').length,
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Profile hero */}
          <LinearGradient
            colors={isDark ? ['#2C2018', '#3C2C1C'] : ['#EDE0CC', '#F5EAD8']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.profileHero}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>BK</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>Ben Kao</Text>
              <View style={styles.profileHouseRow}>
                <Ionicons name="home-outline" size={13} color={colors.textSecondary} />
                <Text style={[styles.profileHouse, { color: colors.textSecondary }]}>My Kitchen</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.surface + 'CC' }]}>
              <Ionicons name="pencil-outline" size={15} color={colors.textSecondary} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <StatCard value={stats.total} label="Total" icon="cube-outline" color={colors.primary} isDark={isDark} />
            <StatCard value={stats.attention} label="Attention" icon="time-outline" color={colors.warning} isDark={isDark} />
            <StatCard value={stats.lowStock} label="Low Stock" icon="alert-circle-outline" color={colors.wood} isDark={isDark} />
          </View>

          {/* Storage breakdown */}
          <SectionCard title="Storage" isDark={isDark}>
            {[
              { key: 'fridge', label: 'Fridge', emoji: '🧊', color: colors.fridge.accent },
              { key: 'pantry', label: 'Pantry', emoji: '🫙', color: colors.pantry.accent },
              { key: 'supply', label: 'Supply', emoji: '📦', color: colors.supply.accent },
            ].map(({ key, label, emoji, color }) => {
              const count = catCounts[key];
              const pct = (count / stats.total) * 100;
              return (
                <View key={key} style={styles.barRow}>
                  <Text style={{ fontSize: 14, width: 20 }}>{emoji}</Text>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{label}</Text>
                  <View style={[styles.barTrack, { backgroundColor: colors.surfaceWarm }]}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={[styles.barCount, { color: colors.textSecondary }]}>{count}</Text>
                </View>
              );
            })}
          </SectionCard>

          {/* Attention items */}
          {attentionItems.length > 0 && (
            <SectionCard title={`Needs attention · ${attentionItems.length}`} isDark={isDark}>
              {attentionItems.map((item, i) => (
                <ExpiringRow key={item.id} item={item} isDark={isDark} isLast={i === attentionItems.length - 1} />
              ))}
            </SectionCard>
          )}

          {/* Notifications */}
          <SectionCard title="Notifications" isDark={isDark}>
            <SettingRow icon="notifications-outline" label="Expiry alerts" sub="When items are about to expire" value={notif} onValueChange={setNotif} isDark={isDark} />
            <SettingRow icon="mail-outline" label="Weekly digest" sub="Sunday inventory summary" value={digest} onValueChange={setDigest} isDark={isDark} isLast />
          </SectionCard>

          {/* Preferences */}
          <SectionCard title="Preferences" isDark={isDark}>
            <SettingRow icon="scale-outline" label="Units" value={units === 'imperial' ? 'Imperial' : 'Metric'} onPress={() => setUnits(u => u === 'imperial' ? 'metric' : 'imperial')} isDark={isDark} />
            <SettingRow icon="color-palette-outline" label="Appearance" value="System" onPress={() => {}} isDark={isDark} />
            <SettingRow icon="download-outline" label="Export data" sub="Download as CSV" onPress={() => {}} isDark={isDark} isLast />
          </SectionCard>

          {/* About */}
          <SectionCard title="About" isDark={isDark}>
            <SettingRow icon="leaf-outline" label="SmartStock" value="v1.0.0" onPress={() => {}} isDark={isDark} />
            <SettingRow icon="star-outline" label="Rate the app" onPress={() => {}} isDark={isDark} />
            <SettingRow icon="chatbubble-outline" label="Send feedback" onPress={() => {}} isDark={isDark} isLast />
          </SectionCard>

          <Text style={[styles.footer, { color: colors.textTertiary }]}>
            Made with care, for your home 🌿
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: NAV_BOTTOM_INSET },
  profileHero: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    letterSpacing: -0.3,
  },
  profileHouseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  profileHouse: { fontSize: FONT.size.sm },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  statCard: {
    flex: 1,
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    alignItems: 'center',
    gap: 4,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.heavy,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
    textAlign: 'center',
  },
  sectionCard: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderRadius: RADIUS.card,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.bold,
    letterSpacing: -0.2,
    marginBottom: SPACING.md,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm + 2,
  },
  barLabel: { fontSize: FONT.size.sm, width: 50 },
  barTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  barCount: { fontSize: FONT.size.sm, fontWeight: FONT.weight.semibold, width: 20, textAlign: 'right' },
  expiringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  expiringEmojiBg: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expiringName: { fontSize: FONT.size.sm, fontWeight: FONT.weight.semibold },
  expiringStore: { fontSize: FONT.size.xs, marginTop: 1 },
  expiringBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  expiringBadgeText: { fontSize: FONT.size.xs, fontWeight: FONT.weight.bold },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
    gap: SPACING.md,
  },
  settingIconWrap: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingMid: { flex: 1 },
  settingLabel: { fontSize: FONT.size.md, fontWeight: FONT.weight.medium },
  settingSub: { fontSize: FONT.size.xs, marginTop: 1, lineHeight: 15 },
  settingValue: { fontSize: FONT.size.sm },
  footer: {
    textAlign: 'center',
    fontSize: FONT.size.sm,
    paddingVertical: SPACING.lg,
  },
});
