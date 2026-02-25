import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import {
  X,
  Check,
  ImagePlus,
  Crown,
  Sparkles,
} from 'lucide-react-native';
import { GlassButton } from './GlassButton';
import {
  BACKGROUNDS,
  BACKGROUND_CATEGORIES,
  BackgroundCategory,
  Background,
  getBackgroundById,
} from '../../constants/backgrounds';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, FONTS, SPACING, RADIUS, ALPHA_COLORS } from '../../utils/constants';

interface BackgroundSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const THUMBNAIL_SIZE = (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.sm * 2) / 3;

export function BackgroundSelector({ visible, onClose }: BackgroundSelectorProps) {
  const {
    backgroundId,
    setBackgroundImage,
    customBackgroundUri,
    setCustomBackgroundUri,
    isDark,
    colors,
  } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<BackgroundCategory>('default');
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Get sorted categories
  const sortedCategories = Object.entries(BACKGROUND_CATEGORIES)
    .sort((a, b) => a[1].order - b[1].order)
    .map(([key]) => key as BackgroundCategory);

  // Get backgrounds for selected category
  const categoryBackgrounds = BACKGROUNDS.filter(
    (bg) => bg.category === selectedCategory
  );

  const handleSelectBackground = useCallback(
    (id: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPreviewId(id);
    },
    []
  );

  const handleConfirmSelection = useCallback(() => {
    if (previewId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setBackgroundImage(previewId);
      setCustomBackgroundUri(null);
      setPreviewId(null);
      onClose();
    }
  }, [previewId, setBackgroundImage, setCustomBackgroundUri, onClose]);

  const handlePickImage = useCallback(async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to set a custom background.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCustomBackgroundUri(result.assets[0].uri);
        setBackgroundImage('default');
        onClose();
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  }, [setCustomBackgroundUri, setBackgroundImage, onClose]);

  const handleCategoryChange = useCallback((category: BackgroundCategory) => {
    Haptics.selectionAsync();
    setSelectedCategory(category);
  }, []);

  const renderThumbnail = (background: Background) => {
    const isSelected = backgroundId === background.id && !customBackgroundUri && !previewId;
    const isPreview = previewId === background.id;
    const themeColors = isDark ? background.colors.dark : background.colors.light;

    return (
      <TouchableOpacity
        key={background.id}
        style={[
          styles.thumbnail,
          (isSelected || isPreview) && styles.thumbnailSelected,
          (isSelected || isPreview) && { borderColor: COLORS.primary },
        ]}
        onPress={() => handleSelectBackground(background.id)}
        activeOpacity={0.7}
      >
        {background.type === 'solid' && (
          <View
            style={[styles.thumbnailContent, { backgroundColor: themeColors[0] }]}
          />
        )}

        {(background.type === 'gradient' || background.type === 'animated') && (
          <LinearGradient
            colors={themeColors as [string, string, ...string[]]}
            style={styles.thumbnailContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}

        {background.type === 'pattern' && (
          <LinearGradient
            colors={themeColors as [string, string, ...string[]]}
            style={styles.thumbnailContent}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            {/* Pattern indicator */}
            <View style={styles.patternIndicator}>
              <Sparkles size={16} color={isDark ? '#ffffff' : '#000000'} />
            </View>
          </LinearGradient>
        )}

        {/* Selected checkmark */}
        {(isSelected || isPreview) && (
          <View style={styles.checkmark}>
            <Check size={16} color="#ffffff" />
          </View>
        )}

        {/* Premium badge */}
        {background.premium && (
          <View style={styles.premiumBadge}>
            <Crown size={10} color="#fbbf24" />
          </View>
        )}

        {/* Animated indicator */}
        {background.type === 'animated' && (
          <View style={styles.animatedBadge}>
            <Text style={styles.animatedText}>LIVE</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCustomPhotoThumbnail = () => {
    const isSelected = customBackgroundUri !== null;

    return (
      <TouchableOpacity
        style={[
          styles.thumbnail,
          isSelected && styles.thumbnailSelected,
          isSelected && { borderColor: COLORS.primary },
        ]}
        onPress={handlePickImage}
        activeOpacity={0.7}
      >
        {customBackgroundUri ? (
          <Image
            source={{ uri: customBackgroundUri }}
            style={styles.thumbnailContent}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.thumbnailContent,
              styles.addPhotoThumbnail,
              { backgroundColor: colors.glass, borderColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[10] },
            ]}
          >
            <ImagePlus size={24} color={colors.textSecondary} />
          </View>
        )}

        {isSelected && (
          <View style={styles.checkmark}>
            <Check size={16} color="#ffffff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Get preview background for live preview
  const previewBackground = previewId
    ? getBackgroundById(previewId)
    : customBackgroundUri
    ? null
    : getBackgroundById(backgroundId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Choose Background
          </Text>
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.glass }]}
            onPress={onClose}
          >
            <X size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Preview Area */}
        <View style={styles.previewArea}>
          <View style={[styles.previewContainer, { backgroundColor: colors.backgroundSecondary }]}>
            {previewBackground ? (
              previewBackground.type === 'gradient' ||
              previewBackground.type === 'animated' ? (
                <LinearGradient
                  colors={
                    (isDark
                      ? previewBackground.colors.dark
                      : previewBackground.colors.light) as [string, string, ...string[]]
                  }
                  style={styles.previewGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              ) : (
                <View
                  style={[
                    styles.previewGradient,
                    {
                      backgroundColor: isDark
                        ? previewBackground.colors.dark[0]
                        : previewBackground.colors.light[0],
                    },
                  ]}
                />
              )
            ) : customBackgroundUri ? (
              <Image
                source={{ uri: customBackgroundUri }}
                style={styles.previewGradient}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[styles.previewGradient, { backgroundColor: colors.background }]}
              />
            )}

            {/* Glass card preview */}
            <BlurView intensity={30} tint={isDark ? 'dark' : 'light'} style={[styles.previewCard, { borderColor: isDark ? ALPHA_COLORS.white[10] : ALPHA_COLORS.black[10] }]}>
              <Text style={[styles.previewCardTitle, { color: colors.text }]}>
                Preview Card
              </Text>
              <Text style={[styles.previewCardText, { color: colors.textSecondary }]}>
                This is how glass effects will look
              </Text>
            </BlurView>
          </View>

          {/* Preview name */}
          <Text style={[styles.previewName, { color: colors.textSecondary }]}>
            {previewId
              ? getBackgroundById(previewId)?.name || 'Unknown'
              : customBackgroundUri
              ? 'Custom Photo'
              : getBackgroundById(backgroundId)?.name || 'Default'}
          </Text>
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryTabs}
        >
          {sortedCategories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  {
                    backgroundColor: isActive
                      ? isDark
                        ? ALPHA_COLORS.primary.bg
                        : ALPHA_COLORS.primary.bgSubtle
                      : colors.glass,
                    borderColor: isActive
                      ? ALPHA_COLORS.primary.border
                      : isDark
                        ? ALPHA_COLORS.white[10]
                        : 'transparent',
                    borderWidth: 1,
                  },
                ]}
                onPress={() => handleCategoryChange(category)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    { color: isActive ? COLORS.primary : colors.textSecondary },
                  ]}
                >
                  {BACKGROUND_CATEGORIES[category].name}
                </Text>
              </TouchableOpacity>
            );
          })}
          {/* Custom tab */}
          <TouchableOpacity
            style={[
              styles.categoryTab,
              {
                backgroundColor: colors.glass,
                borderColor: isDark ? ALPHA_COLORS.white[10] : 'transparent',
                borderWidth: 1,
              },
            ]}
            onPress={handlePickImage}
          >
            <ImagePlus size={14} color={colors.textSecondary} />
            <Text style={[styles.categoryTabText, { color: colors.textSecondary, marginLeft: 4 }]}>
              Custom
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Background Grid */}
        <ScrollView
          style={styles.gridContainer}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {/* Show custom photo thumbnail in default category */}
          {selectedCategory === 'default' && renderCustomPhotoThumbnail()}

          {categoryBackgrounds.map((bg) => renderThumbnail(bg as Background))}
        </ScrollView>

        {/* Confirm Button */}
        {previewId && (
          <View style={styles.footer}>
            <GlassButton
              variant="primary"
              fullWidth
              onPress={handleConfirmSelection}
              icon={<Check size={20} color="#ffffff" />}
              label="Apply Background"
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

export default BackgroundSelector;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.semibold,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewArea: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  previewContainer: {
    height: 180,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  previewCard: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
  },
  previewCardTitle: {
    fontSize: 16,
    fontFamily: FONTS.semibold,
    marginBottom: 4,
  },
  previewCardText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  previewName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  categoryTabs: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryTabText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
  gridContainer: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    paddingBottom: SPACING.xxl,
  },
  thumbnail: {
    width: THUMBNAIL_SIZE,
    height: THUMBNAIL_SIZE,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderWidth: 2,
  },
  thumbnailContent: {
    flex: 1,
  },
  addPhotoThumbnail: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: ALPHA_COLORS.black[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: ALPHA_COLORS.danger.border,
  },
  animatedText: {
    fontSize: 8,
    fontFamily: FONTS.bold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  patternIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  footer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
});
