'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import SellerCard from '../../components/ui/SellerCard';
import { db } from '../../lib/db';
import { TrustedReseller } from '../../types';
import { Search, Filter, ShieldCheck, MapPin, Users } from 'lucide-react';

export default function ResellersDirectory() {
  const [resellers, setResellers] = useState<TrustedReseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  useEffect(() => {
    db.getResellers().then((data) => {
      setResellers(data || []);
      setLoading(false);
    });
  }, []);

  // Filtering logic
  const filteredResellers = resellers.filter((reseller) => {
    const matchesQuery =
      searchQuery.trim() === '' ||
      reseller.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reseller.telegram_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reseller.whatsapp_number?.replace(/\D/g, '').includes(searchQuery.replace(/\D/g, '')) ||
      reseller.profile?.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRegion =
      selectedRegion === 'all' ||
      (reseller.region && reseller.region.toLowerCase() === selectedRegion.toLowerCase());

    return matchesQuery && matchesRegion;
  });

  const regionsList = ['all', 'North India', 'South India', 'West India', 'East India', 'Central India', 'North-East India', 'Pan India'];

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto py-12 px-4 space-y-8 font-mono">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-accent-green">
            <Users className="w-8 h-8" />
            <h1 className="text-3xl font-bold font-display uppercase tracking-wider text-text-primary">
              Verified Resellers Network
            </h1>
          </div>
          <p className="text-text-secondary text-xs font-sans max-w-2xl leading-relaxed">
            Community-vetted merchants and regional account traders. Verified by peer trust votes and regional administrators.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="backdrop-blur-md bg-white/[0.02] border border-border-subtle rounded-xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                type="text"
                placeholder="Search store name, Telegram, WhatsApp..."
                className="w-full bg-bg-surface border border-border-subtle focus:border-accent-green focus:outline-none rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary font-mono"
              />
            </div>

            {/* Region Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <div className="flex items-center gap-1.5 text-xs text-text-muted mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                <span>Region:</span>
              </div>
              {regionsList.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all uppercase ${
                    selectedRegion === reg
                      ? 'bg-accent-green/15 text-accent-green border border-accent-green/30 font-bold'
                      : 'border border-border-subtle/60 text-text-secondary hover:text-text-primary hover:bg-white/[0.02]'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resellers Grid */}
        {loading ? (
          <div className="py-20 text-center text-text-muted space-y-3">
            <span className="w-8 h-8 border-4 border-accent-green border-t-transparent rounded-full animate-spin inline-block"></span>
            <p className="text-xs uppercase tracking-widest">Loading Verified Merchant Catalog...</p>
          </div>
        ) : filteredResellers.length === 0 ? (
          <div className="backdrop-blur-md bg-white/[0.01] border border-border-subtle rounded-xl p-12 text-center space-y-4">
            <ShieldCheck className="w-12 h-12 text-text-muted mx-auto" />
            <h3 className="text-base font-bold uppercase text-text-primary">No Resellers Found</h3>
            <p className="text-xs text-text-secondary font-sans max-w-sm mx-auto">
              No merchant profiles match your current search query or region filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResellers.map((reseller) => (
              <SellerCard key={reseller.id} reseller={reseller} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

