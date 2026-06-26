import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  useColorScheme,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getColors, SPACING, RADIUS, FONT, SHADOW } from '../theme';
import ManualInputForm from '../components/ManualInputForm';

const { width: W } = Dimensions.get('window');
const FRAME_SIZE = W * 0.76;

export default function ScanScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = getColors(isDark);

  const [inputMode, setInputMode] = useState('scan');
  const [scanType, setScanType] = useState('item');
  const [flashOn, setFlashOn] = useState(false);
  const [aiStatus, setAiStatus] = useState('idle');
  const [showSuccess, setShowSuccess] = useState(false);

  const scanLineY = useRef(new Animated.Value(0)).current;
  const pillAnim = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (inputMode !== 'scan') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, { toValue: 1, duration: 2400, useNativeDriver: true }),
        Animated.timing(scanLineY, { toValue: 0, duration: 2400, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [inputMode]);

  const scanLineTranslate = scanLineY.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FRAME_SIZE - 2],
  });

  const switchMode = (m) => {
    setInputMode(m);
    Animated.spring(pillAnim, {
      toValue: m === 'scan' ? 0 : 1,
      damping: 22,
      stiffness: 240,
      useNativeDriver: false,
    }).start();
  };

  const pillLeft = pillAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '50%'] });

  const handleCapture = () => {
    if (aiStatus !== 'idle') return;
    setAiStatus('analyzing');
    setTimeout(() => {
      setAiStatus('done');
      setShowSuccess(true);
      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, damping: 16, stiffness: 180, useNativeDriver: true }),
        Animated.timing(successOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(successScale, { toValue: 0.8, duration: 280, useNativeDriver: true }),
          Animated.timing(successOpacity, { toValue: 0, duration: 280, useNativeDriver: true }),
        ]).start(() => { setShowSuccess(false); setAiStatus('idle'); });
      }, 2200);
    }, 1800);
  };

  const aiLabel = {
    idle: scanType === 'item' ? 'Point at an item to identify it' : 'Point at a receipt to capture items',
    analyzing: '✦ Analyzing with AI...',
    done: scanType === 'item' ? '✓ Item captured!' : '✓ Items found on receipt',
  }[aiStatus];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0A0C0A', '#111610', '#0C100C']}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.wordmark}>SmartStock</Text>

          {/* Scan / Manual toggle */}
          <View style={styles.toggleWrap}>
            <Animated.View style={[styles.togglePill, { left: pillLeft }]} />
            {['scan', 'manual'].map((m) => (
              <TouchableOpacity key={m} onPress={() => switchMode(m)} style={styles.toggleBtn} activeOpacity={0.85}>
                <Ionicons
                  name={m === 'scan' ? 'scan' : 'create-outline'}
                  size={13}
                  color={inputMode === m ? '#FFF' : 'rgba(255,255,255,0.45)'}
                />
                <Text style={[styles.toggleLabel, { color: inputMode === m ? '#FFF' : 'rgba(255,255,255,0.45)' }]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {inputMode === 'scan' ? (
          <View style={styles.scanBody}>
            {/* Scan type selector */}
            <View style={styles.typeRow}>
              {[
                { key: 'receipt', label: 'Receipt', icon: 'receipt-outline' },
                { key: 'item', label: 'Item', icon: 'cube-outline' },
              ].map(({ key, label, icon }) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setScanType(key)}
                  activeOpacity={0.75}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: scanType === key ? 'rgba(255,255,255,0.2)' : 'transparent',
                      borderColor: scanType === key ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.15)',
                    },
                  ]}
                >
                  <Ionicons name={icon} size={13} color={scanType === key ? '#FFF' : 'rgba(255,255,255,0.45)'} />
                  <Text style={[styles.typeChipLabel, { color: scanType === key ? '#FFF' : 'rgba(255,255,255,0.45)' }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Camera frame */}
            <View style={styles.frameWrap}>
              <View style={styles.frame}>
                {/* Corner brackets */}
                {[
                  { top: 0, left: 0, borderTopWidth: 2.5, borderLeftWidth: 2.5 },
                  { top: 0, right: 0, borderTopWidth: 2.5, borderRightWidth: 2.5 },
                  { bottom: 0, left: 0, borderBottomWidth: 2.5, borderLeftWidth: 2.5 },
                  { bottom: 0, right: 0, borderBottomWidth: 2.5, borderRightWidth: 2.5 },
                ].map((corner, i) => (
                  <View
                    key={i}
                    style={[
                      styles.corner,
                      corner,
                      { borderColor: aiStatus === 'analyzing' ? '#D4A060' : 'rgba(255,255,255,0.85)' },
                    ]}
                  />
                ))}

                {/* Scan line */}
                <Animated.View
                  style={[
                    styles.scanLine,
                    {
                      transform: [{ translateY: scanLineTranslate }],
                      backgroundColor: aiStatus === 'analyzing'
                        ? 'rgba(196,132,74,0.7)'
                        : 'rgba(255,255,255,0.45)',
                    },
                  ]}
                />

                {/* Rule-of-thirds grid */}
                {['33%', '66%'].map(pos => [
                  <View key={`v${pos}`} style={[styles.gridV, { left: pos }]} />,
                  <View key={`h${pos}`} style={[styles.gridH, { top: pos }]} />,
                ])}

                <View style={styles.frameLabel}>
                  <Text style={styles.frameLabelText}>
                    {scanType === 'receipt' ? '📄 Receipt' : '📦 Item'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Status */}
            <View style={styles.statusRow}>
              <View style={[
                styles.statusDot,
                {
                  backgroundColor: aiStatus === 'idle' ? 'rgba(255,255,255,0.3)'
                    : aiStatus === 'analyzing' ? '#C4844A'
                    : '#5AAA70',
                },
              ]} />
              <Text style={styles.statusText}>{aiLabel}</Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={() => setFlashOn(!flashOn)}
                style={[styles.ctrlBtn, { backgroundColor: flashOn ? 'rgba(196,148,80,0.25)' : 'rgba(255,255,255,0.1)' }]}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={flashOn ? 'flash' : 'flash-off-outline'}
                  size={22}
                  color={flashOn ? '#D4A860' : 'rgba(255,255,255,0.65)'}
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCapture}
                style={[styles.shutter, { borderColor: aiStatus === 'analyzing' ? '#C4844A' : 'rgba(255,255,255,0.85)' }]}
                activeOpacity={0.85}
                disabled={aiStatus === 'analyzing'}
              >
                <View style={[
                  styles.shutterInner,
                  { backgroundColor: aiStatus === 'analyzing' ? '#C4844A' : '#FFFFFF' },
                ]} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.ctrlBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
                activeOpacity={0.75}
              >
                <Ionicons name="camera-reverse-outline" size={22} color="rgba(255,255,255,0.65)" />
              </TouchableOpacity>
            </View>

            <Text style={styles.tip}>
              {scanType === 'item'
                ? 'AI identifies items and captures expiry dates automatically'
                : 'AI extracts all grocery items from your receipt in seconds'}
            </Text>
          </View>
        ) : (
          <View style={[styles.manualWrapper, { backgroundColor: colors.background }]}>
            <View style={styles.manualHeader}>
              <Text style={[styles.manualTitle, { color: colors.text }]}>Add Item</Text>
              <Text style={[styles.manualSub, { color: colors.textSecondary }]}>Fill in the details below</Text>
            </View>
            <ManualInputForm
              isDark={isDark}
              onSave={() => switchMode('scan')}
              onCancel={() => switchMode('scan')}
            />
          </View>
        )}
      </SafeAreaView>

      {/* Success overlay */}
      {showSuccess && (
        <Animated.View style={[styles.successOverlay, { opacity: successOpacity }]}>
          <Animated.View style={[styles.successCard, { transform: [{ scale: successScale }] }]}>
            <Text style={styles.successEmoji}>
              {scanType === 'receipt' ? '🧾' : '✅'}
            </Text>
            <Text style={styles.successTitle}>
              {scanType === 'receipt' ? 'Receipt Captured!' : 'Item Added!'}
            </Text>
            <Text style={styles.successSub}>
              {scanType === 'receipt' ? '4 items logged to inventory' : 'Saved to your inventory'}
            </Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  wordmark: {
    fontSize: FONT.size.lg,
    fontWeight: FONT.weight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.full,
    padding: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  togglePill: {
    position: 'absolute',
    top: 3,
    bottom: 3,
    width: '50%',
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    zIndex: 1,
    width: 80,
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
  },
  scanBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: SPACING.lg,
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: 4,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  typeChipLabel: {
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.semibold,
  },
  frameWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 2,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
    borderRadius: 1,
  },
  gridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  gridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  frameLabel: {
    position: 'absolute',
    bottom: SPACING.md,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  frameLabelText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: FONT.size.sm,
    fontWeight: FONT.weight.medium,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xl,
    marginVertical: SPACING.md,
  },
  ctrlBtn: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  tip: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: FONT.size.xs,
    textAlign: 'center',
    paddingHorizontal: SPACING.xxl,
    lineHeight: 17,
  },
  manualWrapper: { flex: 1 },
  manualHeader: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  manualTitle: {
    fontSize: FONT.size.xxl,
    fontWeight: FONT.weight.bold,
    letterSpacing: -0.5,
  },
  manualSub: { fontSize: FONT.size.md, marginTop: 2 },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,8,6,0.55)',
    zIndex: 999,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    minWidth: 220,
  },
  successEmoji: { fontSize: 44, marginBottom: SPACING.sm },
  successTitle: {
    fontSize: FONT.size.xl,
    fontWeight: FONT.weight.bold,
    color: '#1E1A16',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  successSub: { fontSize: FONT.size.md, color: '#6B5C4C', textAlign: 'center' },
});
