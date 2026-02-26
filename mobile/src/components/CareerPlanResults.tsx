import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Linking,
  Modal,
  Share,
} from 'react-native';
import {
  Target,
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  FileText,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Check,
  Clock,
  DollarSign,
  MapPin,
  Users,
  TrendingUp,
  Code,
  Lightbulb,
  Shield,
  Zap,
  Star,
  ArrowRight,
  X,
  Filter,
  GraduationCap,
  Play,
  BarChart3,
  Globe,
  Heart,
  Sparkles,
  Building,
} from 'lucide-react-native';
import { GlassCard } from './glass/GlassCard';
import { useTheme } from '../hooks/useTheme';
import { COLORS, SPACING, RADIUS, FONTS } from '../utils/constants';
import CareerPathCertifications from './CareerPathCertifications';
import type { CareerPlan } from '../types/career-plan';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CareerPlanResultsProps {
  plan: CareerPlan;
  timeline: string;
  onExportPDF?: () => void;
}

const sectionColors = {
  roles: { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  skills: { bg: 'rgba(34,197,94,0.2)', text: '#4ade80', border: 'rgba(34,197,94,0.3)' },
  skillsGuidance: { bg: 'rgba(16,185,129,0.2)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
  certs: { bg: 'rgba(234,179,8,0.2)', text: '#facc15', border: 'rgba(234,179,8,0.3)' },
  experience: { bg: 'rgba(168,85,247,0.2)', text: '#c084fc', border: 'rgba(168,85,247,0.3)' },
  events: { bg: 'rgba(236,72,153,0.2)', text: '#f472b6', border: 'rgba(236,72,153,0.3)' },
  timeline: { bg: 'rgba(249,115,22,0.2)', text: '#fb923c', border: 'rgba(249,115,22,0.3)' },
  resume: { bg: 'rgba(6,182,212,0.2)', text: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
  education: { bg: 'rgba(99,102,241,0.2)', text: '#818cf8', border: 'rgba(99,102,241,0.3)' },
  sources: { bg: 'rgba(107,114,128,0.2)', text: '#9ca3af', border: 'rgba(107,114,128,0.3)' },
};

type SectionKey = keyof typeof sectionColors;

const sectionConfig: Array<{
  key: SectionKey;
  title: string;
  modalTitle: string;
  Icon: any;
  getSubtitle: (plan: CareerPlan, stats: any) => string;
  isAvailable: (plan: CareerPlan) => boolean;
}> = [
  {
    key: 'roles', title: 'Target Roles', modalTitle: 'Target Roles',
    Icon: Target,
    getSubtitle: (p) => `${p.targetRoles?.length || 0} roles identified`,
    isAvailable: (p) => !!(p.targetRoles && p.targetRoles.length > 0),
  },
  {
    key: 'skills', title: 'Skills Analysis', modalTitle: 'Skills Analysis',
    Icon: Award,
    getSubtitle: (_, s) => `${s.skillsHave} skills you have, ${s.skillsToLearn} to build`,
    isAvailable: (p) => !!p.skillsAnalysis,
  },
  {
    key: 'skillsGuidance', title: 'Skills Guidance', modalTitle: 'Skills Development Guidance',
    Icon: Lightbulb,
    getSubtitle: (p) => `${(p.skillsGuidance?.softSkills?.length || 0) + (p.skillsGuidance?.hardSkills?.length || 0)} skills with development plans`,
    isAvailable: (p) => !!p.skillsGuidance,
  },
  {
    key: 'certs', title: 'Certifications', modalTitle: 'Recommended Certifications',
    Icon: Award,
    getSubtitle: (_, s) => `${s.certsCount} recommended certifications`,
    isAvailable: (p) => !!(p.certificationPath && p.certificationPath.length > 0),
  },
  {
    key: 'experience', title: 'Experience Plan', modalTitle: 'Experience Building Plan',
    Icon: Briefcase,
    getSubtitle: (_, s) => `${s.projectsCount} hands-on projects`,
    isAvailable: (p) => !!(p.experiencePlan && p.experiencePlan.length > 0),
  },
  {
    key: 'events', title: 'Networking Events', modalTitle: 'Networking Events',
    Icon: Calendar,
    getSubtitle: (_, s) => `${s.eventsCount} events & conferences`,
    isAvailable: (p) => !!(p.events && p.events.length > 0),
  },
  {
    key: 'timeline', title: 'Action Timeline', modalTitle: 'Your Action Timeline',
    Icon: Calendar,
    getSubtitle: (_, s) => `${s.weeksInPlan}-week plan with milestones`,
    isAvailable: (p) => !!p.timeline,
  },
  {
    key: 'resume', title: 'Resume & LinkedIn', modalTitle: 'Resume & LinkedIn Assets',
    Icon: FileText,
    getSubtitle: () => 'Headlines, summaries, bullets & ATS keywords',
    isAvailable: (p) => !!p.resumeAssets,
  },
  {
    key: 'education', title: 'Education Options', modalTitle: 'Education & Training Options',
    Icon: BookOpen,
    getSubtitle: (p) => `${p.educationOptions?.length || 0} training options`,
    isAvailable: (p) => !!(p.educationOptions && p.educationOptions.length > 0),
  },
  {
    key: 'sources', title: 'Research Sources', modalTitle: 'Research Sources',
    Icon: ExternalLink,
    getSubtitle: (p) => `${p.researchSources?.length || 0} citations`,
    isAvailable: (p) => !!(p.researchSources && p.researchSources.length > 0),
  },
];

export default function CareerPlanResults({ plan, timeline, onExportPDF }: CareerPlanResultsProps) {
  const { colors } = useTheme();
  const [activeModal, setActiveModal] = useState<SectionKey | null>(null);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
  const [expandedBullet, setExpandedBullet] = useState<number | null>(null);
  const [projectDifficultyFilter, setProjectDifficultyFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const stats = useMemo(() => {
    const targetRolesCount = plan.targetRoles?.length || 0;
    const certsCount = plan.certificationPath?.length || 0;
    const projectsCount = plan.experiencePlan?.length || 0;
    const eventsCount = plan.events?.length || 0;
    const weeksInPlan = plan.timeline?.twelveWeekPlan?.length || 0;
    const skillsToLearn = plan.skillsAnalysis?.needToBuild?.length || 0;
    const skillsHave = plan.skillsAnalysis?.alreadyHave?.length || 0;
    const salaryRange = plan.targetRoles?.[0]?.salaryRange || 'Competitive';
    return { targetRolesCount, certsCount, projectsCount, eventsCount, weeksInPlan, skillsToLearn, skillsHave, salaryRange };
  }, [plan]);

  const quickStart = useMemo(() => {
    const primaryRole = plan.targetRoles?.[0];
    const firstWeekTask = plan.timeline?.twelveWeekPlan?.[0];
    const topCert = plan.certificationPath?.[0];
    return { primaryRole, firstWeekTask, topCert };
  }, [plan]);

  const openUrl = (url: string) => {
    if (url) Linking.openURL(url).catch(() => {});
  };

  const handleExport = async () => {
    if (onExportPDF) {
      onExportPDF();
    } else {
      try {
        await Share.share({ message: `Career Plan - ${plan.targetRoles?.[0]?.title || 'My Plan'}`, title: 'Career Plan' });
      } catch {}
    }
  };

  // ========== MODAL CONTENT RENDERERS ==========

  const renderRolesModal = () => (
    <View style={s.modalBody}>
      {plan.targetRoles?.map((role, idx) => (
        <GlassCard key={idx} style={s.modalCard}>
          <Text style={[s.cardTitle, { color: colors.text }]}>{role.title}</Text>
          <Text style={[s.cardBody, { color: colors.textSecondary }]}>{role.whyAligned}</Text>
          <View style={s.row}>
            <View style={s.flex1}>
              <Text style={[s.label, { color: colors.textTertiary }]}>Growth Outlook:</Text>
              <Text style={[s.cardBody, { color: colors.text }]}>{role.growthOutlook}</Text>
            </View>
            <View style={s.flex1}>
              <Text style={[s.label, { color: colors.textTertiary }]}>Salary Range:</Text>
              <Text style={[s.cardBody, { color: colors.text }]}>{role.salaryRange}</Text>
            </View>
          </View>

          {role.typicalRequirements?.length > 0 && (
            <View style={s.mt12}>
              <Text style={[s.label, { color: colors.textTertiary }]}>Typical Requirements:</Text>
              {role.typicalRequirements.map((req, i) => (
                <View key={i} style={s.bulletRow}>
                  <Check color="#4ade80" size={14} style={s.bulletIcon} />
                  <Text style={[s.bulletText, { color: colors.text }]}>{req}</Text>
                </View>
              ))}
            </View>
          )}

          {role.bridgeRoles?.length > 0 && (
            <View style={[s.innerCard, { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }]}>
              <View style={s.rowCenter}>
                <TrendingUp color={colors.text} size={16} />
                <Text style={[s.innerTitle, { color: colors.text }]}>Bridge Roles (Stepping Stones)</Text>
              </View>
              {role.bridgeRoles.map((br, bi) => (
                <View key={bi} style={[s.innerItem, { backgroundColor: 'rgba(59,130,246,0.05)' }]}>
                  <Text style={[s.innerItemTitle, { color: colors.text }]}>{br.title}</Text>
                  <Text style={[s.smallText, { color: colors.textSecondary }]}>{br.whyGoodFit}</Text>
                  <Text style={[s.xsText, { color: colors.textTertiary }]}>Time to qualify: {br.timeToQualify}</Text>
                </View>
              ))}
            </View>
          )}

          {role.sourceCitations?.length > 0 && (
            <View style={s.mt12}>
              <Text style={[s.xsLabel, { color: colors.textTertiary }]}>Research Sources:</Text>
              {role.sourceCitations.map((url, i) => (
                <TouchableOpacity key={i} style={s.linkRow} onPress={() => openUrl(url)}>
                  <ExternalLink color="#60a5fa" size={12} />
                  <Text style={s.linkText} numberOfLines={2}>{url}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </GlassCard>
      ))}
    </View>
  );

  const renderSkillsModal = () => (
    <View style={s.modalBody}>
      {plan.skillsAnalysis?.alreadyHave?.length > 0 && (
        <View>
          <View style={s.sectionHeader}>
            <Check color="#4ade80" size={18} />
            <Text style={[s.sectionTitle, { color: colors.text }]}>Skills You Already Have</Text>
          </View>
          {plan.skillsAnalysis.alreadyHave.map((skill, idx) => (
            <GlassCard key={idx} style={s.modalCard}>
              <Text style={[s.cardTitle, { color: colors.text }]}>{skill.skillName}</Text>
              <Text style={[s.smallText, { color: colors.textSecondary }]}>
                <Text style={{ color: colors.textTertiary }}>How you have this: </Text>{skill.evidenceFromInput}
              </Text>
              <Text style={[s.smallText, { color: colors.textSecondary, marginTop: 4 }]}>
                <Text style={{ color: colors.textTertiary }}>Maps to target role: </Text>{skill.targetRoleMapping}
              </Text>
              {skill.resumeBullets?.length > 0 && (
                <View style={[s.innerCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                  <Text style={[s.xsLabel, { color: colors.textTertiary }]}>Resume bullets:</Text>
                  {skill.resumeBullets.map((b, i) => (
                    <Text key={i} style={[s.smallText, { color: colors.textSecondary }]}>• {b}</Text>
                  ))}
                </View>
              )}
            </GlassCard>
          ))}
        </View>
      )}

      {plan.skillsAnalysis?.canReframe?.length > 0 && (
        <View style={s.mt16}>
          <View style={s.sectionHeader}>
            <Sparkles color="#facc15" size={18} />
            <Text style={[s.sectionTitle, { color: colors.text }]}>Skills You Can Reframe</Text>
          </View>
          {plan.skillsAnalysis.canReframe.map((skill, idx) => (
            <GlassCard key={idx} style={s.modalCard}>
              <Text style={[s.cardTitle, { color: colors.text }]}>{skill.skillName}</Text>
              <View style={s.row}>
                <View style={s.flex1}>
                  <Text style={[s.label, { color: colors.textTertiary }]}>Current context:</Text>
                  <Text style={[s.smallText, { color: colors.textSecondary }]}>{skill.currentContext}</Text>
                </View>
                <View style={s.flex1}>
                  <Text style={[s.label, { color: colors.textTertiary }]}>Target context:</Text>
                  <Text style={[s.smallText, { color: colors.textSecondary }]}>{skill.targetContext}</Text>
                </View>
              </View>
              <View style={[s.innerCard, { backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.2)' }]}>
                <Text style={[s.xsLabel, { color: '#fde047' }]}>How to reframe:</Text>
                <Text style={[s.smallText, { color: colors.textSecondary }]}>{skill.howToReframe}</Text>
              </View>
              {skill.resumeBullets?.length > 0 && (
                <View style={[s.innerCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                  <Text style={[s.xsLabel, { color: colors.textTertiary }]}>Reframed resume bullets:</Text>
                  {skill.resumeBullets.map((b, i) => (
                    <Text key={i} style={[s.smallText, { color: colors.textSecondary }]}>• {b}</Text>
                  ))}
                </View>
              )}
            </GlassCard>
          ))}
        </View>
      )}

      {plan.skillsAnalysis?.needToBuild?.length > 0 && (
        <View style={s.mt16}>
          <View style={s.sectionHeader}>
            <TrendingUp color="#60a5fa" size={18} />
            <Text style={[s.sectionTitle, { color: colors.text }]}>Skills You Need to Build</Text>
          </View>
          {plan.skillsAnalysis.needToBuild.map((skill, idx) => (
            <GlassCard key={idx} style={s.modalCard}>
              <View style={s.rowSpaceBetween}>
                <Text style={[s.cardTitle, { color: colors.text, flex: 1 }]}>{skill.skillName}</Text>
                <View style={[s.badge, {
                  backgroundColor: skill.priority === 'critical' ? 'rgba(239,68,68,0.2)' : skill.priority === 'high' ? 'rgba(249,115,22,0.2)' : 'rgba(59,130,246,0.2)',
                }]}>
                  <Text style={[s.badgeText, {
                    color: skill.priority === 'critical' ? '#fca5a5' : skill.priority === 'high' ? '#fdba74' : '#93c5fd',
                  }]}>{skill.priority.toUpperCase()}</Text>
                </View>
              </View>
              <Text style={[s.smallText, { color: colors.textSecondary }]}>
                <Text style={{ color: colors.textTertiary }}>Why needed: </Text>{skill.whyNeeded}
              </Text>
              <View style={[s.innerCard, { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }]}>
                <Text style={[s.xsLabel, { color: '#93c5fd' }]}>How to build:</Text>
                <Text style={[s.smallText, { color: colors.textSecondary }]}>{skill.howToBuild}</Text>
              </View>
              <View style={s.rowCenter}>
                <Clock color={colors.textTertiary} size={12} />
                <Text style={[s.xsText, { color: colors.textTertiary, marginLeft: 4 }]}>Estimated time: {skill.estimatedTime}</Text>
              </View>
            </GlassCard>
          ))}
        </View>
      )}
    </View>
  );

  const renderSkillGuidanceItem = (skill: any, idx: number) => (
    <GlassCard key={idx} style={s.modalCard}>
      <View style={s.rowSpaceBetween}>
        <Text style={[s.cardTitle, { color: colors.text, flex: 1 }]}>{skill.skillName}</Text>
        <View style={s.rowCenter}>
          <View style={[s.badge, {
            backgroundColor: skill.importance === 'critical' ? 'rgba(239,68,68,0.2)' : skill.importance === 'high' ? 'rgba(249,115,22,0.2)' : 'rgba(59,130,246,0.2)',
          }]}>
            <Text style={[s.badgeText, {
              color: skill.importance === 'critical' ? '#fca5a5' : skill.importance === 'high' ? '#fdba74' : '#93c5fd',
            }]}>{skill.importance?.toUpperCase()}</Text>
          </View>
          <View style={[s.badge, { backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: 4 }]}>
            <Clock color={colors.textSecondary} size={10} />
            <Text style={[s.badgeText, { color: colors.textSecondary, marginLeft: 2 }]}>{skill.estimatedTime}</Text>
          </View>
        </View>
      </View>

      <View style={[s.innerCard, { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }]}>
        <Text style={[s.innerCardLabel, { color: '#93c5fd' }]}>Why This Skill Matters</Text>
        <Text style={[s.smallText, { color: colors.textSecondary }]}>{skill.whyNeeded}</Text>
      </View>

      <View style={[s.innerCard, { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' }]}>
        <Text style={[s.innerCardLabel, { color: '#86efac' }]}>How to Develop This Skill</Text>
        <Text style={[s.smallText, { color: colors.textSecondary }]}>{skill.howToImprove}</Text>
      </View>

      <View style={[s.innerCard, { backgroundColor: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.2)' }]}>
        <Text style={[s.innerCardLabel, { color: '#d8b4fe' }]}>Real-World Application</Text>
        <Text style={[s.smallText, { color: colors.textSecondary }]}>{skill.realWorldApplication}</Text>
      </View>

      {skill.resources?.length > 0 && (
        <View style={s.mt8}>
          <Text style={[s.innerCardLabel, { color: colors.text }]}>Learning Resources</Text>
          {skill.resources.map((url: string, i: number) => (
            <TouchableOpacity key={i} style={s.linkRow} onPress={() => openUrl(url)}>
              <ExternalLink color="#60a5fa" size={12} />
              <Text style={s.linkText} numberOfLines={2}>{url}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </GlassCard>
  );

  const renderSkillsGuidanceModal = () => (
    <View style={s.modalBody}>
      {plan.skillsGuidance?.skillDevelopmentStrategy && (
        <View style={[s.strategyBanner, { borderColor: 'rgba(168,85,247,0.2)' }]}>
          <View style={s.rowCenter}>
            <Zap color={colors.text} size={18} />
            <Text style={[s.sectionTitle, { color: colors.text, marginLeft: 8 }]}>Your Skills Development Strategy</Text>
          </View>
          <Text style={[s.cardBody, { color: colors.textSecondary, marginTop: 8 }]}>{plan.skillsGuidance.skillDevelopmentStrategy}</Text>
        </View>
      )}

      {plan.skillsGuidance?.softSkills?.length > 0 && (
        <View style={s.mt16}>
          <View style={s.sectionHeader}>
            <Heart color="#f472b6" size={18} />
            <Text style={[s.sectionTitle, { color: colors.text }]}>Essential Soft Skills ({plan.skillsGuidance.softSkills.length})</Text>
          </View>
          {plan.skillsGuidance.softSkills.map(renderSkillGuidanceItem)}
        </View>
      )}

      {plan.skillsGuidance?.hardSkills?.length > 0 && (
        <View style={s.mt16}>
          <View style={s.sectionHeader}>
            <Code color="#4ade80" size={18} />
            <Text style={[s.sectionTitle, { color: colors.text }]}>Essential Hard Skills ({plan.skillsGuidance.hardSkills.length})</Text>
          </View>
          {plan.skillsGuidance.hardSkills.map(renderSkillGuidanceItem)}
        </View>
      )}
    </View>
  );

  const renderCertsModal = () => (
    <View style={s.modalBody}>
      <CareerPathCertifications
        certifications={plan.certificationPath as any || []}
        certificationJourneySummary={plan.certificationJourneySummary}
      />
    </View>
  );

  const renderExperienceModal = () => {
    const filtered = (plan.experiencePlan || []).filter(
      p => projectDifficultyFilter === 'all' || p.difficultyLevel?.toLowerCase() === projectDifficultyFilter
    );

    return (
      <View style={s.modalBody}>
        {/* Difficulty Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
          <View style={s.rowCenter}>
            <Filter color={colors.textSecondary} size={14} />
            <Text style={[s.smallText, { color: colors.textSecondary, marginLeft: 4, marginRight: 8 }]}>Difficulty:</Text>
          </View>
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(level => {
            const isActive = projectDifficultyFilter === level;
            const count = level === 'all'
              ? plan.experiencePlan?.length || 0
              : (plan.experiencePlan || []).filter(p => p.difficultyLevel?.toLowerCase() === level).length;
            const activeBg = level === 'beginner' ? '#22c55e' : level === 'intermediate' ? '#eab308' : level === 'advanced' ? '#ef4444' : '#3b82f6';
            return (
              <TouchableOpacity
                key={level}
                style={[s.filterChip, { backgroundColor: isActive ? activeBg : 'rgba(255,255,255,0.06)' }]}
                onPress={() => setProjectDifficultyFilter(level)}
              >
                <Text style={[s.filterChipText, { color: isActive ? '#fff' : colors.textSecondary }]}>
                  {level === 'all' ? `All (${count})` : `${level.charAt(0).toUpperCase() + level.slice(1)} (${count})`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {filtered.map((project, idx) => {
          const isExpanded = expandedProject === idx;
          const diffColor = project.difficultyLevel?.toLowerCase() === 'beginner'
            ? { bg: 'rgba(34,197,94,0.2)', text: '#86efac' }
            : project.difficultyLevel?.toLowerCase() === 'intermediate'
            ? { bg: 'rgba(234,179,8,0.2)', text: '#fde047' }
            : { bg: 'rgba(239,68,68,0.2)', text: '#fca5a5' };

          return (
            <GlassCard key={idx} style={s.modalCard}>
              <TouchableOpacity onPress={() => setExpandedProject(isExpanded ? null : idx)}>
                <View style={s.rowWrap}>
                  <Text style={[s.cardTitle, { color: colors.text, marginRight: 6 }]}>{project.title}</Text>
                  <View style={[s.badge, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                    <Text style={[s.badgeText, { color: colors.text }]}>{project.type?.toUpperCase()}</Text>
                  </View>
                  <View style={[s.badge, { backgroundColor: diffColor.bg }]}>
                    <Text style={[s.badgeText, { color: diffColor.text }]}>{project.difficultyLevel?.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={[s.rowCenter, { marginTop: 6 }]}>
                  <Clock color={colors.textTertiary} size={12} />
                  <Text style={[s.xsText, { color: colors.textTertiary, marginLeft: 4 }]}>{project.timeCommitment}</Text>
                </View>
                {project.skillsDemonstrated?.length > 0 && (
                  <View style={[s.chipRow, { marginTop: 8 }]}>
                    {project.skillsDemonstrated.slice(0, 4).map((sk, i) => (
                      <View key={i} style={[s.chip, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                        <Text style={[s.chipText, { color: colors.textSecondary }]}>{sk}</Text>
                      </View>
                    ))}
                    {project.skillsDemonstrated.length > 4 && (
                      <Text style={[s.xsText, { color: colors.textTertiary }]}>+{project.skillsDemonstrated.length - 4} more</Text>
                    )}
                  </View>
                )}
                <ChevronDown color={colors.textSecondary} size={18} style={[s.chevron, isExpanded && s.chevronUp]} />
              </TouchableOpacity>

              {isExpanded && (
                <View style={s.mt12}>
                  <Text style={[s.innerCardLabel, { color: colors.text }]}>Project Description</Text>
                  <Text style={[s.smallText, { color: colors.textSecondary }]}>{project.description}</Text>

                  {project.skillsDemonstrated?.length > 0 && (
                    <View style={s.mt12}>
                      <Text style={[s.innerCardLabel, { color: colors.text }]}>Skills Demonstrated</Text>
                      <View style={s.chipRow}>
                        {project.skillsDemonstrated.map((sk, i) => (
                          <View key={i} style={[s.chip, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                            <Text style={[s.chipText, { color: colors.text }]}>{sk}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  {project.detailedTechStack?.length > 0 && (
                    <View style={s.mt12}>
                      <View style={s.rowCenter}>
                        <Code color={colors.text} size={14} />
                        <Text style={[s.innerCardLabel, { color: colors.text, marginLeft: 6 }]}>Tech Stack ({project.detailedTechStack.length})</Text>
                      </View>
                      {project.detailedTechStack.map((tech, ti) => (
                        <View key={ti} style={[s.innerCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                          <Text style={[s.innerItemTitle, { color: colors.text }]}>{tech.name}</Text>
                          <Text style={[s.xsText, { color: colors.textSecondary }]}>{tech.category}</Text>
                          <View style={[s.innerCard, { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }]}>
                            <Text style={[s.xsLabel, { color: '#93c5fd' }]}>Why this technology:</Text>
                            <Text style={[s.smallText, { color: colors.textSecondary }]}>{tech.whyThisTech}</Text>
                          </View>
                          {tech.learningResources?.length > 0 && tech.learningResources.map((url, ui) => (
                            <TouchableOpacity key={ui} style={s.linkRow} onPress={() => openUrl(url)}>
                              <ExternalLink color="#60a5fa" size={12} />
                              <Text style={s.linkText} numberOfLines={1}>Resource {ui + 1}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      ))}
                    </View>
                  )}

                  {project.architectureOverview && (
                    <View style={[s.innerCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                      <View style={s.rowCenter}>
                        <Shield color={colors.text} size={14} />
                        <Text style={[s.innerCardLabel, { color: colors.text, marginLeft: 6 }]}>Architecture Overview</Text>
                      </View>
                      <Text style={[s.smallText, { color: colors.textSecondary }]}>{project.architectureOverview}</Text>
                    </View>
                  )}

                  {project.stepByStepGuide?.length > 0 && (
                    <View style={s.mt12}>
                      <View style={s.rowCenter}>
                        <Lightbulb color={colors.text} size={14} />
                        <Text style={[s.innerCardLabel, { color: colors.text, marginLeft: 6 }]}>Step-by-Step Guide</Text>
                      </View>
                      {project.stepByStepGuide.map((step, si) => (
                        <View key={si} style={s.stepRow}>
                          <View style={s.stepNumber}>
                            <Text style={s.stepNumberText}>{si + 1}</Text>
                          </View>
                          <Text style={[s.smallText, { color: colors.textSecondary, flex: 1 }]}>{step}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {project.howToShowcase && (
                    <View style={[s.innerCard, { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' }]}>
                      <View style={s.rowCenter}>
                        <Star color="#86efac" size={14} />
                        <Text style={[s.innerCardLabel, { color: '#86efac', marginLeft: 6 }]}>Showcase Tips</Text>
                      </View>
                      <Text style={[s.smallText, { color: colors.textSecondary }]}>{project.howToShowcase}</Text>
                    </View>
                  )}

                  {project.githubExampleRepos?.length > 0 && (
                    <View style={s.mt8}>
                      <Text style={[s.innerCardLabel, { color: colors.text }]}>Similar Projects on GitHub</Text>
                      <View style={s.chipRow}>
                        {project.githubExampleRepos.map((repo, ri) => (
                          <TouchableOpacity key={ri} style={s.linkRow} onPress={() => openUrl(repo)}>
                            <ExternalLink color={colors.textSecondary} size={12} />
                            <Text style={[s.linkText, { color: colors.textSecondary }]}>Example {ri + 1}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </GlassCard>
          );
        })}
      </View>
    );
  };

  const renderEventsModal = () => (
    <View style={s.modalBody}>
      {plan.events?.map((event, idx) => {
        const isExpanded = expandedEvent === idx;
        return (
          <GlassCard key={idx} style={s.modalCard}>
            <TouchableOpacity onPress={() => setExpandedEvent(isExpanded ? null : idx)}>
              <View style={s.rowWrap}>
                <Text style={[s.cardTitle, { color: colors.text, marginRight: 6 }]}>{event.name}</Text>
                <View style={[s.badge, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                  <Text style={[s.badgeText, { color: colors.text }]}>{event.type?.toUpperCase()}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                  <Text style={[s.badgeText, { color: colors.text }]}>{event.scope?.toUpperCase()}</Text>
                </View>
                {event.beginnerFriendly && (
                  <View style={[s.badge, { backgroundColor: 'rgba(34,197,94,0.2)' }]}>
                    <Text style={[s.badgeText, { color: '#86efac' }]}>Beginner Friendly</Text>
                  </View>
                )}
                {event.virtualOptionAvailable && (
                  <View style={[s.badge, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                    <Text style={[s.badgeText, { color: '#93c5fd' }]}>Virtual Option</Text>
                  </View>
                )}
              </View>

              <View style={s.mt8}>
                <View style={s.infoRow}><Building color={colors.textSecondary} size={14} /><Text style={[s.smallText, { color: colors.textSecondary, marginLeft: 6 }]}>{event.organizer}</Text></View>
                <View style={s.infoRow}><Calendar color={colors.textSecondary} size={14} /><Text style={[s.smallText, { color: colors.textSecondary, marginLeft: 6 }]}>{event.dateOrSeason}</Text></View>
                <View style={s.infoRow}><MapPin color={colors.textSecondary} size={14} /><Text style={[s.smallText, { color: colors.textSecondary, marginLeft: 6 }]}>{event.location}</Text></View>
                {event.attendeeCount && <View style={s.infoRow}><Users color={colors.textSecondary} size={14} /><Text style={[s.smallText, { color: colors.textSecondary, marginLeft: 6 }]}>{event.attendeeCount}</Text></View>}
                <View style={s.infoRow}><DollarSign color={colors.textSecondary} size={14} /><Text style={[s.smallText, { color: colors.textSecondary, marginLeft: 6 }]}>{event.priceRange}</Text></View>
              </View>
              <ChevronDown color={colors.textSecondary} size={18} style={[s.chevron, isExpanded && s.chevronUp]} />
            </TouchableOpacity>

            {isExpanded && (
              <View style={s.mt12}>
                {event.targetAudience && (
                  <View style={[s.innerCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                    <Text style={[s.xsLabel, { color: colors.textTertiary }]}>Target Audience:</Text>
                    <Text style={[s.smallText, { color: colors.text }]}>{event.targetAudience}</Text>
                  </View>
                )}
                {event.whyAttend && (
                  <View style={[s.innerCard, { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }]}>
                    <Text style={[s.innerCardLabel, { color: '#93c5fd' }]}>Why Attend This Event</Text>
                    <Text style={[s.smallText, { color: colors.textSecondary }]}>{event.whyAttend}</Text>
                  </View>
                )}
                {event.keyTopics?.length > 0 && (
                  <View style={s.mt8}>
                    <Text style={[s.innerCardLabel, { color: colors.text }]}>Key Topics Covered</Text>
                    <View style={s.chipRow}>
                      {event.keyTopics.map((t, i) => (
                        <View key={i} style={[s.chip, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                          <Text style={[s.chipText, { color: colors.text }]}>{t}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {event.notableSpeakers?.length > 0 && (
                  <View style={s.mt8}>
                    <Text style={[s.innerCardLabel, { color: colors.text }]}>Notable Speakers/Companies</Text>
                    {event.notableSpeakers.map((sp, i) => (
                      <View key={i} style={s.bulletRow}>
                        <Check color="#4ade80" size={12} style={s.bulletIcon} />
                        <Text style={[s.smallText, { color: colors.textSecondary }]}>{sp}</Text>
                      </View>
                    ))}
                  </View>
                )}
                {event.registrationLink && (
                  <TouchableOpacity style={[s.linkButton, { backgroundColor: 'rgba(255,255,255,0.06)' }]} onPress={() => openUrl(event.registrationLink!)}>
                    <ExternalLink color={colors.text} size={14} />
                    <Text style={[s.linkButtonText, { color: colors.text }]}>Register for Event</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </GlassCard>
        );
      })}
    </View>
  );

  const renderTimelineModal = () => (
    <View style={s.modalBody}>
      {plan.timeline?.twelveWeekPlan?.length > 0 && (
        <View>
          <Text style={[s.sectionTitle, { color: colors.text, marginBottom: 12 }]}>12-Week Tactical Plan</Text>
          {plan.timeline.twelveWeekPlan.map((week, idx) => (
            <GlassCard key={idx} style={s.modalCard}>
              <View style={s.rowCenter}>
                <View style={s.weekBadge}>
                  <Text style={s.weekBadgeText}>{week.weekNumber}</Text>
                </View>
                <Text style={[s.cardTitle, { color: colors.text, marginLeft: 8 }]}>{week.milestone || `Week ${week.weekNumber}`}</Text>
              </View>
              {week.tasks?.length > 0 && (
                <View style={s.ml40}>
                  {week.tasks.map((task, ti) => (
                    <View key={ti} style={s.bulletRow}>
                      <Check color="#4ade80" size={14} style={s.bulletIcon} />
                      <Text style={[s.smallText, { color: colors.textSecondary }]}>{task}</Text>
                    </View>
                  ))}
                </View>
              )}
              {week.checkpoint && (
                <View style={[s.checkpointBadge, { marginLeft: 40 }]}>
                  <Text style={s.checkpointText}>Checkpoint: {week.checkpoint}</Text>
                </View>
              )}
            </GlassCard>
          ))}
        </View>
      )}

      {plan.timeline?.sixMonthPlan?.length > 0 && (
        <View style={s.mt16}>
          <Text style={[s.sectionTitle, { color: colors.text, marginBottom: 12 }]}>6-Month Strategic Phases</Text>
          {plan.timeline.sixMonthPlan.map((month, idx) => (
            <GlassCard key={idx} style={s.modalCard}>
              <View style={s.rowCenter}>
                <View style={s.monthBadge}>
                  <Text style={s.monthBadgeText}>M{month.monthNumber}</Text>
                </View>
                <View style={{ marginLeft: 8 }}>
                  <Text style={[s.cardTitle, { color: colors.text }]}>{month.phaseName}</Text>
                  <Text style={[s.xsText, { color: colors.textSecondary }]}>Month {month.monthNumber}</Text>
                </View>
              </View>
              {month.goals?.length > 0 && (
                <View style={s.ml40}>
                  <Text style={[s.label, { color: colors.textTertiary }]}>Goals:</Text>
                  {month.goals.map((g, gi) => (
                    <View key={gi} style={s.bulletRow}>
                      <Target color="#60a5fa" size={14} style={s.bulletIcon} />
                      <Text style={[s.smallText, { color: colors.textSecondary }]}>{g}</Text>
                    </View>
                  ))}
                </View>
              )}
              {month.deliverables?.length > 0 && (
                <View style={s.ml40}>
                  <Text style={[s.label, { color: colors.textTertiary }]}>Deliverables:</Text>
                  {month.deliverables.map((d, di) => (
                    <View key={di} style={s.bulletRow}>
                      <Check color="#4ade80" size={14} style={s.bulletIcon} />
                      <Text style={[s.smallText, { color: colors.textSecondary }]}>{d}</Text>
                    </View>
                  ))}
                </View>
              )}
            </GlassCard>
          ))}
        </View>
      )}

      {plan.timeline?.applyReadyCheckpoint && (
        <View style={s.applyReadyBanner}>
          <Text style={s.applyReadyTitle}>Apply-Ready Checkpoint</Text>
          <Text style={[s.cardBody, { color: colors.text }]}>{plan.timeline.applyReadyCheckpoint}</Text>
        </View>
      )}
    </View>
  );

  const renderResumeModal = () => (
    <View style={s.modalBody}>
      {/* Headline */}
      {plan.resumeAssets?.headline && (
        <GlassCard style={s.modalCard}>
          <Text style={[s.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Professional Headline</Text>
          <View style={[s.highlightBox, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
            <Text style={[s.cardTitle, { color: colors.text }]}>{plan.resumeAssets.headline}</Text>
          </View>
          {plan.resumeAssets.headlineExplanation && (
            <View style={[s.innerCard, { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }]}>
              <Text style={[s.innerCardLabel, { color: '#93c5fd' }]}>Why This Headline Works</Text>
              <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.resumeAssets.headlineExplanation}</Text>
            </View>
          )}
        </GlassCard>
      )}

      {/* Summary */}
      {plan.resumeAssets?.summary && (
        <GlassCard style={s.modalCard}>
          <Text style={[s.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Professional Summary</Text>
          <View style={[s.highlightBox, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
            <Text style={[s.cardBody, { color: colors.text }]}>{plan.resumeAssets.summary}</Text>
          </View>
          {plan.resumeAssets.summaryBreakdown && (
            <View style={[s.innerCard, { backgroundColor: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.2)' }]}>
              <Text style={[s.innerCardLabel, { color: '#d8b4fe' }]}>Sentence-by-Sentence Breakdown</Text>
              <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.resumeAssets.summaryBreakdown}</Text>
            </View>
          )}
          {plan.resumeAssets.summaryStrategy && (
            <View style={[s.innerCard, { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }]}>
              <Text style={[s.innerCardLabel, { color: '#93c5fd' }]}>Overall Strategy</Text>
              <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.resumeAssets.summaryStrategy}</Text>
            </View>
          )}
        </GlassCard>
      )}

      {/* Skills Grouped */}
      {plan.resumeAssets?.skillsGrouped?.length > 0 && (
        <GlassCard style={s.modalCard}>
          <Text style={[s.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Skills Section (Organized by Category)</Text>
          {plan.resumeAssets.skillsGrouped.map((group, idx) => (
            <View key={idx} style={[s.innerCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
              <View style={s.rowSpaceBetween}>
                <Text style={[s.innerItemTitle, { color: colors.text }]}>{group.category}</Text>
                <View style={[s.badge, {
                  backgroundColor: group.priority === 'core' ? 'rgba(239,68,68,0.2)' : group.priority === 'important' ? 'rgba(249,115,22,0.2)' : 'rgba(59,130,246,0.2)',
                }]}>
                  <Text style={[s.badgeText, {
                    color: group.priority === 'core' ? '#fca5a5' : group.priority === 'important' ? '#fdba74' : '#93c5fd',
                  }]}>{group.priority?.toUpperCase()}</Text>
                </View>
              </View>
              <View style={s.chipRow}>
                {group.skills?.map((sk, si) => (
                  <View key={si} style={[s.chip, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                    <Text style={[s.chipText, { color: colors.text }]}>{sk}</Text>
                  </View>
                ))}
              </View>
              <Text style={[s.xsText, { color: colors.textSecondary, marginTop: 4 }]}>
                <Text style={{ fontWeight: '600' }}>Why grouped: </Text>{group.whyGroupThese}
              </Text>
            </View>
          ))}
          {plan.resumeAssets.skillsOrderingRationale && (
            <View style={[s.innerCard, { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }]}>
              <Text style={[s.innerCardLabel, { color: '#93c5fd' }]}>Ordering Strategy</Text>
              <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.resumeAssets.skillsOrderingRationale}</Text>
            </View>
          )}
        </GlassCard>
      )}

      {/* Target Role Bullets */}
      {plan.resumeAssets?.targetRoleBullets?.length > 0 && (
        <GlassCard style={s.modalCard}>
          <Text style={[s.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Achievement Bullets for Resume</Text>
          {plan.resumeAssets.targetRoleBullets.map((bullet, idx) => (
            <View key={idx} style={[s.innerCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
              <TouchableOpacity onPress={() => setExpandedBullet(expandedBullet === idx ? null : idx)}>
                <View style={s.rowSpaceBetween}>
                  <Text style={[s.smallText, { color: colors.textSecondary, flex: 1, paddingRight: 8 }]}>{bullet.bulletText}</Text>
                  <ChevronDown color={colors.textSecondary} size={16} style={expandedBullet === idx ? s.chevronUp : undefined} />
                </View>
              </TouchableOpacity>
              {expandedBullet === idx && (
                <View style={s.mt8}>
                  {bullet.whyThisWorks && (
                    <View style={[s.innerCard, { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' }]}>
                      <Text style={[s.xsLabel, { color: '#86efac' }]}>Why This Works</Text>
                      <Text style={[s.xsText, { color: colors.textSecondary }]}>{bullet.whyThisWorks}</Text>
                    </View>
                  )}
                  {bullet.whatToEmphasize && (
                    <View style={[s.innerCard, { backgroundColor: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.2)' }]}>
                      <Text style={[s.xsLabel, { color: '#d8b4fe' }]}>Interview Talking Points</Text>
                      <Text style={[s.xsText, { color: colors.textSecondary }]}>{bullet.whatToEmphasize}</Text>
                    </View>
                  )}
                  {bullet.keywordsIncluded?.length > 0 && (
                    <View style={s.mt4}>
                      <Text style={[s.xsLabel, { color: colors.textTertiary }]}>ATS Keywords Included:</Text>
                      <View style={s.chipRow}>
                        {bullet.keywordsIncluded.map((kw, ki) => (
                          <View key={ki} style={[s.chip, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                            <Text style={[s.chipText, { color: '#93c5fd' }]}>{kw}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                  {bullet.structureExplanation && (
                    <View style={[s.innerCard, { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }]}>
                      <Text style={[s.xsLabel, { color: '#93c5fd' }]}>CAR/STAR Structure</Text>
                      <Text style={[s.xsText, { color: colors.textSecondary }]}>{bullet.structureExplanation}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))}
          {plan.resumeAssets.bulletsOverallStrategy && (
            <View style={[s.innerCard, { backgroundColor: 'rgba(234,179,8,0.08)', borderColor: 'rgba(234,179,8,0.2)' }]}>
              <Text style={[s.innerCardLabel, { color: '#fde047' }]}>How These Bullets Position You</Text>
              <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.resumeAssets.bulletsOverallStrategy}</Text>
            </View>
          )}
        </GlassCard>
      )}

      {/* Experience Reframing */}
      {plan.resumeAssets?.howToReframeCurrentRole && (
        <GlassCard style={s.modalCard}>
          <Text style={[s.sectionTitle, { color: colors.text, marginBottom: 8 }]}>How to Reframe Your Current Experience</Text>
          <View style={[s.innerCard, { backgroundColor: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.2)' }]}>
            <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.resumeAssets.howToReframeCurrentRole}</Text>
          </View>
          {plan.resumeAssets.experienceGapsToAddress?.length > 0 && (
            <View style={s.mt8}>
              <Text style={[s.innerCardLabel, { color: colors.text }]}>Addressing Experience Gaps</Text>
              {plan.resumeAssets.experienceGapsToAddress.map((gap, i) => (
                <View key={i} style={s.bulletRow}>
                  <Lightbulb color="#facc15" size={14} style={s.bulletIcon} />
                  <Text style={[s.smallText, { color: colors.textSecondary }]}>{gap}</Text>
                </View>
              ))}
            </View>
          )}
        </GlassCard>
      )}

      {/* Keywords & ATS */}
      {plan.resumeAssets?.keywordsForAts?.length > 0 && (
        <GlassCard style={s.modalCard}>
          <Text style={[s.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Keywords for ATS</Text>
          <View style={s.chipRow}>
            {plan.resumeAssets.keywordsForAts.map((kw, i) => (
              <View key={i} style={[s.chip, { backgroundColor: 'rgba(34,197,94,0.2)' }]}>
                <Text style={[s.chipText, { color: '#86efac', fontFamily: 'monospace' }]}>{kw}</Text>
              </View>
            ))}
          </View>
          {plan.resumeAssets.keywordPlacementStrategy && (
            <View style={[s.innerCard, { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)', marginTop: 12 }]}>
              <Text style={[s.innerCardLabel, { color: '#86efac' }]}>Keyword Placement Strategy</Text>
              <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.resumeAssets.keywordPlacementStrategy}</Text>
            </View>
          )}
        </GlassCard>
      )}

      {/* LinkedIn */}
      <GlassCard style={s.modalCard}>
        <View style={s.rowCenter}>
          <Globe color={colors.text} size={18} />
          <Text style={[s.sectionTitle, { color: colors.text, marginLeft: 8 }]}>LinkedIn Optimization</Text>
        </View>
        {plan.resumeAssets?.linkedinHeadline && (
          <View style={s.mt8}>
            <Text style={[s.innerCardLabel, { color: colors.text }]}>LinkedIn Headline</Text>
            <View style={[s.highlightBox, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              <Text style={[s.cardBody, { color: colors.text }]}>{plan.resumeAssets.linkedinHeadline}</Text>
            </View>
          </View>
        )}
        {plan.resumeAssets?.linkedinAboutSection && (
          <View style={s.mt8}>
            <Text style={[s.innerCardLabel, { color: colors.text }]}>LinkedIn About Section</Text>
            <View style={[s.highlightBox, { backgroundColor: 'rgba(255,255,255,0.04)', maxHeight: 200 }]}>
              <ScrollView nestedScrollEnabled>
                <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.resumeAssets.linkedinAboutSection}</Text>
              </ScrollView>
            </View>
          </View>
        )}
        {plan.resumeAssets?.linkedinStrategy && (
          <View style={[s.innerCard, { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }]}>
            <Text style={[s.innerCardLabel, { color: '#93c5fd' }]}>LinkedIn Optimization Strategy</Text>
            <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.resumeAssets.linkedinStrategy}</Text>
          </View>
        )}
      </GlassCard>

      {/* Cover Letter */}
      {plan.resumeAssets?.coverLetterTemplate && (
        <GlassCard style={s.modalCard}>
          <Text style={[s.sectionTitle, { color: colors.text, marginBottom: 8 }]}>Cover Letter Framework</Text>
          <View style={[s.highlightBox, { backgroundColor: 'rgba(255,255,255,0.04)', maxHeight: 250 }]}>
            <ScrollView nestedScrollEnabled>
              <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.resumeAssets.coverLetterTemplate}</Text>
            </ScrollView>
          </View>
          {plan.resumeAssets.coverLetterGuidance && (
            <View style={[s.innerCard, { backgroundColor: 'rgba(168,85,247,0.08)', borderColor: 'rgba(168,85,247,0.2)' }]}>
              <Text style={[s.innerCardLabel, { color: '#d8b4fe' }]}>How to Adapt This Template</Text>
              <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.resumeAssets.coverLetterGuidance}</Text>
            </View>
          )}
        </GlassCard>
      )}
    </View>
  );

  const renderEducationModal = () => (
    <View style={s.modalBody}>
      {plan.educationRecommendation && (
        <View style={[s.strategyBanner, { borderColor: 'rgba(99,102,241,0.3)' }]}>
          <View style={s.rowCenter}>
            <GraduationCap color="#818cf8" size={18} />
            <View style={{ marginLeft: 8, flex: 1 }}>
              <Text style={[s.innerCardLabel, { color: colors.text }]}>Our Recommendation</Text>
              <Text style={[s.smallText, { color: colors.textSecondary }]}>{plan.educationRecommendation}</Text>
            </View>
          </View>
        </View>
      )}

      {plan.educationOptions?.map((option, idx) => {
        const isBest = option.comparisonRank === 1;
        return (
          <GlassCard key={idx} style={[s.modalCard, isBest && { borderColor: 'rgba(99,102,241,0.5)', borderWidth: 2 }]}>
            <View style={s.rowWrap}>
              <Text style={[s.cardTitle, { color: colors.text, marginRight: 6 }]}>{option.name}</Text>
              <View style={[s.badge, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Text style={[s.badgeText, { color: colors.text }]}>{option.type?.toUpperCase()}</Text>
              </View>
              <View style={[s.badge, { backgroundColor: 'rgba(255,255,255,0.06)' }]}>
                <Text style={[s.badgeText, { color: colors.text }]}>{option.format?.toUpperCase()}</Text>
              </View>
              {isBest && (
                <View style={[s.badge, { backgroundColor: 'rgba(99,102,241,0.2)' }]}>
                  <Star color="#818cf8" size={10} />
                  <Text style={[s.badgeText, { color: '#a5b4fc', marginLeft: 2 }]}>Best for You</Text>
                </View>
              )}
            </View>

            <View style={[s.rowWrap, { marginTop: 6 }]}>
              <View style={[s.rowCenter, { marginRight: 12 }]}>
                <Clock color={colors.textSecondary} size={14} />
                <Text style={[s.smallText, { color: colors.textSecondary, marginLeft: 4 }]}>{option.duration}</Text>
              </View>
              <View style={[s.rowCenter, { marginRight: 12 }]}>
                <DollarSign color={colors.textSecondary} size={14} />
                <Text style={[s.smallText, { color: colors.textSecondary, marginLeft: 4 }]}>{option.costRange}</Text>
              </View>
              {option.timeCommitmentWeekly && (
                <View style={s.rowCenter}>
                  <Calendar color={colors.textSecondary} size={14} />
                  <Text style={[s.smallText, { color: colors.textSecondary, marginLeft: 4 }]}>{option.timeCommitmentWeekly}/week</Text>
                </View>
              )}
            </View>

            {option.description && <Text style={[s.cardBody, { color: colors.textSecondary, marginTop: 8 }]}>{option.description}</Text>}
            {option.whoItsBestFor && (
              <View style={[s.innerCard, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
                <Text style={[s.smallText, { color: colors.textSecondary, fontStyle: 'italic' }]}>{option.whoItsBestFor}</Text>
              </View>
            )}

            <View style={s.row}>
              {option.pros?.length > 0 && (
                <View style={[s.flex1, s.innerCard, { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' }]}>
                  <Text style={[s.innerCardLabel, { color: '#86efac' }]}>Pros</Text>
                  {option.pros.map((p, i) => (
                    <View key={i} style={s.bulletRow}>
                      <Check color="#4ade80" size={12} style={s.bulletIcon} />
                      <Text style={[s.xsText, { color: colors.textSecondary }]}>{p}</Text>
                    </View>
                  ))}
                </View>
              )}
              {option.cons?.length > 0 && (
                <View style={[s.flex1, s.innerCard, { backgroundColor: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)', marginLeft: 8 }]}>
                  <Text style={[s.innerCardLabel, { color: '#fca5a5' }]}>Cons</Text>
                  {option.cons.map((c, i) => (
                    <View key={i} style={s.bulletRow}>
                      <X color="#ef4444" size={12} style={s.bulletIcon} />
                      <Text style={[s.xsText, { color: colors.textSecondary }]}>{c}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {option.financingOptions && (
              <View style={[s.innerCard, { backgroundColor: 'rgba(59,130,246,0.08)', borderColor: 'rgba(59,130,246,0.2)' }]}>
                <View style={s.rowCenter}>
                  <DollarSign color="#93c5fd" size={12} />
                  <Text style={[s.innerCardLabel, { color: '#93c5fd', marginLeft: 4 }]}>Financing Options</Text>
                </View>
                <Text style={[s.smallText, { color: colors.textSecondary }]}>{option.financingOptions}</Text>
              </View>
            )}

            {option.employmentOutcomes && (
              <View style={[s.innerCard, { backgroundColor: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' }]}>
                <View style={s.rowCenter}>
                  <TrendingUp color="#86efac" size={12} />
                  <Text style={[s.innerCardLabel, { color: '#86efac', marginLeft: 4 }]}>Employment Outcomes</Text>
                </View>
                <Text style={[s.smallText, { color: colors.textSecondary }]}>{option.employmentOutcomes}</Text>
              </View>
            )}

            {option.officialLink && (
              <TouchableOpacity style={[s.linkButton, { backgroundColor: 'rgba(99,102,241,0.2)', borderColor: 'rgba(99,102,241,0.3)' }]} onPress={() => openUrl(option.officialLink!)}>
                <ExternalLink color="#a5b4fc" size={14} />
                <Text style={[s.linkButtonText, { color: '#a5b4fc' }]}>View Program</Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        );
      })}
    </View>
  );

  const renderSourcesModal = () => (
    <View style={s.modalBody}>
      {plan.researchSources?.map((source, idx) => (
        <TouchableOpacity key={idx} style={s.sourceRow} onPress={() => openUrl(source)}>
          <ExternalLink color={colors.textSecondary} size={14} style={{ flexShrink: 0 }} />
          <Text style={[s.smallText, { color: colors.textSecondary, marginLeft: 6, flex: 1 }]} numberOfLines={2}>{source}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const modalRenderers: Record<SectionKey, () => React.ReactElement> = {
    roles: renderRolesModal,
    skills: renderSkillsModal,
    skillsGuidance: renderSkillsGuidanceModal,
    certs: renderCertsModal,
    experience: renderExperienceModal,
    events: renderEventsModal,
    timeline: renderTimelineModal,
    resume: renderResumeModal,
    education: renderEducationModal,
    sources: renderSourcesModal,
  };

  const activeConfig = sectionConfig.find(c => c.key === activeModal);

  // ========== MAIN RENDER ==========
  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ===== QUICK START ===== */}
        <GlassCard style={s.quickStartCard}>
          <View style={s.quickStartHeader}>
            <View style={[s.iconCircle, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
              <Play color="#60a5fa" size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.quickStartTitle, { color: colors.text }]}>Quick Start</Text>
              <Text style={[s.xsText, { color: colors.textSecondary }]}>Your 3 most important next steps</Text>
            </View>
            <View style={s.startHereBadge}>
              <Text style={s.startHereText}>START HERE</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.quickStartScroll}>
            {quickStart.primaryRole && (
              <TouchableOpacity style={[s.quickStartItem, { borderColor: 'rgba(59,130,246,0.3)' }]} onPress={() => setActiveModal('roles')}>
                <View style={s.rowCenter}>
                  <View style={[s.iconCircleSmall, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
                    <Target color="#60a5fa" size={14} />
                  </View>
                  <Text style={[s.stepLabel, { color: '#60a5fa' }]}>STEP 1</Text>
                </View>
                <Text style={[s.quickStartItemTitle, { color: colors.text }]} numberOfLines={2}>{quickStart.primaryRole.title}</Text>
                <Text style={[s.xsText, { color: colors.textSecondary }]} numberOfLines={2}>{quickStart.primaryRole.whyAligned}</Text>
                <View style={[s.rowSpaceBetween, { marginTop: 6 }]}>
                  <Text style={[s.xsText, { color: '#4ade80' }]}>{quickStart.primaryRole.salaryRange}</Text>
                  <ArrowRight color={colors.textTertiary} size={14} />
                </View>
              </TouchableOpacity>
            )}

            {quickStart.firstWeekTask && (
              <TouchableOpacity style={[s.quickStartItem, { borderColor: 'rgba(249,115,22,0.3)' }]} onPress={() => setActiveModal('timeline')}>
                <View style={s.rowCenter}>
                  <View style={[s.iconCircleSmall, { backgroundColor: 'rgba(249,115,22,0.2)' }]}>
                    <Calendar color="#fb923c" size={14} />
                  </View>
                  <Text style={[s.stepLabel, { color: '#fb923c' }]}>WEEK 1</Text>
                </View>
                <Text style={[s.quickStartItemTitle, { color: colors.text }]} numberOfLines={2}>{quickStart.firstWeekTask.milestone || 'First Week Goals'}</Text>
                <Text style={[s.xsText, { color: colors.textSecondary }]} numberOfLines={2}>{quickStart.firstWeekTask.tasks?.[0] || 'Start your career transition'}</Text>
                <View style={[s.rowSpaceBetween, { marginTop: 6 }]}>
                  <Text style={[s.xsText, { color: '#fb923c' }]}>{quickStart.firstWeekTask.tasks?.length || 0} tasks</Text>
                  <ArrowRight color={colors.textTertiary} size={14} />
                </View>
              </TouchableOpacity>
            )}

            {quickStart.topCert && (
              <TouchableOpacity style={[s.quickStartItem, { borderColor: 'rgba(234,179,8,0.3)' }]} onPress={() => setActiveModal('certs')}>
                <View style={s.rowCenter}>
                  <View style={[s.iconCircleSmall, { backgroundColor: 'rgba(234,179,8,0.2)' }]}>
                    <Award color="#facc15" size={14} />
                  </View>
                  <Text style={[s.stepLabel, { color: '#facc15' }]}>PRIORITY CERT</Text>
                </View>
                <Text style={[s.quickStartItemTitle, { color: colors.text }]} numberOfLines={2}>{quickStart.topCert.name}</Text>
                <Text style={[s.xsText, { color: colors.textSecondary }]} numberOfLines={2}>{quickStart.topCert.whatItUnlocks || 'Recommended for your target role'}</Text>
                <View style={[s.rowSpaceBetween, { marginTop: 6 }]}>
                  <View style={[s.badge, {
                    backgroundColor: quickStart.topCert.level === 'foundation' ? 'rgba(34,197,94,0.2)' : quickStart.topCert.level === 'intermediate' ? 'rgba(234,179,8,0.2)' : 'rgba(239,68,68,0.2)',
                  }]}>
                    <Text style={[s.badgeText, {
                      color: quickStart.topCert.level === 'foundation' ? '#86efac' : quickStart.topCert.level === 'intermediate' ? '#fde047' : '#fca5a5',
                    }]}>{quickStart.topCert.level}</Text>
                  </View>
                  <ArrowRight color={colors.textTertiary} size={14} />
                </View>
              </TouchableOpacity>
            )}
          </ScrollView>
        </GlassCard>

        {/* ===== STATS SUMMARY ===== */}
        <GlassCard style={s.statsCard}>
          <View style={s.rowCenter}>
            <BarChart3 color={colors.text} size={18} />
            <Text style={[s.cardTitle, { color: colors.text, marginLeft: 8 }]}>Your Plan at a Glance</Text>
          </View>
          <View style={s.statsGrid}>
            {[
              { val: stats.targetRolesCount, label: 'Target Roles', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.3)', color: '#60a5fa' },
              { val: stats.certsCount, label: 'Certifications', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', color: '#facc15' },
              { val: stats.projectsCount, label: 'Projects', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.3)', color: '#c084fc' },
              { val: stats.eventsCount, label: 'Events', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.3)', color: '#f472b6' },
              { val: stats.skillsHave, label: 'Skills You Have', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', color: '#4ade80' },
              { val: stats.weeksInPlan, label: 'Week Plan', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', color: '#fb923c' },
            ].map((stat, i) => (
              <View key={i} style={[s.statBox, { backgroundColor: stat.bg, borderColor: stat.border }]}>
                <Text style={[s.statValue, { color: stat.color }]}>{stat.val}</Text>
                <Text style={[s.statLabel, { color: colors.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
          <View style={s.salaryBar}>
            <DollarSign color="#4ade80" size={14} />
            <Text style={[s.smallText, { color: colors.textSecondary, marginLeft: 4 }]}>Target Salary Range: </Text>
            <Text style={[s.smallText, { color: '#4ade80', fontWeight: '600' }]}>{stats.salaryRange}</Text>
          </View>
        </GlassCard>

        {/* ===== VISUAL TIMELINE ===== */}
        {plan.timeline?.twelveWeekPlan?.length > 0 && (
          <GlassCard style={s.timelinePreview}>
            <View style={s.rowSpaceBetween}>
              <View style={s.rowCenter}>
                <Calendar color="#fb923c" size={18} />
                <Text style={[s.cardTitle, { color: colors.text, marginLeft: 8 }]}>12-Week Journey</Text>
              </View>
              <TouchableOpacity style={s.rowCenter} onPress={() => setActiveModal('timeline')}>
                <Text style={[s.xsText, { color: '#fb923c' }]}>View Full Timeline</Text>
                <ChevronRight color="#fb923c" size={12} />
              </TouchableOpacity>
            </View>
            <View style={s.progressBar}>
              <View style={[s.progressFill, { width: '0%' }]} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.weekMarkers}>
                {plan.timeline.twelveWeekPlan.slice(0, 6).map((w, i) => (
                  <View key={i} style={s.weekMarker}>
                    <View style={[s.weekDot, i === 0 && s.weekDotActive]} />
                    <Text style={[s.xsText, { color: colors.textTertiary }]}>W{w.weekNumber}</Text>
                  </View>
                ))}
                <View style={s.weekMarker}>
                  <View style={[s.weekDot, { backgroundColor: 'rgba(34,197,94,0.3)' }]} />
                  <Text style={[s.xsText, { color: '#4ade80' }]}>Goal</Text>
                </View>
              </View>
            </ScrollView>
            <View style={s.thisWeekBanner}>
              <Star color="#fb923c" size={14} />
              <Text style={[s.xsText, { color: colors.textSecondary, marginLeft: 6, flex: 1 }]}>
                <Text style={{ color: '#fb923c', fontWeight: '600' }}>This week: </Text>
                {plan.timeline.twelveWeekPlan[0]?.milestone || plan.timeline.twelveWeekPlan[0]?.tasks?.[0] || 'Start your journey'}
              </Text>
            </View>
          </GlassCard>
        )}

        {/* ===== SECTION GRID ===== */}
        <View style={s.sectionGrid}>
          {sectionConfig.filter(c => c.isAvailable(plan)).map(({ key, title, Icon, getSubtitle }) => {
            const color = sectionColors[key];
            return (
              <TouchableOpacity key={key} style={s.sectionCard} onPress={() => setActiveModal(key)} activeOpacity={0.7}>
                <GlassCard style={s.sectionCardInner}>
                  <View style={s.rowCenter}>
                    <View style={[s.sectionIcon, { backgroundColor: color.bg }]}>
                      <Icon color={color.text} size={20} />
                    </View>
                    <Text style={[s.sectionCardTitle, { color: colors.text }]}>{title}</Text>
                  </View>
                  <Text style={[s.xsText, { color: colors.textSecondary, marginTop: 4 }]} numberOfLines={2}>{getSubtitle(plan, stats)}</Text>
                  <View style={[s.rowCenter, { marginTop: 8 }]}>
                    <Text style={[s.xsText, { color: color.text }]}>View Details</Text>
                    <ChevronRight color={color.text} size={14} />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ===== EXPORT ===== */}
        <GlassCard style={s.exportCard}>
          <View style={s.rowSpaceBetween}>
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { color: colors.text }]}>Export Your Plan</Text>
              <Text style={[s.xsText, { color: colors.textSecondary }]}>Share this career plan</Text>
            </View>
            <TouchableOpacity style={s.exportButton} onPress={handleExport}>
              <ExternalLink color={colors.text} size={16} />
              <Text style={[s.exportButtonText, { color: colors.text }]}>Share</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* ===== MODAL ===== */}
      <Modal visible={!!activeModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setActiveModal(null)}>
        <View style={[s.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[s.modalHeader, { backgroundColor: colors.background, borderBottomColor: colors.glassBorder }]}>
            <Text style={[s.modalTitle, { color: colors.text }]} numberOfLines={1}>{activeConfig?.modalTitle}</Text>
            <TouchableOpacity style={s.modalClose} onPress={() => { setActiveModal(null); setExpandedProject(null); setExpandedEvent(null); setExpandedBullet(null); }}>
              <X color={colors.textSecondary} size={22} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={s.modalScroll} showsVerticalScrollIndicator={false}>
            {activeModal && modalRenderers[activeModal]()}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

// ========== STYLES ==========
const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.md },

  // Quick Start
  quickStartCard: { marginBottom: SPACING.md },
  quickStartHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  quickStartTitle: { fontSize: 18, fontWeight: '700' },
  quickStartScroll: { marginTop: 4 },
  quickStartItem: {
    width: SCREEN_WIDTH * 0.6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginRight: SPACING.sm,
  },
  quickStartItemTitle: { fontSize: 14, fontWeight: '600', marginTop: 8, marginBottom: 4 },
  stepLabel: { fontSize: 10, fontWeight: '700', marginLeft: 6 },
  startHereBadge: { backgroundColor: 'rgba(34,197,94,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  startHereText: { color: '#86efac', fontSize: 9, fontWeight: '700' },

  // Stats
  statsCard: { marginBottom: SPACING.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  statBox: {
    width: '31%',
    marginRight: '2%',
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 2 },
  salaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: 'rgba(34,197,94,0.06)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.2)',
    marginTop: 8,
  },

  // Timeline Preview
  timelinePreview: { marginBottom: SPACING.md },
  progressBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, marginTop: 12, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: '#fb923c' },
  weekMarkers: { flexDirection: 'row', marginTop: 8, paddingBottom: 4 },
  weekMarker: { alignItems: 'center', marginRight: 24 },
  weekDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.12)', marginBottom: 4 },
  weekDotActive: { backgroundColor: '#fb923c' },
  thisWeekBanner: {
    flexDirection: 'row', alignItems: 'center', padding: 8,
    backgroundColor: 'rgba(249,115,22,0.08)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.2)',
    borderRadius: RADIUS.md, marginTop: 8,
  },

  // Section Grid
  sectionGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  sectionCard: { width: '50%', padding: 4, marginBottom: 4 },
  sectionCardInner: { minHeight: 120 },
  sectionIcon: { width: 36, height: 36, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  sectionCardTitle: { fontSize: 14, fontWeight: '700', flex: 1 },

  // Export
  exportCard: { marginTop: SPACING.sm },
  exportButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.md },
  exportButtonText: { fontSize: 13, fontWeight: '600', marginLeft: 6 },

  // Modal
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.md, paddingTop: SPACING.lg, paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', flex: 1 },
  modalClose: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  modalScroll: { paddingBottom: 40 },
  modalBody: { padding: SPACING.md },
  modalCard: { marginBottom: SPACING.sm },

  // Shared
  row: { flexDirection: 'row', marginTop: 8 },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  rowSpaceBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowWrap: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  flex1: { flex: 1 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  ml40: { marginLeft: 40 },

  iconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  iconCircleSmall: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardBody: { fontSize: 13, lineHeight: 20, marginTop: 4 },
  label: { fontSize: 11, fontWeight: '500', marginBottom: 2 },
  smallText: { fontSize: 12, lineHeight: 18 },
  xsText: { fontSize: 11 },
  xsLabel: { fontSize: 10, fontWeight: '600', marginBottom: 4 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },

  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText: { fontSize: 9, fontWeight: '600' },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  chipText: { fontSize: 11 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  bulletIcon: { marginTop: 2, marginRight: 6, flexShrink: 0 },
  bulletText: { fontSize: 12, lineHeight: 18, flex: 1 },

  innerCard: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: RADIUS.md, padding: 12, marginTop: 8 },
  innerTitle: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  innerItemTitle: { fontSize: 13, fontWeight: '600' },
  innerItem: { borderRadius: RADIUS.sm, padding: 10, marginTop: 6 },
  innerCardLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },

  linkRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 },
  linkText: { fontSize: 11, color: '#60a5fa', marginLeft: 4, flex: 1, textDecorationLine: 'underline' },
  linkButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginTop: 8, alignSelf: 'flex-start' },
  linkButtonText: { fontSize: 12, fontWeight: '500', marginLeft: 6 },

  highlightBox: { borderRadius: RADIUS.md, padding: 12, marginTop: 4 },

  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },

  chevron: { position: 'absolute', right: 0, top: 4 },
  chevronUp: { transform: [{ rotate: '180deg' }] },

  filterRow: { marginBottom: 12 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6 },
  filterChipText: { fontSize: 11, fontWeight: '500' },

  weekBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  weekBadgeText: { fontSize: 12, fontWeight: '600', color: '#fff' },

  monthBadge: { width: 40, height: 40, borderRadius: RADIUS.md, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  monthBadgeText: { fontSize: 13, fontWeight: '600', color: '#fff' },

  checkpointBadge: { backgroundColor: 'rgba(34,197,94,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: RADIUS.md, marginTop: 8, alignSelf: 'flex-start' },
  checkpointText: { fontSize: 10, color: '#86efac' },

  applyReadyBanner: { backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 2, borderColor: 'rgba(34,197,94,0.4)', borderRadius: RADIUS.lg, padding: SPACING.md, alignItems: 'center', marginTop: 16 },
  applyReadyTitle: { fontSize: 16, fontWeight: '700', color: '#86efac', marginBottom: 6 },

  strategyBanner: { borderWidth: 1, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: 12, backgroundColor: 'rgba(168,85,247,0.06)' },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 6, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.sm, padding: 10 },
  stepNumber: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(168,85,247,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 },
  stepNumberText: { fontSize: 11, fontWeight: '700', color: '#c084fc' },

  sourceRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.04)' },
});
