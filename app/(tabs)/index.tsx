import { Card } from '@/components';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { WeightRecord, WeightChartData, WeightSummary } from '@/src/models/weight';
import { weightService } from '@/src/services';
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
// SafeAreaView removido — o header da Tab já cobre a safe area

// --- SUB-COMPONENTES INTERNOS ---

const TrendBadge = ({ trend }: { trend: string }) => {
  const config = {
    loss: { label: '↓ Perda', color: Colors.success },
    gain: { label: '↑ Ganho', color: Colors.error },
    stable: { label: '→ Estável', color: Colors.info },
  }[trend] ?? { label: '→ Estável', color: Colors.info };

  return (
    <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
      <Text style={[styles.badgeText, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const MiniChart = ({ data }: { data: WeightChartData[] }) => {
  if (!data || !data.length) return null;
  const values = data.map(d => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <View style={styles.chartBars}>
      {data.map((item, index) => (
        <View key={index} style={styles.chartColumn}>
          <Text style={styles.chartValue}>{item.value}</Text>
          <View style={[styles.chartBar, { height: ((item.value - min) / range) * 60 + 20, backgroundColor: Colors.primary }]} />
          <Text style={styles.chartLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

// --- TELA PRINCIPAL ---

export default function WeightScreen() {
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

      // Carrega dados em paralelo
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

      // Recarrega os dados
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
      <View style={styles.screen}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando registros...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
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
            {reminderMsg && (
              <Pressable
                style={styles.reminderBanner}
                onPress={() => {
                  setReminderMsg(null);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.reminderText}>⚠️ {reminderMsg}</Text>
                <Text style={styles.reminderAction}>Registrar agora</Text>
              </Pressable>
            )}

            {summary && (
              <Card title="Resumo" style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Atual</Text>
                    <Text style={styles.summaryValue}>{summary.current}kg</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Variação</Text>
                    <Text
                      style={[
                        styles.summaryValue,
                        {
                          color:
                            summary.difference <= 0
                              ? Colors.success
                              : Colors.error,
                        },
                      ]}
                    >
                      {summary.difference > 0 ? '+' : ''}{summary.difference}kg
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

            <Text style={styles.sectionTitle}>Histórico de Registros</Text>
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.recordCard}>
            <View style={styles.recordRow}>
              <View>
                <Text style={styles.recordWeight}>{item.value} kg</Text>
                <Text style={styles.recordDate}>
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              {item.notes && (
                <Text style={styles.recordNotes} numberOfLines={2}>
                  {item.notes}
                </Text>
              )}
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum registro de peso ainda</Text>
              <Text style={styles.emptySubtext}>
                Clique no + para começar
              </Text>
            </View>
          ) : null
        }
      />

      {/* Botão para abrir Modal */}
      <TouchableOpacity
        style={styles.fab}
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
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Novo Registro</Text>

              <Text style={styles.inputLabel}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 80.5"
                keyboardType="decimal-pad"
                value={value}
                onChangeText={setValue}
                editable={!saving}
              />

              <Text style={styles.inputLabel}>Notas (opcional)</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                placeholder="Como se sente hoje?"
                multiline
                value={notes}
                onChangeText={setNotes}
                editable={!saving}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.btn, styles.btnCancel]}
                  onPress={() => setModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={{ color: Colors.text }}>Cancelar</Text>
                </Pressable>
                <Pressable
                  style={[styles.btn, styles.btnSave, saving && styles.btnDisabled]}
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
  screen: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, paddingBottom: 100 },
  summaryCard: { marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary },
  summaryValue: { fontSize: 22, fontFamily: Fonts.family.bold },
  badge: { alignSelf: 'center', marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontFamily: Fonts.family.bold, fontSize: 12 },
  chartCard: { marginBottom: Spacing.md },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 100, marginTop: 10 },
  chartColumn: { alignItems: 'center' },
  chartBar: { width: 14, borderRadius: 4 },
  chartValue: { fontSize: 9, color: Colors.textSecondary, marginBottom: 2 },
  chartLabel: { fontSize: 9, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontFamily: Fonts.family.bold, marginVertical: 10 },
  recordCard: { marginBottom: 8 },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordWeight: { fontSize: 18, fontFamily: Fonts.family.bold, color: Colors.primary },
  recordDate: { fontSize: 12, color: Colors.textSecondary },
  recordNotes: { fontSize: 12, color: Colors.textLight, maxWidth: '50%', textAlign: 'right' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabIcon: { color: '#FFF', fontSize: 24, fontFamily: Fonts.family.bold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontFamily: Fonts.family.bold, marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 5 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#EEE' },
  btnSave: { backgroundColor: Colors.primary },
  btnDisabled: { opacity: 0.6 },
  reminderBanner: { backgroundColor: Colors.warning + '20', borderRadius: 10, padding: 14, marginBottom: Spacing.md, alignItems: 'center' },
  reminderText: { fontSize: 14, color: Colors.text, textAlign: 'center', marginBottom: 6 },
  reminderAction: { fontSize: 14, fontFamily: Fonts.family.bold, color: Colors.primary },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: Colors.textSecondary },
  errorBanner: { backgroundColor: Colors.error + '20', padding: 12, marginHorizontal: Spacing.md, marginTop: Spacing.md, borderRadius: 8 },
  errorText: { color: Colors.error, fontFamily: Fonts.family.bold },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: Colors.textSecondary, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: Colors.textLight },
  modalBackdrop: { flex: 1 },
});