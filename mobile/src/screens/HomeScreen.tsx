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
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FileText, Upload, Trash2, Target } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../api/client';
import { COLORS, SPACING, RADIUS, FONTS, ALPHA_COLORS } from '../utils/constants';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../context/ThemeContext';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';

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
  const { colors, isDark } = useTheme();
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
    <GlassCard style={styles.card} material="thin">
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
          <FileText color={colors.text} size={24} />
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.filename, { color: colors.text }]} numberOfLines={1}>
            {item.filename}
          </Text>
          {item.name && (
            <Text style={[styles.name, { color: colors.textSecondary }]}>{item.name}</Text>
          )}
          <Text style={[styles.meta, { color: colors.textTertiary }]}>
            {item.skills_count} skills {'\u2022'} {formatDate(item.uploaded_at)}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <GlassButton
          label="Tailor"
          variant="secondary"
          size="sm"
          icon={<Target color={COLORS.primary} size={18} />}
          onPress={() => handleTailor(item.id)}
          style={styles.actionButton}
        />

        <GlassButton
          label={deletingId === item.id ? '' : 'Delete'}
          variant="danger"
          size="sm"
          icon={
            deletingId === item.id ? (
              <ActivityIndicator size="small" color={COLORS.danger} />
            ) : (
              <Trash2 color={COLORS.danger} size={18} />
            )
          }
          onPress={() => handleDelete(item.id)}
          disabled={deletingId === item.id}
          style={styles.actionButton}
        />
      </View>
    </GlassCard>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <FileText color={colors.textTertiary} size={64} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Resumes Yet</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Upload your first resume to get started with tailoring for specific jobs.
      </Text>
      <GlassButton
        label="Upload Resume"
        variant="primary"
        size="lg"
        icon={<Upload color="#ffffff" size={20} />}
        onPress={() => navigation.navigate('UploadResume')}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading resumes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Resumes</Text>
        <GlassButton
          variant="secondary"
          size="sm"
          icon={<Upload color={colors.text} size={20} />}
          onPress={() => navigation.navigate('UploadResume')}
          style={styles.addButton}
        />
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    fontFamily: FONTS.regular,
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
    fontFamily: FONTS.extralight,
  },
  addButton: {
    width: 44,
    height: 44,
  },
  list: {
    padding: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: 120, // Extra space for floating tab bar
  },
  card: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  filename: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  name: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
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
    fontFamily: FONTS.extralight,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
});
