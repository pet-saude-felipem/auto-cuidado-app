import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Card } from '@/components';
import { Colors, Fonts, Spacing } from '@/constants/theme';
import { mockWeightRecords, mockWeightSummary, mockWeightChartData } from '@/src/mocks';
import { WeightRecord } from '@/src/models';

function TrendBadge({ trend }: { trend: string }) {
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
}

function MiniChart({ data }: { data: { label: string; value: number }[] }) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return (
    <View style={styles.chartContainer}>
      <View style={styles.chartBars}>
        {data.map((item, index) => {
          const height = ((item.value - min) / range) * 80 + 20;
          return (
            <View key={index} style={styles.chartColumn}>
              <Text style={styles.chartValue}>{item.value}</Text>
              <View
                style={[
                  styles.chartBar,
                  { height, backgroundColor: Colors.primary },
                ]}
              />
              <Text style={styles.chartLabel}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function WeightItem({ item }: { item: WeightRecord }) {
  const dateFormatted = new Date(item.date + 'T00:00:00').toLocaleDateString('pt-BR');

  return (
    <Card style={styles.recordCard}>
      <View style={styles.recordRow}>
        <View>
          <Text style={styles.recordWeight}>{item.value} kg</Text>
          <Text style={styles.recordDate}>{dateFormatted}</Text>
        </View>
        {item.notes && (
          <Text style={styles.recordNotes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}
      </View>
    </Card>
  );
}

export default function WeightScreen() {
  const [records] = useState(mockWeightRecords);
  const summary = mockWeightSummary;
  const chartData = mockWeightChartData;

  return (
    <SafeAreaView style={styles.screen}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {/* Card resumo */}
            <Card title="Resumo" style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Atual</Text>
                  <Text style={styles.summaryValue}>{summary.current} kg</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Anterior</Text>
                  <Text style={styles.summaryValue}>{summary.previous} kg</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Variação</Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      { color: summary.difference <= 0 ? Colors.success : Colors.error },
                    ]}
                  >
                    {summary.difference > 0 ? '+' : ''}{summary.difference} kg
                  </Text>
                </View>
              </View>
              <TrendBadge trend={summary.trend} />
            </Card>

            {/* Gráfico */}
            <Card title="Evolução" style={styles.chartCard}>
              <MiniChart data={chartData} />
            </Card>

            {/* Título da lista */}
            <Text style={styles.sectionTitle}>Registros</Text>
          </>
        }
        renderItem={({ item }) => <WeightItem item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
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
  summaryCard: {
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: Fonts.size.xs,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: Fonts.size.xl,
    fontWeight: Fonts.weight.bold,
    color: Colors.text,
  },
  badge: {
    alignSelf: 'center',
    marginTop: Spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: Fonts.size.sm,
    fontWeight: Fonts.weight.semibold,
  },
  chartCard: {
    marginBottom: Spacing.md,
  },
  chartContainer: {
    marginTop: Spacing.sm,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 130,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: 20,
    borderRadius: 4,
    marginVertical: 4,
  },
  chartValue: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  chartLabel: {
    fontSize: 10,
    color: Colors.textLight,
  },
  sectionTitle: {
    fontSize: Fonts.size.lg,
    fontWeight: Fonts.weight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  recordCard: {
    marginBottom: 0,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordWeight: {
    fontSize: Fonts.size.xl,
    fontWeight: Fonts.weight.bold,
    color: Colors.primary,
  },
  recordDate: {
    fontSize: Fonts.size.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  recordNotes: {
    fontSize: Fonts.size.sm,
    color: Colors.textSecondary,
    maxWidth: '50%',
    textAlign: 'right',
  },
});
