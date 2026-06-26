import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  Dimensions,
  useColorScheme,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

const BG_SOURCES = {
  fridge: require('../../assets/fridge.jpg'),
  pantry: require('../../assets/pantry.jpg'),
  supply: require('../../assets/supply.jpg'),
};

// On web, pass objectFit as an inline CSS prop — RN Web forwards unknown style keys to the DOM
const BG_IMG_STYLE = Platform.OS === 'web' ? { objectFit: 'contain' } : null;
import { Ionicons } from '@expo/vector-icons';
import { getColors, SPACING, RADIUS, FONT } from '../theme';
import { INVENTORY_ITEMS, getExpirationStatus, getDaysUntilExpiration } from '../data/sampleData';
import ItemDetailModal from '../components/ItemDetailModal';

const { width: W } = Dimensions.get('window');

const MODES = ['fridge', 'pantry', 'supply'];

const MODE_CONFIG = {
  fridge: { label: 'Fridge', emoji: '🧊' },
  pantry: { label: 'Pantry', emoji: '🫙' },
  supply: { label: 'Supply', emoji: '📦' },
};

// Web-only blur — applied inline to avoid StyleSheet validation errors on native
const BLUR = Platform.OS === 'web'
  ? { backdropFilter: 'blur(22px)', WebkitBackdropFilter: 'blur(22px)' }
  : undefined;

const BLUR_SM = Platform.OS === 'web'
  ? { backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }
  : undefined;

function expiryBadge(expirationDate) {
  const status = getExpirationStatus(expirationDate);
  const days = getDaysUntilExpiration(expirationDate);
  if (!expirationDate || status === 'none' || status === 'good') return null;
  const label = status === 'expired' ? 'Expired' : `${days}d`;
  const color = (status === 'expired' || status === 'critical') ? '#FF453A' : '#FF9F0A';
  return { label, color };
}

