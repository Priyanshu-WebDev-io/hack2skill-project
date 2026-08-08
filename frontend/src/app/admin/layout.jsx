"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, FileText, Settings, LogOut, LayoutDashboard } from 'lucide-react';

export default function AdminLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Seminar Leads', href: '/admin/leads', icon: Users },
    { name: 'Automation Logs', href: '/admin/logs', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 flex text-neutral-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-neutral-900/50 flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white tracking-tight">Admin Portal</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-colors ${
                  isActive 
                    ? 'bg-indigo-500/10 text-indigo-400' 
                    : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl font-medium text-neutral-400 hover:bg-white/5 hover:text-red-400 transition-colors">
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
