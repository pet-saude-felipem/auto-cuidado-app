import { Card, ThemeToggleButton } from '@/components';
import { Fonts, Spacing, BorderRadius } from '@/constants/theme';
import { WeightRecord, WeightChartData, WeightSummary } from '@/src/models/weight';
import { weightService } from '@/src/services';
import { useTheme } from '@/src/context/ThemeContext';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

// --- SUB-COMPONENTES INTERNOS ---

const TrendBadge = ({ trend }: { trend: string }) => {
  const { theme } = useTheme();

  const config = {
    loss: { label: '↓ Perda', color: theme.success },
    gain: { label: '↑ Ganho', color: theme.error },
    stable: { label: '→ Estável', color: theme.info },
  }[trend] ?? { label: '→ Estável', color: theme.info };

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const MiniChart = ({ data }: { data: WeightChartData[] }) => {
  const { theme } = useTheme();

  if (!data || !data.length) return null;
  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <View style={styles.chartBars}>
      {data.map((item, index) => (
        <View key={index} style={styles.chartColumn}>
          <Text style={[styles.chartValue, { color: theme.textSecondary }]}>{item.value}</Text>
          <View
            style={[
              styles.chartBar,
              {
                height: ((item.value - min) / range) * 60 + 20,
                backgroundColor: theme.primary,
              },
            ]}
          />
          <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

// --- TELA PRINCIPAL ---

export default function WeightScreen() {
  const { theme, themeType } = useTheme();

  // Verifica se o tema atual é o secundário (E-SUS/SMS)
  const isEsus = themeType === 'secondary' || theme.primary === '#25696A';

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

  const loadData = async () => {
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
          `Faz ${reminder.lastDays} dias que você não registra seu peso. Vamos atualizar?`
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
  };

  useEffect(() => {
    loadData();
  }, []);

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

      const today = new Date().toISOString().split('T')[0];
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
      <View style={[styles.screen, { backgroundColor: theme.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Carregando registros...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: theme.error + '20' }]}>
          <Text style={[styles.errorText, { color: theme.error }]}>⚠️ {error}</Text>
        </View>
      )}

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadData}
        ListHeaderComponent={
          <>
            {/* Botão de Alternância de Tema */}
            <View style={styles.toggleContainer}>
              <ThemeToggleButton />
            </View>

            {reminderMsg && (
              <Pressable
                style={[
                  styles.reminderBanner,
                  { backgroundColor: isEsus ? '#FDEEE7' : theme.tagBackground },
                ]}
                onPress={() => {
                  setReminderMsg(null);
                  setModalVisible(true);
                }}
              >
                <Text style={[styles.reminderText, { color: theme.text }]}>⚠️ {reminderMsg}</Text>
                <Text style={[styles.reminderAction, { color: isEsus ? theme.secondary : theme.primary }]}>
                  Registrar agora
                </Text>
              </Pressable>
            )}

            {summary && (
              <Card title="Resumo" style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Atual</Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>{summary.current}kg</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Variação</Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color: summary.difference <= 0 ? theme.success : theme.error,
                        },
                      ]}
                    >
                      {summary.difference > 0 ? '+' : ''}
                      {summary.difference}kg
                    </Text>
                  </View>
                </View>
                <TrendBadge trend={summary.trend} />
              </Card>
            )}

            {chartData.length > 0 && (
              <Card title="Evolução" style={styles.chartCard}>
                <MiniChart data={chartData} />
              </Card>
            )}

            <Text style={[styles.sectionTitle, { color: theme.text }]}>Histórico de Registros</Text>
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.recordCard}>
            <View style={styles.recordRow}>
              <View>
                <Text style={[styles.recordWeight, { color: theme.primary }]}>{item.value} kg</Text>
                <Text style={[styles.recordDate, { color: theme.textSecondary }]}>
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              {item.notes && (
                <Text style={[styles.recordNotes, { color: theme.textLight }]} numberOfLines={2}>
                  {item.notes}
                </Text>
              )}
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                Nenhum registro de peso ainda
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textLight }]}>
                Clique no + para começar
              </Text>
            </View>
          ) : null
        }
      />

      {/* Botão Flutuante (FAB) - Laranja no E-SUS / Azul  */}
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: isEsus ? theme.secondary : theme.primary },
        ]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal de Cadastro */}
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
              <Text style={[styles.modalTitle, { color: theme.text }]}>Novo Registro</Text>

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Peso (kg)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                placeholder="Ex: 80.5"
                placeholderTextColor={theme.textLight}
                keyboardType="decimal-pad"
                value={value}
                onChangeText={setValue}
                editable={!saving}
              />

              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Notas (opcional)</Text>
              <TextInput
                style={[
                  styles.input,
                  { height: 60, backgroundColor: theme.background, color: theme.text },
                ]}
                placeholder="Como se sente hoje?"
                placeholderTextColor={theme.textLight}
                multiline
                value={notes}
                onChangeText={setNotes}
                editable={!saving}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.btn, styles.btnCancel, { backgroundColor: theme.border }]}
                  onPress={() => setModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={{ color: theme.text }}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.btn,
                    { backgroundColor: isEsus ? theme.secondary : theme.primary },
                    saving && styles.btnDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{ color: '#FFF', fontFamily: Fonts.family.bold }}>
                      Salvar
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { padding: Spacing.md, paddingBottom: 100 },
  toggleContainer: { marginBottom: Spacing.sm },
  summaryCard: { marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12 },
  summaryValue: { fontSize: 22, fontFamily: Fonts.family.bold },
  badge: { alignSelf: 'center', marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontFamily: Fonts.family.bold, fontSize: 12 },
  chartCard: { marginBottom: Spacing.md },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 100, marginTop: 10 },
  chartColumn: { alignItems: 'center' },
  chartBar: { width: 14, borderRadius: 4 },
  chartValue: { fontSize: 9, marginBottom: 2 },
  chartLabel: { fontSize: 9, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.family.bold, marginVertical: 10 },
  recordCard: { marginBottom: 8 },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordWeight: { fontSize: 18, fontFamily: Fonts.family.bold },
  recordDate: { fontSize: 12 },
  recordNotes: { fontSize: 12, maxWidth: '50%', textAlign: 'right' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabIcon: { color: '#FFF', fontSize: 24, fontFamily: Fonts.family.bold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: BorderRadius.md, padding: 20 },
  modalTitle: { fontSize: 18, fontFamily: Fonts.family.bold, marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 12, marginBottom: 5 },
  input: { borderRadius: 8, padding: 12, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  btnCancel: {},
  btnDisabled: { opacity: 0.6 },
  reminderBanner: { borderRadius: 10, padding: 14, marginBottom: Spacing.md, alignItems: 'center' },
  reminderText: { fontSize: 14, textAlign: 'center', marginBottom: 6 },
  reminderAction: { fontSize: 14, fontFamily: Fonts.family.bold },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10 },
  errorBanner: { padding: 12, marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: 8 },
  errorText: { fontFamily: Fonts.family.bold },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, marginBottom: 8 },
  emptySubtext: { fontSize: 14 },
  modalBackdrop: { flex: 1 },
});