jest.mock('../../api/client', () => ({
  api: {
    listInterviewPreps: jest.fn(),
    getInterviewPrep: jest.fn(),
    generateInterviewPrep: jest.fn(),
    deleteInterviewPrep: jest.fn(),
    generateCommonQuestions: jest.fn(),
    generateBehavioralTechnicalQuestions: jest.fn(),
    regenerateSingleQuestion: jest.fn(),
    getPracticeHistory: jest.fn(),
    savePracticeResponse: jest.fn(),
  },
}));

import { useInterviewStore } from '../interviewStore';
import { api } from '../../api/client';

const mockedApi = api as jest.Mocked<typeof api>;

const mockPrep = {
  id: 1,
  tailored_resume_id: 10,
  company: 'Acme Corp',
  job_title: 'Security Engineer',
  created_at: '2026-01-15T00:00:00Z',
  status: 'completed',
};

const mockPrep2 = {
  id: 2,
  tailored_resume_id: 11,
  company: 'Beta Inc',
  job_title: 'Program Manager',
  created_at: '2026-01-20T00:00:00Z',
  status: 'completed',
};

const mockCommonQuestion = {
  id: 100,
  interview_prep_id: 1,
  question: 'Tell me about yourself',
  category: 'common',
  suggested_answer: 'I am a security professional...',
  tips: ['Be concise', 'Highlight relevant experience'],
};

const mockBehavioralQuestion = {
  id: 101,
  interview_prep_id: 1,
  question: 'Describe a conflict resolution experience',
  category: 'behavioral',
  suggested_answer: 'In my previous role...',
  tips: ['Use STAR format'],
};

const mockTechnicalQuestion = {
  id: 102,
  interview_prep_id: 1,
  question: 'Explain the NIST framework',
  category: 'technical',
  suggested_answer: 'NIST CSF consists of...',
  tips: ['Be thorough'],
};

const mockPracticeResponse = {
  id: 50,
  question_text: 'Tell me about yourself',
  response_text: 'I am a security professional with 10+ years...',
  practiced_at: '2026-01-16T10:00:00Z',
  duration_seconds: 120,
  times_practiced: 3,
};

