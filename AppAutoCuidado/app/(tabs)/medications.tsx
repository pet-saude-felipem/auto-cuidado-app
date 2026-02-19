import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Card } from '@/components';
import { Colors, Fonts, Spacing, BorderRadius } from '@/constants/theme';
import { mockMedications, mockMedicationLogs } from '@/src/mocks';
import { Medication, MedicationLog } from '@/src/models';

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

export default function MedicationsScreen() {
  const [medications] = useState(mockMedications);
  const [logs] = useState(mockMedicationLogs);

  const handleTaken = (medicationId: string) => {
    // Ponto de integração — Gustavo implementará o service
    console.log('Tomei:', medicationId);
  };

  const handleMissed = (medicationId: string) => {
    // Ponto de integração — Gustavo implementará o service
    console.log('Perdi:', medicationId);
  };

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
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
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
});
