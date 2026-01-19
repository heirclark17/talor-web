import React, { useState } from 'react'
import type { CareerPlan } from '../types/career-plan'
import CareerPathCertifications from './CareerPathCertifications'
import {
  Target, Award, BookOpen, Briefcase, Calendar, FileText,
  ChevronRight, ChevronDown, ExternalLink, Check, Clock,
  DollarSign, MapPin, Users, TrendingUp, Code, Lightbulb,
  Download, Shield, Zap, Book, Video, FileQuestion, Globe,
  Building, Heart, Sparkles
} from 'lucide-react'

interface CareerPlanResultsProps {
  plan: CareerPlan
  timeline: string
  onExportPDF?: () => void
}

export default function CareerPlanResults({ plan, timeline, onExportPDF }: CareerPlanResultsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [expandedCert, setExpandedCert] = useState<number | null>(null)
  const [expandedProject, setExpandedProject] = useState<number | null>(null)
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null)
  const [expandedBullet, setExpandedBullet] = useState<number | null>(null)

  return (
    <div className="space-y-4">
      {/* Target Roles */}
      {plan.targetRoles && plan.targetRoles.length > 0 && (
        <div className="glass rounded-lg border border-white/10 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'roles' ? null : 'roles')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-white" />
              <div className="text-left">
                <h2 className="text-xl font-semibold text-white">Target Roles</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Specific job titles that match your goals with salary ranges, requirements, and bridge roles • {plan.targetRoles.length} recommendations
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'roles' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'roles' && (
            <div className="px-6 pb-6 space-y-4">
              {plan.targetRoles.map((role, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-2">{role.title}</h3>
                  <p className="text-gray-400 mb-4">{role.whyAligned}</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Growth Outlook:</span>
                      <p className="text-white mt-1">{role.growthOutlook}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Salary Range:</span>
                      <p className="text-white mt-1">{role.salaryRange}</p>
                    </div>
                  </div>

                  {role.typicalRequirements && role.typicalRequirements.length > 0 && (
                    <div className="mb-4">
                      <span className="text-gray-500 text-sm">Typical Requirements:</span>
                      <ul className="mt-2 space-y-1">
                        {role.typicalRequirements.map((req, reqIdx) => (
                          <li key={reqIdx} className="text-white text-sm flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {role.bridgeRoles && role.bridgeRoles.length > 0 && (
                    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Bridge Roles (Stepping Stones)
                      </h4>
                      <div className="space-y-3">
                        {role.bridgeRoles.map((bridge, bridgeIdx) => (
                          <div key={bridgeIdx} className="bg-white/5 rounded p-3">
                            <div className="font-semibold text-white mb-1">{bridge.title}</div>
                            <div className="text-sm text-gray-400 mb-2">{bridge.whyGoodFit}</div>
                            <div className="text-xs text-gray-500">Time to qualify: {bridge.timeToQualify}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {role.sourceCitations && role.sourceCitations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <span className="text-xs text-gray-500 font-semibold mb-2 block">Research Sources:</span>
                      <div className="space-y-1">
                        {role.sourceCitations.map((url, urlIdx) => (
                          <a
                            key={urlIdx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:text-blue-300 underline flex items-start gap-1 break-all"
                          >
                            <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                            <span>{url}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skills Analysis */}
      {plan.skillsAnalysis && (
        <div className="glass rounded-lg border border-white/10 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'skills' ? null : 'skills')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-white" />
              <div className="text-left">
                <h2 className="text-xl font-semibold text-white">Skills Analysis</h2>
                <p className="text-sm text-gray-400 mt-1">
                  What you already have, what you can reframe, and what you need to build with specific action plans
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'skills' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'skills' && (
            <div className="px-6 pb-6 space-y-6">
              {plan.skillsAnalysis.alreadyHave && plan.skillsAnalysis.alreadyHave.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    Skills You Already Have
                  </h3>
                  <div className="space-y-3">
                    {plan.skillsAnalysis.alreadyHave.map((skill, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="font-semibold text-white mb-2">{skill.skillName}</div>
                        <div className="text-sm text-gray-400 mb-2">
                          <span className="text-gray-500">How you have this:</span> {skill.evidenceFromInput}
                        </div>
                        <div className="text-sm text-gray-300 mb-3">
                          <span className="text-gray-500">Maps to target role:</span> {skill.targetRoleMapping}
                        </div>
                        {skill.resumeBullets && skill.resumeBullets.length > 0 && (
                          <div className="bg-white/5 rounded p-3">
                            <div className="text-xs text-gray-500 mb-2">Resume bullets:</div>
                            {skill.resumeBullets.map((bullet, bIdx) => (
                              <div key={bIdx} className="text-sm text-gray-300 mb-1">• {bullet}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {plan.skillsAnalysis.canReframe && plan.skillsAnalysis.canReframe.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    Skills You Can Reframe
                  </h3>
                  <div className="space-y-3">
                    {plan.skillsAnalysis.canReframe.map((skill, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="font-semibold text-white mb-2">{skill.skillName}</div>
                        <div className="grid md:grid-cols-2 gap-3 mb-3">
                          <div className="text-sm">
                            <span className="text-gray-500">Current context:</span>
                            <p className="text-gray-400 mt-1">{skill.currentContext}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500">Target context:</span>
                            <p className="text-gray-300 mt-1">{skill.targetContext}</p>
                          </div>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-3 mb-3">
                          <div className="text-xs text-yellow-300 mb-1">How to reframe:</div>
                          <div className="text-sm text-gray-300">{skill.howToReframe}</div>
                        </div>
                        {skill.resumeBullets && skill.resumeBullets.length > 0 && (
                          <div className="bg-white/5 rounded p-3">
                            <div className="text-xs text-gray-500 mb-2">Reframed resume bullets:</div>
                            {skill.resumeBullets.map((bullet, bIdx) => (
                              <div key={bIdx} className="text-sm text-gray-300 mb-1">• {bullet}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {plan.skillsAnalysis.needToBuild && plan.skillsAnalysis.needToBuild.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    Skills You Need to Build
                  </h3>
                  <div className="space-y-3">
                    {plan.skillsAnalysis.needToBuild.map((skill, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-semibold text-white">{skill.skillName}</div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            skill.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                            skill.priority === 'high' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {skill.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-400 mb-3">
                          <span className="text-gray-500">Why needed:</span> {skill.whyNeeded}
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mb-2">
                          <div className="text-xs text-blue-300 mb-1">How to build:</div>
                          <div className="text-sm text-gray-300">{skill.howToBuild}</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Estimated time: {skill.estimatedTime}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Skills Guidance */}
      {plan.skillsGuidance && (
        <div className="glass rounded-lg border border-white/10 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'skillsGuidance' ? null : 'skillsGuidance')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="w-6 h-6 text-white" />
              <div className="text-left">
                <h2 className="text-xl font-semibold text-white">Skills Development Guidance</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Essential soft and hard skills with detailed why they matter, how to improve, and real-world application
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'skillsGuidance' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'skillsGuidance' && (
            <div className="px-6 pb-6 space-y-6">
              {/* Overall Strategy */}
              {plan.skillsGuidance.skillDevelopmentStrategy && (
                <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-white/10 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Your Skills Development Strategy
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{plan.skillsGuidance.skillDevelopmentStrategy}</p>
                </div>
              )}

              {/* Soft Skills */}
              {plan.skillsGuidance.softSkills && plan.skillsGuidance.softSkills.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-pink-400" />
                    Essential Soft Skills ({plan.skillsGuidance.softSkills.length} skills)
                  </h3>
                  <div className="space-y-4">
                    {plan.skillsGuidance.softSkills.map((skill, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-5 border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-semibold text-white">{skill.skillName}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              skill.importance === 'critical' ? 'bg-red-500/20 text-red-300' :
                              skill.importance === 'high' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {skill.importance.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {skill.estimatedTime}
                            </span>
                          </div>
                        </div>

                        {/* Why Needed */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                          <h5 className="text-blue-300 font-semibold text-sm mb-2">Why This Skill Matters</h5>
                          <p className="text-sm text-gray-300">{skill.whyNeeded}</p>
                        </div>

                        {/* How to Improve */}
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                          <h5 className="text-green-300 font-semibold text-sm mb-2">How to Develop This Skill</h5>
                          <p className="text-sm text-gray-300">{skill.howToImprove}</p>
                        </div>

                        {/* Real World Application */}
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                          <h5 className="text-purple-300 font-semibold text-sm mb-2">Real-World Application</h5>
                          <p className="text-sm text-gray-300">{skill.realWorldApplication}</p>
                        </div>

                        {/* Learning Resources */}
                        {skill.resources && skill.resources.length > 0 && (
                          <div>
                            <h5 className="text-white font-semibold text-sm mb-2">Learning Resources</h5>
                            <div className="space-y-1">
                              {skill.resources.map((resource, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={resource}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-2 text-xs text-blue-400 hover:text-blue-300 underline break-all"
                                >
                                  <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  <span>{resource}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hard Skills */}
              {plan.skillsGuidance.hardSkills && plan.skillsGuidance.hardSkills.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-green-400" />
                    Essential Hard Skills ({plan.skillsGuidance.hardSkills.length} skills)
                  </h3>
                  <div className="space-y-4">
                    {plan.skillsGuidance.hardSkills.map((skill, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-5 border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-lg font-semibold text-white">{skill.skillName}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              skill.importance === 'critical' ? 'bg-red-500/20 text-red-300' :
                              skill.importance === 'high' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-blue-500/20 text-blue-300'
                            }`}>
                              {skill.importance.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-400 bg-white/10 px-3 py-1 rounded-full">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {skill.estimatedTime}
                            </span>
                          </div>
                        </div>

                        {/* Why Needed */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                          <h5 className="text-blue-300 font-semibold text-sm mb-2">Why This Skill Matters</h5>
                          <p className="text-sm text-gray-300">{skill.whyNeeded}</p>
                        </div>

                        {/* How to Improve */}
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                          <h5 className="text-green-300 font-semibold text-sm mb-2">How to Develop This Skill</h5>
                          <p className="text-sm text-gray-300">{skill.howToImprove}</p>
                        </div>

                        {/* Real World Application */}
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                          <h5 className="text-purple-300 font-semibold text-sm mb-2">Real-World Application</h5>
                          <p className="text-sm text-gray-300">{skill.realWorldApplication}</p>
                        </div>

                        {/* Learning Resources */}
                        {skill.resources && skill.resources.length > 0 && (
                          <div>
                            <h5 className="text-white font-semibold text-sm mb-2">Learning Resources</h5>
                            <div className="space-y-1">
                              {skill.resources.map((resource, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={resource}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-2 text-xs text-blue-400 hover:text-blue-300 underline break-all"
                                >
                                  <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                  <span>{resource}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Certifications (Interview-Prep Style) */}
      {plan.certificationPath && plan.certificationPath.length > 0 && (
        <div className="glass rounded-lg border border-white/10 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'certs' ? null : 'certs')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-white" />
              <div className="text-left">
                <h2 className="text-xl font-semibold text-white">Recommended Certifications for This Career Path</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Personalized certification recommendations with study materials, exam details, and timelines
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'certs' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'certs' && (
            <div className="px-6 pb-6">
              <CareerPathCertifications certifications={plan.certificationPath} />
            </div>
          )}
        </div>
      )}

      {/* Experience Plan (with Detailed Tech Stacks) */}
      {plan.experiencePlan && plan.experiencePlan.length > 0 && (
        <div className="glass rounded-lg border border-white/10 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'experience' ? null : 'experience')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-white" />
              <div className="text-left">
                <h2 className="text-xl font-semibold text-white">Experience Building Plan</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Hands-on projects with detailed tech stacks, step-by-step guides, and portfolio showcase strategies • {plan.experiencePlan.length} projects
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'experience' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'experience' && (
            <div className="px-6 pb-6 space-y-4">
              {plan.experiencePlan.map((project, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                  {/* Project Header */}
                  <button
                    onClick={() => setExpandedProject(expandedProject === idx ? null : idx)}
                    className="w-full p-6 flex items-start justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                        <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{project.type}</span>
                        <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{project.difficultyLevel}</span>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                      <div className="text-sm text-gray-500">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {project.timeCommitment}
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ml-4 flex-shrink-0 mt-1 ${expandedProject === idx ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Project Details */}
                  {expandedProject === idx && (
                    <div className="px-6 pb-6 space-y-6 border-t border-white/10">
                      {/* Skills Demonstrated */}
                      {project.skillsDemonstrated && project.skillsDemonstrated.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-3">Skills Demonstrated</h4>
                          <div className="flex flex-wrap gap-2">
                            {project.skillsDemonstrated.map((skill, sIdx) => (
                              <span key={sIdx} className="bg-white/10 px-3 py-1 rounded-full text-sm text-white">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Detailed Tech Stack */}
                      {project.detailedTechStack && project.detailedTechStack.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Code className="w-4 h-4" />
                            Detailed Tech Stack ({project.detailedTechStack.length} technologies)
                          </h4>
                          <div className="space-y-3">
                            {project.detailedTechStack.map((tech, tIdx) => (
                              <div key={tIdx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="flex items-start justify-between mb-2">
                                  <div>
                                    <h5 className="text-white font-semibold">{tech.name}</h5>
                                    <div className="text-xs text-gray-400 uppercase">{tech.category}</div>
                                  </div>
                                </div>
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 mb-3">
                                  <div className="text-xs text-blue-300 mb-1">Why this technology:</div>
                                  <div className="text-sm text-gray-300">{tech.whyThisTech}</div>
                                </div>
                                {tech.learningResources && tech.learningResources.length > 0 && (
                                  <div>
                                    <div className="text-xs text-gray-500 mb-2">Learning resources:</div>
                                    <div className="space-y-1">
                                      {tech.learningResources.map((url, uIdx) => (
                                        <a
                                          key={uIdx}
                                          href={url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-white/60 hover:text-white underline flex items-center gap-1"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          Resource {uIdx + 1}
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Architecture Overview */}
                      {project.architectureOverview && (
                        <div className="bg-white/5 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Architecture Overview
                          </h4>
                          <p className="text-sm text-gray-300">{project.architectureOverview}</p>
                        </div>
                      )}

                      {/* Step-by-Step Guide */}
                      {project.stepByStepGuide && project.stepByStepGuide.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4" />
                            Step-by-Step Implementation Guide
                          </h4>
                          <div className="space-y-2">
                            {project.stepByStepGuide.map((step, sIdx) => (
                              <div key={sIdx} className="flex items-start gap-3 bg-white/5 rounded p-3">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs font-semibold">{sIdx + 1}</span>
                                </div>
                                <div className="text-sm text-gray-300">{step}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* How to Showcase */}
                      {project.howToShowcase && (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                          <h4 className="text-green-300 font-semibold mb-2">How to Showcase on Resume/LinkedIn</h4>
                          <p className="text-sm text-gray-300">{project.howToShowcase}</p>
                        </div>
                      )}

                      {/* GitHub Examples */}
                      {project.githubExampleRepos && project.githubExampleRepos.length > 0 && (
                        <div>
                          <h5 className="text-white font-semibold text-sm mb-2">Similar Projects on GitHub</h5>
                          <div className="flex flex-wrap gap-2">
                            {project.githubExampleRepos.map((repo, rIdx) => (
                              <a
                                key={rIdx}
                                href={repo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-white/60 hover:text-white underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Example {rIdx + 1}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Networking Events (Comprehensive Details) */}
      {plan.events && plan.events.length > 0 && (
        <div className="glass rounded-lg border border-white/10 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'events' ? null : 'events')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-white" />
              <div className="text-left">
                <h2 className="text-xl font-semibold text-white">Networking Events</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Industry conferences, meetups, and networking opportunities with dates, locations, and registration links • {plan.events.length} events
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'events' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'events' && (
            <div className="px-6 pb-6 space-y-4">
              {plan.events.map((event, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                  {/* Event Header */}
                  <button
                    onClick={() => setExpandedEvent(expandedEvent === idx ? null : idx)}
                    className="w-full p-6 flex items-start justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-white">{event.name}</h3>
                        <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{event.type}</span>
                        <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{event.scope}</span>
                        {event.beginnerFriendly && (
                          <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">
                            Beginner Friendly
                          </span>
                        )}
                        {event.virtualOptionAvailable && (
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                            Virtual Option
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          <span>{event.organizer}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{event.dateOrSeason}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.location}</span>
                        </div>
                        {event.attendeeCount && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{event.attendeeCount}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          <span>{event.priceRange}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ml-4 flex-shrink-0 mt-1 ${expandedEvent === idx ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Event Details */}
                  {expandedEvent === idx && (
                    <div className="px-6 pb-6 space-y-4 border-t border-white/10">
                      {/* Target Audience */}
                      {event.targetAudience && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-xs text-gray-500 mb-1">Target Audience:</div>
                          <div className="text-sm text-white">{event.targetAudience}</div>
                        </div>
                      )}

                      {/* Why Attend */}
                      {event.whyAttend && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                          <h4 className="text-blue-300 font-semibold mb-2">Why Attend This Event</h4>
                          <p className="text-sm text-gray-300">{event.whyAttend}</p>
                        </div>
                      )}

                      {/* Key Topics */}
                      {event.keyTopics && event.keyTopics.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold text-sm mb-2">Key Topics Covered</h4>
                          <div className="flex flex-wrap gap-2">
                            {event.keyTopics.map((topic, tIdx) => (
                              <span key={tIdx} className="bg-white/10 px-3 py-1 rounded-full text-xs text-white">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notable Speakers */}
                      {event.notableSpeakers && event.notableSpeakers.length > 0 && (
                        <div>
                          <h4 className="text-white font-semibold text-sm mb-2">Notable Speakers/Companies</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {event.notableSpeakers.map((speaker, sIdx) => (
                              <div key={sIdx} className="text-sm text-gray-300 flex items-center gap-2">
                                <Check className="w-3 h-3 text-green-400" />
                                {speaker}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Registration Link */}
                      {event.registrationLink && (
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Register for Event
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Timeline */}
      {plan.timeline && (
        <div className="glass rounded-lg border border-white/10 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'timeline' ? null : 'timeline')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-white" />
              <div className="text-left">
                <h2 className="text-xl font-semibold text-white">Your Action Timeline</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Week-by-week tactical plan with milestones, tasks, and checkpoints to keep you on track
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'timeline' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'timeline' && (
            <div className="px-6 pb-6 space-y-6">
              {/* 12-Week Plan */}
              {plan.timeline.twelveWeekPlan && plan.timeline.twelveWeekPlan.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-4">12-Week Tactical Plan</h3>
                  <div className="space-y-3">
                    {plan.timeline.twelveWeekPlan.map((week, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {week.weekNumber}
                          </div>
                          <div className="text-white font-semibold">{week.milestone || `Week ${week.weekNumber}`}</div>
                        </div>
                        {week.tasks && week.tasks.length > 0 && (
                          <ul className="space-y-1 ml-11">
                            {week.tasks.map((task, taskIdx) => (
                              <li key={taskIdx} className="text-gray-300 text-sm flex items-start gap-2">
                                <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                {task}
                              </li>
                            ))}
                          </ul>
                        )}
                        {week.checkpoint && (
                          <div className="ml-11 mt-3 text-xs bg-green-500/20 text-green-300 px-3 py-2 rounded-lg inline-block">
                            ✓ Checkpoint: {week.checkpoint}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6-Month Plan */}
              {plan.timeline.sixMonthPlan && plan.timeline.sixMonthPlan.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-4">6-Month Strategic Phases</h3>
                  <div className="space-y-3">
                    {plan.timeline.sixMonthPlan.map((month, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white font-semibold">
                            M{month.monthNumber}
                          </div>
                          <div>
                            <div className="text-white font-semibold">{month.phaseName}</div>
                            <div className="text-xs text-gray-400">Month {month.monthNumber}</div>
                          </div>
                        </div>
                        <div className="space-y-3 ml-13">
                          {month.goals && month.goals.length > 0 && (
                            <div>
                              <div className="text-sm text-gray-500 mb-1">Goals:</div>
                              <ul className="space-y-1">
                                {month.goals.map((goal, gIdx) => (
                                  <li key={gIdx} className="text-gray-300 text-sm flex items-start gap-2">
                                    <Target className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                                    {goal}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {month.deliverables && month.deliverables.length > 0 && (
                            <div>
                              <div className="text-sm text-gray-500 mb-1">Deliverables:</div>
                              <ul className="space-y-1">
                                {month.deliverables.map((deliverable, dIdx) => (
                                  <li key={dIdx} className="text-gray-300 text-sm flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                    {deliverable}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply-Ready Checkpoint */}
              {plan.timeline.applyReadyCheckpoint && (
                <div className="bg-green-500/20 border-2 border-green-500/50 rounded-lg p-6 text-center">
                  <h3 className="text-green-300 font-semibold text-lg mb-2">🎯 Apply-Ready Checkpoint</h3>
                  <p className="text-white">{plan.timeline.applyReadyCheckpoint}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Resume Assets (Extreme Detail with Guidance) */}
      {plan.resumeAssets && (
        <div className="glass rounded-lg border border-white/10 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'resume' ? null : 'resume')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-white" />
              <div className="text-left">
                <h2 className="text-xl font-semibold text-white">Resume & LinkedIn Assets</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Ready-to-use headlines, summaries, achievement bullets, and optimization strategies with ATS keywords
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'resume' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'resume' && (
            <div className="px-6 pb-6 space-y-6">
              {/* Headline with Explanation */}
              {plan.resumeAssets.headline && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Professional Headline</h3>
                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <p className="text-white text-lg font-semibold">{plan.resumeAssets.headline}</p>
                  </div>
                  {plan.resumeAssets.headlineExplanation && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-blue-300 font-semibold text-sm mb-2">Why This Headline Works</h4>
                      <p className="text-sm text-gray-300">{plan.resumeAssets.headlineExplanation}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Summary with Breakdown */}
              {plan.resumeAssets.summary && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Professional Summary</h3>
                  <div className="bg-white/10 rounded-lg p-4 mb-4">
                    <p className="text-white leading-relaxed">{plan.resumeAssets.summary}</p>
                  </div>

                  {plan.resumeAssets.summaryBreakdown && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-3">
                      <h4 className="text-purple-300 font-semibold text-sm mb-2">Sentence-by-Sentence Breakdown</h4>
                      <p className="text-sm text-gray-300 whitespace-pre-line">{plan.resumeAssets.summaryBreakdown}</p>
                    </div>
                  )}

                  {plan.resumeAssets.summaryStrategy && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <h4 className="text-blue-300 font-semibold text-sm mb-2">Overall Strategy</h4>
                      <p className="text-sm text-gray-300">{plan.resumeAssets.summaryStrategy}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Skills Grouped */}
              {plan.resumeAssets.skillsGrouped && plan.resumeAssets.skillsGrouped.length > 0 && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Skills Section (Organized by Category)</h3>
                  <div className="space-y-4">
                    {plan.resumeAssets.skillsGrouped.map((group, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-white font-semibold">{group.category}</h4>
                          <span className={`text-xs px-2 py-1 rounded ${
                            group.priority === 'core' ? 'bg-red-500/20 text-red-300' :
                            group.priority === 'important' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {group.priority.toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {group.skills.map((skill, sIdx) => (
                            <span key={sIdx} className="bg-white/10 px-3 py-1 rounded-full text-sm text-white">
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-400 bg-white/5 rounded p-2">
                          <strong>Why grouped:</strong> {group.whyGroupThese}
                        </div>
                      </div>
                    ))}
                  </div>

                  {plan.resumeAssets.skillsOrderingRationale && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
                      <h4 className="text-blue-300 font-semibold text-sm mb-2">Ordering Strategy</h4>
                      <p className="text-sm text-gray-300">{plan.resumeAssets.skillsOrderingRationale}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Target Role Bullets (with Extreme Detail) */}
              {plan.resumeAssets.targetRoleBullets && plan.resumeAssets.targetRoleBullets.length > 0 && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Achievement Bullets for Resume</h3>
                  <div className="space-y-3">
                    {plan.resumeAssets.targetRoleBullets.map((bullet, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                        {/* Bullet Header */}
                        <button
                          onClick={() => setExpandedBullet(expandedBullet === idx ? null : idx)}
                          className="w-full p-4 hover:bg-white/5 transition-colors text-left"
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-gray-300 text-sm flex-1 pr-4">{bullet.bulletText}</p>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${expandedBullet === idx ? 'rotate-180' : ''}`} />
                          </div>
                        </button>

                        {/* Bullet Details */}
                        {expandedBullet === idx && (
                          <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                            {/* Why This Works */}
                            {bullet.whyThisWorks && (
                              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                <h5 className="text-green-300 font-semibold text-sm mb-1">Why This Works</h5>
                                <p className="text-xs text-gray-300">{bullet.whyThisWorks}</p>
                              </div>
                            )}

                            {/* What to Emphasize */}
                            {bullet.whatToEmphasize && (
                              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                                <h5 className="text-purple-300 font-semibold text-sm mb-1">Interview Talking Points</h5>
                                <p className="text-xs text-gray-300">{bullet.whatToEmphasize}</p>
                              </div>
                            )}

                            {/* ATS Keywords */}
                            {bullet.keywordsIncluded && bullet.keywordsIncluded.length > 0 && (
                              <div>
                                <div className="text-xs text-gray-500 mb-2">ATS Keywords Included:</div>
                                <div className="flex flex-wrap gap-1">
                                  {bullet.keywordsIncluded.map((keyword, kIdx) => (
                                    <span key={kIdx} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                                      {keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Structure Explanation */}
                            {bullet.structureExplanation && (
                              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                <h5 className="text-blue-300 font-semibold text-sm mb-1">CAR/STAR Structure</h5>
                                <p className="text-xs text-gray-300">{bullet.structureExplanation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Overall Bullets Strategy */}
                  {plan.resumeAssets.bulletsOverallStrategy && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
                      <h4 className="text-yellow-300 font-semibold text-sm mb-2">How These Bullets Position You</h4>
                      <p className="text-sm text-gray-300">{plan.resumeAssets.bulletsOverallStrategy}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Experience Reframing Guide */}
              {plan.resumeAssets.howToReframeCurrentRole && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">How to Reframe Your Current Experience</h3>
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-300 whitespace-pre-line">{plan.resumeAssets.howToReframeCurrentRole}</p>
                  </div>

                  {plan.resumeAssets.experienceGapsToAddress && plan.resumeAssets.experienceGapsToAddress.length > 0 && (
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-2">Addressing Experience Gaps</h4>
                      <ul className="space-y-1">
                        {plan.resumeAssets.experienceGapsToAddress.map((gap, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            {gap}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Keywords & ATS */}
              {plan.resumeAssets.keywordsForAts && plan.resumeAssets.keywordsForAts.length > 0 && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Keywords for ATS (Applicant Tracking Systems)</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {plan.resumeAssets.keywordsForAts.map((keyword, idx) => (
                      <span key={idx} className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-mono">
                        {keyword}
                      </span>
                    ))}
                  </div>

                  {plan.resumeAssets.keywordPlacementStrategy && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                      <h4 className="text-green-300 font-semibold text-sm mb-2">Keyword Placement Strategy</h4>
                      <p className="text-sm text-gray-300">{plan.resumeAssets.keywordPlacementStrategy}</p>
                    </div>
                  )}
                </div>
              )}

              {/* LinkedIn Guidance */}
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  LinkedIn Optimization
                </h3>

                {plan.resumeAssets.linkedinHeadline && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold text-sm mb-2">LinkedIn Headline</h4>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-white">{plan.resumeAssets.linkedinHeadline}</p>
                    </div>
                  </div>
                )}

                {plan.resumeAssets.linkedinAboutSection && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold text-sm mb-2">LinkedIn About Section</h4>
                    <div className="bg-white/10 rounded-lg p-3 max-h-60 overflow-y-auto">
                      <p className="text-gray-300 text-sm whitespace-pre-line">{plan.resumeAssets.linkedinAboutSection}</p>
                    </div>
                  </div>
                )}

                {plan.resumeAssets.linkedinStrategy && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-semibold text-sm mb-2">LinkedIn Optimization Strategy</h4>
                    <p className="text-sm text-gray-300">{plan.resumeAssets.linkedinStrategy}</p>
                  </div>
                )}
              </div>

              {/* Cover Letter Template */}
              {plan.resumeAssets.coverLetterTemplate && (
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <h3 className="text-white font-semibold mb-3">Cover Letter Framework</h3>
                  <div className="bg-white/10 rounded-lg p-4 mb-4 max-h-80 overflow-y-auto">
                    <p className="text-gray-300 text-sm whitespace-pre-line">{plan.resumeAssets.coverLetterTemplate}</p>
                  </div>

                  {plan.resumeAssets.coverLetterGuidance && (
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <h4 className="text-purple-300 font-semibold text-sm mb-2">How to Adapt This Template</h4>
                      <p className="text-sm text-gray-300">{plan.resumeAssets.coverLetterGuidance}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Education Options */}
      {plan.educationOptions && plan.educationOptions.length > 0 && (
        <div className="glass rounded-lg border border-white/10 overflow-hidden">
          <button
            onClick={() => setExpandedSection(expandedSection === 'education' ? null : 'education')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-white" />
              <div className="text-left">
                <h2 className="text-xl font-semibold text-white">Education & Training Options</h2>
                <p className="text-sm text-gray-400 mt-1">
                  Formal degree programs, bootcamps, and online courses with costs, duration, and pros/cons • {plan.educationOptions.length} options
                </p>
              </div>
            </div>
            <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${expandedSection === 'education' ? 'rotate-90' : ''}`} />
          </button>
          {expandedSection === 'education' && (
            <div className="px-6 pb-6 space-y-4">
              {plan.educationOptions.map((option, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">{option.name}</h3>
                        <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{option.type}</span>
                        <span className="text-xs bg-white/10 px-2 py-1 rounded text-white uppercase">{option.format}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {option.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {option.costRange}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {option.pros && option.pros.length > 0 && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <h4 className="text-green-300 font-semibold text-sm mb-2">Pros</h4>
                        <ul className="space-y-1">
                          {option.pros.map((pro, pIdx) => (
                            <li key={pIdx} className="text-sm text-gray-300 flex items-start gap-2">
                              <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {option.cons && option.cons.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <h4 className="text-red-300 font-semibold text-sm mb-2">Cons</h4>
                        <ul className="space-y-1">
                          {option.cons.map((con, cIdx) => (
                            <li key={cIdx} className="text-sm text-gray-300 flex items-start gap-2">
                              <span className="text-red-400 flex-shrink-0">×</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {option.officialLink && (
                    <a
                      href={option.officialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Program Details
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Research Sources */}
      {plan.researchSources && plan.researchSources.length > 0 && (
        <div className="glass rounded-lg border border-white/10 p-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Research Sources ({plan.researchSources.length} citations)
          </h3>
          <div className="grid md:grid-cols-2 gap-2">
            {plan.researchSources.map((source, idx) => (
              <a
                key={idx}
                href={source}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 hover:text-white underline flex items-center gap-1 truncate"
              >
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{source}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Download/Export Actions */}
      <div className="glass rounded-lg border border-white/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold mb-1">Export Your Plan</h3>
            <p className="text-sm text-gray-400">Download this career plan for offline access</p>
          </div>
          <button
            onClick={onExportPDF || (() => window.print())}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  )
}
