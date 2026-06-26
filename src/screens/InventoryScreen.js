import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  StyleSheet,
  Dimensions,
  useColorScheme,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import { INVENTORY_ITEMS, CATEGORY_CONFIG, getExpirationStatus, getDaysUntilExpiration } from '../data/sampleData';
import ItemCard, { CARD_W, CARD_GAP, CARD_H_PAD } from '../components/ItemCard';
import ItemDetailModal from '../components/ItemDetailModal';

const { width: W } = Dimensions.get('window');

const MODES = ['all', 'fridge', 'pantry', 'supply'];

const MODE_CONFIG = {
  all: { label: 'All', emoji: '✨', icon: 'apps-outline', iconActive: 'apps' },
  fridge: { label: 'Fridge', emoji: '🧊', icon: 'snow-outline', iconActive: 'snow' },
  pantry: { label: 'Pantry', emoji: '🫙', icon: 'storefront-outline', iconActive: 'storefront' },
  supply: { label: 'Supply', emoji: '📦', icon: 'cube-outline', iconActive: 'cube' },
};

function FeaturedCard({ items, isDark, colors }) {
  const urgentItems = items.filter(item => {
    const s = getExpirationStatus(item.expirationDate);
    return s === 'critical' || s === 'expired';
  });
  const warningItems = items.filter(item => getExpirationStatus(item.expirationDate) === 'warning');

  if (urgentItems.length === 0 && warningItems.length === 0) {
    return (
      <LinearGradient
        colors={isDark ? ['#2A2018', '#3A2C1C'] : ['#F8EDD8', '#EEDD9A']}
        style={styles.featuredCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.featuredContent}>
          <Text style={styles.featuredEmoji}>✅</Text>
          <View style={styles.featuredText}>
            <Text style={[styles.featuredTitle, { color: isDark ? '#F5EEE5' : '#1E1A16' }]}>
              All fresh & stocked
            </Text>
            <Text style={[styles.featuredSub, { color: isDark ? '#A89880' : '#6B5C4C' }]}>
              {items.length} items across your home
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  const count = urgentItems.length + warningItems.length;
  return (
    <LinearGradient
      colors={isDark ? ['#3A1808', '#5A2810'] : ['#C87848', '#A85C28']}
      style={styles.featuredCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.featuredContent}>
        <View style={styles.featuredLeft}>
          <Text style={styles.featuredBigNumber}>{count}</Text>
          <Text style={styles.featuredUnit}>item{count !== 1 ? 's' : ''}</Text>
        </View>
        <View style={styles.featuredText}>
          <Text style={styles.featuredTitleWhite}>
            {urgentItems.length > 0 ? 'Needs attention' : 'Expiring soon'}
          </Text>
          <Text style={styles.featuredSubWhite}>
            {urgentItems.length > 0
              ? `${urgentItems.length} critical · ${warningItems.length} this week`
              : `${warningItems.length} expiring within 7 days`}
          </Text>
        </View>
        <View style={styles.featuredItems}>
          {[...urgentItems, ...warningItems].slice(0, 3).map(item => (
            <Text key={item.id} style={styles.featuredItemEmoji}>{item.emoji}</Text>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

export default function InventoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);

  const [mode, setMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const activeModeColors = mode === 'all' ? colors.fridge : colors[mode];

  const filteredItems = useMemo(() => {
    let items = mode === 'all' ? INVENTORY_ITEMS : INVENTORY_ITEMS.filter(i => i.category === mode);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.store.toLowerCase().includes(q) ||
        i.notes.toLowerCase().includes(q)
      );
    }
    return items.sort((a, b) => a.name.localeCompare(b.name));
  }, [mode, searchQuery]);

  const handleItemPress = (item) => {
    setSelectedItem(item);
    setShowDetail(true);
  };

  // Grid: 2 columns using sections trick — pair items
  const pairedItems = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < filteredItems.length; i += 2) {
      pairs.push({ id: `pair-${i}`, left: filteredItems[i], right: filteredItems[i + 1] || null });
    }
    return pairs;
  }, [filteredItems]);

  const ListHeader = () => (
    <View style={styles.listHeader}>
      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.searchBg }]}>
        <Ionicons name="search" size={17} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search your inventory..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Featured card */}
      <FeaturedCard items={INVENTORY_ITEMS} isDark={isDark} colors={colors} />

      {/* Category pills */}
      <View style={styles.pillsRow}>
        {MODES.map((m) => {
          const isActive = mode === m;
          const cfg = MODE_CONFIG[m];
          const mColors = m === 'all' ? null : colors[m];
          return (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              activeOpacity={0.75}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive
                    ? (m === 'all' ? colors.primary : mColors.accent)
                    : colors.surfaceWarm,
                },
              ]}
            >
              <Text style={styles.pillEmoji}>{cfg.emoji}</Text>
              <Text style={[
                styles.pillLabel,
                { color: isActive ? '#FFF' : colors.textSecondary },
              ]}>
                {cfg.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Count */}
      <Text style={[styles.countLabel, { color: colors.textTertiary }]}>
        {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        {searchQuery ? ` matching "${searchQuery}"` : ''}
      </Text>
    </View>
  );

  const modeColors = mode === 'all' ? colors.fridge : colors[mode];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Page title */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Inventory</Text>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
            <Ionicons name="add" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        {filteredItems.length === 0 && searchQuery ? (
          <FlatList
            data={[]}
            ListHeaderComponent={ListHeader}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🔍</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Try a different search term
                </Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        ) : (
          <FlatList
            data={pairedItems}
            keyExtractor={pair => pair.id}
            ListHeaderComponent={ListHeader}
            renderItem={({ item: pair }) => (
              <View style={styles.pairRow}>
                <ItemCard
                  item={pair.left}
                  onPress={() => handleItemPress(pair.left)}
                  isDark={isDark}
                  modeColors={pair.left.category === 'all' ? colors.fridge : colors[pair.left.category]}
                />
                {pair.right ? (
                  <ItemCard
                    item={pair.right}
                    onPress={() => handleItemPress(pair.right)}
                    isDark={isDark}
                    modeColors={pair.right.category === 'all' ? colors.fridge : colors[pair.right.category]}
                  />
                ) : (
                  <View style={{ width: CARD_W }} />
                )}
              </View>
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>{MODE_CONFIG[mode].emoji}</Text>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing here yet</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>Tap Scan to add items</Text>
              </View>
            )}
          />
        )}
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
  root: { flex: 1 },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  pageTitle: {
    fontSize: FONT.size.xxxl,
    fontWeight: FONT.weight.heavy,
    letterSpacing: -1.2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listHeader: {
    paddingHorizontal: CARD_H_PAD,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? 11 : 9,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT.size.md,
    padding: 0,
  },
  featuredCard: {
    borderRadius: RADIUS.card,
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  featuredEmoji: { fontSize: 32 },
  featuredLeft: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  featuredBigNumber: {
    fontSize: FONT.size.display,
    fontWeight: FONT.weight.heavy,
    color: '#FFF',
    lineHeight: FONT.size.display,
  },
  featuredUnit: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FONT.size.md,
    fontWeight: FONT.weight.medium,
    paddingBottom: 4,
  },
  featuredText: { flex: 1 },
  featuredTitle: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    letterSpacing: -0.3,
  },
  featuredTitleWhite: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: '#FFF',
    letterSpacing: -0.3,
  },
  featuredSub: {
    fontSize: FONT.size.sm,
    marginTop: 2,
  },
  featuredSubWhite: {
    fontSize: FONT.size.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  featuredItems: {
    flexDirection: 'column',
    gap: 2,
  },
  featuredItemEmoji: { fontSize: 18 },
  pillsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.full,
  },
  pillEmoji: { fontSize: 13 },
  pillLabel: {
    fontSize: FONT.size.xs,
    fontWeight: FONT.weight.semibold,
  },
  countLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
    marginTop: -4,
  },
  listContent: {
    paddingHorizontal: CARD_H_PAD,
    paddingBottom: 100,
  },
  pairRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: { fontSize: 48, marginBottom: SPACING.md },
  emptyTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    marginBottom: SPACING.xs,
    letterSpacing: -0.3,
  },
  emptySub: {
    fontSize: FONT.size.md,
    textAlign: 'center',
  },
});
