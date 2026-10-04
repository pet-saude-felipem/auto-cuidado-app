import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppText as Text } from '@/components/app-text';
import {
  View,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Card } from '@/components';
import { BorderRadius, Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { medicationService, weightService } from '@/src/services';
import { Medication, MedicationLog, WeightRecord } from '@/src/models';
import { parseLocalDate } from '@/src/utils/date';

type HistoryItem = {
  id: string;
  type: 'weight' | 'medication';
  title: string;
  subtitle: string;
  date: string;
  status?: string;
};

function buildHistory(
  weights: WeightRecord[],
  medications: Medication[],
  logs: MedicationLog[],
): { title: string; data: HistoryItem[] }[] {
  const items: HistoryItem[] = [];

  weights.forEach((r) => {
    items.push({
      id: `w-${r.id}`,
      type: 'weight',
      title: `${r.value} kg`,
      subtitle: r.notes ?? 'Registro de peso',
      date: r.date,
    });
  });

  // Logs de medicação vindos do PostgreSQL
  logs.forEach((log) => {
    const med = medications.find((m) => m.id === log.medicationId);
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
    const dateLabel = parseLocalDate(item.date).toLocaleDateString('pt-BR', {
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
  const { theme } = useTheme();
  const isWeight = item.type === 'weight';
  const icon = isWeight ? 'scale-outline' : 'medkit-outline';
  const accentColor = isWeight
    ? theme.primary
    : item.status === 'taken'
      ? theme.success
      : theme.error;

  return (
    <Card style={styles.itemCard}>
      <View style={styles.itemRow}>
        <View style={[styles.itemIcon, { backgroundColor: accentColor + '18' }]}>
          <Ionicons name={icon} size={21} color={accentColor} />
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>{item.subtitle}</Text>
          <View style={[styles.itemTypeBadge, { backgroundColor: accentColor + '18' }]}>
            <Text style={[styles.itemTypeText, { color: accentColor }]}>
              {isWeight ? 'Peso' : 'Medicação'}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [sections, setSections] = useState<{ title: string; data: HistoryItem[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [meds, logs, weights] = await Promise.all([
        medicationService.getAllMedications(),
        medicationService.getRecentLogs(),
        weightService.getAllRecords(),
      ]);
      setSections(buildHistory(weights, meds, logs));
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setSections([]);
      setError('Não foi possível carregar o histórico. Verifique a conexão com o servidor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { void loadData(); }, [loadData]));

  if (loading) {
    return (
      <View style={[styles.screen, styles.loadingScreen, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primaryDark} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {error && (
              <Pressable onPress={() => { void loadData(); }} accessibilityRole="button">
                <Text style={{ color: theme.error, marginBottom: Spacing.md }}>{error} Toque para tentar novamente.</Text>
              </Pressable>
            )}
            <View style={styles.pageIntro}>
              <Text style={[styles.pageTitle, { color: theme.text }]}>Sua jornada de cuidado</Text>
              <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
                Consulte suas pesagens e os registros de medicação.
              </Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: theme.primary }]}>
              <View style={styles.summaryText}>
                <Text style={[styles.summaryEyebrow, { color: theme.textOnPrimary }]}>HISTÓRICO</Text>
                <Text style={[styles.summaryTitle, { color: theme.textOnPrimary }]}>Acompanhe seu progresso</Text>
                <Text style={[styles.summarySubtitle, { color: theme.textOnPrimary }]}>Seus registros organizados por data.</Text>
              </View>
              <View style={styles.summaryIcon}>
                <Ionicons name="time-outline" size={24} color={theme.textOnPrimary} />
              </View>
            </View>
            <Text style={[styles.listTitle, { color: theme.text }]}>Registros por data</Text>
          </>
        }
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>{section.title}</Text>
        )}
        renderItem={({ item }) => <HistoryItemCard item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        SectionSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        ListEmptyComponent={
          error ? null : <Card style={styles.emptyCard}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.tagBackground }]}>
              <Ionicons name="time-outline" size={26} color={theme.primaryDark} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>Nenhum registro encontrado</Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Os registros de peso e medicação aparecerão aqui.
            </Text>
          </Card>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loadingScreen: { alignItems: 'center', justifyContent: 'center', padding: Spacing.lg },
  loadingText: { fontSize: Fonts.size.sm, fontFamily: Fonts.family.regular, marginTop: Spacing.sm },
  list: { padding: Spacing.md, paddingBottom: Spacing.xl },
  pageIntro: { marginBottom: Spacing.lg, minWidth: 0 },
  pageTitle: { fontSize: Fonts.size.lg, fontFamily: Fonts.family.bold, lineHeight: 26 },
  pageSubtitle: { fontSize: Fonts.size.sm, fontFamily: Fonts.family.regular, lineHeight: 22, marginTop: Spacing.xs },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    elevation: 3,
    shadowColor: '#123A39',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
  },
  summaryText: { flex: 1, minWidth: 0 },
  summaryEyebrow: { color: '#FFFFFFB8', fontSize: 10, letterSpacing: 1.1, fontFamily: Fonts.family.bold },
  summaryTitle: { color: '#FFFFFF', fontSize: Fonts.size.md, fontFamily: Fonts.family.bold, lineHeight: 24, marginTop: Spacing.sm },
  summarySubtitle: { color: '#FFFFFFD8', fontSize: Fonts.size.xs, fontFamily: Fonts.family.regular, lineHeight: 19, marginTop: Spacing.xs },
  summaryIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFFFFF20', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  listTitle: { fontSize: Fonts.size.md, fontFamily: Fonts.family.bold, marginBottom: Spacing.xs },
  sectionHeader: {
    fontSize: Fonts.size.sm,
    fontFamily: Fonts.family.bold,
    textTransform: 'capitalize',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    minWidth: 0,
  },
  itemCard: { padding: Spacing.md },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  itemIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemContent: { flex: 1, minWidth: 0 },
  itemTitle: { fontSize: Fonts.size.sm, fontFamily: Fonts.family.bold, lineHeight: 21 },
  itemSubtitle: { fontSize: Fonts.size.xs, fontFamily: Fonts.family.regular, lineHeight: 18, marginTop: 2 },
  itemTypeBadge: { borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 5, alignSelf: 'flex-start', marginTop: Spacing.sm },
  itemTypeText: { fontSize: 10, fontFamily: Fonts.family.bold, textAlign: 'center' },
  emptyCard: { alignItems: 'center', padding: Spacing.lg, marginTop: Spacing.md },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  emptyTitle: { fontSize: Fonts.size.md, fontFamily: Fonts.family.bold, textAlign: 'center' },
  emptyText: { fontSize: Fonts.size.sm, fontFamily: Fonts.family.regular, lineHeight: 22, textAlign: 'center', marginTop: Spacing.xs },
});
