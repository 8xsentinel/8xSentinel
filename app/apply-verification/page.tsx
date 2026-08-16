'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/db';
import { storage } from '../../lib/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../../lib/firebase/AuthContext';
import { toast } from 'sonner';
import { 
  ArrowLeft, ArrowRight, ShieldCheck, CheckCircle, Info, 
  MapPin, Camera, FileText, CheckCircle2, AlertTriangle, Crosshair
} from 'lucide-react';
import ProtectedRoute from '../../components/auth/ProtectedRoute';

export default function Tier2ApplicationPage() {
  const router = useRouter();
  const { profile } = useAuth();
  
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  
  const [govIdFile, setGovIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      db.getUserStoreApplication(profile.id).then(res => {
        setStoreData(res);
        setLoading(false);
      });
    } else if (profile === null) {
        setLoading(false);
    }
  }, [profile]);

  const handleGetLocation = () => {
    setLocationLoading(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationLoading(false);
        toast.success('Live location secured');
      },
      (err) => {
        toast.error('Failed to get location. Please enable location permissions.');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!govIdFile) {
        toast.error('Please upload a valid Government ID.');
        return;
      }
    } else if (step === 2) {
      if (!location) {
        toast.error('Please capture your live location.');
        return;
      }
    } else if (step === 3) {
      if (!selfieFile) {
        toast.error('Please capture or upload a selfie.');
        return;
      }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeData?.id || !govIdFile || !selfieFile || !location) {
      toast.error('Incomplete application data.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload Gov ID
      const govIdRef = ref(storage, `kyc/${storeData.id}_govid_${Date.now()}`);
      await uploadBytes(govIdRef, govIdFile);
      const govIdUrl = await getDownloadURL(govIdRef);

      // Upload Selfie
      const selfieRef = ref(storage, `kyc/${storeData.id}_selfie_${Date.now()}`);
      await uploadBytes(selfieRef, selfieFile);
      const selfieUrl = await getDownloadURL(selfieRef);

      const kycData = {
        govIdUrl,
        selfieUrl,
        locationLat: location.lat.toString(),
        locationLng: location.lng.toString()
      };

      await db.applyForSentinelTrusted(storeData.id, kycData);
      
      toast.success('Sentinel Trusted Application Submitted!', {
        description: 'Root Administrators will review your KYC documents shortly.'
      });
      setStep(5);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit application. Try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container py-24 text-center font-sans">Loading verification matrix...</div>;
  }

  // Pre-requisites Check: Reseller must be Sentinel Verified
  const isVerifiedReseller = 
    storeData?.verification_status === 'approved' || 
    storeData?.verificationStatus === 'approved' || 
    profile?.store_status === 'approved' || 
    (profile as any)?.storeStatus === 'approved' || 
    profile?.role === 'verified_reseller';

  if (!storeData || !isVerifiedReseller) {
    return (
      <ProtectedRoute>
        <div className="max-w-xl mx-auto py-24 px-4 text-center space-y-6 font-sans">
          <div className="w-20 h-20 rounded-2xl bg-accent-amber/10 border border-accent-amber/30 flex items-center justify-center mx-auto text-accent-amber shadow-[0_0_40px_rgba(245,158,11,0.2)]">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-white font-mono">
            Sentinel Verified Clearance Required
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed">
            You must be an approved <strong>Sentinel Verified</strong> reseller before applying for the elite <strong>Sentinel Trusted</strong> distinction.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors border border-white/10"
          >
            Return to Dashboard
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-8 font-sans">
        <div className="space-y-3">
          <div className="badge badge-amber bg-accent-amber/10 text-accent-amber border border-accent-amber/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block font-mono">
            SENTINEL TRUSTED ONBOARDING
          </div>
          <h1 
            className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight text-white flex items-center gap-3"
            style={{ fontFamily: 'var(--font-h)' }}
          >
            <ShieldCheck className="w-8 h-8 text-accent-amber animate-pulse" />
            <span>Sentinel <span className="text-accent-amber">Trusted</span></span>
          </h1>
          <p className="text-text-secondary text-xs font-sans font-medium">
            Elite trust seal for high-volume traders. Requires biometric KYC including live geofencing and Government ID verification.
          </p>
        </div>

        {step <= 4 && (
          <div className="flex justify-between items-center text-[10px] tracking-widest text-text-muted border-b border-white/10 pb-4">
            {['Government ID', 'Live Location', 'Identity Selfie', 'Review'].map((label, idx) => {
              const active = idx + 1 === step;
              const completed = idx + 1 < step;
              return (
                <div key={idx} className="flex items-center gap-1">
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center font-bold ${active ? 'border-accent-amber text-accent-amber bg-accent-amber/5' : ''} ${completed ? 'border-accent-amber text-accent-amber bg-accent-amber/5' : 'border-white/10'}`}>
                    {idx + 1}
                  </span>
                  <span className={`hidden sm:inline ${active ? 'text-accent-amber font-bold' : ''} ${completed ? 'text-accent-amber' : ''}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNextStep(); }} className="bg-[#0d121f] border border-white/10 shadow-[0_0_80px_rgba(245,158,11,0.05)] rounded-2xl p-6 md:p-8 space-y-6">
          
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <FileText className="w-5 h-5 text-accent-amber" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">Government ID Upload</h3>
              </div>
              <p className="text-text-secondary text-sm">
                Upload a clear image of a valid Government ID (Aadhar, PAN, Passport, or Driver's License). The name on the ID must match your account.
              </p>
              <div className="p-8 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.02] text-center space-y-4 hover:bg-white/[0.04] transition-colors relative cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => e.target.files && setGovIdFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="w-12 h-12 text-text-muted mx-auto" />
                <div>
                  <p className="text-white font-medium text-sm">
                    {govIdFile ? govIdFile.name : 'Click or drag Government ID image here'}
                  </p>
                  <p className="text-text-muted text-xs mt-1">JPEG, PNG up to 5MB</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <MapPin className="w-5 h-5 text-accent-amber" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">Live Location Geofencing</h3>
              </div>
              <p className="text-text-secondary text-sm">
                To prevent fraudulent cross-border store fronts, Sentinel Trusted requires a live geo-location tag. Please allow location access.
              </p>
              <div className="p-8 border border-white/10 rounded-xl bg-white/[0.02] text-center space-y-6">
                <Crosshair className={`w-16 h-16 mx-auto ${location ? 'text-accent-green' : 'text-accent-amber'} ${locationLoading ? 'animate-spin opacity-50' : ''}`} />
                <div>
                  {location ? (
                    <div className="space-y-2">
                      <p className="text-accent-green font-bold text-sm uppercase tracking-wider">Location Secured</p>
                      <p className="text-xs text-text-muted font-mono">LAT: {location.lat.toFixed(6)} | LNG: {location.lng.toFixed(6)}</p>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={locationLoading}
                      className="bg-accent-amber/20 hover:bg-accent-amber/30 text-accent-amber border border-accent-amber/40 px-6 py-3 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                      {locationLoading ? 'Acquiring GPS Signal...' : 'Capture Live Location'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <Camera className="w-5 h-5 text-accent-amber" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">Identity Selfie</h3>
              </div>
              <p className="text-text-secondary text-sm">
                Take a clear selfie of your face. This will be cross-referenced with your Government ID by the moderation team.
              </p>
              <div className="p-8 border-2 border-dashed border-white/10 rounded-xl bg-white/[0.02] text-center space-y-4 hover:bg-white/[0.04] transition-colors relative cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*"
                  capture="user"
                  onChange={(e) => e.target.files && setSelfieFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Camera className="w-12 h-12 text-text-muted mx-auto" />
                <div>
                  <p className="text-white font-medium text-sm">
                    {selfieFile ? selfieFile.name : 'Tap to open camera or upload selfie'}
                  </p>
                  <p className="text-text-muted text-xs mt-1">Make sure you are in a well-lit area</p>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <CheckCircle className="w-5 h-5 text-accent-amber" />
                <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">Review Application</h3>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-white/10 rounded-xl bg-white/[0.02]">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Gov ID Document</p>
                  <p className="text-sm text-white font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-green" /> Uploaded
                  </p>
                </div>
                <div className="p-4 border border-white/10 rounded-xl bg-white/[0.02]">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Live Coordinates</p>
                  <p className="text-sm text-white font-medium flex items-center gap-2 font-mono">
                    <CheckCircle2 className="w-4 h-4 text-accent-green" /> {location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}
                  </p>
                </div>
                <div className="p-4 border border-white/10 rounded-xl bg-white/[0.02] sm:col-span-2">
                  <p className="text-[10px] text-text-muted uppercase tracking-widest mb-1">Identity Selfie</p>
                  <p className="text-sm text-white font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-accent-green" /> Captured
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 mt-6">
                <Info className="w-5 h-5 text-accent-amber shrink-0 mt-0.5" />
                <p className="text-xs text-text-secondary leading-relaxed">
                  By submitting this application, you agree to Sentinel's strictly enforced KYC policies. Providing false documentation will result in a permanent hardware ban and listing as a Verified Scammer.
                </p>
              </div>
            </div>
          )}

          {step <= 4 && (
            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <button
                type="button"
                onClick={() => step > 1 ? setStep(step - 1) : router.push('/dashboard')}
                className="flex items-center gap-1.5 text-text-secondary hover:text-white px-4 py-2 rounded text-xs uppercase font-mono transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{step === 1 ? 'Cancel' : 'Back'}</span>
              </button>

              {step < 4 ? (
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-accent-amber/20 border border-accent-amber/40 text-accent-amber hover:bg-accent-amber hover:text-bg-void px-6 py-2.5 rounded text-xs font-bold uppercase transition-all duration-200"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-accent-amber hover:shadow-[0_0_30px_rgba(245,158,11,0.35)] text-bg-void px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading KYC Data...' : 'Submit Final Application'}
                </button>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="text-center space-y-6 py-8">
              <div className="w-20 h-20 rounded-full bg-accent-amber/10 border border-accent-amber/20 text-accent-amber flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 animate-pulse" />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold font-mono uppercase tracking-widest text-white">
                  Application Under Review
                </h3>
                <p className="text-text-secondary text-sm max-w-md mx-auto">
                  Your Sentinel Trusted application and biometric KYC documents have been securely transmitted to the Sentinel Command Deck.
                </p>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </ProtectedRoute>
  );
}
