import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import LoginPage from '@/components/Auth/LoginPage';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// Mock the logo image
jest.mock('../../assets/images/NF_blue.png', () => 'mocked-image');

import { router } from 'expo-router';

describe('LoginPage - Component Tests', () => {

  const defaultProps = {
    email: '',
    setEmail: jest.fn(),
    password: '',
    setPassword: jest.fn(),
    onLogin: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // CT-LOGIN-001: Renders email and password fields
  it('CT-LOGIN-001: renders email and password input fields', () => {
    render(<LoginPage {...defaultProps} />);

    expect(screen.getByPlaceholderText('johndoe@example.com')).toBeTruthy();
    expect(screen.getByPlaceholderText('********')).toBeTruthy();
  });

  // CT-LOGIN-002: Renders sign in button
  it('CT-LOGIN-002: renders the sign in button', () => {
    render(<LoginPage {...defaultProps} />);

    expect(screen.getByText('Sign in')).toBeTruthy();
  });

  // CT-LOGIN-003: Renders page title and subtitle
  it('CT-LOGIN-003: renders title and subtitle text', () => {
    render(<LoginPage {...defaultProps} />);

    expect(screen.getByText('Sign in to NutrFi')).toBeTruthy();
    expect(screen.getByText(/Get access to exercises and workout history/)).toBeTruthy();
  });

  // CT-LOGIN-004: Email input calls setEmail when typed into
  it('CT-LOGIN-004: typing in email field calls setEmail', () => {
    const mockSetEmail = jest.fn();
    render(<LoginPage {...defaultProps} setEmail={mockSetEmail} />);

    fireEvent.changeText(
      screen.getByPlaceholderText('johndoe@example.com'),
      'isaac@test.com'
    );

    expect(mockSetEmail).toHaveBeenCalledWith('isaac@test.com');
  });

  // CT-LOGIN-005: Password input calls setPassword when typed into
  it('CT-LOGIN-005: typing in password field calls setPassword', () => {
    const mockSetPassword = jest.fn();
    render(<LoginPage {...defaultProps} setPassword={mockSetPassword} />);

    fireEvent.changeText(
      screen.getByPlaceholderText('********'),
      'password123'
    );

    expect(mockSetPassword).toHaveBeenCalledWith('password123');
  });

  // CT-LOGIN-006: Pressing sign in button calls onLogin
  it('CT-LOGIN-006: pressing sign in button calls onLogin', () => {
    const mockOnLogin = jest.fn();
    render(<LoginPage {...defaultProps} onLogin={mockOnLogin} />);

    fireEvent.press(screen.getByText('Sign in'));

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });

  // CT-LOGIN-007: Pressing sign up link navigates to signup page
  it('CT-LOGIN-007: pressing sign up link navigates to signup screen', () => {
    render(<LoginPage {...defaultProps} />);

    fireEvent.press(screen.getByText(/Sign up/));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/(auth)/signup',
    });
  });

  // CT-LOGIN-008: Renders NutriFi logo
  it('CT-LOGIN-008: renders the NutriFi logo', () => {
    render(<LoginPage {...defaultProps} />);

    expect(screen.getByLabelText('NutriFi logo')).toBeTruthy();
  });
});