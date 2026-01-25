import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookOpen, Trash2, X, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

interface StarStory {
  id: number;
  title: string;
  story_theme?: string;
  company_context?: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  key_themes?: string[];
  talking_points?: string[];
  created_at: string;
  updated_at: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function StarStoriesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [stories, setStories] = useState<StarStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [selectedStory, setSelectedStory] = useState<StarStory | null>(null);

  const loadStories = async () => {
    try {
      const result = await api.listStarStories();
      if (result.success && result.data) {
        const storyList = Array.isArray(result.data) ? result.data : (result.data.stories || []);
        setStories(storyList);
      } else {
        console.error('Failed to load STAR stories:', result.error);
        setStories([]);
      }
    } catch (error) {
      console.error('Error loading STAR stories:', error);
      setStories([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadStories();
  };

  const handleDelete = (storyId: number) => {
    Alert.alert(
      'Delete STAR Story',
      'Are you sure you want to delete this story? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(storyId);
            try {
              const result = await api.deleteStarStory(storyId);
              if (result.success) {
                setStories((prev) => prev.filter((s) => s.id !== storyId));
                if (selectedStory?.id === storyId) {
                  setSelectedStory(null);
                }
              } else {
                Alert.alert('Error', result.error || 'Failed to delete STAR story');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete STAR story');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStoryCard = ({ item }: { item: StarStory }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelectedStory(item)}
      accessibilityRole="button"
      accessibilityLabel={`STAR story: ${item.title || 'Untitled'}`}
      accessibilityHint={`Theme: ${item.story_theme || 'No theme'}. Created ${formatDate(item.created_at)}`}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <BookOpen color={COLORS.primary} size={24} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title || 'Untitled Story'}
          </Text>
          {item.story_theme && (
            <Text style={styles.cardTheme} numberOfLines={1}>
              {item.story_theme}
            </Text>
          )}
          <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          handleDelete(item.id);
        }}
        disabled={deletingId === item.id}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${item.title || 'story'}`}
        accessibilityHint="Permanently removes this STAR story"
        accessibilityState={{ disabled: deletingId === item.id, busy: deletingId === item.id }}
      >
        {deletingId === item.id ? (
          <ActivityIndicator size="small" color={COLORS.danger} />
        ) : (
          <Trash2 color={COLORS.danger} size={18} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <BookOpen color={COLORS.dark.textTertiary} size={64} />
      </View>
      <Text style={styles.emptyTitle}>No STAR Stories</Text>
      <Text style={styles.emptyText}>
        Create behavioral interview stories using the Situation, Task, Action, Result framework.
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => {
          // TODO: Navigate to create STAR story screen
          Alert.alert('Coming Soon', 'STAR story creation screen coming soon!');
        }}
      >
        <Plus color={COLORS.dark.background} size={20} />
        <Text style={styles.createButtonText}>Create Story</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading STAR stories...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>STAR Stories</Text>
        {stories.length > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              // TODO: Navigate to create STAR story screen
              Alert.alert('Coming Soon', 'STAR story creation screen coming soon!');
            }}
          >
            <Plus color={COLORS.primary} size={24} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={stories}
        renderItem={renderStoryCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      />

      {/* Story Detail Modal */}
      <Modal
        visible={selectedStory !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedStory(null)}
      >
        {selectedStory && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedStory(null)}
              >
                <X color={COLORS.dark.text} size={24} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>STAR Story</Text>
              <View style={styles.headerPlaceholder} />
            </View>

            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
              <Text style={styles.storyTitle}>{selectedStory.title || 'Untitled Story'}</Text>

              {selectedStory.story_theme && (
                <View style={styles.themeBadge}>
                  <Text style={styles.themeBadgeText}>{selectedStory.story_theme}</Text>
                </View>
              )}

              {selectedStory.company_context && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Company Context</Text>
                  <Text style={styles.sectionText}>{selectedStory.company_context}</Text>
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Situation</Text>
                <Text style={styles.sectionText}>{selectedStory.situation}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Task</Text>
                <Text style={styles.sectionText}>{selectedStory.task}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Action</Text>
                <Text style={styles.sectionText}>{selectedStory.action}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Result</Text>
                <Text style={styles.sectionText}>{selectedStory.result}</Text>
              </View>

              {selectedStory.key_themes && selectedStory.key_themes.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Key Themes</Text>
                  <View style={styles.tagsList}>
                    {selectedStory.key_themes.map((theme, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{theme}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {selectedStory.talking_points && selectedStory.talking_points.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>Talking Points</Text>
                  {selectedStory.talking_points.map((point, index) => (
                    <View key={index} style={styles.bulletPoint}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <Text style={styles.metaText}>
                  Created: {formatDate(selectedStory.created_at)}
                </Text>
                {selectedStory.updated_at !== selectedStory.created_at && (
                  <Text style={styles.metaText}>
                    Updated: {formatDate(selectedStory.updated_at)}
                  </Text>
                )}
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.dark.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.dark.text,
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    minHeight: 80,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dark.backgroundTertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.text,
    marginBottom: 2,
  },
  cardTheme: {
    fontSize: 13,
    color: COLORS.dark.textSecondary,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.dark.textTertiary,
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
  },
  emptyIcon: {
    marginBottom: SPACING.lg,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.dark.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.dark.text,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.background,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.dark.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dark.border,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.dark.text,
  },
  headerPlaceholder: {
    width: 44,
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    padding: SPACING.lg,
  },
  storyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.dark.text,
    marginBottom: SPACING.md,
  },
  themeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.dark.backgroundTertiary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  themeBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionText: {
    fontSize: 16,
    color: COLORS.dark.text,
    lineHeight: 24,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.dark.backgroundTertiary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.dark.text,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  bullet: {
    fontSize: 16,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.dark.text,
    lineHeight: 24,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.dark.textTertiary,
    marginBottom: 4,
  },
});
