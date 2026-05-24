'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SellerCard from '../../components/ui/SellerCard';
import { db } from '../../lib/db';
import { TrustedReseller } from '../../types';
import { ShieldCheck, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

export default function ResellersPage() {
  const [resellers, setResellers] = useState<TrustedReseller[]>([]);
  const [activeSpecialty, setActiveSpecialty] = useState<string>('all');

  useEffect(() => {
    let isMounted = true;

    const loadResellers = async () => {
      const data = await db.getResellers();

      if (isMounted) {
        setResellers(Array.isArray(data) ? data : []);
      }
    };

    loadResellers();

    return () => {
      isMounted = false;
    };
  }, []);

  const specialties = [
    { id: 'all', label: 'All Specialties' },
    { id: 'account_sale', label: 'Account Sales' },
    { id: 'uc_topup', label: 'UC Top-up' },
    { id: 'item_trading', label: 'Item Trading' },
    { id: 'recovery', label: 'Account Recovery' }
  ];

  const filteredResellers = activeSpecialty === 'all'
    ? resellers
    : resellers.filter(r => r.specializes_in.includes(activeSpecialty));

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto py-12 px-4 space-y-8 font-mono">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-accent-green text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Reseller Network Database</span>
            </div>
            <h1 className="text-3xl font-bold font-display uppercase tracking-wider text-text-primary">
              Verified Agents Directory
            </h1>
            <p className="text-text-secondary text-xs font-sans font-medium">
              Browse approved BGMI resellers who comply with community trading regulations.
            </p>
          </div>

          <div>
            <Link
              href="/apply-verification"
              className="flex items-center gap-1.5 bg-accent-green text-bg-void font-bold font-mono text-xs uppercase tracking-wider px-5 py-2.5 rounded hover:shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Verification</span>
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border-subtle/50 pb-4">
          <div className="flex items-center gap-1 text-xs text-text-muted mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {specialties.map(spec => (
              <button
                key={spec.id}
                onClick={() => setActiveSpecialty(spec.id)}
                className={`
                  px-3 py-1 rounded text-xs font-medium transition-all duration-200 border
                  ${activeSpecialty === spec.id 
                    ? 'border-accent-green text-accent-green bg-accent-green/5' 
                    : 'border-border-subtle text-text-secondary hover:text-text-primary'}
                `}
              >
                {spec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List */}
        {filteredResellers.length === 0 ? (
          <div className="backdrop-blur-md bg-white/[0.01] border border-border-subtle rounded-xl p-12 text-center text-text-muted font-sans">
            <p className="text-sm">No verified resellers match the selected specialization filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredResellers.map(reseller => (
              <SellerCard key={reseller.id} reseller={reseller} />
            ))}
          </div>
        )}

      </main>
      <Footer />
    </>
  );
}
