import { render, screen } from '@testing-library/react';
import Navbar from '../src/components/Navbar';
import { AuthProvider } from '../src/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Mock the services and router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
}));

describe('Navbar Component', () => {
  it('renders the brand logo/title', () => {
    render(
      <GoogleOAuthProvider clientId="test">
        <AuthProvider>
          <Navbar />
        </AuthProvider>
      </GoogleOAuthProvider>
    );

    const heading = screen.getByText(/Seminar/i);
    expect(heading).toBeInTheDocument();
  });
});
