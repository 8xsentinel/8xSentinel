'use client';

import React, { useState, useEffect, useMemo } from 'react';
import SellerCard from '../../components/ui/SellerCard';
import { db } from '../../lib/db';
import { TrustedReseller } from '../../types';
import { INDIAN_STATES, INDIA_REGIONS } from '../../lib/constants/indiaStates';
import { 
  Search, 
  Filter, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  X, 
  RotateCcw,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../lib/firebase/AuthContext';

export default function ResellersDirectory() {
  const { profile } = useAuth();
  const [resellers, setResellers] = useState<TrustedReseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('All Regions');
  const [selectedState, setSelectedState] = useState<string>('all');

  useEffect(() => {
    if (profile?.id) {
      db.getResellers(profile.id).then((data) => {
        setResellers(data || []);
        setLoading(false);
      });
    }
  }, [profile?.id]);

  // States available for the currently selected region
  const statesForSelectedRegion = useMemo(() => {
    if (selectedRegion === 'All Regions') {
      return INDIAN_STATES;
    }
    const cleanFilterRegion = selectedRegion.toLowerCase().replace(' india', '').trim();
    return INDIAN_STATES.filter(s => 
      s.region.toLowerCase().replace(' india', '').trim() === cleanFilterRegion
    );
  }, [selectedRegion]);

  // Multi-field robust filtering logic
  const filteredResellers = useMemo(() => {
    return resellers.filter((reseller) => {
      const query = searchQuery.trim().toLowerCase();
      const cleanDigits = query.replace(/\D/g, '');

      // 1. Text & Identifier matching
      const matchesQuery =
        query === '' ||
        (reseller.store_name || reseller.storeName || '').toLowerCase().includes(query) ||
        (reseller.state || '').toLowerCase().includes(query) ||
        (reseller.region || '').toLowerCase().includes(query) ||
        (reseller.telegram_username || reseller.telegramUsername || '').toLowerCase().includes(query.replace('@', '')) ||
        (reseller.whatsapp_username || reseller.whatsappUsername || '').toLowerCase().includes(query.replace('@', '')) ||
        (cleanDigits.length >= 3 && (reseller.whatsapp_number || reseller.whatsappNumber || '').replace(/\D/g, '').includes(cleanDigits)) ||
        (reseller.profile?.username || '').toLowerCase().includes(query) ||
        (reseller.profile?.display_name || reseller.profile?.displayName || '').toLowerCase().includes(query) ||
        (reseller.bio || '').toLowerCase().includes(query) ||
        (reseller.specializes_in || reseller.specializesIn || []).some((s: string) => s.toLowerCase().includes(query));

      if (!matchesQuery) return false;

      // 2. Region Matching (resolving from state if reseller.region is missing)
      if (selectedRegion !== 'All Regions') {
        const cleanFilterRegion = selectedRegion.toLowerCase().replace(' india', '').trim();
        const rawResellerRegion = (reseller.region || '').toLowerCase().replace(' india', '').trim();
        
        // Find region from state mapping
        const mappedRegion = INDIAN_STATES.find(
          s => s.name.toLowerCase() === (reseller.state || '').toLowerCase()
        )?.region.toLowerCase().replace(' india', '').trim();

        const effectiveRegion = rawResellerRegion || mappedRegion;
        if (effectiveRegion !== cleanFilterRegion) {
          return false;
        }
      }

      // 3. State Matching
      if (selectedState !== 'all') {
        const resellerState = (reseller.state || '').toLowerCase().trim();
        const filterState = selectedState.toLowerCase().trim();
        if (resellerState !== filterState) {
          return false;
        }
      }

      return true;
    });
  }, [resellers, searchQuery, selectedRegion, selectedState]);

  const hasActiveFilters = searchQuery.trim() !== '' || selectedRegion !== 'All Regions' || selectedState !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('All Regions');
    setSelectedState('all');
  };

  return (
    <ProtectedRoute requireRole="verified_reseller">
      <div className="max-w-7xl mx-auto py-12 px-4 space-y-8 font-sans">
        {/* Header Section */}
        <div className="space-y-3">
          <div className="badge badge-green">
            BGMI RESELLERS DIRECTORY
          </div>
          <div className="flex items-center gap-3">
            <h1 
              className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white"
              style={{ fontFamily: 'var(--font-h)' }}
            >
              Verified Resellers <span className="g">Network</span>
            </h1>
          </div>
          <p className="text-text-secondary text-xs sm:text-sm max-w-2xl leading-relaxed">
            Built by Resellers for all Resellers across India. Discover verified BGMI stores operating on WhatsApp & Telegram across all 28 States & 8 Union Territories.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-6 space-y-4 border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* 1. Search Box */}
            <div className="relative md:col-span-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-cyan pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store name, state (e.g. Maharashtra, Delhi), Telegram, WhatsApp..."
                className="w-full bg-[#080a0f]/90 border border-white/10 hover:border-white/20 focus:border-accent-cyan rounded-xl pl-11 pr-10 py-3 text-xs text-white placeholder:text-text-muted focus:outline-none transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white p-1 rounded transition-colors cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 2. Region Dropdown */}
            <div className="md:col-span-3 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-cyan pointer-events-none z-10" />
              <select
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setSelectedState('all');
                }}
                className="w-full bg-[#080a0f]/90 border border-white/10 hover:border-white/20 focus:border-accent-cyan rounded-xl pl-11 pr-10 py-3 text-xs text-white appearance-none cursor-pointer focus:outline-none transition-all"
              >
                <option value="All Regions" className="bg-[#080a0f] text-white">All Regions</option>
                {INDIA_REGIONS.filter(r => r !== 'All Regions').map((r) => (
                  <option key={r} value={r} className="bg-[#080a0f] text-white">
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>

            {/* 3. State Dropdown */}
            <div className="md:col-span-3 relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-green pointer-events-none z-10" />
              <select
                value={selectedState}
                onChange={(e) => {
                  const st = e.target.value;
                  setSelectedState(st);
                  if (st !== 'all') {
                    const stateObj = INDIAN_STATES.find(s => s.name === st);
                    if (stateObj) setSelectedRegion(stateObj.region);
                  }
                }}
                className="w-full bg-[#080a0f]/90 border border-white/10 hover:border-white/20 focus:border-accent-green rounded-xl pl-11 pr-10 py-3 text-xs text-white appearance-none cursor-pointer focus:outline-none transition-all"
              >
                <option value="all" className="bg-[#080a0f] text-white">
                  All States / UTs ({statesForSelectedRegion.length})
                </option>
                <optgroup label="States (28)" className="bg-[#080a0f] text-accent-cyan font-bold">
                  {statesForSelectedRegion.filter(s => s.type === 'state').map((st) => (
                    <option key={st.code} value={st.name} className="bg-[#080a0f] text-white font-normal">
                      {st.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Union Territories (8)" className="bg-[#080a0f] text-accent-amber font-bold">
                  {statesForSelectedRegion.filter(s => s.type === 'ut').map((st) => (
                    <option key={st.code} value={st.name} className="bg-[#080a0f] text-white font-normal">
                      {st.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Quick Region Pill Selectors */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-thin">
            {INDIA_REGIONS.map((reg) => {
              const isSelected = selectedRegion === reg;
              return (
                <button
                  key={reg}
                  type="button"
                  onClick={() => {
                    setSelectedRegion(reg);
                    setSelectedState('all');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-accent-green/20 text-accent-green border-accent-green/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-white/[0.02] text-text-secondary hover:text-white border-white/5 hover:border-white/15'
                  }`}
                  style={{ fontFamily: 'var(--font-h)' }}
                >
                  {reg}
                </button>
              );
            })}
          </div>

          {/* Filter Status Strip & Reset Action */}
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <span className="text-text-muted flex items-center gap-1.5">
              <span>Showing <strong className="text-white font-bold">{filteredResellers.length}</strong> of <strong className="text-white">{resellers.length}</strong> verified stores</span>
              {selectedRegion !== 'All Regions' && (
                <span className="text-accent-cyan">&bull; Region: {selectedRegion}</span>
              )}
              {selectedState !== 'all' && (
                <span className="text-accent-green">&bull; State: {selectedState}</span>
              )}
            </span>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] text-accent-cyan hover:text-white flex items-center gap-1 transition-colors cursor-pointer underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Reseller Cards Grid */}
        {loading ? (
          <div className="py-24 text-center text-text-muted space-y-3">
            <span className="w-8 h-8 border-3 border-accent-green border-t-transparent rounded-full animate-spin inline-block shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
            <p className="text-xs uppercase tracking-widest font-bold text-accent-green font-mono">
              Loading Verified Resellers Catalog...
            </p>
          </div>
        ) : filteredResellers.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center space-y-4 border border-white/10">
            <ShieldCheck className="w-12 h-12 text-text-muted mx-auto opacity-40" />
            <h3 className="text-base font-bold uppercase text-white" style={{ fontFamily: 'var(--font-h)' }}>
              No Resellers Found
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
              No BGMI reseller profiles match your current search query or region filter.
            </p>
            {hasActiveFilters && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-outline py-2 px-4 text-xs font-mono uppercase inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>Clear Filters</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResellers.map((reseller) => (
              <SellerCard key={reseller.id} reseller={reseller} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
