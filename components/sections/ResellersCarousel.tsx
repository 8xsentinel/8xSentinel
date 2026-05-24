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
    <section className="py-20 px-4 max-w-6xl mx-auto space-y-8 border-b border-border-subtle/30">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-accent-green font-mono text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Reseller Verification Network</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-display uppercase tracking-wider text-text-primary">
            Trusted Resellers
          </h2>
          <p className="text-text-secondary text-sm max-w-md">
            Skip the risk. These sellers have verified trade histories and certified escrow compatibility.
          </p>
        </div>

        <Link
          href="/resellers"
          className="inline-flex items-center gap-1.5 text-accent-green hover:text-accent-green/85 text-xs font-mono font-bold uppercase tracking-wider"
        >
          <span>View All Sellers</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {resellers.length === 0 ? (
        <div className="backdrop-blur-md bg-white/[0.01] border border-border-subtle rounded-xl p-8 text-center text-text-muted font-mono text-sm">
          No verified resellers currently on record.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {resellers.slice(0, 4).map(reseller => (
            <SellerCard key={reseller.id} reseller={reseller} />
          ))}
        </div>
      )}
    </section>
  );
}
