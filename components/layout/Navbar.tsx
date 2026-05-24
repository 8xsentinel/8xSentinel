'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Shield, Search, FileSpreadsheet, User, Users, Menu, X, ArrowRightLeft, ShieldAlert } from 'lucide-react';
import { db } from '../../lib/db';
import { Profile } from '../../types';
import { toast } from 'sonner';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<Profile | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setUser(db.getCurrentUser());
  }, [pathname]);

  const handleRoleChange = (role: 'user' | 'moderator' | 'admin') => {
    const updated = db.setCurrentUser(role);
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

  const isMod = user?.role === 'moderator' || user?.role === 'admin';

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
          </div>

          {/* Actions & Profile Selector */}
          <div className="hidden md:flex items-center gap-5">
            {/* Override Terminal Switcher widget */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4.5 py-2 rounded bg-bg-surface border border-border-subtle hover:border-accent-cyan/40 text-xs font-mono text-text-secondary transition-all select-none clip-cyber-btn"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-accent-cyan animate-pulse" />
                <span>Clearance: <span className="font-bold text-text-primary uppercase">{user?.role || 'Guest'}</span></span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-bg-surface border border-border-subtle rounded shadow-2xl py-2 z-50 font-mono text-xs clip-cyber">
                  <div className="px-4 py-2 border-b border-border-subtle/30 text-[10px] text-text-muted uppercase tracking-widest font-bold">
                    Terminal Override:
                  </div>
                  <button
                    onClick={() => handleRoleChange('admin')}
                    className="w-full text-left px-4 py-2.5 hover:bg-accent-purple/10 text-accent-purple font-bold flex items-center justify-between"
                  >
                    <span>ADMIN DECK</span>
                    {user?.role === 'admin' && <span className="text-accent-purple">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleChange('moderator')}
                    className="w-full text-left px-4 py-2.5 hover:bg-accent-cyan/10 text-accent-cyan font-bold flex items-center justify-between"
                  >
                    <span>MODERATOR</span>
                    {user?.role === 'moderator' && <span className="text-accent-cyan">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleChange('user')}
                    className="w-full text-left px-4 py-2.5 hover:bg-accent-green/10 text-accent-green font-bold flex items-center justify-between"
                  >
                    <span>STANDARD OPERATOR</span>
                    {user?.role === 'user' && <span className="text-accent-green">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Profile Avatar / Reputation */}
            {user && (
              <div className="flex items-center gap-3 border-l border-border-subtle/60 pl-5">
                <div className="relative">
                  <img
                    src={user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                    alt="avatar"
                    className="w-9 h-9 rounded-md border border-border-subtle bg-bg-surface p-0.5"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent-green rounded-full border-2 border-bg-void animate-pulse"></div>
                </div>
                <div className="text-left font-mono">
                  <p className="text-xs font-bold text-text-primary leading-tight truncate max-w-[100px]">{user.display_name || user.username}</p>
                  <p className="text-[10px] text-accent-cyan font-bold">{user.reputation_points} REP</p>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-2.5 py-1.5 rounded bg-bg-surface border border-border-subtle text-[10px] font-mono text-text-secondary"
            >
              Clearance: <span className="font-bold text-text-primary uppercase">{user?.role || 'Guest'}</span>
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-16 top-16 w-48 bg-bg-surface border border-border-subtle rounded shadow-2xl py-1.5 z-50 font-mono text-[10px] clip-cyber">
                <button onClick={() => handleRoleChange('admin')} className="w-full text-left px-4 py-2 hover:bg-white/[0.03] text-accent-purple font-bold">
                  ADMIN DECK
                </button>
                <button onClick={() => handleRoleChange('moderator')} className="w-full text-left px-4 py-2 hover:bg-white/[0.03] text-accent-cyan font-bold">
                  MODERATOR
                </button>
                <button onClick={() => handleRoleChange('user')} className="w-full text-left px-4 py-2 hover:bg-white/[0.03] text-accent-green font-bold">
                  STANDARD OPERATOR
                </button>
              </div>
            )}

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
          {isMod && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded text-accent-purple font-bold hover:bg-accent-purple/5"
            >
              Command Deck
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-3 pt-4 border-t border-border-subtle/50">
              <img
                src={user.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'}
                alt="avatar"
                className="w-10 h-10 rounded bg-bg-void border border-border-subtle p-0.5"
              />
              <div>
                <p className="font-bold text-text-primary">{user.display_name || user.username}</p>
                <p className="text-[10px] text-accent-cyan font-bold">{user.reputation_points} Reputation Points</p>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
