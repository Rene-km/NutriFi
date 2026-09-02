import { renderHook, act } from '@testing-library/react-native';
import useLoginHook from '@/hooks/Auth/login_hook';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

// Mock Supabase auth
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { signInWithPassword: jest.fn() },
  },
}));

// Mock router navigation
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

describe('useLoginHook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Successful login should navigate home
  it('navigates to home on successful login', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      error: null,
    });

    const { result } = renderHook(() => useLoginHook());

    // Set input values first
    act(() => {
      result.current.setEmail('isaac@test.com');
      result.current.setPassword('password123');
    });

    // Then call login
    await act(async () => {
      await result.current.onLogin();
    });

    expect(router.replace).toHaveBeenCalledWith('/');
    expect(result.current.msg).toBeNull();
  });

  // Wrong credentials should show backend error
  it('sets error message on wrong credentials', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });

    const { result } = renderHook(() => useLoginHook());

    // Set wrong input values
    act(() => {
      result.current.setEmail('wrong@test.com');
      result.current.setPassword('wrongpassword');
    });

    // Try login
    await act(async () => {
      await result.current.onLogin();
    });

    expect(result.current.msg).toBe('Invalid login credentials');
    expect(router.replace).not.toHaveBeenCalled();
  });

  // Empty fields should show validation message
  it('shows error when email and password are empty', async () => {
    const { result } = renderHook(() => useLoginHook());

    // Leave fields empty
    act(() => {
      result.current.setEmail('');
      result.current.setPassword('');
    });

    // Try login
    await act(async () => {
      await result.current.onLogin();
    });

    expect(result.current.msg).toBe('Please enter your email and password.');
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  // Error should clear after successful retry
  it('clears previous error after a successful retry', async () => {
    (supabase.auth.signInWithPassword as jest.Mock)
      .mockResolvedValueOnce({
        error: { message: 'Invalid login credentials' },
      })
      .mockResolvedValueOnce({
        error: null,
      });

    const { result } = renderHook(() => useLoginHook());

    // First attempt fails
    act(() => {
      result.current.setEmail('wrong@test.com');
      result.current.setPassword('wrongpassword');
    });

    await act(async () => {
      await result.current.onLogin();
    });

    expect(result.current.msg).toBe('Invalid login credentials');

    // Second attempt succeeds
    act(() => {
      result.current.setEmail('isaac@test.com');
      result.current.setPassword('password123');
    });

    await act(async () => {
      await result.current.onLogin();
    });

    expect(result.current.msg).toBeNull();
    expect(router.replace).toHaveBeenCalledWith('/');
  });
});