/**
 * Templates Screen
 * Browse and select resume templates
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { FileText, Check, Eye } from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';

const { width } = Dimensions.get('window');
const TEMPLATE_WIDTH = (width - 48) / 2; // 2 columns with padding

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
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const filteredTemplates =
    selectedCategory === 'All'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      navigation.navigate('ResumeBuilder' as never, { templateId: selectedTemplate } as never);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Resume Templates</Text>
          <Text style={styles.subtitle}>
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
                selectedCategory === category && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
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
                    {/* Template Preview */}
                    <View style={styles.templatePreview}>
                      <FileText size={64} color="#9CA3AF" />
                    </View>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <View style={styles.selectedBadge}>
                        <Check size={16} color="#FFF" />
                      </View>
                    )}

                    {/* Template Info */}
                    <View style={styles.templateInfo}>
                      <Text style={styles.templateName}>{template.name}</Text>
                      <Text style={styles.templateCategory}>{template.category}</Text>
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
                  <Text style={styles.detailsTitle}>
                    {templates.find((t) => t.id === selectedTemplate)!.name}
                  </Text>
                  <Text style={styles.detailsDescription}>
                    {templates.find((t) => t.id === selectedTemplate)!.description}
                  </Text>

                  <View style={styles.detailsActions}>
                    <GlassButton
                      variant="secondary"
                      style={styles.detailsButton}
                      onPress={() => {}}
                    >
                      <Eye size={18} color="#FFF" />
                      <Text style={styles.detailsButtonText}>Preview</Text>
                    </GlassButton>

                    <GlassButton
                      variant="primary"
                      style={styles.detailsButton}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  categoryChipText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
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
    borderColor: '#3B82F6',
  },
  templatePreview: {
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    padding: 12,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  templateCategory: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  detailsCard: {
    padding: 20,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  detailsDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
    marginBottom: 20,
  },
  detailsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  detailsButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButtonTextPrimary: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
