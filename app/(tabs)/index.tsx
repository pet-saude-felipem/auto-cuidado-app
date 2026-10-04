import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Card } from '@/components';
import { AppText as Text, SYSTEM_FONT } from '@/components/app-text';
import { BorderRadius, Fonts, Spacing } from '@/constants/theme';
import { WeightChartData, WeightRecord, WeightSummary } from '@/src/models/weight';
import { weightService } from '@/src/services';
import { useTheme } from '@/src/context/ThemeContext';
import { parseLocalDate, toLocalDateISO } from '@/src/utils/date';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

function TrendBadge({ trend }: { trend: string }) {
  const { theme } = useTheme();
  const labels: Record<string, string> = {
    loss: 'Perda',
    gain: 'Ganho',
    stable: 'Estável',
  };
  const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
    loss: 'arrow-down',
    gain: 'arrow-up',
    stable: 'remove',
  };

  return (
    <View style={[styles.trendBadge, { backgroundColor: theme.textOnPrimary + '18' }]}>
      <Ionicons name={icons[trend] ?? 'remove'} size={14} color={theme.textOnPrimary} />
      <Text style={[styles.trendBadgeText, { color: theme.textOnPrimary }]}>{labels[trend] ?? 'Estável'}</Text>
    </View>
  );
}

function WeightSummaryCard({ summary }: { summary: WeightSummary }) {
  const { theme } = useTheme();
  const difference = `${summary.difference > 0 ? '+' : ''}${summary.difference} kg`;

  return (
    <View style={[styles.summaryCard, { backgroundColor: theme.primary }]}>
      <View style={styles.summaryTopRow}>
        <View style={styles.summaryTextBlock}>
          <Text style={[styles.summaryEyebrow, { color: theme.textOnPrimary }]}>SEU ACOMPANHAMENTO</Text>
          <Text style={[styles.summaryTitle, { color: theme.textOnPrimary }]}>Peso atual</Text>
        </View>
        <View style={styles.scaleIcon}>
          <Ionicons name="scale-outline" size={23} color={theme.textOnPrimary} />
        </View>
      </View>

      <View style={styles.currentWeightRow}>
        <Text style={[styles.currentWeight, { color: theme.textOnPrimary }]}>{summary.current}</Text>
        <Text style={[styles.weightUnit, { color: theme.textOnPrimary }]}>kg</Text>
      </View>

      <View style={[styles.summaryFooter, { borderTopColor: theme.textOnPrimary + '30' }]}>
        <View style={styles.variationBlock}>
          <Text style={[styles.variationLabel, { color: theme.textOnPrimary }]}>Variação recente</Text>
          <Text style={[styles.variationValue, { color: theme.textOnPrimary }]}>{difference}</Text>
        </View>
        <TrendBadge trend={summary.trend} />
      </View>
      <Text style={[styles.comparisonHint, { color: theme.textOnPrimary }]}>Comparado ao registro anterior</Text>
    </View>
  );
}

