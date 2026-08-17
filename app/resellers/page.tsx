'use client';

import React, { useState, useEffect } from 'react';
import SellerCard from '../../components/ui/SellerCard';
import { db } from '../../lib/db';
import { TrustedReseller } from '../../types';
import { INDIAN_STATES, INDIA_REGIONS } from '../../lib/constants/indiaStates';
import { Search, Filter, ShieldCheck, MapPin, Users, Building } from 'lucide-react';
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

  // Filtering logic
  const filteredResellers = resellers.filter((reseller) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      query === '' ||
      reseller.store_name.toLowerCase().includes(query) ||
      reseller.state?.toLowerCase().includes(query) ||
      reseller.region?.toLowerCase().includes(query) ||
      reseller.telegram_username?.toLowerCase().includes(query) ||
      reseller.whatsapp_number?.replace(/\D/g, '').includes(query.replace(/\D/g, '')) ||
      (reseller.profile?.username || '').toLowerCase().includes(query) ||
      (reseller.profile?.display_name || '').toLowerCase().includes(query);

    const matchesRegion =
      selectedRegion === 'All Regions' ||
      (reseller.region && reseller.region.toLowerCase() === selectedRegion.toLowerCase());

    const matchesState =
      selectedState === 'all' ||
      (reseller.state && reseller.state.toLowerCase() === selectedState.toLowerCase());

    return matchesQuery && matchesRegion && matchesState;
  });

  const statesForSelectedRegion = selectedRegion === 'All Regions'
    ? INDIAN_STATES
    : INDIAN_STATES.filter(s => s.region.toLowerCase() === selectedRegion.toLowerCase());

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
        <p className="text-text-secondary text-sm max-w-2xl leading-relaxed">
          Built by Resellers for all Resellers across India. Discover verified BGMI stores operating on WhatsApp & Telegram across all 28 States & 8 Union Territories.
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="glass-panel rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-cyan pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search store name, state (e.g. Maharashtra, Delhi), telegram, WhatsApp..."
              className="input-field pl-11 py-3 text-xs w-full"
            />
          </div>

          {/* Region Dropdown */}
          <div className="md:col-span-3 relative flex items-center">
            <MapPin className="absolute left-4 w-4 h-4 text-accent-cyan pointer-events-none" />
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedState('all');
              }}
              className="input-field pl-11 pr-8 py-3 text-xs w-full appearance-none cursor-pointer"
            >
              <option value="All Regions">All Regions</option>
              {INDIA_REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <Filter className="absolute right-4 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>

          {/* State Dropdown */}
          <div className="md:col-span-3 relative flex items-center">
            <Building className="absolute left-4 w-4 h-4 text-accent-green pointer-events-none" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="input-field pl-11 pr-8 py-3 text-xs w-full appearance-none cursor-pointer"
            >
              <option value="all">All States / UTs</option>
              <optgroup label="States (28)">
                {statesForSelectedRegion.filter(s => s.type === 'state').map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Union Territories (8)">
                {statesForSelectedRegion.filter(s => s.type === 'ut').map((st) => (
                  <option key={st.code} value={st.name}>
                    {st.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <Filter className="absolute right-4 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          </div>
        </div>

        {/* Quick Region Pill Selectors */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {INDIA_REGIONS.map((reg) => {
            const isSelected = selectedRegion === reg;
            return (
              <button
                key={reg}
                onClick={() => {
                  setSelectedRegion(reg);
                  setSelectedState('all');
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-accent-green/20 text-accent-green border border-accent-green/40'
                    : 'bg-white/[0.02] text-text-secondary hover:text-white border border-white/5'
                }`}
                style={{ fontFamily: 'var(--font-h)' }}
              >
                {reg}
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
            Loading Verified Resellers Catalog...
          </p>
        </div>
      ) : filteredResellers.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-text-muted mx-auto opacity-40" />
          <h3 className="text-base font-bold uppercase text-white" style={{ fontFamily: 'var(--font-h)' }}>
            No Resellers Found
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto leading-relaxed">
            No BGMI reseller profiles match your current search query or region filter.
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
    </ProtectedRoute>
  );
}
