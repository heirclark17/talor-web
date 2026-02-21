/**
 * Not Found Screen
 * 404 error page with navigation options
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AlertCircle, Home, Search, FileText, MessageCircle } from 'lucide-react-native';
import { GlassCard } from '../components/glass/GlassCard';
import { GlassButton } from '../components/glass/GlassButton';

export default function NotFoundScreen() {
  const navigation = useNavigation();

  const quickLinks = [
    {
      title: 'Home',
      description: 'Go back to the homepage',
      icon: Home,
      action: () => navigation.navigate('Home' as never),
    },
    {
      title: 'Job Search',
      description: 'Find jobs to apply for',
      icon: Search,
      action: () => navigation.navigate('JobSearch' as never),
    },
    {
      title: 'Upload Resume',
      description: 'Upload and optimize your resume',
      icon: FileText,
      action: () => navigation.navigate('UploadResume' as never),
    },
    {
      title: 'Get Help',
      description: 'Contact support',
      icon: MessageCircle,
      action: () => navigation.navigate('Settings' as never),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Error Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <AlertCircle size={64} color="#EF4444" />
          </View>
        </View>

        {/* Error Message */}
        <View style={styles.messageContainer}>
          <Text style={styles.errorCode}>404</Text>
          <Text style={styles.title}>Page Not Found</Text>
          <Text style={styles.description}>
            Sorry, we couldn't find the page you're looking for. It might have been
            moved or doesn't exist.
          </Text>
        </View>

        {/* Home Button */}
        <GlassButton
          onPress={() => navigation.navigate('Home' as never)}
          variant="primary"
          style={styles.homeButton}
        >
          <Home size={20} color="#FFF" />
          <Text style={styles.homeButtonText}>Go to Home</Text>
        </GlassButton>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          <Text style={styles.quickLinksTitle}>Quick Links</Text>
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <GlassCard
                key={index}
                style={styles.quickLinkCard}
                onPress={link.action}
              >
                <View style={styles.quickLinkIcon}>
                  <Icon size={24} color="#3B82F6" />
                </View>
                <View style={styles.quickLinkContent}>
                  <Text style={styles.quickLinkTitle}>{link.title}</Text>
                  <Text style={styles.quickLinkDescription}>
                    {link.description}
                  </Text>
                </View>
              </GlassCard>
            );
          })}
        </View>
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
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  errorCode: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#EF4444',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 32,
  },
  homeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  quickLinks: {
    gap: 12,
  },
  quickLinksTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  quickLinkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  quickLinkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkContent: {
    flex: 1,
  },
  quickLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  quickLinkDescription: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
