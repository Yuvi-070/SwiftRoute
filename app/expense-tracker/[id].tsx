import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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
  loadExpenseData,
  saveExpenseData,
  type Expense,
  type ExpenseData,
} from '../../services/storageService';
import AnimatedCard from '../../components/ui/AnimatedCard';
import AnimatedCounter from '../../components/ui/AnimatedCounter';

const EXPENSE_CATEGORIES = [
  'Food & Drink',
  'Transport',
  'Accommodation',
  'Activities',
  'Shopping',
  'Health',
  'Other',
];

const CATEGORY_ICONS: Record<string, string> = {
  'Food & Drink': 'restaurant-outline',
  'Transport': 'car-outline',
  'Accommodation': 'bed-outline',
  'Activities': 'ticket-outline',
  'Shopping': 'bag-handle-outline',
  'Health': 'medkit-outline',
  'Other': 'ellipsis-horizontal-outline',
};

export default function ExpenseTrackerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const { theme, isDark } = useTheme();

  const [data, setData] = useState<ExpenseData>({ totalBudget: 0, expenses: [] });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [budgetInput, setBudgetInput] = useState('');

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const loadData = useCallback(async () => {
    if (!id) return;
    const stored = await loadExpenseData(id);
    if (stored) setData(stored);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const persist = async (updated: ExpenseData) => {
    setData(updated);
    if (id) await saveExpenseData(id, updated);
  };

  const totalSpent = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = data.totalBudget - totalSpent;

  const handleSetBudget = async () => {
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val < 0) {
      Alert.alert('Invalid budget', 'Please enter a valid positive number.');
      return;
    }
    await persist({ ...data, totalBudget: val });
    setBudgetInput('');
    setShowBudgetForm(false);
  };

  const handleAddExpense = async () => {
    const amount = parseFloat(newAmount);
    if (!newLabel.trim()) {
      Alert.alert('Missing label', 'Please enter a description for this expense.');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid positive amount.');
      return;
    }
    const expense: Expense = {
      id: `exp_${Date.now()}`,
      label: newLabel.trim(),
      amount,
      category: newCategory,
      date: new Date().toISOString(),
    };
    const updated: ExpenseData = {
      ...data,
      expenses: [expense, ...data.expenses],
    };
    await persist(updated);
    setNewLabel('');
    setNewAmount('');
    setNewCategory(EXPENSE_CATEGORIES[0]);
    setShowAddForm(false);
  };

  const handleDeleteExpense = (expenseId: string) => {
    Alert.alert('Delete expense', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated: ExpenseData = {
            ...data,
            expenses: data.expenses.filter((e) => e.id !== expenseId),
          };
          await persist(updated);
        },
      },
    ]);
  };

  const spentPercent =
    data.totalBudget > 0 ? Math.min((totalSpent / data.totalBudget) * 100, 100) : 0;
  const progressColor =
    spentPercent > 90 ? theme.error : spentPercent > 70 ? theme.secondary : theme.success;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.hero, { backgroundColor: theme.primary }]}>
        <View
          style={[StyleSheet.absoluteFillObject, { backgroundColor: theme.accent, opacity: 0.35 }]}
        />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>💰 Expense Tracker</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Budget card */}
        <AnimatedCard delay={0}>
          <View
            style={[
              styles.budgetCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                ...Platform.select({
                  ios: { shadowColor: theme.shadowColor, shadowOffset: { width: 0, height: 3 }, shadowOpacity: theme.shadowOpacity, shadowRadius: 10 },
                  android: { elevation: 2 },
                }),
              },
            ]}
          >
            <View style={styles.budgetRow}>
              <View>
                <Text style={[styles.budgetLabel, { color: theme.textSecondary }]}>Total Budget</Text>
                <Text style={[styles.budgetValue, { color: theme.textPrimary }]}>
                  {data.totalBudget > 0 ? `$${data.totalBudget.toFixed(2)}` : 'Not set'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.editBudgetBtn, { backgroundColor: theme.primaryMuted }]}
                onPress={() => {
                  setBudgetInput(data.totalBudget > 0 ? String(data.totalBudget) : '');
                  setShowBudgetForm(true);
                }}
              >
                <Ionicons name="pencil-outline" size={16} color={theme.primary} />
                <Text style={[styles.editBudgetText, { color: theme.primary }]}>Set Budget</Text>
              </TouchableOpacity>
            </View>

            {data.totalBudget > 0 && (
              <>
                <View style={[styles.progressBg, { backgroundColor: theme.divider }]}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${spentPercent}%`, backgroundColor: progressColor },
                    ]}
                  />
                </View>
                <View style={styles.budgetStatsRow}>
                  <View style={styles.budgetStat}>
                    <Text style={[styles.budgetStatLabel, { color: theme.textTertiary }]}>Spent</Text>
                    <Text style={[styles.budgetStatValue, { color: theme.error }]}>
                      ${totalSpent.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.budgetStatDivider, { backgroundColor: theme.divider }]} />
                  <View style={styles.budgetStat}>
                    <Text style={[styles.budgetStatLabel, { color: theme.textTertiary }]}>Remaining</Text>
                    <Text
                      style={[
                        styles.budgetStatValue,
                        { color: remaining >= 0 ? theme.success : theme.error },
                      ]}
                    >
                      {remaining >= 0 ? '$' : '-$'}
                      {Math.abs(remaining).toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.budgetStatDivider, { backgroundColor: theme.divider }]} />
                  <View style={styles.budgetStat}>
                    <Text style={[styles.budgetStatLabel, { color: theme.textTertiary }]}>Used</Text>
                    <Text style={[styles.budgetStatValue, { color: progressColor }]}>
                      {Math.round(spentPercent)}%
                    </Text>
                  </View>
                </View>
              </>
            )}
          </View>
        </AnimatedCard>

        {/* Budget form */}
        {showBudgetForm && (
          <AnimatedCard delay={0}>
            <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.formTitle, { color: theme.textPrimary }]}>Set Total Budget</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Enter total budget (e.g. 1500)"
                placeholderTextColor={theme.textTertiary}
                keyboardType="numeric"
                value={budgetInput}
                onChangeText={setBudgetInput}
              />
              <View style={styles.formBtns}>
                <TouchableOpacity
                  style={[styles.formBtn, { backgroundColor: theme.surfacePressed }]}
                  onPress={() => setShowBudgetForm(false)}
                >
                  <Text style={[styles.formBtnSecondaryText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formBtn, { backgroundColor: theme.primary }]}
                  onPress={handleSetBudget}
                >
                  <Text style={styles.formBtnText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* Add expense form */}
        {showAddForm && (
          <AnimatedCard delay={0}>
            <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Text style={[styles.formTitle, { color: theme.textPrimary }]}>Add Expense</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Description (e.g. Dinner)"
                placeholderTextColor={theme.textTertiary}
                value={newLabel}
                onChangeText={setNewLabel}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.surfaceElevated, color: theme.textPrimary, borderColor: theme.border }]}
                placeholder="Amount (e.g. 25.50)"
                placeholderTextColor={theme.textTertiary}
                keyboardType="numeric"
                value={newAmount}
                onChangeText={setNewAmount}
              />
              <Text style={[styles.formFieldLabel, { color: theme.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      {
                        borderColor: theme.border,
                        backgroundColor: newCategory === cat ? theme.primary : theme.surface,
                      },
                    ]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Ionicons
                      name={CATEGORY_ICONS[cat] as never}
                      size={14}
                      color={newCategory === cat ? '#FFF' : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        { color: newCategory === cat ? '#FFF' : theme.textSecondary },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.formBtns}>
                <TouchableOpacity
                  style={[styles.formBtn, { backgroundColor: theme.surfacePressed }]}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={[styles.formBtnSecondaryText, { color: theme.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formBtn, { backgroundColor: theme.primary }]}
                  onPress={handleAddExpense}
                >
                  <Text style={styles.formBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* Expenses list */}
        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Expenses ({data.expenses.length})
          </Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: theme.primary }]}
            onPress={() => { setShowAddForm(true); setShowBudgetForm(false); }}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {data.expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={theme.textTertiary} />
            <Text style={[styles.emptyStateText, { color: theme.textPrimary }]}>No expenses yet.</Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
              Tap {'"'}Add{'"'} to log your first expense.
            </Text>
          </View>
        ) : (
          data.expenses.map((expense, i) => (
            <AnimatedCard key={expense.id} delay={i * 50}>
              <View
                style={[
                  styles.expenseRow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={[styles.expenseIcon, { backgroundColor: theme.primaryMuted }]}>
                  <Ionicons
                    name={(CATEGORY_ICONS[expense.category] ?? 'ellipsis-horizontal-outline') as never}
                    size={20}
                    color={theme.primary}
                  />
                </View>
                <View style={styles.expenseBody}>
                  <Text style={[styles.expenseLabel, { color: theme.textPrimary }]}>{expense.label}</Text>
                  <Text style={[styles.expenseCategory, { color: theme.textTertiary }]}>{expense.category}</Text>
                </View>
                <Text style={[styles.expenseAmount, { color: theme.textPrimary }]}>
                  ${expense.amount.toFixed(2)}
                </Text>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteExpense(expense.id)}>
                  <Ionicons name="trash-outline" size={18} color={theme.error} />
                </TouchableOpacity>
              </View>
            </AnimatedCard>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    paddingTop: 56,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing['2xl'],
    overflow: 'hidden',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontFamily: 'outfit-bold', fontSize: 26, color: '#FFF',
  },
  scrollContent: { padding: spacing.xl },
  budgetCard: {
    borderRadius: radii.lg, padding: spacing.lg + 2,
    marginBottom: spacing.lg, borderWidth: 1,
  },
  budgetRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: spacing.md,
  },
  budgetLabel: { ...typography.bodySmall, marginBottom: 2 },
  budgetValue: { ...typography.h1 },
  editBudgetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radii.sm + 2,
  },
  editBudgetText: { fontFamily: 'outfit-medium', fontSize: 13 },
  progressBg: {
    height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.md,
  },
  progressFill: { height: 8, borderRadius: 4 },
  budgetStatsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  budgetStat: { alignItems: 'center', flex: 1 },
  budgetStatLabel: { ...typography.caption, marginBottom: 2 },
  budgetStatValue: { fontFamily: 'outfit-bold', fontSize: 16 },
  budgetStatDivider: { width: 1, alignSelf: 'stretch' },
  formCard: {
    borderRadius: radii.lg, padding: spacing.lg + 2,
    marginBottom: spacing.lg, borderWidth: 1,
  },
  formTitle: { ...typography.subtitle, fontFamily: 'outfit-bold', marginBottom: spacing.md },
  formFieldLabel: { ...typography.bodySmall, fontFamily: 'outfit-medium', marginBottom: spacing.sm, marginTop: 4 },
  input: {
    borderWidth: 1, borderRadius: radii.sm + 2,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2,
    ...typography.body, marginBottom: spacing.md,
  },
  categoryScroll: { marginBottom: spacing.md },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderRadius: radii.full,
    paddingHorizontal: spacing.md, paddingVertical: 6, marginRight: spacing.sm,
  },
  categoryChipText: { fontFamily: 'outfit', fontSize: 13 },
  formBtns: { flexDirection: 'row', gap: spacing.sm + 2 },
  formBtn: {
    flex: 1, paddingVertical: spacing.md, borderRadius: radii.sm + 2, alignItems: 'center',
  },
  formBtnText: { ...typography.buttonSmall, color: '#FFF' },
  formBtnSecondaryText: { ...typography.buttonSmall },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h3 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: radii.sm + 2,
  },
  addBtnText: { ...typography.buttonSmall, color: '#FFF', fontSize: 13 },
  emptyState: { alignItems: 'center', paddingVertical: spacing['5xl'], gap: spacing.sm },
  emptyStateText: { ...typography.subtitle, fontFamily: 'outfit-bold' },
  emptyStateSubtext: { ...typography.body, textAlign: 'center' },
  expenseRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radii.md + 2, padding: spacing.md,
    marginBottom: spacing.sm + 2, borderWidth: 1, gap: spacing.md,
  },
  expenseIcon: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  expenseBody: { flex: 1, gap: 2 },
  expenseLabel: { ...typography.label },
  expenseCategory: { ...typography.caption },
  expenseAmount: { fontFamily: 'outfit-bold', fontSize: 15 },
  deleteBtn: { padding: 4 },
});
