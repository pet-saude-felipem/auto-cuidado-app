import React, { useState } from 'react';
import {
  View,
  Text,
  SectionList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Card } from '@/components';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { mockMedicationLogs, mockMedications, mockWeightRecords } from '@/src/mocks';

type HistoryItem = {
  id: string;
  type: 'weight' | 'medication';
  title: string;
  subtitle: string;
  date: string;
  status?: string;
};

function buildHistory(): { title: string; data: HistoryItem[] }[] {
  const items: HistoryItem[] = [];

  // Registros de peso
  mockWeightRecords.forEach((r) => {
    items.push({
      id: `w-${r.id}`,
      type: 'weight',
      title: `${r.value} kg`,
      subtitle: r.notes ?? 'Registro de peso',
      date: r.date,
    });
  });

  // Logs de medicação
  mockMedicationLogs.forEach((log) => {
    const med = mockMedications.find((m) => m.id === log.medicationId);
    items.push({
      id: `m-${log.id}`,
      type: 'medication',
      title: med?.name ?? 'Medicação',
      subtitle: `${log.time} — ${log.status === 'taken' ? 'Tomou' : 'Perdeu'}`,
      date: log.date,
      status: log.status,
    });
  });

  // Ordenar por data (mais recente primeiro)
  items.sort((a, b) => b.date.localeCompare(a.date));

  // Agrupar por data
  const groups: Record<string, HistoryItem[]> = {};
  items.forEach((item) => {
    const dateLabel = new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
    });
    if (!groups[dateLabel]) groups[dateLabel] = [];
    groups[dateLabel].push(item);
  });

  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

function HistoryItemCard({ item }: { item: HistoryItem }) {
  const isWeight = item.type === 'weight';
  const icon = isWeight ? '⚖️' : '💊';
  const accentColor = isWeight
    ? Colors.primary
    : item.status === 'taken'
      ? Colors.success
      : Colors.error;

  return (
    <Card style={styles.itemCard}>
      <View style={styles.itemRow}>
        <Text style={styles.itemIcon}>{icon}</Text>
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: accentColor }]}>{item.title}</Text>
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        </View>
      </View>
    </Card>
  );
}

export default function HistoryScreen() {
  const [sections] = useState(buildHistory);

  return (
    <SafeAreaView style={styles.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionHeader}>{section.title}</Text>
        )}
        renderItem={({ item }) => <HistoryItemCard item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        SectionSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          <Text style={styles.empty}>Nenhum registro encontrado</Text>
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
  sectionHeader: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semibold,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  itemCard: {
    marginBottom: 0,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  itemIcon: {
    fontSize: 24,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: Fonts.size.md,
    fontWeight: Fonts.weight.bold,
  },
  itemSubtitle: {
    fontSize: Fonts.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    color: Colors.textLight,
    marginTop: Spacing.xxl,
    fontSize: Fonts.size.md,
  },
});
