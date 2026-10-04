import React, { useCallback, useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { AppText as Text, SYSTEM_FONT } from '@/components/app-text';
import {
  View,
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
import { Card } from '@/components';
import { Fonts, Spacing, BorderRadius } from '@/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { medicationService, notificationService } from '@/src/services';
import { Medication, MedicationLog, MedicationFrequency } from '@/src/models';
import { toLocalDateISO } from '@/src/utils/date';

function StatusBadge({ status }: { status: 'taken' | 'missed' }) {
  const { theme } = useTheme();
  const isTaken = status === 'taken';
  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: (isTaken ? theme.success : theme.error) + '20' },
      ]}
    >
      <Text
        style={[
          styles.statusText,
          { color: isTaken ? theme.success : theme.error },
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
  const { theme } = useTheme();
  const todayLogs = logs.filter(
    (l) => l.medicationId === item.id && l.date === toLocalDateISO()
  );

  return (
    <Card style={styles.medCard}>
      <View style={styles.medHeader}>
        <View style={[styles.medIcon, { backgroundColor: theme.tagBackground }]}>
          <Ionicons name="medkit-outline" size={22} color={theme.primaryDark} />
        </View>
        <View style={styles.medInfo}>
          <Text style={[styles.medName, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.medDosage, { color: theme.textSecondary }]}>
            {item.dosage} — {item.frequency === '5+' ? `${item.times.length}x` : item.frequency}/dia
          </Text>
          <Text style={[styles.medTimes, { color: theme.primaryDark }]}>
            Horários: {item.times.join(', ')}
          </Text>
          {item.notes && (
            <Text style={[styles.medNotes, { color: theme.textSecondary }]}>{item.notes}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.success + '15', borderColor: theme.success + '40' }]}
          onPress={() => onTaken(item.id)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Ionicons name="checkmark-circle-outline" size={18} color={theme.success} />
          <Text style={[styles.actionText, { color: theme.success }]}>Tomei</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.error + '15', borderColor: theme.error + '40' }]}
          onPress={() => onMissed(item.id)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Ionicons name="close-circle-outline" size={18} color={theme.error} />
          <Text style={[styles.actionText, { color: theme.error }]}>Perdi</Text>
        </TouchableOpacity>
      </View>

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

const FREQUENCY_OPTIONS: { value: MedicationFrequency; label: string }[] = [
  { value: '1x', label: '1' },
  { value: '2x', label: '2' },
  { value: '3x', label: '3' },
  { value: '4x', label: '4' },
  { value: '5+', label: 'Mais de 4' },
];

function frequencyForTimes(count: number): MedicationFrequency {
  return count > 4 ? '5+' : `${count}x` as MedicationFrequency;
}

export default function MedicationsScreen() {
  const { theme, currentTheme, medicationReminders, fontPreference, textScale } = useTheme();
  const actionColor = currentTheme === 'secondary' ? theme.secondary : theme.primary;
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado do modal de cadastro
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDosage, setFormDosage] = useState('');
  const [formTimes, setFormTimes] = useState<string[]>(['']);
  const formFrequency = frequencyForTimes(formTimes.length);
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFormName('');
    setFormDosage('');
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
    if (formTimes.some(t => !t.trim())) {
      errors.times = 'Preencha todos os horários';
    } else {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      const invalid = formTimes.some(t => !timeRegex.test(t.trim()));
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
        times: formTimes.map(t => t.trim()),
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

  const selectFrequency = (frequency: MedicationFrequency) => {
    if (frequency === formFrequency) return;
    const count = frequency === '5+' ? 5 : Number.parseInt(frequency, 10);
    setFormTimes(prev => Array.from({ length: count }, (_, index) => prev[index] ?? ''));
    setFormErrors(prev => ({ ...prev, times: '' }));
  };

  const addTimeSlot = () => {
    setFormTimes(prev => [...prev, '']);
    setFormErrors(prev => ({ ...prev, times: '' }));
  };

  const removeTimeSlot = (index: number) => {
    if (formTimes.length > 1) setFormTimes(prev => prev.filter((_, i) => i !== index));
    setFormErrors(prev => ({ ...prev, times: '' }));
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
      notificationService.reconcileMedicationReminders(meds.map((med) => med.id))
        .catch((err: unknown) => console.warn('Erro ao atualizar lembretes:', err));
    } catch (err) {
      setError('Não foi possível carregar as medicações.\nVerifique se o servidor está rodando.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));

  useEffect(() => {
    // Solicita permissões para notificações ao abrir o app
    if (medicationReminders) notificationService.ensurePermissions().catch((err: unknown) =>
      console.warn('Erro ao solicitar permissões:', err)
    );
  }, [loadData, medicationReminders]);

  const handleTaken = async (medicationId: string) => {
    const now = new Date().toTimeString().slice(0, 5);
    try {
      // Registra a medicação como tomada
      const log = await medicationService.registerUse(medicationId, now, 'taken');
      setLogs((prev) => [...prev, log]);

      // Encontra a medicação para pegar o nome e horários
      const medication = medications.find((m) => m.id === medicationId);
      if (medication && medicationReminders) {
        // Calcula a próxima dose
        const nextDoseTime = calculateNextDoseTime(medication.times, now);
        if (nextDoseTime) {
          // Agenda notificação para a próxima dose
          await notificationService.schedule({
            title: 'Hora da sua medicação',
            body: `Hora da sua medicação: ${medication.name}`,
            scheduledDate: nextDoseTime.toISOString(),
            type: 'medication_reminder',
            relatedId: medicationId,
          });
        }
      }
    } catch (err) {
      console.error('Erro ao registrar tomada:', err);
    }
  };

  // Função auxiliar para calcular próxima dose
  const calculateNextDoseTime = (times: string[], currentTime: string): Date | null => {
    const currentMinutes = parseInt(currentTime.split(':')[0]) * 60 + parseInt(currentTime.split(':')[1]);
    
    // Ordena os horários e encontra o próximo
    const futureTime = times
      .map((t) => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1]))
      .sort((a, b) => a - b)
      .find((t) => t > currentMinutes);

    if (futureTime) {
      // Próximo horário hoje
      const hours = Math.floor(futureTime / 60);
      const minutes = futureTime % 60;
      const nextDose = new Date();
      nextDose.setHours(hours, minutes, 0, 0);
      return nextDose;
    } else {
      // Primeiro horário amanhã
      const firstTime = times
        .map((t) => parseInt(t.split(':')[0]) * 60 + parseInt(t.split(':')[1]))
        .sort((a, b) => a - b)[0];
      if (firstTime !== undefined) {
        const hours = Math.floor(firstTime / 60);
        const minutes = firstTime % 60;
        const nextDose = new Date();
        nextDose.setDate(nextDose.getDate() + 1);
        nextDose.setHours(hours, minutes, 0, 0);
        return nextDose;
      }
    }
    return null;
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
      <View style={[styles.screen, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primaryDark} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Carregando medicações…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={38} color={theme.error} />
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={loadData}>
          <Text style={[styles.retryText, { color: theme.textOnPrimary }]}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
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
          <>
            <View style={styles.pageIntro}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Cuide da sua rotina</Text>
              <Text style={[styles.introSubtitle, { color: theme.textSecondary }]}>
                Organize os horários e acompanhe o uso dos seus medicamentos.
              </Text>
            </View>

            <View style={[styles.summaryCard, { backgroundColor: theme.primary }]}>
              <View style={styles.summaryTop}>
                <View style={styles.summaryCopy}>
                  <Text style={[styles.summaryEyebrow, { color: theme.textOnPrimary }]}>SUAS MEDICAÇÕES</Text>
                  <Text style={[styles.summaryNumber, { color: theme.textOnPrimary }]}>{medications.length}</Text>
                  <Text style={[styles.summaryLabel, { color: theme.textOnPrimary }]}>
                    {medications.length === 1 ? 'medicação cadastrada' : 'medicações cadastradas'}
                  </Text>
                </View>
                <View style={styles.summaryIcon}>
                  <Ionicons name="medkit-outline" size={24} color={theme.textOnPrimary} />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: actionColor }]}
              onPress={openModal}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Adicionar medicação"
            >
              <Ionicons name="add" size={21} color={theme.textOnPrimary} />
              <Text style={[styles.addButtonText, { color: theme.textOnPrimary }]}>Adicionar medicação</Text>
            </TouchableOpacity>

            <View style={styles.listHeading}>
              <Text style={[styles.listTitle, { color: theme.text }]}>Minha lista</Text>
              <Text style={[styles.listSubtitle, { color: theme.textSecondary }]}>Medicamentos e horários cadastrados</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.tagBackground }]}>
              <Ionicons name="medkit-outline" size={26} color={theme.primaryDark} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Nenhuma medicação ainda</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Use o botão acima para adicionar sua primeira medicação.
            </Text>
          </Card>
        }
      />

      {modalVisible && (
        <Modal visible={modalVisible} transparent animationType="slide">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps="handled">
              <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Nova medicação</Text>
                  <Pressable
                    style={styles.closeButton}
                    onPress={closeModal}
                    disabled={saving}
                    accessibilityRole="button"
                    accessibilityLabel="Fechar"
                  >
                    <Ionicons name="close" size={22} color={theme.textSecondary} />
                  </Pressable>
                </View>

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Nome *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, borderColor: formErrors.name ? theme.error : theme.border, color: theme.text, fontFamily: fontPreference === 'system' ? SYSTEM_FONT : Fonts.family.regular, fontSize: Fonts.size.md * textScale }]}
                  placeholder="Ex: Losartana"
                  placeholderTextColor={theme.textLight}
                  value={formName}
                  onChangeText={(t) => { setFormName(t); setFormErrors(e => ({ ...e, name: '' })); }}
                />
                {formErrors.name ? <Text style={[styles.errorMsg, { color: theme.error }]}>{formErrors.name}</Text> : null}

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Dosagem *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.background, borderColor: formErrors.dosage ? theme.error : theme.border, color: theme.text, fontFamily: fontPreference === 'system' ? SYSTEM_FONT : Fonts.family.regular, fontSize: Fonts.size.md * textScale }]}
                  placeholder="Ex: 50mg"
                  placeholderTextColor={theme.textLight}
                  value={formDosage}
                  onChangeText={(t) => { setFormDosage(t); setFormErrors(e => ({ ...e, dosage: '' })); }}
                />
                {formErrors.dosage ? <Text style={[styles.errorMsg, { color: theme.error }]}>{formErrors.dosage}</Text> : null}

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Frequência diária *</Text>
                <View style={styles.freqRow} accessibilityRole="radiogroup">
                  {FREQUENCY_OPTIONS.map((option) => (
                    <Pressable
                      key={option.value}
                      style={[
                        styles.freqBtn,
                        option.value === '5+' && styles.freqBtnMore,
                        { backgroundColor: formFrequency === option.value ? theme.primary : theme.background, borderColor: formFrequency === option.value ? theme.primary : theme.border },
                      ]}
                      onPress={() => selectFrequency(option.value)}
                      accessibilityRole="radio"
                      accessibilityLabel={option.value === '5+' ? 'Mais de 4 vezes ao dia' : `${option.label} vez${option.label === '1' ? '' : 'es'} ao dia`}
                      accessibilityState={{ selected: formFrequency === option.value }}
                    >
                      <Text style={[styles.freqText, { color: formFrequency === option.value ? theme.textOnPrimary : theme.textSecondary }]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Horários ({formTimes.length}) *</Text>
                {formTimes.map((time, idx) => (
                  <View key={idx} style={styles.timeRow}>
                    <View style={[styles.timeIndex, { backgroundColor: theme.primary + '12' }]}>
                      <Text style={[styles.timeIndexText, { color: theme.primaryDark }]}>{idx + 1}</Text>
                    </View>
                    <TextInput
                      style={[styles.input, styles.timeInput, { backgroundColor: theme.background, borderColor: formErrors.times ? theme.error : theme.border, color: theme.text, fontFamily: fontPreference === 'system' ? SYSTEM_FONT : Fonts.family.regular, fontSize: Fonts.size.md * textScale }]}
                      placeholder="HH:MM"
                      placeholderTextColor={theme.textLight}
                      keyboardType="numeric"
                      accessibilityLabel={`Horário ${idx + 1}`}
                      maxLength={5}
                      value={time}
                      onChangeText={(t) => { updateTime(idx, t); setFormErrors(e => ({ ...e, times: '' })); }}
                    />
                    {formTimes.length > 1 && (
                      <Pressable onPress={() => removeTimeSlot(idx)} style={styles.removeTimeBtn} accessibilityRole="button" accessibilityLabel="Remover horário">
                        <Ionicons name="close" size={20} color={theme.error} />
                      </Pressable>
                    )}
                  </View>
                ))}
                {formErrors.times ? <Text style={[styles.errorMsg, { color: theme.error }]}>{formErrors.times}</Text> : null}
                <Pressable onPress={addTimeSlot} style={styles.addTimeBtn} accessibilityRole="button">
                  <Text style={[styles.addTimeTxt, { color: theme.primaryDark }]}>+ Adicionar horário</Text>
                </Pressable>

                <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Notas (opcional)</Text>
                <TextInput
                  style={[styles.input, styles.notesInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text, fontFamily: fontPreference === 'system' ? SYSTEM_FONT : Fonts.family.regular, fontSize: Fonts.size.md * textScale }]}
                  placeholder="Observações..."
                  placeholderTextColor={theme.textLight}
                  multiline
                  value={formNotes}
                  onChangeText={setFormNotes}
                />

                {formErrors.submit ? <Text style={[styles.errorMsg, { color: theme.error }]}>{formErrors.submit}</Text> : null}

                <View style={styles.modalButtons}>
                  <Pressable style={[styles.btn, { backgroundColor: theme.background, borderColor: theme.border }]} onPress={closeModal} disabled={saving}>
                    <Text style={[styles.buttonText, { color: theme.text }]}>Cancelar</Text>
                  </Pressable>
                  <Pressable style={[styles.btn, { backgroundColor: actionColor, borderColor: actionColor }]} onPress={handleAddMedication} disabled={saving}>
                    <Text style={[styles.buttonText, { color: theme.textOnPrimary }]}>
                      {saving ? 'Salvando…' : 'Salvar'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.sm,
  },
  errorText: {
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.md,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
  },
  retryText: {
    color: '#fff',
    fontFamily: Fonts.family.bold,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  pageIntro: { marginBottom: Spacing.lg, minWidth: 0 },
  introSubtitle: { fontSize: Fonts.size.sm, fontFamily: Fonts.family.regular, lineHeight: 22 },
  sectionTitle: {
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.family.bold,
    marginBottom: Spacing.xs,
  },
  summaryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    elevation: 3,
    shadowColor: '#123A39',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
  summaryTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.sm },
  summaryCopy: { flex: 1, minWidth: 0 },
  summaryEyebrow: { color: '#FFFFFFB8', fontSize: 10, letterSpacing: 1.1, fontFamily: Fonts.family.bold },
  summaryNumber: { color: '#FFFFFF', fontSize: 38, lineHeight: 48, fontFamily: Fonts.family.bold, marginTop: Spacing.sm },
  summaryLabel: { color: '#FFFFFF', fontSize: Fonts.size.sm, fontFamily: Fonts.family.regular, lineHeight: 21 },
  summaryIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF20', alignItems: 'center', justifyContent: 'center' },
  addButton: { minHeight: 52, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: Spacing.sm, borderRadius: BorderRadius.md, marginBottom: Spacing.lg, paddingHorizontal: Spacing.md },
  addButtonText: { color: '#FFFFFF', fontSize: Fonts.size.sm, fontFamily: Fonts.family.bold, textAlign: 'center', flexShrink: 1 },
  listHeading: { marginBottom: Spacing.sm, minWidth: 0 },
  listTitle: { fontSize: Fonts.size.md, fontFamily: Fonts.family.bold },
  listSubtitle: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.regular, lineHeight: 18, marginTop: 3 },
  medCard: {
    padding: Spacing.md,
  },
  medHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  medIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  medInfo: {
    flex: 1,
    minWidth: 0,
  },
  medName: {
    fontSize: Fonts.size.lg,
    fontFamily: Fonts.family.bold,
  },
  medDosage: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.family.regular,
    marginTop: 2,
  },
  medTimes: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.family.regular,
    marginTop: 4,
  },
  medNotes: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.family.italic,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionText: { fontFamily: Fonts.family.bold, fontSize: Fonts.size.xs, flexShrink: 1 },
  todayLogs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: Fonts.size.xs,
    fontFamily: Fonts.family.regular,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: Fonts.family.regular,
    fontSize: Fonts.size.md,
    marginTop: Spacing.xs,
    lineHeight: 22,
  },
  emptyCard: { alignItems: 'center', padding: Spacing.lg },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  emptyTitle: { fontSize: Fonts.size.md, fontFamily: Fonts.family.bold, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContent: { width: '100%', maxWidth: 480, alignSelf: 'center', borderRadius: BorderRadius.lg, padding: Spacing.md },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.md, gap: Spacing.sm },
  modalTitle: { flex: 1, minWidth: 0, fontSize: Fonts.size.lg, fontFamily: Fonts.family.bold },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  inputLabel: { fontSize: 12, fontFamily: Fonts.family.regular, marginBottom: 5, marginTop: 4 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 4, fontFamily: Fonts.family.regular },
  notesInput: { minHeight: 80, textAlignVertical: 'top' },
  errorMsg: { fontSize: 11, marginBottom: 8 },
  freqRow: { flexDirection: 'row' as const, flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  freqBtn: {
    flexBasis: '22%',
    flexGrow: 1,
    minWidth: 0,
    minHeight: 44,
    paddingHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  freqBtnMore: { flexBasis: '100%' },
  freqText: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.bold, textAlign: 'center' },
  timeRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginBottom: 4 },
  timeIndex: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  timeIndexText: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.bold },
  timeInput: { flex: 1, minWidth: 0 },
  removeTimeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  addTimeBtn: { marginBottom: 12 },
  addTimeTxt: { fontSize: 13, fontFamily: Fonts.family.bold },
  modalButtons: { flexDirection: 'row' as const, gap: Spacing.sm, marginTop: Spacing.md },
  btn: { flex: 1, minWidth: 0, minHeight: 48, paddingHorizontal: Spacing.xs, borderRadius: 8, borderWidth: 1, alignItems: 'center' as const, justifyContent: 'center' as const },
  buttonText: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.bold, textAlign: 'center' },
});
