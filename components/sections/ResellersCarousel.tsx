'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { db } from '../../lib/db';
import { TrustedReseller } from '../../types';
import SellerCard from '../ui/SellerCard';

export default function ResellersCarousel() {
  const [resellers, setResellers] = useState<TrustedReseller[]>([]);

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

  return (
    <section className="py-12 md:py-20 px-4 max-w-6xl mx-auto space-y-8 border-b border-white/5 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="badge badge-green">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>VERIFIED MERCHANTS</span>
          </div>
          <h2 
            className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white"
            style={{ fontFamily: 'var(--font-h)' }}
          >
            Trusted <span className="g">Resellers</span>
          </h2>
          <p className="text-text-secondary text-sm max-w-md font-sans leading-relaxed">
            Eliminate counterparty risk. These merchants hold authenticated regional clearances and verified escrow track records.
          </p>
        </div>

        <Link
          href="/resellers"
          className="btn btn-outline py-2.5 px-5 text-xs inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <span>View All Sellers</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent-cyan" />
        </Link>
      </div>

      {resellers.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center text-text-muted text-sm font-sans">
          No verified resellers currently listed.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resellers.slice(0, 4).map(reseller => (
            <SellerCard key={reseller.id} reseller={reseller} />
          ))}
        </div>
      )}
    </section>
  );
}