describe('InterviewStore', () => {
  beforeEach(() => {
    useInterviewStore.getState().reset();
    jest.clearAllMocks();
  });

  // ── Initial state ────────────────────────────────────────────

  it('should have correct initial state', () => {
    const state = useInterviewStore.getState();

    expect(state.interviewPreps).toEqual([]);
    expect(state.selectedInterviewPrep).toBeNull();
    expect(state.commonQuestions).toEqual([]);
    expect(state.behavioralQuestions).toEqual([]);
    expect(state.technicalQuestions).toEqual([]);
    expect(state.practiceHistory).toEqual([]);
    expect(state.isLoadingPreps).toBe(false);
    expect(state.isLoadingQuestions).toBe(false);
    expect(state.isGenerating).toBe(false);
    expect(state.isSavingPractice).toBe(false);
    expect(state.error).toBeNull();
  });

  // ── fetchInterviewPreps ──────────────────────────────────────

  it('fetchInterviewPreps success with flat data', async () => {
    mockedApi.listInterviewPreps.mockResolvedValue({
      success: true,
      data: [mockPrep, mockPrep2],
    });

    await useInterviewStore.getState().fetchInterviewPreps();

    const state = useInterviewStore.getState();
    expect(state.interviewPreps).toEqual([mockPrep, mockPrep2]);
    expect(state.isLoadingPreps).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchInterviewPreps success with nested data (interview_preps key)', async () => {
    mockedApi.listInterviewPreps.mockResolvedValue({
      success: true,
      data: { interview_preps: [mockPrep] },
    });

    await useInterviewStore.getState().fetchInterviewPreps();

    expect(useInterviewStore.getState().interviewPreps).toEqual([mockPrep]);
  });

  it('fetchInterviewPreps error: sets error', async () => {
    mockedApi.listInterviewPreps.mockResolvedValue({
      success: false,
      error: 'Forbidden',
    });

    await useInterviewStore.getState().fetchInterviewPreps();

    const state = useInterviewStore.getState();
    expect(state.error).toBe('Forbidden');
    expect(state.interviewPreps).toEqual([]);
    expect(state.isLoadingPreps).toBe(false);
  });

  it('fetchInterviewPreps exception: sets error from thrown error', async () => {
    mockedApi.listInterviewPreps.mockRejectedValue(new Error('Network failure'));

    await useInterviewStore.getState().fetchInterviewPreps();

    expect(useInterviewStore.getState().error).toBe('Network failure');
    expect(useInterviewStore.getState().isLoadingPreps).toBe(false);
  });

  // ── fetchInterviewPrep (single) ──────────────────────────────

  it('fetchInterviewPrep success: sets selectedInterviewPrep', async () => {
    mockedApi.getInterviewPrep.mockResolvedValue({
      success: true,
      data: mockPrep,
    });

    const result = await useInterviewStore.getState().fetchInterviewPrep(1);

    expect(result).toEqual(mockPrep);
    expect(useInterviewStore.getState().selectedInterviewPrep).toEqual(mockPrep);
    expect(useInterviewStore.getState().isLoadingPreps).toBe(false);
  });

  it('fetchInterviewPrep error: returns null and sets error', async () => {
    mockedApi.getInterviewPrep.mockResolvedValue({
      success: false,
      error: 'Not found',
    });

    const result = await useInterviewStore.getState().fetchInterviewPrep(999);

    expect(result).toBeNull();
    expect(useInterviewStore.getState().error).toBe('Not found');
    expect(useInterviewStore.getState().isLoadingPreps).toBe(false);
  });

  it('fetchInterviewPrep exception: returns null', async () => {
    mockedApi.getInterviewPrep.mockRejectedValue(new Error('Timeout'));

    const result = await useInterviewStore.getState().fetchInterviewPrep(1);

    expect(result).toBeNull();
    expect(useInterviewStore.getState().error).toBe('Timeout');
  });

  // ── selectInterviewPrep ──────────────────────────────────────

  it('selectInterviewPrep: sets selectedInterviewPrep', () => {
    useInterviewStore.getState().selectInterviewPrep(mockPrep);

    expect(useInterviewStore.getState().selectedInterviewPrep).toEqual(mockPrep);
  });

  it('selectInterviewPrep null: clears selection', () => {
    useInterviewStore.getState().selectInterviewPrep(mockPrep);
    useInterviewStore.getState().selectInterviewPrep(null);

    expect(useInterviewStore.getState().selectedInterviewPrep).toBeNull();
  });

  // ── generateInterviewPrep ────────────────────────────────────

  it('generateInterviewPrep success: prepends to list and selects it', async () => {
    // Seed existing preps
    mockedApi.listInterviewPreps.mockResolvedValue({
      success: true,
      data: [mockPrep2],
    });
    await useInterviewStore.getState().fetchInterviewPreps();

    mockedApi.generateInterviewPrep.mockResolvedValue({
      success: true,
      data: mockPrep,
    });

    const result = await useInterviewStore.getState().generateInterviewPrep(10);

    expect(result).toEqual(mockPrep);
    const state = useInterviewStore.getState();
    expect(state.interviewPreps[0]).toEqual(mockPrep);
    expect(state.interviewPreps[1]).toEqual(mockPrep2);
    expect(state.selectedInterviewPrep).toEqual(mockPrep);
    expect(state.isGenerating).toBe(false);
  });

  it('generateInterviewPrep failure: returns null and sets error', async () => {
    mockedApi.generateInterviewPrep.mockResolvedValue({
      success: false,
      error: 'AI service unavailable',
    });

    const result = await useInterviewStore.getState().generateInterviewPrep(10);

    expect(result).toBeNull();
    expect(useInterviewStore.getState().error).toBe('AI service unavailable');
    expect(useInterviewStore.getState().isGenerating).toBe(false);
  });

  it('generateInterviewPrep exception: returns null', async () => {
    mockedApi.generateInterviewPrep.mockRejectedValue(new Error('Server crash'));

    const result = await useInterviewStore.getState().generateInterviewPrep(10);

    expect(result).toBeNull();
    expect(useInterviewStore.getState().error).toBe('Server crash');
    expect(useInterviewStore.getState().isGenerating).toBe(false);
  });

  // ── deleteInterviewPrep ──────────────────────────────────────

  it('deleteInterviewPrep success: removes from list and clears selection if selected', async () => {
    // Seed state
    mockedApi.listInterviewPreps.mockResolvedValue({
      success: true,
      data: [mockPrep, mockPrep2],
    });
    await useInterviewStore.getState().fetchInterviewPreps();
    useInterviewStore.getState().selectInterviewPrep(mockPrep);

    mockedApi.deleteInterviewPrep.mockResolvedValue({ success: true });

    const result = await useInterviewStore.getState().deleteInterviewPrep(1);

    expect(result).toBe(true);
    expect(useInterviewStore.getState().interviewPreps).toEqual([mockPrep2]);
    expect(useInterviewStore.getState().selectedInterviewPrep).toBeNull();
  });

  it('deleteInterviewPrep failure: returns false and sets error', async () => {
    mockedApi.deleteInterviewPrep.mockResolvedValue({
      success: false,
      error: 'Cannot delete',
    });

    const result = await useInterviewStore.getState().deleteInterviewPrep(999);

    expect(result).toBe(false);
    expect(useInterviewStore.getState().error).toBe('Cannot delete');
  });

  it('deleteInterviewPrep exception: returns false', async () => {
    mockedApi.deleteInterviewPrep.mockRejectedValue(new Error('DB error'));

    const result = await useInterviewStore.getState().deleteInterviewPrep(1);

    expect(result).toBe(false);
    expect(useInterviewStore.getState().error).toBe('DB error');
  });

  // ── fetchCommonQuestions ─────────────────────────────────────

  it('fetchCommonQuestions success: sets commonQuestions', async () => {
    mockedApi.generateCommonQuestions.mockResolvedValue({
      success: true,
      data: { questions: [mockCommonQuestion] },
    });

    await useInterviewStore.getState().fetchCommonQuestions(1);

    expect(useInterviewStore.getState().commonQuestions).toEqual([mockCommonQuestion]);
    expect(useInterviewStore.getState().isLoadingQuestions).toBe(false);
  });

  it('fetchCommonQuestions error: sets error', async () => {
    mockedApi.generateCommonQuestions.mockResolvedValue({
      success: false,
      error: 'Failed to generate',
    });

    await useInterviewStore.getState().fetchCommonQuestions(1);

    expect(useInterviewStore.getState().error).toBe('Failed to generate');
    expect(useInterviewStore.getState().commonQuestions).toEqual([]);
    expect(useInterviewStore.getState().isLoadingQuestions).toBe(false);
  });

  it('fetchCommonQuestions exception: sets error', async () => {
    mockedApi.generateCommonQuestions.mockRejectedValue(new Error('API down'));

    await useInterviewStore.getState().fetchCommonQuestions(1);

    expect(useInterviewStore.getState().error).toBe('API down');
    expect(useInterviewStore.getState().isLoadingQuestions).toBe(false);
  });

  // ── fetchBehavioralQuestions ──────────────────────────────────

  it('fetchBehavioralQuestions: filters by category === behavioral', async () => {
    mockedApi.generateBehavioralTechnicalQuestions.mockResolvedValue({
      success: true,
      data: { questions: [mockBehavioralQuestion, mockTechnicalQuestion] },
    });

    await useInterviewStore.getState().fetchBehavioralQuestions(1);

    const state = useInterviewStore.getState();
    expect(state.behavioralQuestions).toEqual([mockBehavioralQuestion]);
    expect(state.isLoadingQuestions).toBe(false);
  });

  it('fetchBehavioralQuestions error: sets error', async () => {
    mockedApi.generateBehavioralTechnicalQuestions.mockResolvedValue({
      success: false,
      error: 'Question generation failed',
    });

    await useInterviewStore.getState().fetchBehavioralQuestions(1);

    expect(useInterviewStore.getState().error).toBe('Question generation failed');
  });

  // ── fetchTechnicalQuestions ───────────────────────────────────

  it('fetchTechnicalQuestions: filters by category === technical', async () => {
    mockedApi.generateBehavioralTechnicalQuestions.mockResolvedValue({
      success: true,
      data: { questions: [mockBehavioralQuestion, mockTechnicalQuestion] },
    });

    await useInterviewStore.getState().fetchTechnicalQuestions(1);

    const state = useInterviewStore.getState();
    expect(state.technicalQuestions).toEqual([mockTechnicalQuestion]);
    expect(state.isLoadingQuestions).toBe(false);
  });

  it('fetchTechnicalQuestions error: sets error', async () => {
    mockedApi.generateBehavioralTechnicalQuestions.mockResolvedValue({
      success: false,
      error: 'Service unavailable',
    });

    await useInterviewStore.getState().fetchTechnicalQuestions(1);

    expect(useInterviewStore.getState().error).toBe('Service unavailable');
  });

  // ── regenerateQuestion ───────────────────────────────────────

  it('regenerateQuestion success: updates correct question in common category', async () => {
    // Seed common questions
    mockedApi.generateCommonQuestions.mockResolvedValue({
      success: true,
      data: { questions: [mockCommonQuestion] },
    });
    await useInterviewStore.getState().fetchCommonQuestions(1);

    const updatedQuestion = { ...mockCommonQuestion, question: 'Updated question text' };
    mockedApi.regenerateSingleQuestion.mockResolvedValue({
      success: true,
      data: updatedQuestion,
    });

    const result = await useInterviewStore.getState().regenerateQuestion(1, 100, 'common');

    expect(result).toBe(true);
    expect(useInterviewStore.getState().commonQuestions[0]).toEqual(updatedQuestion);
  });

  it('regenerateQuestion success: updates correct question in behavioral category', async () => {
    // Seed behavioral questions
    useInterviewStore.setState({ behavioralQuestions: [mockBehavioralQuestion] });

    const updatedQuestion = { ...mockBehavioralQuestion, question: 'Updated behavioral' };
    mockedApi.regenerateSingleQuestion.mockResolvedValue({
      success: true,
      data: updatedQuestion,
    });

    const result = await useInterviewStore.getState().regenerateQuestion(1, 101, 'behavioral');

    expect(result).toBe(true);
    expect(useInterviewStore.getState().behavioralQuestions[0]).toEqual(updatedQuestion);
    // Technical should be unchanged
    expect(useInterviewStore.getState().technicalQuestions).toEqual([]);
  });

  it('regenerateQuestion failure: returns false', async () => {
    mockedApi.regenerateSingleQuestion.mockResolvedValue({
      success: false,
      error: 'Not found',
    });

    const result = await useInterviewStore.getState().regenerateQuestion(1, 999, 'common');

    expect(result).toBe(false);
  });

  it('regenerateQuestion exception: returns false', async () => {
    mockedApi.regenerateSingleQuestion.mockRejectedValue(new Error('Server error'));

    const result = await useInterviewStore.getState().regenerateQuestion(1, 100, 'common');

    expect(result).toBe(false);
  });

  // ── fetchPracticeHistory ─────────────────────────────────────

  it('fetchPracticeHistory success: sets practice history array', async () => {
    mockedApi.getPracticeHistory.mockResolvedValue({
      success: true,
      data: [mockPracticeResponse],
    });

    await useInterviewStore.getState().fetchPracticeHistory(1);

    expect(useInterviewStore.getState().practiceHistory).toEqual([mockPracticeResponse]);
  });

  it('fetchPracticeHistory non-array data: sets empty array', async () => {
    mockedApi.getPracticeHistory.mockResolvedValue({
      success: true,
      data: { some: 'object' },
    });

    await useInterviewStore.getState().fetchPracticeHistory(1);

    expect(useInterviewStore.getState().practiceHistory).toEqual([]);
  });

  it('fetchPracticeHistory exception: does not crash (logs error)', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedApi.getPracticeHistory.mockRejectedValue(new Error('DB error'));

    await useInterviewStore.getState().fetchPracticeHistory(1);

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  // ── savePracticeResponse ─────────────────────────────────────

  it('savePracticeResponse success: returns true and refreshes history', async () => {
    mockedApi.savePracticeResponse.mockResolvedValue({ success: true });
    mockedApi.getPracticeHistory.mockResolvedValue({
      success: true,
      data: [mockPracticeResponse],
    });

    const practiceData = {
      interviewPrepId: 1,
      questionText: 'Tell me about yourself',
      questionCategory: 'common',
      writtenAnswer: 'I am a security professional...',
      practiceDurationSeconds: 120,
    };

    const result = await useInterviewStore.getState().savePracticeResponse(practiceData);

    expect(result).toBe(true);
    expect(mockedApi.getPracticeHistory).toHaveBeenCalledWith(1);
    expect(useInterviewStore.getState().isSavingPractice).toBe(false);
  });

  it('savePracticeResponse failure: returns false', async () => {
    mockedApi.savePracticeResponse.mockResolvedValue({ success: false });

    const practiceData = {
      interviewPrepId: 1,
      questionText: 'Question',
    };

    const result = await useInterviewStore.getState().savePracticeResponse(practiceData);

    expect(result).toBe(false);
    expect(useInterviewStore.getState().isSavingPractice).toBe(false);
  });

  it('savePracticeResponse exception: returns false', async () => {
    mockedApi.savePracticeResponse.mockRejectedValue(new Error('Save failed'));

    const practiceData = {
      interviewPrepId: 1,
      questionText: 'Question',
    };

    const result = await useInterviewStore.getState().savePracticeResponse(practiceData);

    expect(result).toBe(false);
    expect(useInterviewStore.getState().isSavingPractice).toBe(false);
  });

  // ── clearError ───────────────────────────────────────────────

  it('clearError: sets error to null', () => {
    useInterviewStore.setState({ error: 'Some error' });

    useInterviewStore.getState().clearError();

    expect(useInterviewStore.getState().error).toBeNull();
  });

  // ── reset ────────────────────────────────────────────────────

  it('reset: restores all state to initial values', async () => {
    // Mutate state
    mockedApi.listInterviewPreps.mockResolvedValue({
      success: true,
      data: [mockPrep],
    });
    await useInterviewStore.getState().fetchInterviewPreps();
    useInterviewStore.getState().selectInterviewPrep(mockPrep);
    useInterviewStore.setState({
      commonQuestions: [mockCommonQuestion],
      behavioralQuestions: [mockBehavioralQuestion],
      technicalQuestions: [mockTechnicalQuestion],
      practiceHistory: [mockPracticeResponse],
      error: 'some error',
    });

    // Reset
    useInterviewStore.getState().reset();

    const state = useInterviewStore.getState();
    expect(state.interviewPreps).toEqual([]);
    expect(state.selectedInterviewPrep).toBeNull();
    expect(state.commonQuestions).toEqual([]);
    expect(state.behavioralQuestions).toEqual([]);
    expect(state.technicalQuestions).toEqual([]);
    expect(state.practiceHistory).toEqual([]);
    expect(state.isLoadingPreps).toBe(false);
    expect(state.isLoadingQuestions).toBe(false);
    expect(state.isGenerating).toBe(false);
    expect(state.isSavingPractice).toBe(false);
    expect(state.error).toBeNull();
  });
});