function MiniChart({ data }: { data: WeightChartData[] }) {
  const { theme, textScale } = useTheme();
  if (data.length === 0) return null;

  const values = data.map((item) => item.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.chartBars, { width: Math.max(data.length * 72 * textScale, 240), height: 124 * textScale }]}>
        {data.map((item, index) => (
          <View key={`${item.label}-${index}`} style={[styles.chartColumn, { minWidth: 56 * textScale }]}>
            <Text style={[styles.chartValue, { color: theme.textSecondary }]}>
              {item.value}
            </Text>
            <View
              style={[
                styles.chartBar,
                {
                  height: ((item.value - min) / range) * 60 + 20,
                  backgroundColor: theme.primary,
                },
              ]}
            />
            <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default function WeightScreen() {
  const { theme, currentTheme, fontPreference, textScale, weightReminder } = useTheme();
  const isEsus = currentTheme === 'secondary';

  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [chartData, setChartData] = useState<WeightChartData[]>([]);
  const [summary, setSummary] = useState<WeightSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [allRecords, chart, summaryData, reminder] = await Promise.all([
        weightService.getAllRecords(),
        weightService.getChartData(),
        weightService.getSummary(),
        weightService.checkMonthlyReminder(),
      ]);

      setRecords(allRecords);
      setChartData(chart);
      setSummary(summaryData);

      if (reminder.shouldRemind) {
        setReminderMsg(
          `Faz ${reminder.lastDays} dias que você não registra seu peso. Vamos atualizar?`,
        );
      } else {
        setReminderMsg(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dados';
      setError(message);
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));

  const handleSave = async () => {
    if (!value.trim()) {
      setError('Informe um peso válido');
      return;
    }

    const weightValue = parseFloat(value.replace(',', '.'));
    if (isNaN(weightValue) || weightValue <= 0) {
      setError('Peso deve ser um número maior que zero');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const today = toLocalDateISO();
      await weightService.addRecord(weightValue, today, notes || undefined);
      await loadData();

      setValue('');
      setNotes('');
      setModalVisible(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar';
      setError(message);
      console.error('Erro ao salvar:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading && records.length === 0) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primaryDark} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Carregando seu acompanhamento...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadData}
        ListHeaderComponent={
          <>
            <View style={styles.topActions}>
              <View style={styles.intro}>
                <Text style={[styles.introTitle, { color: theme.text }]}>Acompanhe sua evolução</Text>
                <Text style={[styles.introSubtitle, { color: theme.textSecondary }]}>Seus registros de peso em um só lugar.</Text>
              </View>
            </View>

            {error && (
              <View style={[styles.errorBanner, { backgroundColor: theme.error + '18' }]}>
                <Ionicons name="alert-circle-outline" size={18} color={theme.error} />
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}

            {weightReminder && reminderMsg && (
              <Pressable
                style={[
                  styles.reminderBanner,
                  { backgroundColor: isEsus ? '#FDEEE7' : theme.tagBackground },
                ]}
                onPress={() => {
                  setReminderMsg(null);
                  setModalVisible(true);
                }}
                accessibilityRole="button"
              >
                <View style={styles.reminderIcon}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={isEsus ? theme.secondary : theme.primaryDark}
                  />
                </View>
                <View style={styles.reminderContent}>
                  <Text style={[styles.reminderTitle, { color: theme.text }]}>Hora de atualizar</Text>
                  <Text style={[styles.reminderText, { color: theme.textSecondary }]}>{reminderMsg}</Text>
                  <Text style={[styles.reminderAction, { color: isEsus ? theme.secondary : theme.primaryDark }]}>
                    Registrar agora
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isEsus ? theme.secondary : theme.primaryDark}
                />
              </Pressable>
            )}

            {summary ? (
              <WeightSummaryCard summary={summary} />
            ) : (
              <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.emptyIcon, { backgroundColor: theme.tagBackground }]}>
                  <Ionicons name="scale-outline" size={28} color={theme.primaryDark} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Comece seu acompanhamento</Text>
                <Text style={[styles.emptyDescription, { color: theme.textSecondary }]}>Registre seu primeiro peso para visualizar sua evolução por aqui.</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.registerButton, { backgroundColor: isEsus ? theme.secondary : theme.primary }]}
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Registrar peso"
            >
              <Ionicons name="add" size={21} color={theme.textOnPrimary} />
              <Text style={[styles.registerButtonText, { color: theme.textOnPrimary }]}>Registrar peso</Text>
            </TouchableOpacity>

            {chartData.length > 0 && (
              <Card style={styles.chartCard}>
                <View style={styles.cardHeading}>
                  <View style={styles.headingText}>
                    <Text style={[styles.cardTitle, { color: theme.text }]}>Sua evolução</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Acompanhe os registros ao longo do tempo</Text>
                  </View>
                  <Ionicons name="stats-chart-outline" size={21} color={theme.primaryDark} />
                </View>
                <MiniChart data={chartData} />
              </Card>
            )}

            <View style={styles.historyHeading}>
              <View style={styles.headingText}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Histórico de pesagem</Text>
                <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Do registro mais recente ao mais antigo</Text>
              </View>
              {records.length > 0 && (
                <View style={[styles.countBadge, { backgroundColor: theme.tagBackground }]}>
                  <Text style={[styles.countText, { color: theme.primaryDark }]}>{records.length}</Text>
                </View>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.recordCard}>
            <View style={styles.recordRow}>
              <View style={[styles.recordIcon, { backgroundColor: theme.tagBackground }]}>
                <Ionicons name="scale-outline" size={20} color={theme.primaryDark} />
              </View>
              <View style={styles.recordInfo}>
                <Text style={[styles.recordWeight, { color: theme.text }]}>{item.value} kg</Text>
                <Text style={[styles.recordDate, { color: theme.textSecondary }]}>
                  {parseLocalDate(item.date).toLocaleDateString('pt-BR')}
                </Text>
                {item.notes ? (
                  <Text style={[styles.recordNotes, { color: theme.textSecondary }]}>
                    {item.notes}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
        )}
        ItemSeparatorComponent={() => <View style={styles.recordSeparator} />}
        ListEmptyComponent={
          !loading ? (
            <Text style={[styles.emptyListText, { color: theme.textSecondary }]}>Nenhum registro por enquanto.</Text>
          ) : null
        }
      />

      {modalVisible && (
        <Modal visible={modalVisible} transparent animationType="slide">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <Pressable
              style={styles.modalBackdrop}
              onPress={() => !saving && setModalVisible(false)}
            />
            <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
              <ScrollView contentContainerStyle={styles.modalInner} keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>Novo registro</Text>
                <Pressable
                  onPress={() => !saving && setModalVisible(false)}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Fechar"
                >
                  <Ionicons name="close" size={22} color={theme.textSecondary} />
                </Pressable>
              </View>

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Peso (kg)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, fontFamily: fontPreference === 'system' ? SYSTEM_FONT : Fonts.family.regular, fontSize: Fonts.size.md * textScale }]}
                placeholder="Ex.: 80,5"
                placeholderTextColor={theme.textLight}
                keyboardType="decimal-pad"
                value={value}
                onChangeText={setValue}
                editable={!saving}
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Anotação (opcional)</Text>
              <TextInput
                style={[styles.input, styles.notesInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, fontFamily: fontPreference === 'system' ? SYSTEM_FONT : Fonts.family.regular, fontSize: Fonts.size.md * textScale }]}
                placeholder="Adicione uma observação"
                placeholderTextColor={theme.textLight}
                multiline
                value={notes}
                onChangeText={setNotes}
                editable={!saving}
              />

              {error && <Text style={[styles.formError, { color: theme.error }]}>{error}</Text>}

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.btn, styles.btnCancel, { backgroundColor: theme.background, borderColor: theme.border }]}
                  onPress={() => setModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={[styles.buttonLabel, { color: theme.text }]}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, { backgroundColor: isEsus ? theme.secondary : theme.primary }, saving && styles.btnDisabled]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color={theme.textOnPrimary} />
                  ) : (
                    <Text style={[styles.buttonLabel, styles.saveLabel, { color: theme.textOnPrimary }]}>Salvar</Text>
                  )}
                </Pressable>
              </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { padding: Spacing.md, paddingBottom: Spacing.xl },
  topActions: {
    alignItems: 'stretch',
    marginBottom: Spacing.lg,
  },
  intro: { minWidth: 0, paddingTop: Spacing.xs, marginBottom: Spacing.sm },
  introTitle: { fontSize: Fonts.size.lg, fontFamily: Fonts.family.bold, lineHeight: 26 },
  introSubtitle: { fontSize: Fonts.size.sm, fontFamily: Fonts.family.regular, lineHeight: 21, marginTop: 3 },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#123A39',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
  summaryTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryTextBlock: { flex: 1 },
  summaryEyebrow: { color: '#FFFFFFB8', fontSize: 10, letterSpacing: 1.1, fontFamily: Fonts.family.bold },
  summaryTitle: { color: '#FFFFFF', fontSize: Fonts.size.md, fontFamily: Fonts.family.bold, marginTop: 4 },
  scaleIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentWeightRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', marginTop: Spacing.sm },
  currentWeight: { color: '#FFFFFF', fontSize: 38, lineHeight: 46, fontFamily: Fonts.family.bold },
  weightUnit: { color: '#FFFFFFE0', fontSize: Fonts.size.md, fontFamily: Fonts.family.bold, marginLeft: 7 },
  summaryFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF30',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
  },
  variationBlock: { flex: 1, minWidth: 0 },
  variationLabel: { color: '#FFFFFFC7', fontSize: Fonts.size.xs, fontFamily: Fonts.family.regular },
  variationValue: { color: '#FFFFFF', fontSize: Fonts.size.md, fontFamily: Fonts.family.bold, marginTop: 3 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 5,
    backgroundColor: '#FFFFFF24',
    borderRadius: BorderRadius.md,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  trendBadgeText: { color: '#FFFFFF', fontFamily: Fonts.family.bold, fontSize: Fonts.size.xs },
  comparisonHint: { color: '#FFFFFFA8', fontSize: 10, fontFamily: Fonts.family.regular, marginTop: Spacing.sm },
  emptyCard: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  emptyTitle: { fontSize: Fonts.size.md, fontFamily: Fonts.family.bold, textAlign: 'center' },
  emptyDescription: { fontSize: Fonts.size.sm, fontFamily: Fonts.family.regular, lineHeight: 21, textAlign: 'center', marginTop: Spacing.xs },
  chartCard: { marginBottom: Spacing.md, padding: Spacing.md, overflow: 'hidden' },
  cardHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  headingText: { flex: 1, minWidth: 0 },
  cardTitle: { fontSize: Fonts.size.md, fontFamily: Fonts.family.bold },
  cardSubtitle: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.regular, lineHeight: 18, marginTop: 3 },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', marginTop: Spacing.md },
  chartColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBar: { width: 16, minHeight: 8, maxHeight: 72, borderRadius: 6, marginTop: 5 },
  chartValue: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.regular },
  chartLabel: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.regular, marginTop: 5 },
  historyHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.xs, marginBottom: Spacing.sm },
  sectionTitle: { fontSize: Fonts.size.md, fontFamily: Fonts.family.bold },
  countBadge: { minWidth: 28, height: 28, borderRadius: 14, paddingHorizontal: 7, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: Spacing.sm },
  countText: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.bold },
  recordCard: { padding: Spacing.md },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  recordIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  recordInfo: { flex: 1, minWidth: 0 },
  recordWeight: { fontSize: Fonts.size.md, fontFamily: Fonts.family.bold },
  recordDate: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.regular, marginTop: 2 },
  recordNotes: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.regular, lineHeight: 17, marginTop: 5 },
  recordSeparator: { height: Spacing.sm },
  emptyListText: { textAlign: 'center', fontSize: Fonts.size.sm, fontFamily: Fonts.family.regular, paddingVertical: Spacing.md },
  registerButton: {
    alignSelf: 'stretch',
    minHeight: 52,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginBottom: Spacing.md,
    elevation: 5,
    shadowColor: '#123A39',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
  },
  registerButtonText: { color: '#FFFFFF', fontSize: Fonts.size.sm, fontFamily: Fonts.family.bold },
  loadingScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  loadingText: { marginTop: Spacing.sm, fontSize: Fonts.size.sm, fontFamily: Fonts.family.regular },
  errorBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, padding: Spacing.sm, borderRadius: BorderRadius.sm, marginBottom: Spacing.md },
  errorText: { flex: 1, fontSize: Fonts.size.xs, fontFamily: Fonts.family.bold },
  reminderBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md },
  reminderIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  reminderContent: { flex: 1 },
  reminderTitle: { fontSize: Fonts.size.sm, fontFamily: Fonts.family.bold },
  reminderText: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.regular, lineHeight: 18, marginTop: 3 },
  reminderAction: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.bold, marginTop: 6 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.48)', justifyContent: 'center', padding: Spacing.md },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalContent: { width: '100%', maxWidth: 480, maxHeight: '88%', alignSelf: 'center', borderRadius: BorderRadius.lg, elevation: 8 },
  modalInner: { padding: Spacing.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md },
  modalTitle: { fontSize: Fonts.size.lg, fontFamily: Fonts.family.bold },
  closeButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19 },
  inputLabel: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.bold, marginBottom: 6, marginTop: Spacing.xs },
  input: { minHeight: 48, borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginBottom: Spacing.sm, fontSize: Fonts.size.sm, fontFamily: Fonts.family.regular },
  notesInput: { minHeight: 84, textAlignVertical: 'top' },
  formError: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.regular, marginBottom: Spacing.xs },
  modalButtons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  btn: { flex: 1, minHeight: 48, paddingHorizontal: Spacing.sm, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center' },
  btnCancel: { borderWidth: 1 },
  buttonLabel: { fontSize: Fonts.size.sm, fontFamily: Fonts.family.bold },
  saveLabel: { color: '#FFFFFF' },
  btnDisabled: { opacity: 0.65 },
});
