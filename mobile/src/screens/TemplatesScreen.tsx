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
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FileText, Check, Eye } from 'lucide-react-native';
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
  preview: string;
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Professional',
    category: 'Classic',
    description: 'Clean and professional design suitable for any industry',
    preview: 'https://via.placeholder.com/400x600/000000/FFFFFF?text=Professional',
  },
  {
    id: '2',
    name: 'Modern',
    category: 'Contemporary',
    description: 'Modern design with bold typography and clean layout',
    preview: 'https://via.placeholder.com/400x600/1F2937/FFFFFF?text=Modern',
  },
  {
    id: '3',
    name: 'Technical',
    category: 'Tech',
    description: 'Optimized for software engineers and technical roles',
    preview: 'https://via.placeholder.com/400x600/111827/FFFFFF?text=Technical',
  },
  {
    id: '4',
    name: 'Creative',
    category: 'Design',
    description: 'Eye-catching design for creative professionals',
    preview: 'https://via.placeholder.com/400x600/374151/FFFFFF?text=Creative',
  },
  {
    id: '5',
    name: 'Executive',
    category: 'Leadership',
    description: 'Sophisticated design for senior-level positions',
    preview: 'https://via.placeholder.com/400x600/4B5563/FFFFFF?text=Executive',
  },
  {
    id: '6',
    name: 'Minimal',
    category: 'Simple',
    description: 'Minimalist design that focuses on content',
    preview: 'https://via.placeholder.com/400x600/6B7280/FFFFFF?text=Minimal',
  },
];

const categories = ['All', 'Classic', 'Contemporary', 'Tech', 'Design', 'Leadership', 'Simple'];

export default function TemplatesScreen() {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [imageError, setImageError] = useState<{ [key: string]: boolean }>({});

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
                      {imageError[template.id] ? (
                        <FileText size={64} color={colors.textSecondary} />
                      ) : (
                        <Image
                          source={{ uri: template.preview }}
                          style={styles.previewImage}
                          resizeMode="cover"
                          onError={() => setImageError({ ...imageError, [template.id]: true })}
                        />
                      )}
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
                    {imageError[selectedTemplate] ? (
                      <View style={styles.previewPlaceholder}>
                        <FileText size={80} color={colors.textSecondary} />
                        <Text style={[styles.previewPlaceholderText, { color: colors.textSecondary }]}>
                          Preview not available
                        </Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: templates.find((t) => t.id === selectedTemplate)?.preview }}
                        style={styles.previewImageFull}
                        resizeMode="contain"
                        onError={() => setImageError({ ...imageError, [selectedTemplate]: true })}
                      />
                    )}
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
  previewImage: {
    width: '100%',
    height: '100%',
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
  previewImageFull: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    alignItems: 'center',
    gap: 12,
  },
  previewPlaceholderText: {
    ...TYPOGRAPHY.subhead,
  },
});
