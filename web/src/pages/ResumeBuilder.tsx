/**
 * Resume Builder - Start from Scratch
 *
 * Guided multi-step form for users without existing resumes
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { api } from '../api/client';
import { showSuccess, showError } from '../utils/toast';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
}

export default function ResumeBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
  });

  const [summary, setSummary] = useState('');

  const [experience, setExperience] = useState<Experience[]>([
    {
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
    },
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
    },
  ]);

  const [skills, setSkills] = useState<string[]>(['']);
  const [certifications, setCertifications] = useState('');

  const totalSteps = 5;

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: '',
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        school: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, value: string) => {
    const updated = [...skills];
    updated[index] = value;
    setSkills(updated);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Format data for backend
      const resumeData = {
        contact: contactInfo,
        summary,
        experience: experience.filter((exp) => exp.company && exp.title),
        education: education.filter((edu) => edu.school),
        skills: skills.filter((s) => s.trim()),
        certifications,
      };

      // Create resume via API (using JSON upload)
      const dataStr = JSON.stringify(resumeData);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const file = new File([blob], 'built-resume.json', {
        type: 'application/json',
      });

      const response = await api.uploadResume(file, { isBuilderResume: true });

      if (response.success) {
        showSuccess('Resume created successfully!');
        navigate('/tailor', {
          state: { selectedResumeId: response.data.resume_id },
        });
      } else {
        throw new Error(response.error || 'Failed to create resume');
      }
    } catch (error: any) {
      showError(error.message || 'Failed to create resume');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return contactInfo.name && contactInfo.email;
      case 2:
        return summary.trim().length > 0;
      case 3:
        return experience.some((exp) => exp.company && exp.title);
      case 4:
        return education.some((edu) => edu.school);
      case 5:
        return skills.some((s) => s.trim());
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-theme mb-4">
            Build Your Resume
          </h1>
          <p className="text-theme-secondary">
            Create a professional resume from scratch in {totalSteps} easy steps
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-theme-secondary">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-theme-secondary">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full h-2 bg-theme-glass-10 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <div className="glass rounded-2xl p-8 mb-6">
          {/* Step 1: Contact Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-theme">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={contactInfo.name}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, name: e.target.value })
                    }
                    className="input"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, email: e.target.value })
                    }
                    className="input"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, phone: e.target.value })
                    }
                    className="input"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={contactInfo.location}
                    onChange={(e) =>
                      setContactInfo({
                        ...contactInfo,
                        location: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-theme-secondary mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={contactInfo.linkedin}
                    onChange={(e) =>
                      setContactInfo({
                        ...contactInfo,
                        linkedin: e.target.value,
                      })
                    }
                    className="input"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Professional Summary */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-theme">
                  Professional Summary
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Summary *
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="input min-h-[200px]"
                  placeholder="Write a brief professional summary highlighting your key skills, experience, and career goals..."
                />
                <p className="text-xs text-theme-tertiary mt-2">
                  Tip: Focus on your most relevant skills and achievements (3-5
                  sentences)
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Experience */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-theme">
                    Work Experience
                  </h2>
                </div>
                <button onClick={addExperience} className="btn-secondary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Position
                </button>
              </div>

              {experience.map((exp, index) => (
                <div key={index} className="p-6 bg-theme-glass-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-theme">Position {index + 1}</h3>
                    {experience.length > 1 && (
                      <button
                        onClick={() => removeExperience(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].title = e.target.value;
                          setExperience(updated);
                        }}
                        className="input"
                        placeholder="Software Engineer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Company *
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].company = e.target.value;
                          setExperience(updated);
                        }}
                        className="input"
                        placeholder="Google"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].location = e.target.value;
                          setExperience(updated);
                        }}
                        className="input"
                        placeholder="San Francisco, CA"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Start Date
                      </label>
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].startDate = e.target.value;
                          setExperience(updated);
                        }}
                        className="input"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[index].current = e.target.checked;
                            if (e.target.checked) {
                              updated[index].endDate = '';
                            }
                            setExperience(updated);
                          }}
                          className="w-4 h-4"
                        />
                        <label className="text-sm font-medium text-theme-secondary">
                          I currently work here
                        </label>
                      </div>
                      {!exp.current && (
                        <div>
                          <label className="block text-sm font-medium text-theme-secondary mb-2">
                            End Date
                          </label>
                          <input
                            type="month"
                            value={exp.endDate}
                            onChange={(e) => {
                              const updated = [...experience];
                              updated[index].endDate = e.target.value;
                              setExperience(updated);
                            }}
                            className="input"
                          />
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Description
                      </label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].description = e.target.value;
                          setExperience(updated);
                        }}
                        className="input min-h-[100px]"
                        placeholder="• Led development of...&#10;• Implemented...&#10;• Achieved..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Education */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-blue-500" />
                  <h2 className="text-2xl font-bold text-theme">Education</h2>
                </div>
                <button onClick={addEducation} className="btn-secondary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Education
                </button>
              </div>

              {education.map((edu, index) => (
                <div key={index} className="p-6 bg-theme-glass-5 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-theme">Education {index + 1}</h3>
                    {education.length > 1 && (
                      <button
                        onClick={() => removeEducation(index)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        School *
                      </label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].school = e.target.value;
                          setEducation(updated);
                        }}
                        className="input"
                        placeholder="Stanford University"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].degree = e.target.value;
                          setEducation(updated);
                        }}
                        className="input"
                        placeholder="Bachelor of Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].field = e.target.value;
                          setEducation(updated);
                        }}
                        className="input"
                        placeholder="Computer Science"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        Start Year
                      </label>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].startDate = e.target.value;
                          setEducation(updated);
                        }}
                        className="input"
                        placeholder="2018"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        End Year
                      </label>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].endDate = e.target.value;
                          setEducation(updated);
                        }}
                        className="input"
                        placeholder="2022"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-theme-secondary mb-2">
                        GPA (optional)
                      </label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].gpa = e.target.value;
                          setEducation(updated);
                        }}
                        className="input"
                        placeholder="3.8"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Skills */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-theme">Skills & Certifications</h2>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-theme-secondary">
                    Skills *
                  </label>
                  <button onClick={addSkill} className="text-blue-500 hover:text-blue-600 text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    Add Skill
                  </button>
                </div>
                <div className="space-y-2">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        className="input flex-1"
                        placeholder="e.g., JavaScript, React, Node.js"
                      />
                      {skills.length > 1 && (
                        <button
                          onClick={() => removeSkill(index)}
                          className="p-2 text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-secondary mb-2">
                  Certifications (optional)
                </label>
                <textarea
                  value={certifications}
                  onChange={(e) => setCertifications(e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="AWS Certified Solutions Architect&#10;PMP Certified"
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Resume...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Create Resume
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