function GlassItemRow({ item, onPress }) {
  const badge = expiryBadge(item.expirationDate);
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.72}
      style={[styles.glassRow, BLUR]}
    >
      <View style={[styles.emojiWrap, BLUR_SM]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.rowMid}>
        <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowSub} numberOfLines={1}>
          {item.quantity} {item.unit}{item.store ? ` · ${item.store}` : ''}
        </Text>
      </View>
      {badge && (
        <View style={[styles.badge, { borderColor: badge.color + '80' }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.38)" />
    </TouchableOpacity>
  );
}

function AttentionBanner({ items }) {
  if (items.length === 0) return null;
  const urgent = items.filter(i => {
    const s = getExpirationStatus(i.expirationDate);
    return s === 'expired' || s === 'critical';
  });
  const warning = items.filter(i => getExpirationStatus(i.expirationDate) === 'warning');
  const parts = [];
  if (urgent.length) parts.push(`${urgent.length} critical`);
  if (warning.length) parts.push(`${warning.length} expiring soon`);

  return (
    <View style={[styles.attentionBanner, BLUR_SM]}>
      <Ionicons name="time-outline" size={14} color="#FF9F0A" />
      <Text style={styles.attentionText}>{parts.join(' · ')}</Text>
      <View style={styles.attentionEmojis}>
        {[...urgent, ...warning].slice(0, 4).map(item => (
          <Text key={item.id} style={{ fontSize: 15 }}>{item.emoji}</Text>
        ))}
      </View>
    </View>
  );
}

export default function InventoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [mode, setMode] = useState('fridge');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  // On web, Animated.Image strips unknown style props so objectFit never reaches the DOM.
  // After mount, set it directly on every <img> — all img tags here are background images.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const fix = () => {
      document.querySelectorAll('img').forEach(img => {
        // RN Web sets the Animated.Image wrapper div to the image's natural pixel
        // dimensions. Override both the wrapper and the img itself.
        const wrapper = img.parentElement;
        if (wrapper) {
          wrapper.style.width = '100%';
          wrapper.style.height = '100%';
          wrapper.style.maxWidth = '100vw';
          wrapper.style.maxHeight = '100vh';
        }
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.backgroundColor = '#0A0A0A';
      });
    };
    fix();
    const t = setTimeout(fix, 150);
    return () => clearTimeout(t);
  }, []);

  // One opacity value per background — only the active one is 1
  const bgOpacity = useRef({
    fridge: new Animated.Value(1),
    pantry: new Animated.Value(0),
    supply: new Animated.Value(0),
  }).current;

  // Sliding pill indicator (maps to index 0 / 1 / 2)
  const pillAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (next) => {
    if (next === mode) return;
    const prev = mode;
    const nextIdx = MODES.indexOf(next);

    Animated.parallel([
      Animated.timing(bgOpacity[prev], { toValue: 0, duration: 420, useNativeDriver: true }),
      Animated.timing(bgOpacity[next], { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(pillAnim, { toValue: nextIdx, damping: 22, stiffness: 220, useNativeDriver: true }),
    ]).start();

    setMode(next);
    setSearchQuery('');
  };

  const filteredItems = useMemo(() => {
    let items = INVENTORY_ITEMS.filter(i => i.category === mode);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.store || '').toLowerCase().includes(q)
      );
    }
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [mode, searchQuery]);

  const attentionItems = useMemo(() =>
    INVENTORY_ITEMS
      .filter(i => {
        if (i.category !== mode) return false;
        const s = getExpirationStatus(i.expirationDate);
        return s === 'expired' || s === 'critical' || s === 'warning';
      })
      .sort((a, b) =>
        (getDaysUntilExpiration(a.expirationDate) ?? 999) -
        (getDaysUntilExpiration(b.expirationDate) ?? 999)
      ),
  [mode]);

  // Width of one segment in the toggle
  const SEG = (W - SPACING.lg * 2) / 3;
  const pillTranslateX = pillAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, SEG, SEG * 2],
  });

  return (
    <View style={styles.root}>
      {/* Layered background images — crossfade on mode switch */}
      {MODES.map(m => (
        <Animated.Image
          key={m}
          source={BG_SOURCES[m]}
          style={[styles.bg, { opacity: bgOpacity[m] }, BG_IMG_STYLE]}
          resizeMode="contain"
        />
      ))}

      {/* Dark scrim so text stays legible */}
      <View style={styles.scrim} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Title + add button */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{MODE_CONFIG[mode].label}</Text>
          <TouchableOpacity style={[styles.addBtn, BLUR_SM]} activeOpacity={0.75}>
            <Ionicons name="add" size={21} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Environment toggle — slides with spring */}
        <View style={styles.toggleWrap}>
          <View style={[styles.toggleTrack, BLUR]}>
            <Animated.View
              style={[
                styles.pillIndicator,
                { width: SEG, transform: [{ translateX: pillTranslateX }] },
              ]}
            />
            {MODES.map((m) => {
              const active = mode === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => switchMode(m)}
                  activeOpacity={0.75}
                  style={styles.pillBtn}
                >
                  <Text style={styles.pillEmoji}>{MODE_CONFIG[m].emoji}</Text>
                  <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
                    {MODE_CONFIG[m].label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Scrollable item list */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AttentionBanner items={attentionItems} />

          <Text style={styles.countLabel}>
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </Text>

          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 52 }}>{MODE_CONFIG[mode].emoji}</Text>
              <Text style={styles.emptyTitle}>
                {searchQuery ? 'No results' : `${MODE_CONFIG[mode].label} is empty`}
              </Text>
              <Text style={styles.emptySub}>
                {searchQuery ? 'Try a different search' : 'Tap + to add items'}
              </Text>
            </View>
          ) : (
            filteredItems.map(item => (
              <GlassItemRow
                key={item.id}
                item={item}
                onPress={() => { setSelectedItem(item); setShowDetail(true); }}
              />
            ))
          )}

          {/* Spacer so last item clears the pinned search bar */}
          <View style={{ height: 90 }} />
        </ScrollView>

        {/* Search bar pinned at bottom of the environment */}
        <View style={styles.searchWrap}>
          <View style={[styles.searchBar, BLUR]}>
            <Ionicons name="search" size={16} color="rgba(255,255,255,0.55)" />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${MODE_CONFIG[mode].label.toLowerCase()}…`}
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={15} color="rgba(255,255,255,0.45)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      <ItemDetailModal
        item={selectedItem}
        visible={showDetail}
        onClose={() => setShowDetail(false)}
        isDark={isDark}
        onEdit={() => setShowDetail(false)}
        onDelete={() => setShowDetail(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0A0A0A' },

  bg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
  },

  scrim: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },

  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT.size.xxxl,
    fontWeight: FONT.weight.heavy,
    color: '#FFF',
    letterSpacing: -1.3,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  toggleWrap: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  toggleTrack: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    position: 'relative',
    overflow: 'hidden',
  },
  pillIndicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.38)',
  },
  pillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: SPACING.sm + 3,
  },
  pillEmoji: { fontSize: 14 },
  pillLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
    color: 'rgba(255,255,255,0.55)',
  },
  pillLabelActive: { color: '#FFF' },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg },

  attentionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,149,0,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,149,0,0.32)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 1,
    marginBottom: SPACING.md,
  },
  attentionText: {
    flex: 1,
    color: '#FF9F0A',
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
  },
  attentionEmojis: { flexDirection: 'row', gap: 3 },

  countLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.medium,
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },

  glassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.card,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  emojiWrap: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.lg,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 26 },
  rowMid: { flex: 1 },
  rowName: {
    color: '#FFF',
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.semibold,
    letterSpacing: -0.2,
  },
  rowSub: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: FONT.size.sm,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  badgeText: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.bold,
  },

  searchWrap: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 13 : 11,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: FONT.size.md,
    padding: 0,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 72,
    gap: SPACING.sm,
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    letterSpacing: -0.3,
  },
  emptySub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: FONT.size.md,
  },
});
