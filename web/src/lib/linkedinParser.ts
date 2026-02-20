/**
 * LinkedIn Profile PDF Parser
 *
 * Parses LinkedIn profile PDFs (downloaded via "Save to PDF" feature)
 * and extracts structured resume data.
 */

export interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  summary?: string;
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  skills: string[];
  certifications: LinkedInCertification[];
  languages?: string[];
}

export interface LinkedInExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string; // undefined for current positions
  description?: string;
  duration?: string;
}

export interface LinkedInEducation {
  school: string;
  degree: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  activities?: string;
}

export interface LinkedInCertification {
  name: string;
  issuer: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

/**
 * Parse LinkedIn profile PDF text
 */
export async function parseLinkedInPDF(file: File): Promise<LinkedInProfile> {
  try {
    // Read PDF as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Use pdf.js to extract text (we'll need to add this dependency)
    const text = await extractTextFromPDF(arrayBuffer);

    // Parse the extracted text
    return parseLinkedInText(text);
  } catch (error) {
    console.error('Error parsing LinkedIn PDF:', error);
    throw new Error('Failed to parse LinkedIn profile. Please ensure this is a valid LinkedIn PDF export.');
  }
}

/**
 * Extract text from PDF using pdf.js
 */
async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
  // Dynamic import to avoid bundling pdf.js in main bundle
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  // Extract text from all pages
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

/**
 * Parse LinkedIn profile text into structured data
 */
export function parseLinkedInText(text: string): LinkedInProfile {
  // Clean up text (remove extra whitespace, normalize line breaks)
  const cleanText = text.replace(/\s+/g, ' ').trim();

  // Extract name (usually first line)
  const nameMatch = cleanText.match(/^([A-Z][a-zA-Z\s'-]+)/);
  const name = nameMatch ? nameMatch[1].trim() : '';

  // Extract headline (usually after name)
  const headlineMatch = cleanText.match(/Contact\s+(.+?)\s+Top Skills/i) ||
                        cleanText.match(/^[A-Z][a-zA-Z\s'-]+\s+(.+?)\s+Contact/i);
  const headline = headlineMatch ? headlineMatch[1].trim() : '';

  // Extract location
  const locationMatch = cleanText.match(/(?:Location|Based in)[:\s]+([^•\n]+)/i);
  const location = locationMatch ? locationMatch[1].trim() : '';

  // Extract email
  const emailMatch = cleanText.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const email = emailMatch ? emailMatch[1] : undefined;

  // Extract phone
  const phoneMatch = cleanText.match(/(?:Phone|Mobile|Tel)[:\s]*([\d\s\-\(\)]+)/i) ||
                     cleanText.match(/(\(\d{3}\)\s*\d{3}-\d{4}|\d{3}-\d{3}-\d{4})/);
  const phone = phoneMatch ? phoneMatch[1].trim() : undefined;

  // Extract LinkedIn URL
  const linkedinMatch = cleanText.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+/i);
  const linkedin = linkedinMatch ? linkedinMatch[0] : undefined;

  // Extract summary
  const summaryMatch = cleanText.match(/Summary\s+(.+?)\s+Experience/is);
  const summary = summaryMatch ? summaryMatch[1].trim() : undefined;

  // Extract experience
  const experience = parseExperience(cleanText);

  // Extract education
  const education = parseEducation(cleanText);

  // Extract skills
  const skills = parseSkills(cleanText);

  // Extract certifications
  const certifications = parseCertifications(cleanText);

  return {
    name,
    headline,
    location,
    email,
    phone,
    linkedin,
    summary,
    experience,
    education,
    skills,
    certifications,
  };
}

/**
 * Parse experience section
 */
export function parseExperience(text: string): LinkedInExperience[] {
  const experiences: LinkedInExperience[] = [];

  // Match experience section
  const experienceSection = text.match(/Experience\s+(.+?)(?:Education|Skills|Certifications|$)/is);
  if (!experienceSection) return experiences;

  const expText = experienceSection[1];

  // Split by company entries (LinkedIn PDFs typically have company name followed by role)
  // Pattern: Company Name · Employment Type Title · Dates · Duration
  const entries = expText.split(/(?=[A-Z][a-zA-Z\s&,.-]+·)/);

  for (const entry of entries) {
    if (entry.trim().length < 10) continue; // Skip very short entries

    // Extract company name (before first ·)
    const companyMatch = entry.match(/^([^·\n]+)/);
    const company = companyMatch ? companyMatch[1].trim() : '';

    // Extract title (after · and before dates)
    const titleMatch = entry.match(/·\s*([^·\n]+?)\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract dates (e.g., "Jan 2020 - Present", "Mar 2018 - Dec 2020")
    const dateMatch = entry.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s*[-–]\s*(?:(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}|Present)/i);
    const startDate = dateMatch ? dateMatch[0].split(/[-–]/)[0].trim() : '';
    const endDate = dateMatch && !dateMatch[0].includes('Present') ? dateMatch[0].split(/[-–]/)[1].trim() : undefined;

    // Extract duration (e.g., "2 yrs 3 mos")
    const durationMatch = entry.match(/(\d+\s*(?:yr|yrs|year|years|mo|mos|month|months)[\s\d]*(?:yr|yrs|year|years|mo|mos|month|months)?)/i);
    const duration = durationMatch ? durationMatch[1].trim() : undefined;

    // Extract location (if present, usually after title)
    const locationMatch = entry.match(/(?:·\s*)([A-Z][a-zA-Z\s,]+(?:, [A-Z]{2})?)\s*(?:·|$)/);
    const location = locationMatch ? locationMatch[1].trim() : undefined;

    // Extract description (text after dates/duration)
    const descMatch = entry.match(/(?:\d+\s*(?:yr|mo)s?\s*)+\s+(.+)/is);
    const description = descMatch ? descMatch[1].trim() : undefined;

    if (company && title) {
      experiences.push({
        title,
        company,
        location,
        startDate,
        endDate,
        description,
        duration,
      });
    }
  }

  return experiences;
}

/**
 * Parse education section
 */
export function parseEducation(text: string): LinkedInEducation[] {
  const education: LinkedInEducation[] = [];

  const educationSection = text.match(/Education\s+(.+?)(?:Skills|Certifications|Languages|Accomplishments|$)/is);
  if (!educationSection) return education;

  const eduText = educationSection[1];

  // Split by school entries
  const entries = eduText.split(/(?=[A-Z][a-zA-Z\s&,.-]+(?:University|College|Institute|School|Academy))/i);

  for (const entry of entries) {
    if (entry.trim().length < 10) continue;

    // Extract school name
    const schoolMatch = entry.match(/^([^\n]+(?:University|College|Institute|School|Academy)[^\n]*)/i);
    const school = schoolMatch ? schoolMatch[1].trim() : '';

    // Extract degree (Bachelor's, Master's, PhD, etc.)
    const degreeMatch = entry.match(/(Bachelor|Master|PhD|Ph\.D\.|Associate|Doctorate|B\.S\.|M\.S\.|MBA|B\.A\.|M\.A\.)(?:'s)?\s*(?:of\s*)?([^\n,]+)?/i);
    const degree = degreeMatch ? degreeMatch[0].trim() : '';

    // Extract field of study
    const fieldMatch = entry.match(/(?:in|of)\s+([A-Z][a-zA-Z\s&,-]+?)(?:\s*[\n·]|\s*\d{4})/);
    const field = fieldMatch ? fieldMatch[1].trim() : undefined;

    // Extract dates
    const dateMatch = entry.match(/(\d{4})\s*[-–]\s*(\d{4}|Present)/);
    const startDate = dateMatch ? dateMatch[1] : undefined;
    const endDate = dateMatch ? dateMatch[2] : undefined;

    // Extract grade/GPA
    const gradeMatch = entry.match(/(?:GPA|Grade)[:\s]*([\d.]+)/i);
    const grade = gradeMatch ? gradeMatch[1] : undefined;

    if (school && degree) {
      education.push({
        school,
        degree,
        field,
        startDate,
        endDate,
        grade,
      });
    }
  }

  return education;
}

/**
 * Parse skills section
 */
export function parseSkills(text: string): string[] {
  const skills: string[] = [];

  // Match skills section (LinkedIn PDFs list "Top Skills" or just "Skills")
  const skillsSection = text.match(/(?:Top\s+)?Skills\s+(.+?)(?:Certifications|Education|Languages|Experience|$)/is);
  if (!skillsSection) return skills;

  const skillsText = skillsSection[1];

  // Skills are typically listed one per line or separated by bullets
  const skillMatches = skillsText.match(/[A-Z][a-zA-Z0-9\s\-\+\.#]+/g);
  if (skillMatches) {
    skillMatches.forEach(skill => {
      const cleaned = skill.trim();
      if (cleaned.length > 2 && cleaned.length < 50) {
        skills.push(cleaned);
      }
    });
  }

  // Remove duplicates
  return Array.from(new Set(skills));
}

/**
 * Parse certifications section
 */
export function parseCertifications(text: string): LinkedInCertification[] {
  const certifications: LinkedInCertification[] = [];

  const certSection = text.match(/(?:Licenses\s*&\s*)?Certifications\s+(.+?)(?:Projects|Publications|Languages|$)/is);
  if (!certSection) return certifications;

  const certText = certSection[1];

  // Split by certification entries
  const entries = certText.split(/(?=[A-Z][a-zA-Z\s:,-]+(?:Certification|Certificate|Certified))/i);

  for (const entry of entries) {
    if (entry.trim().length < 10) continue;

    // Extract certification name
    const nameMatch = entry.match(/^([^\n]+)/);
    const name = nameMatch ? nameMatch[1].trim() : '';

    // Extract issuer (usually follows certification name)
    const issuerMatch = entry.match(/(?:Issued by|Issuer)[:\s]+([^\n]+)/i) ||
                       entry.match(/\n([A-Z][a-zA-Z\s&,.-]+)\s*(?:Issued|Credential|$)/);
    const issuer = issuerMatch ? issuerMatch[1].trim() : '';

    // Extract issue date
    const issueDateMatch = entry.match(/Issued\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i);
    const issueDate = issueDateMatch ? issueDateMatch[0].replace('Issued ', '') : undefined;

    // Extract credential ID
    const credIdMatch = entry.match(/Credential ID[:\s]+([A-Za-z0-9-]+)/i);
    const credentialId = credIdMatch ? credIdMatch[1] : undefined;

    if (name) {
      certifications.push({
        name,
        issuer: issuer || 'Unknown',
        issueDate,
        credentialId,
      });
    }
  }

  return certifications;
}

/**
 * Convert LinkedIn profile to resume data format
 */
export function linkedInToResumeData(profile: LinkedInProfile) {
  return {
    personalInfo: {
      name: profile.name,
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.location,
      linkedin: profile.linkedin,
    },
    summary: profile.summary || profile.headline || '',
    experience: profile.experience.map(exp => ({
      company: exp.company,
      title: exp.title,
      location: exp.location || '',
      startDate: exp.startDate,
      endDate: exp.endDate || 'Present',
      description: exp.description || '',
      achievements: exp.description ? [exp.description] : [],
    })),
    education: profile.education.map(edu => ({
      school: edu.school,
      degree: edu.degree,
      field: edu.field || '',
      startDate: edu.startDate || '',
      endDate: edu.endDate || '',
      gpa: edu.grade,
    })),
    skills: profile.skills,
    certifications: profile.certifications.map(cert => ({
      name: cert.name,
      issuer: cert.issuer,
      date: cert.issueDate || '',
      credentialId: cert.credentialId,
    })),
  };
}
