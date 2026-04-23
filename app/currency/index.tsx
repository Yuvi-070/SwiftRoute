import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { radii, spacing, typography } from '../../constants/theme';
import {
  fetchExchangeRates,
  getCurrencySymbol,
  POPULAR_CURRENCIES,
  type ExchangeRates,
} from '../../services/currencyService';
import AnimatedCard from '../../components/ui/AnimatedCard';
import PressableScale from '../../components/ui/PressableScale';

export default function CurrencyScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();

  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    loadRates();
  }, [fromCurrency]);

  const loadRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchExchangeRates(fromCurrency);
      setRates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rates');
    } finally {
      setLoading(false);
    }
  };

  const parsedAmount = parseFloat(amount) || 0;
  const toRate = rates?.rates[toCurrency] ?? 0;
  const convertedAmount = parsedAmount * toRate;

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.primaryMuted }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            💱 Currency Converter
          </Text>
          <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
            {rates ? `Updated: ${new Date(rates.fetchedAt).toLocaleTimeString()}` : 'Loading rates...'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Converter card */}
        <AnimatedCard delay={0}>
          <View
            style={[
              styles.converterCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                ...Platform.select({
                  ios: {
                    shadowColor: theme.shadowColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: theme.shadowOpacity,
                    shadowRadius: 12,
                  },
                  android: { elevation: 3 },
                }),
              },
            ]}
          >
            {/* From */}
            <View style={styles.currencyRow}>
              <TouchableOpacity
                style={[styles.currencySelector, { backgroundColor: theme.primaryMuted }]}
                onPress={() => {
                  setShowFromPicker(!showFromPicker);
                  setShowToPicker(false);
                }}
              >
                <Text style={[styles.currencyCode, { color: theme.primary }]}>
                  {fromCurrency}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.primary} />
              </TouchableOpacity>
              <TextInput
                style={[
                  styles.amountInput,
                  {
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    backgroundColor: theme.surfaceElevated,
                  },
                ]}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={theme.textTertiary}
              />
            </View>

            {/* Swap button */}
            <View style={styles.swapContainer}>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
              <TouchableOpacity
                style={[styles.swapBtn, { backgroundColor: theme.primary }]}
                onPress={swapCurrencies}
              >
                <Ionicons name="swap-vertical" size={20} color="#FFF" />
              </TouchableOpacity>
              <View style={[styles.divider, { backgroundColor: theme.divider }]} />
            </View>

            {/* To */}
            <View style={styles.currencyRow}>
              <TouchableOpacity
                style={[styles.currencySelector, { backgroundColor: theme.successLight }]}
                onPress={() => {
                  setShowToPicker(!showToPicker);
                  setShowFromPicker(false);
                }}
              >
                <Text style={[styles.currencyCode, { color: theme.success }]}>
                  {toCurrency}
                </Text>
                <Ionicons name="chevron-down" size={16} color={theme.success} />
              </TouchableOpacity>
              <View
                style={[
                  styles.resultBox,
                  { backgroundColor: theme.surfaceElevated, borderColor: theme.border },
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Text style={[styles.resultText, { color: theme.textPrimary }]}>
                    {getCurrencySymbol(toCurrency)} {convertedAmount.toFixed(2)}
                  </Text>
                )}
              </View>
            </View>

            {/* Rate info */}
            {rates && toRate > 0 && (
              <Text style={[styles.rateInfo, { color: theme.textSecondary }]}>
                1 {fromCurrency} = {toRate.toFixed(4)} {toCurrency}
              </Text>
            )}
          </View>
        </AnimatedCard>

        {/* Currency picker */}
        {(showFromPicker || showToPicker) && (
          <AnimatedCard delay={0}>
            <View
              style={[
                styles.pickerCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>
                Select {showFromPicker ? 'Source' : 'Target'} Currency
              </Text>
              {POPULAR_CURRENCIES.map((cur) => {
                const isSelected = showFromPicker
                  ? cur.code === fromCurrency
                  : cur.code === toCurrency;
                return (
                  <PressableScale
                    key={cur.code}
                    onPress={() => {
                      if (showFromPicker) {
                        setFromCurrency(cur.code);
                        setShowFromPicker(false);
                      } else {
                        setToCurrency(cur.code);
                        setShowToPicker(false);
                      }
                    }}
                  >
                    <View
                      style={[
                        styles.pickerRow,
                        {
                          borderBottomColor: theme.divider,
                          backgroundColor: isSelected ? theme.primaryMuted : 'transparent',
                        },
                      ]}
                    >
                      <Text style={[styles.pickerSymbol, { color: theme.primary }]}>
                        {cur.symbol}
                      </Text>
                      <View style={styles.pickerInfo}>
                        <Text style={[styles.pickerCode, { color: theme.textPrimary }]}>
                          {cur.code}
                        </Text>
                        <Text style={[styles.pickerName, { color: theme.textSecondary }]}>
                          {cur.name}
                        </Text>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                      )}
                    </View>
                  </PressableScale>
                );
              })}
            </View>
          </AnimatedCard>
        )}

        {/* Quick conversion grid */}
        {!showFromPicker && !showToPicker && rates && (
          <AnimatedCard delay={200}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              📊 Quick Rates ({fromCurrency})
            </Text>
            <View style={styles.ratesGrid}>
              {['EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'CHF', 'THB']
                .filter((c) => c !== fromCurrency && rates.rates[c])
                .slice(0, 6)
                .map((code, i) => (
                  <View
                    key={code}
                    style={[
                      styles.rateCard,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Text style={[styles.rateCardCode, { color: theme.textPrimary }]}>
                      {code}
                    </Text>
                    <Text style={[styles.rateCardValue, { color: theme.primary }]}>
                      {getCurrencySymbol(code)} {(rates.rates[code] * parsedAmount).toFixed(2)}
                    </Text>
                    <Text style={[styles.rateCardRate, { color: theme.textTertiary }]}>
                      1 = {rates.rates[code].toFixed(2)}
                    </Text>
                  </View>
                ))}
            </View>
          </AnimatedCard>
        )}

        {error && (
          <View style={[styles.errorBox, { backgroundColor: theme.errorLight }]}>
            <Ionicons name="alert-circle" size={16} color={theme.error} />
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { flex: 1 },
  headerTitle: { ...typography.h3 },
  headerSub: { ...typography.bodySmall, marginTop: 1 },
  scrollContent: { padding: spacing.xl },
  converterCard: {
    borderRadius: radii.xl,
    padding: spacing.xl,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: spacing.sm + 4,
    borderRadius: radii.md,
  },
  currencyCode: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
  },
  amountInput: {
    flex: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontFamily: 'outfit-bold',
    fontSize: 22,
    borderWidth: 1,
    textAlign: 'right',
  },
  swapContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  swapBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  resultBox: {
    flex: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md + 2,
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: 'flex-end',
  },
  resultText: {
    fontFamily: 'outfit-bold',
    fontSize: 22,
  },
  rateInfo: {
    ...typography.bodySmall,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  pickerCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  pickerTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.md,
    borderRadius: radii.sm,
  },
  pickerSymbol: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    width: 32,
    textAlign: 'center',
  },
  pickerInfo: { flex: 1 },
  pickerCode: { ...typography.subtitle, fontFamily: 'outfit-bold' },
  pickerName: { ...typography.bodySmall },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  ratesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  rateCard: {
    width: '47%',
    borderRadius: radii.lg,
    padding: spacing.md + 2,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
  },
  rateCardCode: { ...typography.subtitle, fontFamily: 'outfit-bold' },
  rateCardValue: { fontFamily: 'outfit-bold', fontSize: 16 },
  rateCardRate: { ...typography.caption },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.lg,
  },
  errorText: { ...typography.bodySmall, flex: 1 },
});
