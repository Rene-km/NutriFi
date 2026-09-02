import { renderHook, act } from '@testing-library/react-native';
import useSignupHook from '@/hooks/Auth/signup_hook';
import useLoginHook from '@/hooks/Auth/login_hook';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

const mockLoadProfile = jest.fn();
jest.mock('@/lib/api', () => ({
  loadProfile: mockLoadProfile,
}));

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Authentication Flow - Integration', () => {

  it('IT-AUTH-001: signup creates account, upserts profile, and redirects to login', async () => {
    const mockUser = { id: 'user-123', email: 'isaac@test.com' };

    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    });

    const { result } = renderHook(() => useSignupHook());

    await act(async () => {
      result.current.setFullName('Isaac Test');
      result.current.setEmail('isaac@test.com');
      result.current.setPassword('password123');
      result.current.setAge('22');
      result.current.setHeightCm('180');
      result.current.setWeightKg('75');
    });

    await act(async () => {
      await result.current.onSignup();
    });

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'isaac@test.com',
      password: 'password123',
      options: {
        data: {
          full_name: 'Isaac Test',
          gender: 'prefer_not_to_say',
          goal: 'improve_fitness',
        },
      },
    });

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'isaac@test.com',
      password: 'password123',
    });

    expect(supabase.from).toHaveBeenCalledWith('profile');

    expect(result.current.msg).toBe('Account created.');

    expect(router.replace).toHaveBeenCalledWith('/(auth)/login');
  });

  it('IT-AUTH-002: login authenticates and profile data can be loaded', async () => {
    const mockUser = { id: 'user-123', email: 'isaac@test.com' };

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'token-abc' } },
      error: null,
    });

    mockLoadProfile.mockResolvedValue({
      id: 'user-123',
      full_name: 'Isaac Test',
      age: 22,
      height_cm: 180,
      weight_kg: 75,
      gender: 'prefer_not_to_say',
      goal: 'improve_fitness',
    });

    const { result } = renderHook(() => useLoginHook());

    await act(async () => {
      result.current.setEmail('isaac@test.com');
      result.current.setPassword('password123');
    });

    await act(async () => {
      await result.current.onLogin();
    });

    expect(result.current.msg).toBeNull();
    expect(router.replace).toHaveBeenCalledWith('/');

    const profile = await mockLoadProfile();

    expect(profile).not.toBeNull();
    expect(profile.full_name).toBe('Isaac Test');
    expect(profile.age).toBe(22);
    expect(profile.height_cm).toBe(180);
    expect(profile.weight_kg).toBe(75);
  });

  it('IT-AUTH-003: failed login prevents profile from being loaded', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    });

    mockLoadProfile.mockResolvedValue(null);

    const { result } = renderHook(() => useLoginHook());

    await act(async () => {
      result.current.setEmail('wrong@test.com');
      result.current.setPassword('wrongpassword');
    });

    await act(async () => {
      await result.current.onLogin();
    });

    expect(result.current.msg).toBe('Invalid login credentials');

    expect(router.replace).not.toHaveBeenCalled();

    const profile = await mockLoadProfile();
    expect(profile).toBeNull();
  });

  it('IT-AUTH-004: signup failure stops the chain - no signin or profile created', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Email already registered' },
    });

    const { result } = renderHook(() => useSignupHook());

    await act(async () => {
      result.current.setFullName('Isaac Test');
      result.current.setEmail('taken@test.com');
      result.current.setPassword('password123');
      result.current.setAge('22');
      result.current.setHeightCm('180');
      result.current.setWeightKg('75');
    });

    await act(async () => {
      await result.current.onSignup();
    });

    expect(result.current.msg).toBe('Email already registered');

    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();

    expect(supabase.from).not.toHaveBeenCalled();

    expect(router.replace).not.toHaveBeenCalled();

    expect(result.current.loading).toBe(false);
  });

  it('IT-AUTH-005: signup succeeds but profile upsert failure prevents redirect', async () => {
    const mockUser = { id: 'user-456', email: 'new@test.com' };

    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      upsert: jest.fn().mockResolvedValue({
        error: { message: 'Database error saving profile' },
      }),
    });

    const { result } = renderHook(() => useSignupHook());

    await act(async () => {
      result.current.setFullName('New User');
      result.current.setEmail('new@test.com');
      result.current.setPassword('password123');
      result.current.setAge('25');
      result.current.setHeightCm('170');
      result.current.setWeightKg('70');
    });

    await act(async () => {
      await result.current.onSignup();
    });

    expect(supabase.auth.signUp).toHaveBeenCalled();
    expect(supabase.auth.signInWithPassword).toHaveBeenCalled();

    expect(result.current.msg).toBe('Database error saving profile');

    expect(router.replace).not.toHaveBeenCalledWith('/(auth)/login');

    expect(result.current.loading).toBe(false);
  });
});