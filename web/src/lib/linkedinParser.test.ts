/**
 * Tests for LinkedIn Profile PDF Parser
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseLinkedInText,
  parseExperience,
  parseEducation,
  parseSkills,
  parseCertifications,
  linkedInToResumeData,
} from './linkedinParser';

// Note: We're testing the internal parsing functions directly
// since we can't easily test PDF parsing in unit tests

describe('linkedinParser', () => {
  describe('parseExperience', () => {
    it('should parse experience entries correctly', () => {
      const text = `Experience
        Senior Software Engineer · Full-time
        Google · Jan 2020 - Present · 3 yrs 2 mos
        Mountain View, CA
        Led development of search ranking algorithms.

        Software Engineer · Full-time
        Microsoft · Mar 2018 - Dec 2020 · 2 yrs 9 mos
        Redmond, WA
        Built cloud infrastructure tools.

        Education`;

      const experience = parseExperience(text);

      expect(experience).toHaveLength(2);
      expect(experience[0]).toMatchObject({
        title: expect.stringContaining('Engineer'),
        company: expect.any(String),
      });
    });

    it('should handle missing experience section', () => {
      const text = 'Skills JavaScript Python';
      const experience = parseExperience(text);
      expect(experience).toHaveLength(0);
    });
  });

  describe('parseEducation', () => {
    it('should parse education entries correctly', () => {
      const text = `Education
        Stanford University
        Master's of Science in Computer Science
        2016 - 2018
        GPA: 3.9

        University of California, Berkeley
        Bachelor of Science in Engineering
        2012 - 2016

        Skills`;

      const education = parseEducation(text);

      expect(education).toHaveLength(2);
      expect(education[0]).toMatchObject({
        school: expect.stringContaining('Stanford'),
        degree: expect.stringContaining('Master'),
      });
    });

    it('should handle missing education section', () => {
      const text = 'Experience Software Engineer';
      const education = parseEducation(text);
      expect(education).toHaveLength(0);
    });
  });

  describe('parseSkills', () => {
    it('should parse skills list correctly', () => {
      const text = `Top Skills
        JavaScript
        Python
        React
        Node.js
        AWS
        Docker
        Certifications`;

      const skills = parseSkills(text);

      expect(skills.length).toBeGreaterThan(0);
      expect(skills).toContain('JavaScript');
      expect(skills).toContain('Python');
    });

    it('should deduplicate skills', () => {
      const text = `Skills
        JavaScript
        Python
        JavaScript
        React
        Languages`;

      const skills = parseSkills(text);
      const jsCount = skills.filter(s => s === 'JavaScript').length;
      expect(jsCount).toBe(1);
    });

    it('should handle missing skills section', () => {
      const text = 'Experience Software Engineer';
      const skills = parseSkills(text);
      expect(skills).toHaveLength(0);
    });
  });

  describe('parseCertifications', () => {
    it('should parse certifications correctly', () => {
      const text = `Certifications
        AWS Certified Solutions Architect
        Issued by Amazon Web Services
        Issued Jan 2023
        Credential ID ABC123

        Professional Scrum Master I
        Issued by Scrum.org
        Issued Mar 2022

        Projects`;

      const certs = parseCertifications(text);

      expect(certs.length).toBeGreaterThan(0);
      expect(certs[0]).toMatchObject({
        name: expect.stringContaining('AWS'),
        issuer: expect.any(String),
      });
    });

    it('should handle missing certifications section', () => {
      const text = 'Skills JavaScript Python';
      const certs = parseCertifications(text);
      expect(certs).toHaveLength(0);
    });
  });

  describe('linkedInToResumeData', () => {
    it('should convert LinkedIn profile to resume data format', () => {
      const profile = {
        name: 'John Doe',
        headline: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        email: 'john@example.com',
        phone: '555-1234',
        linkedin: 'https://linkedin.com/in/johndoe',
        summary: 'Experienced software engineer...',
        experience: [
          {
            title: 'Senior Engineer',
            company: 'Google',
            location: 'Mountain View, CA',
            startDate: 'Jan 2020',
            endDate: undefined,
            description: 'Led team...',
          },
        ],
        education: [
          {
            school: 'Stanford University',
            degree: "Master's in CS",
            field: 'Computer Science',
            startDate: '2016',
            endDate: '2018',
          },
        ],
        skills: ['JavaScript', 'Python', 'React'],
        certifications: [
          {
            name: 'AWS Certified',
            issuer: 'Amazon',
            issueDate: 'Jan 2023',
          },
        ],
      };

      const resumeData = linkedInToResumeData(profile);

      expect(resumeData.personalInfo).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '555-1234',
        linkedin: 'https://linkedin.com/in/johndoe',
        location: 'San Francisco, CA',
      });

      expect(resumeData.summary).toBe('Experienced software engineer...');
      expect(resumeData.skills).toHaveLength(3);
      expect(resumeData.experience).toHaveLength(1);
      expect(resumeData.education).toHaveLength(1);
      expect(resumeData.certifications).toHaveLength(1);
    });

    it('should handle missing optional fields', () => {
      const profile = {
        name: 'Jane Smith',
        headline: 'Developer',
        location: 'Austin, TX',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
      };

      const resumeData = linkedInToResumeData(profile);

      expect(resumeData.personalInfo.name).toBe('Jane Smith');
      expect(resumeData.personalInfo.email).toBe('');
      expect(resumeData.skills).toHaveLength(0);
    });

    it('should use headline as summary fallback', () => {
      const profile = {
        name: 'Test User',
        headline: 'Software Engineer at Google',
        location: 'NYC',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
      };

      const resumeData = linkedInToResumeData(profile);

      expect(resumeData.summary).toBe('Software Engineer at Google');
    });
  });
});
