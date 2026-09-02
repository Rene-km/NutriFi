import { renderHook, act } from '@testing-library/react-native';
import useSignupHook from '@/hooks/Auth/signup_hook';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock router
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

// Helper to fill valid form fields
const fillValidForm = (result: any) => {
  act(() => {
    result.current.setFullName('Isaac Test');
    result.current.setEmail('isaac@test.com');
    result.current.setPassword('password123');
    result.current.setAge('22');
    result.current.setHeightCm('175');
    result.current.setWeightKg('70');
  });
};

describe('useSignupHook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Successful signup should create account and redirect
  it('creates account and redirects to login on success', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    });

    const { result } = renderHook(() => useSignupHook());

    fillValidForm(result);

    await act(async () => {
      await result.current.onSignup();
    });

    expect(result.current.msg).toBe('Account created.');
    expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
  });

  // Loading should end after signup finishes
  it('sets loading to false after signup completes', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    });

    const { result } = renderHook(() => useSignupHook());

    fillValidForm(result);

    await act(async () => {
      await result.current.onSignup();
    });

    expect(result.current.loading).toBe(false);
  });

  // Empty name should block signup
  it('blocks signup when name is empty', async () => {
    const { result } = renderHook(() => useSignupHook());

    act(() => {
      result.current.setEmail('isaac@test.com');
      result.current.setPassword('password123');
    });

    await act(async () => {
      await result.current.onSignup();
    });

    expect(result.current.msg).toBe('Please enter your name.');
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  // Invalid email should block signup
  it('blocks signup when email has no @ symbol', async () => {
    const { result } = renderHook(() => useSignupHook());

    act(() => {
      result.current.setFullName('Isaac Test');
      result.current.setEmail('notanemail');
      result.current.setPassword('password123');
    });

    await act(async () => {
      await result.current.onSignup();
    });

    expect(result.current.msg).toBe('Please enter a valid email.');
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  // Short password should block signup
  it('blocks signup when password is less than 6 characters', async () => {
    const { result } = renderHook(() => useSignupHook());

    act(() => {
      result.current.setFullName('Isaac Test');
      result.current.setEmail('isaac@test.com');
      result.current.setPassword('abc');
    });

    await act(async () => {
      await result.current.onSignup();
    });

    expect(result.current.msg).toBe('Password must be at least 6 characters.');
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  // Invalid age should block signup
  it('blocks signup when age is out of valid range', async () => {
    const { result } = renderHook(() => useSignupHook());

    fillValidForm(result);

    act(() => {
      result.current.setAge('5');
    });

    await act(async () => {
      await result.current.onSignup();
    });

    expect(result.current.msg).toBe('Enter a valid age.');
    expect(supabase.auth.signUp).not.toHaveBeenCalled();
  });

  // Supabase auth failure should show error
  it('shows error when Supabase signUp fails', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: null,
      error: { message: 'Email already registered' },
    });

    const { result } = renderHook(() => useSignupHook());

    fillValidForm(result);

    await act(async () => {
      await result.current.onSignup();
    });

    expect(result.current.msg).toBe('Email already registered');
    expect(router.replace).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });

  // Profile save failure should show error
  it('shows error when profile upsert fails after successful auth', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({
        error: { message: 'Profile insert failed' },
      }),
    });

    const { result } = renderHook(() => useSignupHook());

    fillValidForm(result);

    await act(async () => {
      await result.current.onSignup();
    });

    expect(result.current.msg).toBe('Profile insert failed');
    expect(router.replace).not.toHaveBeenCalled();
  });
});