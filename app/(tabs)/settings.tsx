import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { AppText as Text } from '@/components/app-text';
import { BorderRadius, Fonts, Spacing, Themes } from '@/constants/theme';
import { TextSizePreference, useTheme } from '@/src/context/ThemeContext';
import { notificationService } from '@/src/services';

const TEXT_LEVELS: TextSizePreference[] = [1, 2, 3, 4, 5];

export default function SettingsScreen() {
  const {
    theme, currentTheme, setCurrentTheme, fontPreference, setFontPreference,
    textLevel, setTextLevel, medicationReminders, setMedicationReminders,
    weightReminder, setWeightReminder,
  } = useTheme();
  const [updatingReminders, setUpdatingReminders] = useState(false);

  const changeMedicationReminders = async (enabled: boolean) => {
    if (updatingReminders) return;
    setUpdatingReminders(true);
    try {
      if (!enabled) await notificationService.cancelMedicationReminders();
      setMedicationReminders(enabled);
    } catch (error) {
      console.error('Erro ao atualizar lembretes:', error);
      Alert.alert('Não foi possível alterar', 'Tente novamente em instantes.');
    } finally {
      setUpdatingReminders(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Aparência</Text>

      <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>Tema</Text>
      <View style={styles.choiceRow} accessibilityRole="radiogroup">
        {([
          { key: 'primary' as const, label: 'Palma da Mão', color: Themes.primary.primary },
          { key: 'blue' as const, label: 'Azul', color: Themes.blue.primary },
          { key: 'secondary' as const, label: 'Verde', color: Themes.secondary.primary },
        ]).map((option) => {
          const selected = currentTheme === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setCurrentTheme(option.key)}
              accessibilityRole="radio"
              accessibilityLabel={`Tema ${option.label}`}
              accessibilityState={{ selected }}
              style={[styles.choice, { borderColor: selected ? theme.primary : theme.border, backgroundColor: selected ? theme.primary + '12' : theme.surface }]}
            >
              <View style={[styles.colorDot, { backgroundColor: option.color }]} />
              <Text style={[styles.choiceLabel, { color: theme.text }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>Fonte</Text>
      <View style={styles.choiceRow} accessibilityRole="radiogroup">
        {([
          { key: 'system' as const, label: 'Normal' },
          { key: 'opendyslexic' as const, label: 'Dislexia' },
        ]).map((option) => {
          const selected = fontPreference === option.key;
          return (
            <Pressable
              key={option.key}
              onPress={() => setFontPreference(option.key)}
              accessibilityRole="radio"
              accessibilityLabel={`Fonte ${option.label}`}
              accessibilityState={{ selected }}
              style={[styles.choice, { borderColor: selected ? theme.primary : theme.border, backgroundColor: selected ? theme.primary + '12' : theme.surface }]}
            >
              <Text style={[styles.choiceLabel, { color: theme.text }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.sizeCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.sizeCardTop}>
          <View style={[styles.sizeIcon, { backgroundColor: theme.primary + '12' }]}>
            <Ionicons name="text-outline" size={20} color={theme.primaryDark} />
          </View>
          <View style={styles.sizeTitleBlock}>
            <Text style={[styles.itemLabel, { color: theme.text }]}>Tamanho do texto</Text>
            <Text style={[styles.helper, { color: theme.textSecondary }]}>Ajuste de 1 a 5</Text>
          </View>
          <View style={[styles.levelPill, { backgroundColor: theme.primary + '12' }]}>
            <Text style={[styles.levelPillText, { color: theme.primaryDark }]}>{textLevel} de 5</Text>
          </View>
        </View>
        <View style={styles.stepsArea}>
          <View style={styles.levelRow} accessibilityRole="radiogroup">
            {TEXT_LEVELS.map((level) => {
              const selected = textLevel === level;
              const completed = level < textLevel;
              return (
                <React.Fragment key={level}>
                  <Pressable
                    onPress={() => setTextLevel(level)}
                    accessibilityRole="radio"
                    accessibilityLabel={`Tamanho do texto, nível ${level} de 5${level === 1 ? ', normal' : ''}`}
                    accessibilityState={{ selected }}
                    hitSlop={4}
                    style={[styles.levelButton, {
                      backgroundColor: selected ? theme.primary : completed ? theme.primary + '12' : theme.surface,
                      borderColor: selected || completed ? theme.primary : theme.border,
                    }]}
                  >
                    <Text style={[styles.levelText, { color: selected ? theme.textOnPrimary : completed ? theme.primaryDark : theme.text }]}>{level}</Text>
                  </Pressable>
                  {level < 5 && <View style={[styles.trackSegment, { backgroundColor: level < textLevel ? theme.primary : theme.border }]} />}
                </React.Fragment>
              );
            })}
          </View>
        </View>
        <View style={styles.rangeLabels}>
          <Text style={[styles.rangeLabel, { color: theme.textSecondary }]}>Normal</Text>
          <Text style={[styles.rangeLabel, { color: theme.textSecondary }]}>Maior</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Lembretes</Text>
      <View style={[styles.switchCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.switchCopy}>
          <Text style={[styles.itemLabel, { color: theme.text }]}>Medicações</Text>
          <Text style={[styles.helper, { color: theme.textSecondary }]}>Avisos das próximas doses</Text>
        </View>
        <Switch value={medicationReminders} onValueChange={(value) => { void changeMedicationReminders(value); }} disabled={updatingReminders} accessibilityLabel="Lembretes de medicações" trackColor={{ false: theme.border, true: theme.primaryLight }} thumbColor={medicationReminders ? theme.primary : theme.textLight} />
      </View>
      <View style={[styles.switchCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.switchCopy}>
          <Text style={[styles.itemLabel, { color: theme.text }]}>Peso</Text>
          <Text style={[styles.helper, { color: theme.textSecondary }]}>Aviso mensal na tela Peso</Text>
        </View>
        <Switch value={weightReminder} onValueChange={setWeightReminder} accessibilityLabel="Lembrete de peso" trackColor={{ false: theme.border, true: theme.primaryLight }} thumbColor={weightReminder ? theme.primary : theme.textLight} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre o AutoCuidado</Text>
      <View style={[styles.aboutCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.itemLabel, { color: theme.text }]}>Versão {Constants.expoConfig?.version ?? '1.0.0'}</Text>
        <Text style={[styles.helper, { color: theme.textSecondary }]}>As preferências ficam salvas neste aparelho. Os registros de saúde usam o serviço de dados configurado para o aplicativo.</Text>
        <View style={[styles.institutionalDivider, { borderTopColor: theme.border }]} />
        <View style={styles.institutionalLogos}>
          <Image
            source={require('../../assets/images/saude-na-palma-da-mao-logo.png')}
            style={styles.institutionalLogo}
            resizeMode="contain"
            accessibilityLabel="Saúde na Palma da Mão"
          />
          <Image
            source={require('../../assets/images/prefeitura-fortaleza-logo.png')}
            style={styles.institutionalLogo}
            resizeMode="contain"
            accessibilityLabel="Prefeitura de Fortaleza"
          />
        </View>
        <Image
          source={require('../../assets/images/pet-saude-logo.png')}
          style={styles.petSaudeLogo}
          resizeMode="contain"
          accessibilityLabel="PET-Saúde Informação e Saúde Digital"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.xxl, gap: Spacing.sm },
  sectionTitle: { fontFamily: Fonts.family.bold, fontSize: Fonts.size.lg, marginTop: Spacing.md, marginBottom: Spacing.xs },
  groupLabel: { fontFamily: Fonts.family.bold, fontSize: Fonts.size.sm, marginTop: Spacing.sm },
  choiceRow: { flexDirection: 'row', gap: Spacing.sm },
  choice: { flex: 1, minWidth: 0, minHeight: 52, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, borderWidth: 1, borderRadius: BorderRadius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
  choiceLabel: { fontFamily: Fonts.family.bold, fontSize: Fonts.size.xs, flexShrink: 1, textAlign: 'center' },
  colorDot: { width: 18, height: 18, borderRadius: 9, flexShrink: 0 },
  sizeCard: { padding: Spacing.md, borderWidth: 1, borderRadius: BorderRadius.md, gap: Spacing.md, marginTop: Spacing.md },
  sizeCardTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  sizeIcon: { width: 36, height: 36, borderRadius: BorderRadius.sm, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sizeTitleBlock: { flex: 1, minWidth: 0 },
  levelPill: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, flexShrink: 0 },
  levelPillText: { fontFamily: Fonts.family.bold, fontSize: Fonts.size.xs },
  helper: { fontFamily: Fonts.family.regular, fontSize: Fonts.size.xs, lineHeight: 20 },
  stepsArea: { minHeight: 44, justifyContent: 'center' },
  levelRow: { flexDirection: 'row', alignItems: 'center' },
  levelButton: { width: 40, height: 40, borderWidth: 2, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  trackSegment: { flex: 1, minWidth: 0, height: 3 },
  levelText: { fontFamily: Fonts.family.bold, fontSize: Fonts.size.sm },
  rangeLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeLabel: { fontFamily: Fonts.family.regular, fontSize: Fonts.size.xs },
  switchCard: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  switchCopy: { flex: 1, minWidth: 0 },
  itemLabel: { fontFamily: Fonts.family.bold, fontSize: Fonts.size.sm },
  aboutCard: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, gap: Spacing.xs },
  institutionalDivider: { borderTopWidth: 1, marginTop: Spacing.sm },
  institutionalLogos: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minWidth: 0 },
  institutionalLogo: { flex: 1, minWidth: 0, height: 105 },
  petSaudeLogo: { width: '100%', maxWidth: 220, height: 64, alignSelf: 'center', marginTop: Spacing.sm },
});
