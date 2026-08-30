'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, Activity, Utensils, BarChart3 } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Workout', href: '/workout', icon: Dumbbell },
    { name: 'Cardio', href: '/cardio', icon: Activity },
    { name: 'Nutrition', href: '/nutrition', icon: Utensils },
    { name: 'Stats', href: '/stats', icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname !== '/') return false;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed bottom-0 w-full bg-slate-900/95 backdrop-blur border-t border-slate-700 z-50">
      <div className="max-w-lg mx-auto flex justify-between items-center px-6 py-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center space-y-1 ${
                active ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium hidden lg:block">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
