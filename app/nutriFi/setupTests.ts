import '@testing-library/jest-native/extend-expect';

// Mock Supabase so no real database calls are made during tests
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    },
    from: jest.fn(),
  },
}));

// Mock expo-router so navigation doesn't crash during tests
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

// Mock Zustand store so profileId is available in all tests
jest.mock('@/stores/profileStore', () => ({
  useProfileStore: () => ({
    profileId: 'test-user-123',
    setProfileId: jest.fn(),
  }),
}));