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
import { Colors } from '../../constants/theme';
import {
  loadExpenseData,
  saveExpenseData,
  type Expense,
  type ExpenseData,
} from '../../services/storageService';

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExpenseTrackerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  const [data, setData] = useState<ExpenseData>({ totalBudget: 0, expenses: [] });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  // Add-expense form state
  const [newLabel, setNewLabel] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState(EXPENSE_CATEGORIES[0]);

  // Budget form state
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
    Alert.alert('Delete expense', 'Are you sure you want to remove this expense?', [
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
    spentPercent > 90 ? Colors.ERROR : spentPercent > 70 ? Colors.SECONDARY : Colors.SUCCESS;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.hero}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.heroTitle}>💰 Expense Tracker</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Budget overview card */}
        <View style={styles.budgetCard}>
          <View style={styles.budgetRow}>
            <View>
              <Text style={styles.budgetLabel}>Total Budget</Text>
              <Text style={styles.budgetValue}>
                {data.totalBudget > 0 ? `$${data.totalBudget.toFixed(2)}` : 'Not set'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editBudgetBtn}
              onPress={() => {
                setBudgetInput(data.totalBudget > 0 ? String(data.totalBudget) : '');
                setShowBudgetForm(true);
              }}
            >
              <Ionicons name="pencil-outline" size={16} color={Colors.PRIMARY} />
              <Text style={styles.editBudgetText}>Set Budget</Text>
            </TouchableOpacity>
          </View>

          {data.totalBudget > 0 && (
            <>
              <View style={styles.progressBg}>
                <View
                  style={[styles.progressFill, { width: `${spentPercent}%`, backgroundColor: progressColor }]}
                />
              </View>

              <View style={styles.budgetStatsRow}>
                <View style={styles.budgetStat}>
                  <Text style={styles.budgetStatLabel}>Spent</Text>
                  <Text style={[styles.budgetStatValue, { color: Colors.ERROR }]}>
                    ${totalSpent.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.budgetStatDivider} />
                <View style={styles.budgetStat}>
                  <Text style={styles.budgetStatLabel}>Remaining</Text>
                  <Text
                    style={[
                      styles.budgetStatValue,
                      { color: remaining >= 0 ? Colors.SUCCESS : Colors.ERROR },
                    ]}
                  >
                    {remaining >= 0 ? '$' : '-$'}
                    {Math.abs(remaining).toFixed(2)}
                  </Text>
                </View>
                <View style={styles.budgetStatDivider} />
                <View style={styles.budgetStat}>
                  <Text style={styles.budgetStatLabel}>Used</Text>
                  <Text style={[styles.budgetStatValue, { color: progressColor }]}>
                    {Math.round(spentPercent)}%
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Set budget form */}
        {showBudgetForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Set Total Budget</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter total budget (e.g. 1500)"
              placeholderTextColor={Colors.GRAY}
              keyboardType="numeric"
              value={budgetInput}
              onChangeText={setBudgetInput}
            />
            <View style={styles.formBtns}>
              <TouchableOpacity
                style={[styles.formBtn, styles.formBtnSecondary]}
                onPress={() => setShowBudgetForm(false)}
              >
                <Text style={styles.formBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.formBtn, styles.formBtnPrimary]} onPress={handleSetBudget}>
                <Text style={styles.formBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Add expense form */}
        {showAddForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add Expense</Text>
            <TextInput
              style={styles.input}
              placeholder="Description (e.g. Dinner at local restaurant)"
              placeholderTextColor={Colors.GRAY}
              value={newLabel}
              onChangeText={setNewLabel}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount (e.g. 25.50)"
              placeholderTextColor={Colors.GRAY}
              keyboardType="numeric"
              value={newAmount}
              onChangeText={setNewAmount}
            />
            <Text style={styles.formFieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {EXPENSE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, newCategory === cat && styles.categoryChipActive]}
                  onPress={() => setNewCategory(cat)}
                >
                  <Ionicons
                    name={CATEGORY_ICONS[cat] as never}
                    size={14}
                    color={newCategory === cat ? Colors.WHITE : Colors.GRAY}
                  />
                  <Text
                    style={[styles.categoryChipText, newCategory === cat && styles.categoryChipTextActive]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.formBtns}>
              <TouchableOpacity
                style={[styles.formBtn, styles.formBtnSecondary]}
                onPress={() => setShowAddForm(false)}
              >
                <Text style={styles.formBtnSecondaryText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.formBtn, styles.formBtnPrimary]} onPress={handleAddExpense}>
                <Text style={styles.formBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Expenses list */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Expenses ({data.expenses.length})</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setShowAddForm(true);
              setShowBudgetForm(false);
            }}
          >
            <Ionicons name="add" size={20} color={Colors.WHITE} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {data.expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Colors.GRAY} />
            <Text style={styles.emptyStateText}>No expenses yet.</Text>
            <Text style={styles.emptyStateSubtext}>Tap &quot;Add&quot; to log your first expense.</Text>
          </View>
        ) : (
          data.expenses.map((expense) => (
            <View key={expense.id} style={styles.expenseRow}>
              <View style={styles.expenseIcon}>
                <Ionicons
                  name={CATEGORY_ICONS[expense.category] as never ?? 'ellipsis-horizontal-outline'}
                  size={20}
                  color={Colors.PRIMARY}
                />
              </View>
              <View style={styles.expenseBody}>
                <Text style={styles.expenseLabel}>{expense.label}</Text>
                <Text style={styles.expenseCategory}>{expense.category}</Text>
              </View>
              <Text style={styles.expenseAmount}>${expense.amount.toFixed(2)}</Text>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDeleteExpense(expense.id)}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.ERROR} />
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND,
  },
  hero: {
    backgroundColor: Colors.PRIMARY,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 26,
    color: Colors.WHITE,
  },
  scrollContent: {
    padding: 20,
  },
  budgetCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  budgetLabel: {
    fontFamily: 'outfit',
    fontSize: 13,
    color: Colors.GRAY,
    marginBottom: 2,
  },
  budgetValue: {
    fontFamily: 'outfit-bold',
    fontSize: 26,
    color: Colors.DARK,
  },
  editBudgetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.PRIMARY + '15',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  editBudgetText: {
    fontFamily: 'outfit-medium',
    fontSize: 13,
    color: Colors.PRIMARY,
  },
  progressBg: {
    height: 8,
    backgroundColor: Colors.LIGHT_GRAY,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  budgetStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  budgetStat: {
    alignItems: 'center',
    flex: 1,
  },
  budgetStatLabel: {
    fontFamily: 'outfit',
    fontSize: 12,
    color: Colors.GRAY,
    marginBottom: 2,
  },
  budgetStatValue: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
  },
  budgetStatDivider: {
    width: 1,
    backgroundColor: Colors.LIGHT_GRAY,
    alignSelf: 'stretch',
  },
  formCard: {
    backgroundColor: Colors.WHITE,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  formTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
    color: Colors.DARK,
    marginBottom: 12,
  },
  formFieldLabel: {
    fontFamily: 'outfit-medium',
    fontSize: 13,
    color: Colors.GRAY,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'outfit',
    fontSize: 14,
    color: Colors.DARK,
    backgroundColor: Colors.BACKGROUND,
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 14,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: Colors.WHITE,
  },
  categoryChipActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  categoryChipText: {
    fontFamily: 'outfit',
    fontSize: 13,
    color: Colors.GRAY,
  },
  categoryChipTextActive: {
    color: Colors.WHITE,
  },
  formBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  formBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  formBtnPrimary: {
    backgroundColor: Colors.PRIMARY,
  },
  formBtnSecondary: {
    backgroundColor: Colors.LIGHT_GRAY,
  },
  formBtnText: {
    fontFamily: 'outfit-bold',
    fontSize: 14,
    color: Colors.WHITE,
  },
  formBtnSecondaryText: {
    fontFamily: 'outfit-bold',
    fontSize: 14,
    color: Colors.GRAY,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    color: Colors.DARK,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: {
    fontFamily: 'outfit-bold',
    fontSize: 13,
    color: Colors.WHITE,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyStateText: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
    color: Colors.DARK,
  },
  emptyStateSubtext: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: Colors.GRAY,
    textAlign: 'center',
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    gap: 12,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  expenseBody: {
    flex: 1,
    gap: 2,
  },
  expenseLabel: {
    fontFamily: 'outfit-medium',
    fontSize: 14,
    color: Colors.DARK,
  },
  expenseCategory: {
    fontFamily: 'outfit',
    fontSize: 12,
    color: Colors.GRAY,
  },
  expenseAmount: {
    fontFamily: 'outfit-bold',
    fontSize: 15,
    color: Colors.DARK,
  },
  deleteBtn: {
    padding: 4,
  },
});
