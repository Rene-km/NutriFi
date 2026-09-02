import { renderHook, act } from '@testing-library/react-native';
import useBMIHook from '@/hooks/Profile/bmi_hook';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

global.alert = jest.fn();

describe('BMI Flow - Integration', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // IT-BMI-001: Calculate BMI then save to profile successfully
  it('IT-BMI-001: calculate BMI then save to profile successfully', async () => {
    const mockUser = { id: 'user-123', email: 'isaac@test.com' };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
    });

    const mockUpdate = jest.fn().mockReturnValue({
      eq: jest.fn().mockResolvedValue({ error: null }),
    });

    (supabase.from as jest.Mock).mockReturnValue({
      update: mockUpdate,
    });

    const { result } = renderHook(() => useBMIHook());

    // Step 1: Calculate BMI
    act(() => {
      result.current.setWeight('75');
      result.current.setHeight('180');
    });

    act(() => {
      result.current.calculateBMI();
    });

    // BMI should be calculated
    expect(result.current.bmiResult).not.toBeNull();
    expect(result.current.bmiResult?.bmi).toBe(23.1);

    // Step 2: Save to profile (integration point - connects to Supabase)
    await act(async () => {
      await result.current.saveBMIToProfile();
    });

    // Verify Supabase was called with correct data
    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith('profile');
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        bmi: 23.1,
        weight_kg: 75,
        height_cm: 180,
        unit: 'metric',
      })
    );

    // Save confirmed
    expect(result.current.isSaved).toBe(true);
    expect(global.alert).toHaveBeenCalledWith('BMI saved successfully!');
  });

  // IT-BMI-002: Calculate BMI but save fails when not logged in
  it('IT-BMI-002: save fails when user is not logged in', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
    });

    const { result } = renderHook(() => useBMIHook());

    act(() => {
      result.current.setWeight('75');
      result.current.setHeight('180');
    });

    act(() => {
      result.current.calculateBMI();
    });

    expect(result.current.bmiResult?.bmi).toBe(23.1);

    await act(async () => {
      await result.current.saveBMIToProfile();
    });

    // Should NOT have called Supabase profile update
    expect(supabase.from).not.toHaveBeenCalled();

    // Should show login alert
    expect(global.alert).toHaveBeenCalledWith('You must be logged in to save');

    // Should NOT be marked as saved
    expect(result.current.isSaved).toBe(false);
  });
});