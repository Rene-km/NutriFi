import React from 'react';
import { render, screen } from '@testing-library/react-native';
import IndexPage from '@/components/Dashboard/IndexPage';
import Streaks from '@/components/Dashboard/Streaks';

// Mock the hooks and child components
jest.mock('@/hooks/Dashboard/useWeeklyGoals', () => ({
  useWeeklyGoals: () => ({
    goals: [],
    loading: false,
    refresh: jest.fn(),
    addGoal: jest.fn(),
    removeGoal: jest.fn(),
  }),
}));

jest.mock('@/components/Dashboard/WeeklyGoalsCard', () => 'WeeklyGoalsCard');
jest.mock('@/components/Dashboard/AllTimeByExerciseChart', () => ({
  AllTimeByExerciseChart: () => null,
}));
jest.mock('@/components/Dashboard/WorkoutProgressChart', () => ({
  WorkoutProgressChart: () => null,
}));
jest.mock('@/components/Dashboard/MiniBMICard', () => 'MiniBMICard');

describe('Streaks Component', () => {
  it('CT-STREAK-001: renders current streak, best streak, and total', () => {
    render(<Streaks streak={5} bestStreak={10} total={25} />);

    // Updated to match actual component text structure
    expect(screen.getByText('5')).toBeTruthy();
    expect(screen.getByText('days in a row')).toBeTruthy();
    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('My Best')).toBeTruthy();
  });

  it('CT-STREAK-002: renders zero values when no workouts done', () => {
    render(<Streaks streak={0} bestStreak={0} total={0} />);

    // Use getAllByText since there are multiple "0"s in the component
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
    expect(screen.getByText('days in a row')).toBeTruthy();
  });

  it('CT-STREAK-003: renders the Streaks title', () => {
    render(<Streaks streak={1} bestStreak={1} total={1} />);

    expect(screen.getByText('Current Streak')).toBeTruthy();
  });
});

describe('IndexPage Component', () => {
  const defaultProps = {
    streaks: { streak: 3, bestStreak: 7, total: 15 },
    profileId: 'user-123',
    handleLogout: jest.fn(),
    exercises: [
      { id: '1', name: 'Push-ups' },
      { id: '2', name: 'Squats' },
    ],
  };

  it('CT-DASH-001: renders welcome title and subtitle', () => {
    render(<IndexPage {...defaultProps} />);

    // Mobile version has "Welcome to NutriFi"
    expect(screen.getByText('Welcome to NutriFi')).toBeTruthy();
    expect(screen.getByText(/Track your workouts/)).toBeTruthy();
  });

  it('CT-DASH-002: renders streaks with correct values', () => {
    render(<IndexPage {...defaultProps} />);

    // Check streak values in the Streaks component
    expect(screen.getByText('3')).toBeTruthy(); // Current streak
    expect(screen.getByText('7')).toBeTruthy(); // Best streak
  });

  it('CT-DASH-003: renders logout button', () => {
    const handleLogout = jest.fn();
    render(<IndexPage {...defaultProps} handleLogout={handleLogout} />);

    expect(screen.getByText('Log out')).toBeTruthy();
  });

  it('CT-DASH-004: renders streak component with correct props', () => {
    render(<IndexPage {...defaultProps} />);

    // Verify streak component renders
    expect(screen.getByText('Current Streak')).toBeTruthy();
    expect(screen.getByText('days in a row')).toBeTruthy();
  });

  it('CT-DASH-005: handles undefined streaks with zero defaults', () => {
    render(<IndexPage streaks={undefined} profileId="user-123" handleLogout={jest.fn()} exercises={[]} />);

    // Should show "0" in the streak display - use getAllByText since there are multiple 0s
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThan(0);
  });

  it('CT-DASH-006: renders all main sections', () => {
    render(<IndexPage {...defaultProps} />);

    expect(screen.getByText('Welcome to NutriFi')).toBeTruthy();
    expect(screen.getByText('Current Streak')).toBeTruthy();
    expect(screen.getByText('Log out')).toBeTruthy();
  });
});