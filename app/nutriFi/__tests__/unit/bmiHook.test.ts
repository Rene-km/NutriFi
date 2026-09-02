import { renderHook, act } from '@testing-library/react-native';
import useBMIHook from '@/hooks/Profile/bmi_hook';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock alert
global.alert = jest.fn();

describe('BMI Hook - Unit Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // UT-BMI-001: Calculates BMI correctly with valid metric inputs
  it('UT-BMI-001: calculates BMI correctly with valid metric inputs', () => {
    const { result } = renderHook(() => useBMIHook());

    act(() => {
      result.current.setWeight('75');
      result.current.setHeight('180');
    });

    act(() => {
      result.current.calculateBMI();
    });

    // BMI = 75 / (1.8 * 1.8) = 23.1
    expect(result.current.bmiResult).not.toBeNull();
    expect(result.current.bmiResult?.bmi).toBe(23.1);
    expect(result.current.bmiResult?.category).toBe('Normal Weight');
    expect(result.current.bmiResult?.categoryColor).toBe('#2ecc71');
  });

  // UT-BMI-002: Categorises underweight correctly
  it('UT-BMI-002: categorises underweight correctly', () => {
    const { result } = renderHook(() => useBMIHook());

    act(() => {
      result.current.setWeight('50');
      result.current.setHeight('180');
    });

    act(() => {
      result.current.calculateBMI();
    });

    // BMI = 50 / (1.8 * 1.8) = 15.4
    expect(result.current.bmiResult?.bmi).toBe(15.4);
    expect(result.current.bmiResult?.category).toBe('Underweight');
    expect(result.current.bmiResult?.categoryColor).toBe('#3498db');
  });

  // UT-BMI-003: Categorises overweight correctly
  it('UT-BMI-003: categorises overweight correctly', () => {
    const { result } = renderHook(() => useBMIHook());

    act(() => {
      result.current.setWeight('85');
      result.current.setHeight('170');
    });

    act(() => {
      result.current.calculateBMI();
    });

    // BMI = 85 / (1.7 * 1.7) = 29.4
    expect(result.current.bmiResult?.bmi).toBe(29.4);
    expect(result.current.bmiResult?.category).toBe('Overweight');
    expect(result.current.bmiResult?.categoryColor).toBe('#f39c12');
  });

  // UT-BMI-004: Categorises obese correctly
  it('UT-BMI-004: categorises obese correctly', () => {
    const { result } = renderHook(() => useBMIHook());

    act(() => {
      result.current.setWeight('110');
      result.current.setHeight('170');
    });

    act(() => {
      result.current.calculateBMI();
    });

    // BMI = 110 / (1.7 * 1.7) = 38.1
    expect(result.current.bmiResult?.bmi).toBe(38.1);
    expect(result.current.bmiResult?.category).toBe('Obese');
    expect(result.current.bmiResult?.categoryColor).toBe('#e74c3c');
  });

  // UT-BMI-005: Shows alert when weight is empty
  it('UT-BMI-005: shows alert when weight is empty', () => {
    const { result } = renderHook(() => useBMIHook());

    act(() => {
      result.current.setHeight('180');
    });

    act(() => {
      result.current.calculateBMI();
    });

    expect(global.alert).toHaveBeenCalledWith('Please enter both weight and height');
    expect(result.current.bmiResult).toBeNull();
  });

  // UT-BMI-006: Shows alert when height is empty
  it('UT-BMI-006: shows alert when height is empty', () => {
    const { result } = renderHook(() => useBMIHook());

    act(() => {
      result.current.setWeight('75');
    });

    act(() => {
      result.current.calculateBMI();
    });

    expect(global.alert).toHaveBeenCalledWith('Please enter both weight and height');
    expect(result.current.bmiResult).toBeNull();
  });

  // UT-BMI-007: Calculates BMI correctly with imperial units
  it('UT-BMI-007: calculates BMI correctly with imperial units', () => {
    const { result } = renderHook(() => useBMIHook());

    act(() => {
      result.current.setUnit('imperial');
      result.current.setWeight('165');
      result.current.setHeight('70');
    });

    act(() => {
      result.current.calculateBMI();
    });

    // BMI = (165 / (70 * 70)) * 703 = 23.7
    expect(result.current.bmiResult).not.toBeNull();
    expect(result.current.bmiResult?.bmi).toBe(23.7);
    expect(result.current.bmiResult?.category).toBe('Normal Weight');
  });

  // UT-BMI-008: Reset form clears all values
  it('UT-BMI-008: reset form clears all values', () => {
    const { result } = renderHook(() => useBMIHook());

    act(() => {
      result.current.setWeight('75');
      result.current.setHeight('180');
    });

    act(() => {
      result.current.calculateBMI();
    });

    expect(result.current.bmiResult).not.toBeNull();

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.weight).toBe('');
    expect(result.current.height).toBe('');
    expect(result.current.bmiResult).toBeNull();
    expect(result.current.isSaved).toBe(false);
  });
});