'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Show, SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { Shield, Search, FileSpreadsheet, Users, Menu, X, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { db } from '../../lib/db';
import { Profile } from '../../types';
import { toast } from 'sonner';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: clerkUser, isSignedIn } = useUser();
  const [user, setUser] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const email = clerkUser.primaryEmailAddress?.emailAddress || '';
      const username = clerkUser.username || clerkUser.firstName || 'operator';
      const name = clerkUser.fullName || clerkUser.firstName || 'Sentinel Operator';
      const syncedUser = db.syncClerkUser(email, username, name);
      setUser(syncedUser);
    } else {
      setUser(db.getCurrentUser());
    }
  }, [isSignedIn, clerkUser, pathname]);

  const handleRoleChange = (role: 'user' | 'seller' | 'regional_admin' | 'super_admin' | 'moderator' | 'admin') => {
    const updated = db.setCurrentUser(role);
    setUser(updated);
    setUser(updated);
    setDropdownOpen(false);
    toast.success(`Access Clearance Updated: ${role.toUpperCase()}`, {
      description: 'System privileges modified for this session.',
      style: {
        background: '#070b16',
        border: '1px solid #8b5cf6',
        color: '#f1f5f9'
      }
    });
    router.refresh();
  };

  const navLinks = [
    { label: 'Registry lookup', href: '/search', icon: Search },
    { label: 'File Report', href: '/submit-report', icon: FileSpreadsheet },
    { label: 'Verified resellers', href: '/resellers', icon: Users },
  ];

  const isMod = user?.role === 'moderator' || user?.role === 'admin' || user?.role === 'regional_admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.primary_email === '8xSentinel@gmail.com' || user?.role === 'super_admin';
  const displayName =
    clerkUser?.fullName ||
    clerkUser?.primaryEmailAddress?.emailAddress ||
    user?.display_name ||
    user?.username ||
    'Operator';

  return (
    <nav className="sticky top-0 z-50 bg-[#03050c]/85 backdrop-blur-lg border-b border-border-subtle/70 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo with cybersecurity gaming glow */}
          <Link href="/" className="flex items-center gap-2.5 text-text-primary hover:text-accent-cyan transition-colors group">
            <div className="relative">
              <Shield className="w-8 h-8 text-accent-cyan fill-accent-cyan/5 transition-transform duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-accent-cyan/15 blur-md rounded-full -z-10 animate-pulse"></div>
            </div>
            <span className="font-display font-bold text-2xl tracking-widest uppercase">
              8x<span className="text-accent-cyan text-glow-cyan">Sentinel</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded text-xs font-mono uppercase tracking-widest font-bold transition-all duration-200
                    ${isActive 
                      ? 'text-accent-cyan bg-accent-cyan/5 border-b-2 border-accent-cyan' 
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/[0.02]'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <Show when="signed-in">
              {isMod && (
                <Link
                  href="/admin"
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded text-xs font-mono uppercase tracking-widest font-bold transition-all duration-200
                    ${pathname.startsWith('/admin') 
                      ? 'text-accent-purple bg-accent-purple/5 border-b-2 border-accent-purple' 
                      : 'text-text-secondary hover:text-accent-purple hover:bg-white/[0.02]'}
                  `}
                >
                  <ShieldAlert className="w-4 h-4 text-accent-purple animate-pulse" />
                  <span>Command Deck</span>
                </Link>
              )}
            </Show>
          </div>

          {/* Actions & Profile Selector */}
          <div className="hidden md:flex items-center gap-5">
            <Show when="signed-in">
            {/* Automatic Clearance Display (No manual selector) */}
            <Show when="signed-in">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded bg-bg-surface border border-border-subtle text-xs font-mono text-text-secondary select-none">
                <Shield className="w-3.5 h-3.5 text-accent-cyan" />
                <span>Clearance: <span className="font-bold text-accent-cyan uppercase">{user?.role?.replace('_', ' ') || 'USER'}</span></span>
              </div>
            </Show>
            </Show>

            {/* Profile Avatar / Reputation */}
            <Show when="signed-in">
              <div className="flex items-center gap-3 border-l border-border-subtle/60 pl-5">
                <UserButton />
                <div className="text-left font-mono">
                  <p className="text-xs font-bold text-text-primary leading-tight truncate max-w-[130px]">{displayName}</p>
                  <p className="text-[10px] text-accent-cyan font-bold">{user?.reputation_points ?? 0} REP</p>
                </div>
              </div>
            </Show>

            <Show when="signed-out">
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <button className="h-9 rounded border border-border-subtle px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-text-secondary transition-colors hover:border-accent-cyan/40 hover:text-text-primary">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="h-9 rounded bg-accent-purple px-3 text-[10px] font-mono font-bold uppercase tracking-widest text-white transition-colors hover:bg-accent-pink">
                    Join
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <Show when="signed-in">
              <div className="px-2.5 py-1 rounded bg-bg-surface border border-border-subtle text-[10px] font-mono text-text-secondary">
                Clearance: <span className="font-bold text-accent-cyan uppercase">{user?.role?.replace('_', ' ') || 'User'}</span>
              </div>
            </Show>

            <Show when="signed-in">
              <UserButton />
            </Show>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="px-2.5 py-1.5 rounded bg-bg-surface border border-border-subtle text-[10px] font-mono font-bold uppercase text-text-primary">
                  Sign In
                </button>
              </SignInButton>
            </Show>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-text-secondary hover:text-text-primary"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-bg-surface/95 border-b border-border-subtle/80 p-5 space-y-4 font-mono text-xs uppercase tracking-wider">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded text-text-secondary hover:text-text-primary hover:bg-white/[0.02] font-bold"
            >
              {link.label}
            </Link>
          ))}
          <Show when="signed-in">
            {isMod && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded text-accent-purple font-bold hover:bg-accent-purple/5"
              >
                Command Deck
              </Link>
            )}
          </Show>
          <Show when="signed-in">
            <div className="flex items-center gap-3 pt-4 border-t border-border-subtle/50">
              <UserButton />
              <div>
                <p className="font-bold text-text-primary normal-case tracking-normal">{displayName}</p>
                <p className="text-[10px] text-accent-cyan font-bold">{user?.reputation_points ?? 0} Reputation Points</p>
              </div>
            </div>
          </Show>
          <Show when="signed-out">
            <div className="flex gap-2 pt-4 border-t border-border-subtle/50">
              <SignInButton mode="modal">
                <button className="flex-1 rounded border border-border-subtle px-3 py-2 text-[10px] font-bold uppercase text-text-primary">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="flex-1 rounded bg-accent-purple px-3 py-2 text-[10px] font-bold uppercase text-white">
                  Join
                </button>
              </SignUpButton>
            </div>
          </Show>
        </div>
      )}
    </nav>
  );
}
