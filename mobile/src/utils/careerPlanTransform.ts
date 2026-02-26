import type { CareerPlan } from '../types/career-plan';

/**
 * Transform snake_case API response to camelCase CareerPlan.
 * Handles both camelCase and snake_case fields from the backend.
 */
export function transformApiResponse(raw: any): CareerPlan {
  if (!raw) return {} as CareerPlan;

  return {
    generatedAt: raw.generatedAt || raw.generated_at || new Date().toISOString(),
    version: raw.version || '1.0',
    profileSummary: raw.profileSummary || raw.profile_summary || '',
    targetRoles: (raw.targetRoles || raw.target_roles || []).map((r: any) => ({
      title: r.title || '',
      whyAligned: r.whyAligned || r.why_aligned || '',
      growthOutlook: r.growthOutlook || r.growth_outlook || '',
      salaryRange: r.salaryRange || r.salary_range || '',
      typicalRequirements: r.typicalRequirements || r.typical_requirements || [],
      bridgeRoles: (r.bridgeRoles || r.bridge_roles || []).map((b: any) => ({
        title: b.title || '',
        whyGoodFit: b.whyGoodFit || b.why_good_fit || '',
        timeToQualify: b.timeToQualify || b.time_to_qualify || '',
        keyGapsToClose: b.keyGapsToClose || b.key_gaps_to_close || [],
      })),
      sourceCitations: r.sourceCitations || r.source_citations || [],
    })),
    skillsAnalysis: (() => {
      const sa = raw.skillsAnalysis || raw.skills_analysis;
      if (!sa) return { alreadyHave: [], canReframe: [], needToBuild: [] };
      return {
        alreadyHave: (sa.alreadyHave || sa.already_have || []).map((s: any) => ({
          skillName: s.skillName || s.skill_name || '',
          evidenceFromInput: s.evidenceFromInput || s.evidence_from_input || '',
          targetRoleMapping: s.targetRoleMapping || s.target_role_mapping || '',
          resumeBullets: s.resumeBullets || s.resume_bullets || [],
        })),
        canReframe: (sa.canReframe || sa.can_reframe || []).map((s: any) => ({
          skillName: s.skillName || s.skill_name || '',
          currentContext: s.currentContext || s.current_context || '',
          targetContext: s.targetContext || s.target_context || '',
          howToReframe: s.howToReframe || s.how_to_reframe || '',
          resumeBullets: s.resumeBullets || s.resume_bullets || [],
        })),
        needToBuild: (sa.needToBuild || sa.need_to_build || []).map((s: any) => ({
          skillName: s.skillName || s.skill_name || '',
          whyNeeded: s.whyNeeded || s.why_needed || '',
          priority: s.priority || 'medium',
          howToBuild: s.howToBuild || s.how_to_build || '',
          estimatedTime: s.estimatedTime || s.estimated_time || '',
        })),
      };
    })(),
    skillsGuidance: (() => {
      const sg = raw.skillsGuidance || raw.skills_guidance;
      if (!sg) return { softSkills: [], hardSkills: [], skillDevelopmentStrategy: '' };
      const mapItem = (item: any) => ({
        skillName: item.skillName || item.skill_name || '',
        whyNeeded: item.whyNeeded || item.why_needed || '',
        howToImprove: item.howToImprove || item.how_to_improve || '',
        importance: item.importance || 'medium',
        estimatedTime: item.estimatedTime || item.estimated_time || '',
        resources: item.resources || [],
        realWorldApplication: item.realWorldApplication || item.real_world_application || '',
      });
      return {
        softSkills: (sg.softSkills || sg.soft_skills || []).map(mapItem),
        hardSkills: (sg.hardSkills || sg.hard_skills || []).map(mapItem),
        skillDevelopmentStrategy: sg.skillDevelopmentStrategy || sg.skill_development_strategy || '',
      };
    })(),
    certificationPath: (raw.certificationPath || raw.certification_path || []).map((c: any) => ({
      name: c.name || '',
      certifyingBody: c.certifyingBody || c.certifying_body || '',
      level: c.level || 'foundation',
      prerequisites: c.prerequisites || [],
      estStudyWeeks: c.estStudyWeeks || c.est_study_weeks || 0,
      estCostRange: c.estCostRange || c.est_cost_range || '',
      examDetails: {
        examCode: c.examDetails?.examCode || c.exam_details?.exam_code,
        passingScore: c.examDetails?.passingScore || c.exam_details?.passing_score,
        durationMinutes: c.examDetails?.durationMinutes || c.exam_details?.duration_minutes,
        numQuestions: c.examDetails?.numQuestions || c.exam_details?.num_questions,
        questionTypes: c.examDetails?.questionTypes || c.exam_details?.question_types,
      },
      officialLinks: c.officialLinks || c.official_links || [],
      whatItUnlocks: c.whatItUnlocks || c.what_it_unlocks || '',
      alternatives: c.alternatives || [],
      studyMaterials: (c.studyMaterials || c.study_materials || []).map((m: any) => ({
        type: m.type || '',
        title: m.title || '',
        provider: m.provider || '',
        url: m.url || '',
        cost: m.cost || '',
        duration: m.duration || '',
        description: m.description || '',
        recommendedOrder: m.recommendedOrder || m.recommended_order || 0,
      })),
      studyPlanWeeks: c.studyPlanWeeks || c.study_plan_weeks || [],
      sourceCitations: c.sourceCitations || c.source_citations || [],
      priority: c.priority,
      roiRating: c.roiRating || c.roi_rating,
      difficulty: c.difficulty,
      skillsGained: c.skillsGained || c.skills_gained,
      whyRecommended: c.whyRecommended || c.why_recommended,
      journeyOrder: c.journeyOrder || c.journey_order,
      tier: c.tier,
      unlocksNext: c.unlocksNext || c.unlocks_next,
      beginnerEntryPoint: c.beginnerEntryPoint || c.beginner_entry_point,
    })),
    educationOptions: (raw.educationOptions || raw.education_options || []).map((e: any) => ({
      type: e.type || 'online-course',
      name: e.name || '',
      duration: e.duration || '',
      costRange: e.costRange || e.cost_range || '',
      format: e.format || 'online',
      officialLink: e.officialLink || e.official_link,
      pros: e.pros || [],
      cons: e.cons || [],
      sourceCitations: e.sourceCitations || e.source_citations || [],
      description: e.description,
      whoItsBestFor: e.whoItsBestFor || e.who_its_best_for,
      financingOptions: e.financingOptions || e.financing_options,
      employmentOutcomes: e.employmentOutcomes || e.employment_outcomes,
      timeCommitmentWeekly: e.timeCommitmentWeekly || e.time_commitment_weekly,
      comparisonRank: e.comparisonRank || e.comparison_rank,
    })),
    experiencePlan: (raw.experiencePlan || raw.experience_plan || []).map((p: any) => ({
      type: p.type || 'portfolio',
      title: p.title || '',
      description: p.description || '',
      skillsDemonstrated: p.skillsDemonstrated || p.skills_demonstrated || [],
      detailedTechStack: (p.detailedTechStack || p.detailed_tech_stack || []).map((t: any) => ({
        name: t.name || '',
        category: t.category || '',
        whyThisTech: t.whyThisTech || t.why_this_tech || '',
        learningResources: t.learningResources || t.learning_resources || [],
      })),
      architectureOverview: p.architectureOverview || p.architecture_overview || '',
      timeCommitment: p.timeCommitment || p.time_commitment || '',
      difficultyLevel: p.difficultyLevel || p.difficulty_level || '',
      stepByStepGuide: p.stepByStepGuide || p.step_by_step_guide || [],
      howToShowcase: p.howToShowcase || p.how_to_showcase || '',
      exampleResources: p.exampleResources || p.example_resources || [],
      githubExampleRepos: p.githubExampleRepos || p.github_example_repos || [],
    })),
    events: (raw.events || []).map((ev: any) => ({
      name: ev.name || '',
      organizer: ev.organizer || '',
      type: ev.type || 'meetup',
      dateOrSeason: ev.dateOrSeason || ev.date_or_season || '',
      location: ev.location || '',
      scope: ev.scope || '',
      priceRange: ev.priceRange || ev.price_range || '',
      attendeeCount: ev.attendeeCount || ev.attendee_count,
      beginnerFriendly: ev.beginnerFriendly ?? ev.beginner_friendly ?? false,
      targetAudience: ev.targetAudience || ev.target_audience || '',
      whyAttend: ev.whyAttend || ev.why_attend || '',
      keyTopics: ev.keyTopics || ev.key_topics || [],
      notableSpeakers: ev.notableSpeakers || ev.notable_speakers || [],
      registrationLink: ev.registrationLink || ev.registration_link,
      recurring: ev.recurring ?? false,
      virtualOptionAvailable: ev.virtualOptionAvailable ?? ev.virtual_option_available ?? false,
      sourceCitations: ev.sourceCitations || ev.source_citations || [],
    })),
    timeline: (() => {
      const tl = raw.timeline;
      if (!tl) return { twelveWeekPlan: [], sixMonthPlan: [], applyReadyCheckpoint: '' };
      return {
        twelveWeekPlan: (tl.twelveWeekPlan || tl.twelve_week_plan || []).map((w: any) => ({
          weekNumber: w.weekNumber || w.week_number || 0,
          tasks: w.tasks || [],
          milestone: w.milestone,
          checkpoint: w.checkpoint,
        })),
        sixMonthPlan: (tl.sixMonthPlan || tl.six_month_plan || []).map((m: any) => ({
          monthNumber: m.monthNumber || m.month_number || 0,
          phaseName: m.phaseName || m.phase_name || '',
          goals: m.goals || [],
          deliverables: m.deliverables || [],
          checkpoint: m.checkpoint,
        })),
        applyReadyCheckpoint: tl.applyReadyCheckpoint || tl.apply_ready_checkpoint || '',
      };
    })(),
    resumeAssets: (() => {
      const ra = raw.resumeAssets || raw.resume_assets;
      if (!ra) return {
        headline: '', headlineExplanation: '', summary: '', summaryBreakdown: '', summaryStrategy: '',
        skillsGrouped: [], skillsOrderingRationale: '', targetRoleBullets: [], bulletsOverallStrategy: '',
        howToReframeCurrentRole: '', experienceGapsToAddress: [], keywordsForAts: [], keywordPlacementStrategy: '',
        linkedinHeadline: '', linkedinAboutSection: '', linkedinStrategy: '',
        coverLetterTemplate: '', coverLetterGuidance: '',
      };
      return {
        headline: ra.headline || '',
        headlineExplanation: ra.headlineExplanation || ra.headline_explanation || '',
        summary: ra.summary || '',
        summaryBreakdown: ra.summaryBreakdown || ra.summary_breakdown || '',
        summaryStrategy: ra.summaryStrategy || ra.summary_strategy || '',
        skillsGrouped: (ra.skillsGrouped || ra.skills_grouped || []).map((g: any) => ({
          category: g.category || '',
          skills: g.skills || [],
          whyGroupThese: g.whyGroupThese || g.why_group_these || '',
          priority: g.priority || '',
        })),
        skillsOrderingRationale: ra.skillsOrderingRationale || ra.skills_ordering_rationale || '',
        targetRoleBullets: (ra.targetRoleBullets || ra.target_role_bullets || []).map((b: any) => ({
          bulletText: b.bulletText || b.bullet_text || '',
          whyThisWorks: b.whyThisWorks || b.why_this_works || '',
          whatToEmphasize: b.whatToEmphasize || b.what_to_emphasize || '',
          keywordsIncluded: b.keywordsIncluded || b.keywords_included || [],
          structureExplanation: b.structureExplanation || b.structure_explanation || '',
        })),
        bulletsOverallStrategy: ra.bulletsOverallStrategy || ra.bullets_overall_strategy || '',
        howToReframeCurrentRole: ra.howToReframeCurrentRole || ra.how_to_reframe_current_role || '',
        experienceGapsToAddress: ra.experienceGapsToAddress || ra.experience_gaps_to_address || [],
        keywordsForAts: ra.keywordsForAts || ra.keywords_for_ats || [],
        keywordPlacementStrategy: ra.keywordPlacementStrategy || ra.keyword_placement_strategy || '',
        linkedinHeadline: ra.linkedinHeadline || ra.linkedin_headline || '',
        linkedinAboutSection: ra.linkedinAboutSection || ra.linkedin_about_section || '',
        linkedinStrategy: ra.linkedinStrategy || ra.linkedin_strategy || '',
        coverLetterTemplate: ra.coverLetterTemplate || ra.cover_letter_template || '',
        coverLetterGuidance: ra.coverLetterGuidance || ra.cover_letter_guidance || '',
      };
    })(),
    researchSources: raw.researchSources || raw.research_sources || [],
    certificationJourneySummary: raw.certificationJourneySummary || raw.certification_journey_summary,
    educationRecommendation: raw.educationRecommendation || raw.education_recommendation,
  };
}
