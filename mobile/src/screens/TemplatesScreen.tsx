/**
 * Templates Screen
 * Browse and select resume templates
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Check, Eye } from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';
import { COLORS, TYPOGRAPHY } from '../utils/constants';
import { useTheme } from '../hooks/useTheme';

const { width } = Dimensions.get('window');
const TEMPLATE_WIDTH = (width - 48) / 2;

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  accentColor: string;
  headerStyle: 'centered' | 'left' | 'sidebar' | 'bold' | 'split' | 'minimal';
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Professional',
    category: 'Classic',
    description: 'Clean and professional design suitable for any industry',
    accentColor: '#2563EB',
    headerStyle: 'centered',
  },
  {
    id: '2',
    name: 'Modern',
    category: 'Contemporary',
    description: 'Modern design with bold typography and clean layout',
    accentColor: '#7C3AED',
    headerStyle: 'left',
  },
  {
    id: '3',
    name: 'Technical',
    category: 'Tech',
    description: 'Optimized for software engineers and technical roles',
    accentColor: '#059669',
    headerStyle: 'sidebar',
  },
  {
    id: '4',
    name: 'Creative',
    category: 'Design',
    description: 'Eye-catching design for creative professionals',
    accentColor: '#DC2626',
    headerStyle: 'bold',
  },
  {
    id: '5',
    name: 'Executive',
    category: 'Leadership',
    description: 'Sophisticated design for senior-level positions',
    accentColor: '#1E293B',
    headerStyle: 'split',
  },
  {
    id: '6',
    name: 'Minimal',
    category: 'Simple',
    description: 'Minimalist design that focuses on content',
    accentColor: '#6B7280',
    headerStyle: 'minimal',
  },
];

// Rendered template preview - no network required, no images needed.
// Each style renders a distinct layout that visually represents the actual
// template design the user will get.
function TemplatePreviewRenderer({
  template,
  large = false,
}: {
  template: Template;
  large?: boolean;
}) {
  const s = large ? previewLarge : previewSmall;
  const accent = template.accentColor;
  const bg = '#FFFFFF';
  const textDark = '#1F2937';
  const textMid = '#6B7280';
  const textLight = '#D1D5DB';

  // Shared reusable line blocks
  const Line = ({
    width,
    height = 3,
    color = textLight,
    style,
  }: {
    width: string | number;
    height?: number;
    color?: string;
    style?: object;
  }) => (
    <View
      style={[
        { width: width as any, height, backgroundColor: color, borderRadius: 2 },
        style,
      ]}
    />
  );

  const Gap = ({ h }: { h: number }) => <View style={{ height: h }} />;

  // --- Professional: centered name header, section dividers ---
  if (template.headerStyle === 'centered') {
    return (
      <View style={[s.canvas, { backgroundColor: bg }]}>
        {/* Header */}
        <View style={[s.centeredHeader, { borderBottomColor: accent }]}>
          <View style={[s.nameLine, { backgroundColor: textDark, width: '60%' }]} />
          <Gap h={large ? 5 : 3} />
          <View style={[s.nameLine, { backgroundColor: textMid, width: '40%', height: large ? 5 : 3 }]} />
          <Gap h={large ? 4 : 2} />
          <Line width="70%" height={large ? 2 : 1} color={textMid} />
        </View>
        <Gap h={large ? 10 : 5} />
        {/* Section */}
        {[{ label: 60, lines: [80, 65, 72] }, { label: 55, lines: [75, 68] }].map((sec, si) => (
          <View key={si} style={s.section}>
            <View style={[s.sectionLabel, { width: `${sec.label}%`, backgroundColor: accent }]} />
            <Gap h={large ? 5 : 3} />
            {sec.lines.map((w, li) => (
              <React.Fragment key={li}>
                <Line width={`${w}%`} />
                <Gap h={large ? 4 : 2} />
              </React.Fragment>
            ))}
            <Gap h={large ? 6 : 3} />
          </View>
        ))}
      </View>
    );
  }

  // --- Modern: left-aligned bold name, colored left border on sections ---
  if (template.headerStyle === 'left') {
    return (
      <View style={[s.canvas, { backgroundColor: bg }]}>
        <View style={{ paddingHorizontal: large ? 16 : 8 }}>
          <View style={[s.nameLine, { backgroundColor: accent, width: '55%', height: large ? 12 : 7 }]} />
          <Gap h={large ? 4 : 2} />
          <Line width="45%" height={large ? 3 : 2} color={textMid} />
          <Gap h={large ? 4 : 2} />
          <Line width="70%" height={large ? 2 : 1} color={textLight} />
        </View>
        <Gap h={large ? 12 : 6} />
        {[{ w: [85, 70, 75] }, { w: [80, 65] }].map((sec, si) => (
          <View key={si} style={[s.section, { borderLeftWidth: large ? 3 : 2, borderLeftColor: accent, paddingLeft: large ? 10 : 5 }]}>
            <Line width="50%" height={large ? 4 : 2} color={textDark} />
            <Gap h={large ? 5 : 3} />
            {sec.w.map((w, li) => (
              <React.Fragment key={li}>
                <Line width={`${w}%`} />
                <Gap h={large ? 4 : 2} />
              </React.Fragment>
            ))}
            <Gap h={large ? 6 : 3} />
          </View>
        ))}
      </View>
    );
  }

  // --- Technical: dark sidebar left, content right ---
  if (template.headerStyle === 'sidebar') {
    return (
      <View style={[s.canvas, { backgroundColor: bg, flexDirection: 'row' }]}>
        {/* Sidebar */}
        <View style={[s.sidebar, { backgroundColor: accent }]}>
          <View style={[s.avatarCircle, { borderColor: 'rgba(255,255,255,0.4)' }]} />
          <Gap h={large ? 8 : 4} />
          {[50, 70, 55, 45, 60, 40].map((w, i) => (
            <React.Fragment key={i}>
              <Line width={`${w}%`} color="rgba(255,255,255,0.5)" height={large ? 3 : 2} />
              <Gap h={large ? 4 : 2} />
            </React.Fragment>
          ))}
        </View>
        {/* Content */}
        <View style={s.sidebarContent}>
          <Line width="80%" height={large ? 6 : 4} color={textDark} />
          <Gap h={large ? 3 : 2} />
          <Line width="60%" height={large ? 3 : 2} color={textMid} />
          <Gap h={large ? 10 : 5} />
          {[{ w: [90, 75, 80] }, { w: [85, 70] }].map((sec, si) => (
            <View key={si} style={{ marginBottom: large ? 8 : 4 }}>
              <Line width="55%" height={large ? 4 : 2} color={accent} />
              <Gap h={large ? 4 : 2} />
              {sec.w.map((w, li) => (
                <React.Fragment key={li}>
                  <Line width={`${w}%`} height={large ? 2 : 1} />
                  <Gap h={large ? 3 : 2} />
                </React.Fragment>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // --- Creative: bold full-width color header block ---
  if (template.headerStyle === 'bold') {
    return (
      <View style={[s.canvas, { backgroundColor: bg }]}>
        <View style={[s.boldHeader, { backgroundColor: accent }]}>
          <View style={[s.nameLine, { backgroundColor: 'rgba(255,255,255,0.9)', width: '65%', height: large ? 13 : 8 }]} />
          <Gap h={large ? 5 : 3} />
          <Line width="45%" height={large ? 3 : 2} color="rgba(255,255,255,0.6)" />
          <Gap h={large ? 3 : 2} />
          <Line width="70%" height={large ? 2 : 1} color="rgba(255,255,255,0.4)" />
        </View>
        <View style={{ padding: large ? 12 : 6 }}>
          {[{ w: [80, 68, 74] }, { w: [78, 62] }].map((sec, si) => (
            <View key={si} style={{ marginBottom: large ? 8 : 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: large ? 4 : 2 }}>
                <View style={{ width: large ? 8 : 5, height: large ? 8 : 5, borderRadius: 4, backgroundColor: accent, marginRight: large ? 5 : 3 }} />
                <Line width="40%" height={large ? 4 : 2} color={textDark} />
              </View>
              {sec.w.map((w, li) => (
                <React.Fragment key={li}>
                  <Line width={`${w}%`} />
                  <Gap h={large ? 3 : 2} />
                </React.Fragment>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // --- Executive: two-tone split header (dark top / light bottom) ---
  if (template.headerStyle === 'split') {
    return (
      <View style={[s.canvas, { backgroundColor: bg }]}>
        <View style={[s.splitHeader, { backgroundColor: accent }]}>
          <Line width="55%" height={large ? 12 : 7} color="#FFFFFF" />
          <Gap h={large ? 4 : 2} />
          <Line width="42%" height={large ? 3 : 2} color="rgba(255,255,255,0.6)" />
        </View>
        <View style={[s.splitSubHeader, { borderBottomColor: accent, borderBottomWidth: large ? 2 : 1 }]}>
          {[40, 55, 38].map((w, i) => (
            <Line key={i} width={`${w}%`} height={large ? 2 : 1} color={textMid} />
          ))}
        </View>
        <View style={{ padding: large ? 12 : 6 }}>
          {[{ w: [85, 70, 76] }, { w: [80, 65] }].map((sec, si) => (
            <View key={si} style={{ marginBottom: large ? 8 : 4 }}>
              <Line width="50%" height={large ? 4 : 2} color={accent} />
              <View style={{ height: large ? 2 : 1, backgroundColor: textLight, marginVertical: large ? 3 : 2 }} />
              {sec.w.map((w, li) => (
                <React.Fragment key={li}>
                  <Line width={`${w}%`} />
                  <Gap h={large ? 3 : 2} />
                </React.Fragment>
              ))}
            </View>
          ))}
        </View>
      </View>
    );
  }

  // --- Minimal: clean, lots of whitespace, thin lines ---
  return (
    <View style={[s.canvas, { backgroundColor: bg }]}>
      <View style={{ padding: large ? 16 : 8 }}>
        <Line width="50%" height={large ? 9 : 5} color={textDark} />
        <Gap h={large ? 5 : 3} />
        <Line width="35%" height={large ? 2 : 1} color={textMid} />
        <Gap h={large ? 2 : 1} />
        <Line width="60%" height={large ? 1 : 1} color={textLight} />
      </View>
      <View style={{ height: large ? 1 : 1, backgroundColor: textLight, marginHorizontal: large ? 16 : 8 }} />
      <View style={{ padding: large ? 16 : 8 }}>
        {[{ lw: 45, lines: [90, 78, 82, 70] }, { lw: 40, lines: [85, 72] }].map((sec, si) => (
          <View key={si} style={{ marginBottom: large ? 12 : 6 }}>
            <Line width={`${sec.lw}%`} height={large ? 2 : 1} color={textDark} />
            <Gap h={large ? 6 : 3} />
            {sec.lines.map((w, li) => (
              <React.Fragment key={li}>
                <Line width={`${w}%`} height={large ? 2 : 1} color={textLight} />
                <Gap h={large ? 4 : 2} />
              </React.Fragment>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

// Sizing tokens for small (grid card) vs large (modal preview)
const previewSmall = StyleSheet.create({
  canvas: { flex: 1, overflow: 'hidden' },
  centeredHeader: { alignItems: 'center', paddingVertical: 8, borderBottomWidth: 2, marginHorizontal: 8 },
  nameLine: { height: 8, borderRadius: 2 },
  section: { paddingHorizontal: 8, marginBottom: 4 },
  sectionLabel: { height: 3, borderRadius: 1 },
  sidebar: { width: '30%', padding: 6, alignItems: 'center' },
  avatarCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  sidebarContent: { flex: 1, padding: 6 },
  boldHeader: { paddingVertical: 12, paddingHorizontal: 8, alignItems: 'flex-start' },
  splitHeader: { paddingVertical: 10, paddingHorizontal: 8, alignItems: 'flex-start' },
  splitSubHeader: { paddingHorizontal: 8, paddingVertical: 5, gap: 3 },
});

const previewLarge = StyleSheet.create({
  canvas: { flex: 1, overflow: 'hidden' },
  centeredHeader: { alignItems: 'center', paddingVertical: 18, borderBottomWidth: 3, marginHorizontal: 16 },
  nameLine: { height: 14, borderRadius: 3 },
  section: { paddingHorizontal: 16, marginBottom: 8 },
  sectionLabel: { height: 5, borderRadius: 2 },
  sidebar: { width: '32%', padding: 12, alignItems: 'center' },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  sidebarContent: { flex: 1, padding: 12 },
  boldHeader: { paddingVertical: 22, paddingHorizontal: 16, alignItems: 'flex-start' },
  splitHeader: { paddingVertical: 18, paddingHorizontal: 16, alignItems: 'flex-start' },
  splitSubHeader: { paddingHorizontal: 16, paddingVertical: 10, gap: 5 },
});

const categories = ['All', 'Classic', 'Contemporary', 'Tech', 'Design', 'Leadership', 'Simple'];

export default function TemplatesScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const ds = useMemo(() => ({
    container: { backgroundColor: colors.background },
    title: { color: colors.text },
    subtitle: { color: colors.textSecondary },
    categoryChip: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
      borderWidth: isDark ? 1 : 0,
    },
    categoryChipText: { color: colors.textSecondary },
    templatePreview: { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
    templateName: { color: colors.text },
    templateCategory: { color: colors.textSecondary },
    detailsTitle: { color: colors.text },
    detailsDescription: { color: colors.textSecondary },
  }), [colors, isDark]);

  const filteredTemplates =
    selectedCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      (navigation as any).navigate('ResumeBuilder', { templateId: selectedTemplate });
    }
  };

  const handlePreview = () => {
    if (selectedTemplate) {
      setPreviewVisible(true);
    }
  };

  return (
    <SafeAreaView style={[styles.container, ds.container]} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, ds.title]}>Resume Templates</Text>
          <Text style={[styles.subtitle, ds.subtitle]}>
            Choose a professional template to get started
          </Text>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryScrollContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryChip,
                ds.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  ds.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Templates Grid */}
        <ScrollView
          style={styles.templatesScroll}
          contentContainerStyle={styles.templatesContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.templatesGrid}>
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate === template.id;
              return (
                <TouchableOpacity
                  key={template.id}
                  onPress={() => handleSelectTemplate(template.id)}
                  style={styles.templateCard}
                >
                  <GlassCard
                    style={[
                      styles.templateCardInner,
                      isSelected && styles.templateCardSelected,
                    ]}
                  >
                    <View style={[styles.templatePreview, ds.templatePreview]}>
                      <TemplatePreviewRenderer template={template} />
                    </View>

                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Check size={16} color="#FFF" />
                      </View>
                    )}

                    <View style={styles.templateInfo}>
                      <Text style={[styles.templateName, ds.templateName]}>
                        {template.name}
                      </Text>
                      <Text style={[styles.templateCategory, ds.templateCategory]}>
                        {template.category}
                      </Text>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected Template Details */}
          {selectedTemplate && (
            <GlassCard style={styles.detailsCard}>
              {templates.find((t) => t.id === selectedTemplate) && (
                <>
                  <Text style={[styles.detailsTitle, ds.detailsTitle]}>
                    {templates.find((t) => t.id === selectedTemplate)!.name}
                  </Text>
                  <Text style={[styles.detailsDescription, ds.detailsDescription]}>
                    {templates.find((t) => t.id === selectedTemplate)!.description}
                  </Text>

                  <View style={styles.detailsActions}>
                    <GlassButton
                      variant="secondary"
                      style={styles.previewButton}
                      onPress={handlePreview}
                    >
                      <Eye size={18} color={colors.text} />
                      <Text style={[styles.detailsButtonText, { color: colors.text }]}>
                        Preview
                      </Text>
                    </GlassButton>

                    <GlassButton
                      variant="primary"
                      style={styles.useButton}
                      onPress={handleUseTemplate}
                    >
                      <Text style={styles.detailsButtonTextPrimary}>
                        Use Template
                      </Text>
                    </GlassButton>
                  </View>
                </>
              )}
            </GlassCard>
          )}
        </ScrollView>
      </View>

      {/* Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setPreviewVisible(false)}
          />
          <View style={styles.modalContent}>
            <GlassCard style={styles.previewCard}>
              {selectedTemplate && (
                <>
                  <View style={styles.previewHeader}>
                    <Text style={[styles.previewTitle, { color: colors.text }]}>
                      {templates.find((t) => t.id === selectedTemplate)?.name}
                    </Text>
                    <TouchableOpacity onPress={() => setPreviewVisible(false)}>
                      <Text style={[styles.closeButton, { color: colors.text }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.previewImageContainer}>
                    {(() => {
                      const tmpl = templates.find((t) => t.id === selectedTemplate);
                      return tmpl ? (
                        <TemplatePreviewRenderer template={tmpl} large />
                      ) : null;
                    })()}
                  </View>
                </>
              )}
            </GlassCard>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 4,
    marginTop: -40,
  },
  title: {
    ...TYPOGRAPHY.title1,
    fontSize: 34,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.callout,
  },
  categoryScroll: {
    maxHeight: 60,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    ...TYPOGRAPHY.subhead,
    fontSize: 14,
  },
  categoryChipTextActive: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.headline.fontFamily,
  },
  templatesScroll: {
    flex: 1,
  },
  templatesContent: {
    padding: 16,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  templateCard: {
    width: TEMPLATE_WIDTH,
  },
  templateCardInner: {
    padding: 0,
    overflow: 'hidden',
  },
  templateCardSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  templatePreview: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    padding: 12,
  },
  templateName: {
    ...TYPOGRAPHY.h6,
    marginBottom: 4,
  },
  templateCategory: {
    ...TYPOGRAPHY.caption1,
  },
  detailsCard: {
    padding: 20,
  },
  detailsTitle: {
    ...TYPOGRAPHY.title3,
    marginBottom: 8,
  },
  detailsDescription: {
    ...TYPOGRAPHY.subhead,
    fontSize: 14,
    marginBottom: 20,
  },
  detailsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  previewButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  useButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  detailsButtonText: {
    ...TYPOGRAPHY.subhead,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.headline.fontFamily,
  },
  detailsButtonTextPrimary: {
    ...TYPOGRAPHY.subhead,
    fontSize: 14,
    fontFamily: TYPOGRAPHY.headline.fontFamily,
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
  },
  previewCard: {
    padding: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    ...TYPOGRAPHY.title3,
  },
  closeButton: {
    fontSize: 28,
    fontWeight: '300',
  },
  previewImageContainer: {
    height: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
