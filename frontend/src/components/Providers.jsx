"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function Providers({ children }) {
  if (!GOOGLE_CLIENT_ID) {
    console.warn("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set.");
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ""}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
