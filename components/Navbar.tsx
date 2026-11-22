'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  LogOut,
  Menu,
  X,
  Crown,
  Zap,
  Settings,
} from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/invoices', label: 'Factures', icon: FileText },
  { href: '/dashboard/invoices/new', label: 'Nouvelle', icon: PlusCircle },
  { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
];

export default function Navbar() {
  const { userProfile, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isPremium = userProfile?.plan === 'premium';
  const isTrial = userProfile?.plan === 'trial';

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Image src="/logo_bizinvoice.png" alt="BizInvoice Logo" width={32} height={32} className="rounded-lg shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow" />
            <span className="text-lg font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              BizInvoice
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-violet-500/15 text-violet-300 shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Badge plan */}
            <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
              isPremium || isTrial
                ? 'bg-violet-500/10 border-violet-500/30 text-violet-300' 
                : 'bg-slate-800 border-white/10 text-slate-400'
            }`}>
              {isPremium || isTrial ? (
                <Crown className="w-3 h-3" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              )}
              {isPremium ? 'Premium' : isTrial ? 'Essai 3J' : 'Free'}
            </div>

            {/* User name */}
            <span className="text-sm text-slate-400 max-w-[120px] truncate">
              {userProfile?.displayName}
            </span>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-900/95 backdrop-blur-xl animate-slideDown">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-violet-500/15 text-violet-300'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
            <hr className="border-white/5 my-2" />
            <div className={`mt-4 px-4 py-3 mb-2 rounded-xl border flex items-center justify-between ${
              isPremium || isTrial
                ? 'bg-violet-500/10 border-violet-500/30 text-violet-300' 
                : 'bg-slate-800/50 border-white/10 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                {isPremium || isTrial ? <Crown className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-500" />}
                <span className="font-semibold">{isPremium ? 'Premium' : isTrial ? 'Essai 3J' : 'Free'}</span>
              </div>
              <span className="text-xs">{userProfile?.displayName}</span>
            </div>
            <button
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition-all"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
