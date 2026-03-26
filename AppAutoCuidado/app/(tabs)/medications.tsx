import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '@/components';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/theme';
import { medicationService } from '@/src/services';
import { Medication, MedicationLog, MedicationFrequency } from '@/src/models';

function StatusBadge({ status }: { status: 'taken' | 'missed' }) {
  const isTaken = status === 'taken';
  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: (isTaken ? Colors.success : Colors.error) + '20' },
      ]}
    >
      <Text
        style={[
          styles.statusText,
          { color: isTaken ? Colors.success : Colors.error },
        ]}
      >
        {isTaken ? '✓ Tomei' : '✗ Perdi'}
      </Text>
    </View>
  );
}

function MedicationItem({
  item,
  logs,
  onTaken,
  onMissed,
}: {
  item: Medication;
  logs: MedicationLog[];
  onTaken: (id: string) => void;
  onMissed: (id: string) => void;
}) {
  const todayLogs = logs.filter(
    (l) => l.medicationId === item.id && l.date === new Date().toISOString().split('T')[0]
  );

  return (
    <Card style={styles.medCard}>
      <View style={styles.medHeader}>
        <View style={styles.medInfo}>
          <Text style={styles.medName}>{item.name}</Text>
          <Text style={styles.medDosage}>
            {item.dosage} — {item.frequency}/dia
          </Text>
          <Text style={styles.medTimes}>
            Horários: {item.times.join(', ')}
          </Text>
          {item.notes && (
            <Text style={styles.medNotes}>{item.notes}</Text>
          )}
        </View>
      </View>

      {/* Ações rápidas */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.takenBtn]}
          onPress={() => onTaken(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.takenText}>✓ Tomei</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.missedBtn]}
          onPress={() => onMissed(item.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.missedText}>✗ Perdi</Text>
        </TouchableOpacity>
      </View>

      {/* Registros do dia */}
      {todayLogs.length > 0 && (
        <View style={styles.todayLogs}>
          {todayLogs.map((log) => (
            <StatusBadge key={log.id} status={log.status} />
          ))}
        </View>
      )}
    </Card>
  );
}

const FREQUENCY_OPTIONS: MedicationFrequency[] = ['1x', '2x', '3x', '4x'];

