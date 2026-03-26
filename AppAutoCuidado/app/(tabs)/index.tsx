import { Card } from '@/components';
import { Colors, Spacing } from '@/constants/theme';
import { WeightRecord } from '@/src/models/weight';
import { weightService } from '@/src/services/weight-service';
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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const MiniChart = ({ data }: { data: any[] }) => {
  if (!data.length) return null;
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
  const [modalVisible, setModalVisible] = useState(false);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderMsg, setReminderMsg] = useState<string | null>(null);

  const loadData = () => {
    setRecords(weightService.getAllRecords());
    
    // Verifica lembrete mensal ao carregar
    const reminder = weightService.checkMonthlyReminder();
    if (reminder.shouldRemind) {
      setReminderMsg(`Faz ${reminder.lastDays} dias que você não registra seu peso. Vamos atualizar?`);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = () => {
    if (!value) return;
    // Salva e recarrega interface
    weightService.addRecord(parseFloat(value.replace(',', '.')), new Date().toISOString(), notes);
    setValue(''); setNotes(''); setModalVisible(false);
    loadData();
  };

  const summary = weightService.getSummary();

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={records}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {reminderMsg && (
              <Pressable
                style={styles.reminderBanner}
                onPress={() => { setReminderMsg(null); setModalVisible(true); }}
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
                    <Text style={[styles.summaryValue, {color: summary.difference <= 0 ? Colors.success : Colors.error}]}>
                      {summary.difference > 0 ? '+' : ''}{summary.difference}kg
                    </Text>
                  </View>
                </View>
                <TrendBadge trend={summary.trend} />
              </Card>
            )}

            <Card title="Evolução" style={styles.chartCard}>
              <MiniChart data={weightService.getChartData()} />
            </Card>

            <Text style={styles.sectionTitle}>Histórico de Registros</Text>
          </>
        }
        renderItem={({ item }) => (
          <Card style={styles.recordCard}>
            <View style={styles.recordRow}>
              <View>
                <Text style={styles.recordWeight}>{item.value} kg</Text>
                <Text style={styles.recordDate}>{new Date(item.date).toLocaleDateString('pt-BR')}</Text>
              </View>
              {item.notes && <Text style={styles.recordNotes} numberOfLines={2}>{item.notes}</Text>}
            </View>
          </Card>
        )}
      />

      {/* Botão para abrir Modal */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal de Cadastro */}
      {modalVisible && (
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Registro</Text>
            
            <Text style={styles.inputLabel}>Peso (kg)</Text>
            <TextInput 
               style={styles.input} 
               placeholder="Ex: 80.5" 
               keyboardType="numeric" 
               value={value} 
               onChangeText={setValue} 
            />

            <Text style={styles.inputLabel}>Notas</Text>
            <TextInput 
               style={[styles.input, {height: 60}]} 
               placeholder="Como se sente hoje?" 
               multiline 
               value={notes} 
               onChangeText={setNotes} 
            />

            <View style={styles.modalButtons}>
              <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => setModalVisible(false)}>
                <Text>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSave}>
                <Text style={{color: '#FFF', fontWeight: 'bold'}}>Salvar</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, paddingBottom: 100 },
  summaryCard: { marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: Colors.textSecondary },
  summaryValue: { fontSize: 22, fontWeight: 'bold' },
  badge: { alignSelf: 'center', marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontWeight: 'bold', fontSize: 12 },
  chartCard: { marginBottom: Spacing.md },
  chartBars: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 100, marginTop: 10 },
  chartColumn: { alignItems: 'center' },
  chartBar: { width: 14, borderRadius: 4 },
  chartValue: { fontSize: 9, color: Colors.textSecondary, marginBottom: 2 },
  chartLabel: { fontSize: 9, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10 },
  recordCard: { marginBottom: 8 },
  recordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordWeight: { fontSize: 18, fontWeight: 'bold', color: Colors.primary },
  recordDate: { fontSize: 12, color: Colors.textSecondary },
  recordNotes: { fontSize: 12, color: Colors.textLight, maxWidth: '50%', textAlign: 'right' },
  fab: { position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabIcon: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputLabel: { fontSize: 12, color: Colors.textSecondary, marginBottom: 5 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center' },
  btnCancel: { backgroundColor: '#EEE' },
  btnSave: { backgroundColor: Colors.primary },
  reminderBanner: { backgroundColor: Colors.warning + '20', borderRadius: 10, padding: 14, marginBottom: Spacing.md, alignItems: 'center' },
  reminderText: { fontSize: 14, color: Colors.text, textAlign: 'center', marginBottom: 6 },
  reminderAction: { fontSize: 14, fontWeight: 'bold', color: Colors.primary },
});