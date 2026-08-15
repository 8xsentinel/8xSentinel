'use client';

import React, { useState, useEffect } from 'react';
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
    <div className="max-w-7xl mx-auto py-12 px-4 space-y-8 font-sans">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="badge badge-green">
          MERCHANT REPUTATION DIRECTORY
        </div>
        <div className="flex items-center gap-3">
          <h1 
            className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white"
            style={{ fontFamily: 'var(--font-h)' }}
          >
            Verified Resellers <span className="g">Network</span>
          </h1>
        </div>
        <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
          Community-vetted merchants and regional account traders. Verified by peer trust votes and certified regional administrators.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-cyan pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by store name, telegram, phone..."
              className="input-field pl-11 py-3 text-xs"
            />
          </div>

          {/* Region Dropdown */}
          <div className="sm:w-64 relative flex items-center">
            <MapPin className="absolute left-4 w-4 h-4 text-accent-cyan pointer-events-none" />
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="input-field pl-11 py-3 text-xs appearance-none cursor-pointer"
            >
              {regionsList.map((reg) => (
                <option key={reg} value={reg} className="bg-[#080a0f] text-white">
                  {reg === 'all' ? 'All Trading Regions' : reg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Region Pill Selectors */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {regionsList.map((reg) => {
            const isSelected = selectedRegion === reg;
            return (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-accent-green/20 text-accent-green border border-accent-green/40'
                    : 'bg-white/[0.02] text-text-secondary hover:text-white border border-white/5'
                }`}
                style={{ fontFamily: 'var(--font-h)' }}
              >
                {reg === 'all' ? 'All Regions' : reg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reseller Cards Grid */}
      {loading ? (
        <div className="py-24 text-center text-text-muted space-y-3">
          <span className="w-8 h-8 border-3 border-accent-green border-t-transparent rounded-full animate-spin inline-block" />
          <p className="text-xs uppercase tracking-widest font-bold text-accent-green" style={{ fontFamily: 'var(--font-h)' }}>
            Loading Verified Merchant Catalog...
          </p>
        </div>
      ) : filteredResellers.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-text-muted mx-auto opacity-40" />
          <h3 className="text-base font-bold uppercase text-white" style={{ fontFamily: 'var(--font-h)' }}>
            No Resellers Found
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
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
    </div>
  );
}