export default function MedicationsScreen() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado do modal de cadastro
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formFrequency, setFormFrequency] = useState<MedicationFrequency>('1x');
  const [formTimes, setFormTimes] = useState<string[]>(['']);
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormName('');
    setFormDosage('');
    setFormFrequency('1x');
    setFormTimes(['']);
    setFormNotes('');
    setFormErrors({});
  };

  const openModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formName.trim()) errors.name = 'Nome é obrigatório';
    if (!formDosage.trim()) errors.dosage = 'Dosagem é obrigatória';
    const validTimes = formTimes.filter(t => t.trim());
    if (validTimes.length === 0) {
      errors.times = 'Informe ao menos um horário';
    } else {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      const invalid = validTimes.some(t => !timeRegex.test(t.trim()));
      if (invalid) errors.times = 'Use o formato HH:MM (ex: 08:00)';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddMedication = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      await medicationService.addMedication({
        name: formName.trim(),
        dosage: formDosage.trim(),
        frequency: formFrequency,
        times: formTimes.filter(t => t.trim()).map(t => t.trim()),
        notes: formNotes.trim() || undefined,
      });
      closeModal();
      loadData();
    } catch (err) {
      setFormErrors({ submit: 'Erro ao salvar. Tente novamente.' });
      console.error('Erro ao cadastrar medicação:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateTime = (index: number, value: string) => {
    // Auto-formata: insere ":" após 2 dígitos
    let cleaned = value.replace(/[^\d]/g, '').slice(0, 4);
    if (cleaned.length > 2) cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2);
    setFormTimes(prev => {
      const updated = [...prev];
      updated[index] = cleaned;
      return updated;
    });
  };

  const addTimeSlot = () => {
    if (formTimes.length < 4) setFormTimes(prev => [...prev, '']);
  };

  const removeTimeSlot = (index: number) => {
    if (formTimes.length > 1) setFormTimes(prev => prev.filter((_, i) => i !== index));
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [meds, recentLogs] = await Promise.all([
        medicationService.getAllMedications(),
        medicationService.getRecentLogs(7),
      ]);
      setMedications(meds);
      setLogs(recentLogs);
    } catch (err) {
      setError('Não foi possível carregar as medicações.\nVerifique se o servidor está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleTaken = async (medicationId: string) => {
    const now = new Date().toTimeString().slice(0, 5);
    try {
      const log = await medicationService.registerUse(medicationId, now, 'taken');
      setLogs((prev) => [...prev, log]);
    } catch (err) {
      console.error('Erro ao registrar tomada:', err);
    }
  };

  const handleMissed = async (medicationId: string) => {
    const now = new Date().toTimeString().slice(0, 5);
    try {
      const log = await medicationService.registerUse(medicationId, now, 'missed');
      setLogs((prev) => [...prev, log]);
    } catch (err) {
      console.error('Erro ao registrar perda:', err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Carregando medicações…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MedicationItem
            item={item}
            logs={logs}
            onTaken={handleTaken}
            onMissed={handleMissed}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Suas Medicações</Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma medicação cadastrada.{'\n'}Toque no botão + para adicionar.</Text>
        }
      />

      {/* FAB para abrir modal de cadastro */}
      <TouchableOpacity style={styles.fab} onPress={openModal} activeOpacity={0.7}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal de cadastro de medicação */}
      {modalVisible && (
        <Modal visible={modalVisible} transparent animationType="slide">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Nova Medicação</Text>

                {/* Nome */}
                <Text style={styles.inputLabel}>Nome *</Text>
                <TextInput
                  style={[styles.input, formErrors.name && styles.inputError]}
                  placeholder="Ex: Losartana"
                  value={formName}
                  onChangeText={(t) => { setFormName(t); setFormErrors(e => ({ ...e, name: '' })); }}
                />
                {formErrors.name ? <Text style={styles.errorMsg}>{formErrors.name}</Text> : null}

                {/* Dosagem */}
                <Text style={styles.inputLabel}>Dosagem *</Text>
                <TextInput
                  style={[styles.input, formErrors.dosage && styles.inputError]}
                  placeholder="Ex: 50mg"
                  value={formDosage}
                  onChangeText={(t) => { setFormDosage(t); setFormErrors(e => ({ ...e, dosage: '' })); }}
                />
                {formErrors.dosage ? <Text style={styles.errorMsg}>{formErrors.dosage}</Text> : null}

                {/* Frequência */}
                <Text style={styles.inputLabel}>Frequência *</Text>
                <View style={styles.freqRow}>
                  {FREQUENCY_OPTIONS.map((freq) => (
                    <Pressable
                      key={freq}
                      style={[styles.freqBtn, formFrequency === freq && styles.freqBtnActive]}
                      onPress={() => setFormFrequency(freq)}
                    >
                      <Text style={[styles.freqText, formFrequency === freq && styles.freqTextActive]}>
                        {freq}/dia
                      </Text>
                    </Pressable>
                  ))}
                </View>

                {/* Horários */}
                <Text style={styles.inputLabel}>Horários *</Text>
                {formTimes.map((time, idx) => (
                  <View key={idx} style={styles.timeRow}>
                    <TextInput
                      style={[styles.input, styles.timeInput, formErrors.times && styles.inputError]}
                      placeholder="HH:MM"
                      keyboardType="numeric"
                      maxLength={5}
                      value={time}
                      onChangeText={(t) => { updateTime(idx, t); setFormErrors(e => ({ ...e, times: '' })); }}
                    />
                    {formTimes.length > 1 && (
                      <Pressable onPress={() => removeTimeSlot(idx)} style={styles.removeTimeBtn}>
                        <Text style={styles.removeTimeTxt}>✕</Text>
                      </Pressable>
                    )}
                  </View>
                ))}
                {formErrors.times ? <Text style={styles.errorMsg}>{formErrors.times}</Text> : null}
                {formTimes.length < 4 && (
                  <Pressable onPress={addTimeSlot} style={styles.addTimeBtn}>
                    <Text style={styles.addTimeTxt}>+ Adicionar horário</Text>
                  </Pressable>
                )}

                {/* Notas */}
                <Text style={styles.inputLabel}>Notas (opcional)</Text>
                <TextInput
                  style={[styles.input, { height: 60 }]}
                  placeholder="Observações..."
                  multiline
                  value={formNotes}
                  onChangeText={setFormNotes}
                />

                {formErrors.submit ? <Text style={styles.errorMsg}>{formErrors.submit}</Text> : null}

                {/* Botões */}
                <View style={styles.modalButtons}>
                  <Pressable style={[styles.btn, styles.btnCancel]} onPress={closeModal} disabled={saving}>
                    <Text>Cancelar</Text>
                  </Pressable>
                  <Pressable style={[styles.btn, styles.btnSave]} onPress={handleAddMedication} disabled={saving}>
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                      {saving ? 'Salvando…' : 'Salvar'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.sm,
    color: Colors.textSecondary,
    fontSize: Fonts.size.sm,
  },
  errorText: {
    color: Colors.error,
    fontSize: Fonts.size.md,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  retryText: {
    color: '#fff',
    fontWeight: Fonts.weight.semibold,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  medCard: {
    marginBottom: 0,
  },
  medHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.bold,
    color: Colors.text,
  },
  medDosage: {
    fontSize: Fonts.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  medTimes: {
    fontSize: Fonts.size.sm,
    color: Colors.primary,
    marginTop: 4,
  },
  medNotes: {
    fontSize: Fonts.size.xs,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  takenBtn: {
    backgroundColor: Colors.success + '15',
    borderWidth: 1,
    borderColor: Colors.success + '40',
  },
  missedBtn: {
    backgroundColor: Colors.error + '15',
    borderWidth: 1,
    borderColor: Colors.error + '40',
  },
  takenText: {
    color: Colors.success,
    fontWeight: Fonts.weight.semibold,
    fontSize: Fonts.size.sm,
  },
  missedText: {
    color: Colors.error,
    fontWeight: Fonts.weight.semibold,
    fontSize: Fonts.size.sm,
  },
  todayLogs: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusText: {
    fontSize: Fonts.size.xs,
    fontWeight: Fonts.weight.medium,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: Fonts.size.md,
    marginTop: Spacing.xl,
    lineHeight: 22,
  },
  // --- FAB ---
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  fabIcon: { color: '#FFF', fontSize: 24, fontWeight: 'bold' as const },
  // --- Modal ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: { backgroundColor: '#FFF', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' as const, marginBottom: 20, textAlign: 'center' as const },
  inputLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 5, marginTop: 4 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginBottom: 4 },
  inputError: { borderWidth: 1, borderColor: Colors.error },
  errorMsg: { color: Colors.error, fontSize: 11, marginBottom: 8 },
  // --- Frequência ---
  freqRow: { flexDirection: 'row' as const, gap: 8, marginBottom: 8 },
  freqBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center' as const,
  },
  freqBtnActive: { backgroundColor: Colors.primary },
  freqText: { fontSize: 13, color: Colors.textSecondary },
  freqTextActive: { color: '#FFF', fontWeight: 'bold' as const },
  // --- Horários ---
  timeRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginBottom: 4 },
  timeInput: { flex: 1 },
  removeTimeBtn: { padding: 8 },
  removeTimeTxt: { color: Colors.error, fontSize: 16, fontWeight: 'bold' as const },
  addTimeBtn: { marginBottom: 12 },
  addTimeTxt: { color: Colors.primary, fontSize: 13, fontWeight: '600' as const },
  // --- Botões ---
  modalButtons: { flexDirection: 'row' as const, gap: 10, marginTop: 12 },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' as const },
  btnCancel: { backgroundColor: '#EEE' },
  btnSave: { backgroundColor: Colors.primary },
});
