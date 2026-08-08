"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Navbar({ onAuthClick }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="border-b border-white/10 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                S
              </div>
              Seminar<span className="text-indigo-400">Pilot</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link 
                    href="/admin"
                    className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
                  >
                    <LayoutDashboard size={16} />
                    Agent Hub
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm text-neutral-400 hover:text-red-400 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={onAuthClick}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
