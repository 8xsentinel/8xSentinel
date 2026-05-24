import React from 'react';
import Link from 'next/link';
import { Shield, MessageSquare, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-bg-void border-t border-border-subtle/50 py-12 px-4 sm:px-6 lg:px-8 mt-auto font-mono text-xs text-text-secondary">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2 text-text-primary">
            <Shield className="w-6 h-6 text-accent-cyan" />
            <span className="font-display font-bold text-lg tracking-wider uppercase">
              8x<span className="text-accent-cyan">Sentinel</span>
            </span>
          </div>
          <p className="text-text-muted font-sans text-sm max-w-sm">
            Definitive trust infrastructure for the BGMI accounts and skins trading ecosystem. 
            Powered by community reports, hand-verified by experienced moderators.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-text-muted uppercase tracking-widest">
            <span>SEC_OP_VER: 1.0.4</span>
            <span>·</span>
            <span>SYSTEM STATE: OPERATIONAL</span>
          </div>
        </div>

        {/* Links Column */}
        <div className="space-y-3">
          <h4 className="text-text-primary font-bold text-sm tracking-wider uppercase">Quick Nav</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/search" className="hover:text-accent-cyan transition-colors">
                Search Registry
              </Link>
            </li>
            <li>
              <Link href="/submit-report" className="hover:text-accent-cyan transition-colors">
                File Scam Report
              </Link>
            </li>
            <li>
              <Link href="/resellers" className="hover:text-accent-cyan transition-colors">
                Verified Resellers
              </Link>
            </li>
          </ul>
        </div>

        {/* Community & Legal Column */}
        <div className="space-y-3">
          <h4 className="text-text-primary font-bold text-sm tracking-wider uppercase">Community</h4>
          <ul className="space-y-2">
            <li>
              <a 
                href="https://t.me" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-1 hover:text-accent-cyan transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Telegram Expose Channel</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </li>
            <li>
              <Link href="/apply-verification" className="hover:text-accent-cyan transition-colors">
                Apply for Reseller Badge
              </Link>
            </li>
            <li className="text-[10px] text-text-muted mt-4 leading-normal font-sans">
              Disclaimer: 8x Sentinel is a community registry and does not participate in account trades or hold escrow. Deal at your own risk.
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border-subtle/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-text-muted">
        <p className="font-sans">&copy; {new Date().getFullYear()} 8x Sentinel Platform. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="hover:text-accent-cyan cursor-pointer transition-colors">Security Protocol</span>
          <span>·</span>
          <span className="hover:text-accent-cyan cursor-pointer transition-colors">Terms of Verification</span>
        </div>
      </div>
    </footer>
  );
}
