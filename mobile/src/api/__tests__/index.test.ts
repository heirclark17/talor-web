/**
 * Tests for api/index.ts barrel exports
 */

jest.mock('../base', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  del: jest.fn(),
  fetchWithAuth: jest.fn(),
  snakeToCamel: jest.fn((x: any) => x),
  camelToSnake: jest.fn((x: any) => x),
}));

jest.mock('../client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('api/index barrel exports', () => {
  it('should export resumeApi', () => {
    const mod = require('../index');
    expect(mod.resumeApi).toBeDefined();
    expect(mod.resumeApi.getResumes).toBeDefined();
  });

  it('should export tailorApi', () => {
    const mod = require('../index');
    expect(mod.tailorApi).toBeDefined();
    expect(mod.tailorApi.tailorResume).toBeDefined();
  });

  it('should export interviewApi', () => {
    const mod = require('../index');
    expect(mod.interviewApi).toBeDefined();
    expect(mod.interviewApi.getInterviewPreps).toBeDefined();
  });

  it('should export combined api object as default', () => {
    const mod = require('../index');
    expect(mod.default).toBeDefined();
    expect(mod.api).toBeDefined();
  });

  it('should export base utilities', () => {
    const mod = require('../index');
    expect(mod.fetchWithAuth).toBeDefined();
    expect(mod.snakeToCamel).toBeDefined();
    expect(mod.camelToSnake).toBeDefined();
    expect(mod.get).toBeDefined();
    expect(mod.post).toBeDefined();
    expect(mod.put).toBeDefined();
    expect(mod.del).toBeDefined();
  });

  it('should have all resume methods on combined api', () => {
    const mod = require('../index');
    expect(mod.api.getResumes).toBeDefined();
    expect(mod.api.getResume).toBeDefined();
    expect(mod.api.uploadResume).toBeDefined();
    expect(mod.api.deleteResume).toBeDefined();
  });

  it('should have all tailor methods on combined api', () => {
    const mod = require('../index');
    expect(mod.api.extractJobDetails).toBeDefined();
    expect(mod.api.tailorResume).toBeDefined();
    expect(mod.api.getTailoredResume).toBeDefined();
    expect(mod.api.getTailoredResumes).toBeDefined();
    expect(mod.api.tailorResumeBatch).toBeDefined();
  });

  it('should have all interview methods on combined api', () => {
    const mod = require('../index');
    expect(mod.api.getInterviewPreps).toBeDefined();
    expect(mod.api.getInterviewPrep).toBeDefined();
    expect(mod.api.generateInterviewPrep).toBeDefined();
    expect(mod.api.deleteInterviewPrep).toBeDefined();
    expect(mod.api.getCommonQuestions).toBeDefined();
    expect(mod.api.getBehavioralQuestions).toBeDefined();
    expect(mod.api.getTechnicalQuestions).toBeDefined();
    expect(mod.api.regenerateQuestion).toBeDefined();
    expect(mod.api.generatePracticeQuestions).toBeDefined();
    expect(mod.api.generatePracticeStarStory).toBeDefined();
    expect(mod.api.savePracticeResponse).toBeDefined();
    expect(mod.api.getPracticeHistory).toBeDefined();
    expect(mod.api.getCompanyResearch).toBeDefined();
    expect(mod.api.getCompanyNews).toBeDefined();
    expect(mod.api.getValuesAlignment).toBeDefined();
    expect(mod.api.getReadinessScore).toBeDefined();
    expect(mod.api.getInterviewStrategy).toBeDefined();
    expect(mod.api.getCompetitiveIntelligence).toBeDefined();
  });

  it('should export individual functions from domain APIs', () => {
    const mod = require('../index');
    // From resumeApi
    expect(mod.getResumes).toBeDefined();
    expect(mod.uploadResume).toBeDefined();
    // From tailorApi
    expect(mod.tailorResume).toBeDefined();
    expect(mod.extractJobDetails).toBeDefined();
    // From interviewApi
    expect(mod.getInterviewPreps).toBeDefined();
    expect(mod.generateInterviewPrep).toBeDefined();
  });
});
