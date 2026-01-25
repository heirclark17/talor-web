import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FileText, Upload, Trash2, Target, ChevronRight } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Resume {
  id: number;
  filename: string;
  name?: string;
  email?: string;
  skills_count: number;
  uploaded_at: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadResumes = async () => {
    try {
      const result = await api.getResumes();
      if (result.success) {
        const resumeList = Array.isArray(result.data) ? result.data : [];
        setResumes(resumeList);
      } else {
        console.error('Failed to load resumes:', result.error);
        setResumes([]);
      }
    } catch (error) {
      console.error('Error loading resumes:', error);
      setResumes([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadResumes();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadResumes();
  };

  const handleDelete = (resumeId: number) => {
    Alert.alert(
      'Delete Resume',
      'Are you sure you want to delete this resume? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(resumeId);
            try {
              const result = await api.deleteResume(resumeId);
              if (result.success) {
                setResumes((prev) => prev.filter((r) => r.id !== resumeId));
              } else {
                Alert.alert('Error', result.error || 'Failed to delete resume');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete resume');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleTailor = (resumeId: number) => {
    navigation.navigate('TailorResume', { resumeId });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderItem = ({ item }: { item: Resume }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <FileText color={COLORS.dark.text} size={24} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.filename} numberOfLines={1}>
            {item.filename}
          </Text>
          {item.name && (
            <Text style={styles.name}>{item.name}</Text>
          )}
          <Text style={styles.meta}>
            {item.skills_count} skills • {formatDate(item.uploaded_at)}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTailor(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Tailor ${item.filename} for a specific job`}
          accessibilityHint="Opens the resume tailoring screen"
        >
          <Target color={COLORS.primary} size={20} />
          <Text style={styles.actionText}>Tailor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
          disabled={deletingId === item.id}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.filename}`}
          accessibilityHint="Permanently removes this resume"
          accessibilityState={{ disabled: deletingId === item.id }}
        >
          {deletingId === item.id ? (
            <ActivityIndicator size="small" color={COLORS.danger} />
          ) : (
            <>
              <Trash2 color={COLORS.danger} size={20} />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <FileText color={COLORS.dark.textTertiary} size={64} />
      </View>
      <Text style={styles.emptyTitle}>No Resumes Yet</Text>
      <Text style={styles.emptyText}>
        Upload your first resume to get started with tailoring for specific jobs.
      </Text>
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={() => navigation.navigate('UploadResume')}
        accessibilityRole="button"
        accessibilityLabel="Upload your first resume"
        accessibilityHint="Opens document picker to select a resume file"
      >
        <Upload color={COLORS.dark.text} size={20} />
        <Text style={styles.uploadButtonText}>Upload Resume</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading resumes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Resumes</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('UploadResume')}
          accessibilityRole="button"
          accessibilityLabel="Upload new resume"
          accessibilityHint="Opens document picker to add another resume"
        >
          <Upload color={COLORS.dark.text} size={20} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={resumes}
        renderItem={renderItem}
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
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dark.glass,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
  },
  card: {
    backgroundColor: COLORS.dark.glass,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.dark.glassBorder,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  cardContent: {
    flex: 1,
  },
  filename: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.text,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    color: COLORS.dark.textSecondary,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: COLORS.dark.textTertiary,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.dark.backgroundTertiary,
    minHeight: 44,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  deleteText: {
    color: COLORS.danger,
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
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.dark.text,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    minHeight: 48,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark.background,
  },
});
