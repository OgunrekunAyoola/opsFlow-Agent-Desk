'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { X, Cookie, ShieldCheck, BarChart, Megaphone } from 'lucide-react';

interface ConsentState {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

const STORAGE_KEY = 'opsflow_cookie_consent';
const EXPIRY_DAYS = 365;

export function CookieConsent() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [consent, setConsent] = useState<ConsentState>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  // Mock region detection (EU/EEA/UK)
  const isEuRegion = () => {
    // In a real app, use an IP-to-Geo service or Edge Middleware
    return true; // Force true for demo/compliance
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { consent: storedConsent, expiry } = JSON.parse(stored);
        if (new Date().getTime() < expiry) {
          setConsent(storedConsent);
          return;
        }
      } catch (e) {
        // Invalid storage, reset
      }
    }

    // If no valid consent found and in EU, show banner
    if (isEuRegion()) {
      setIsOpen(true);
    }
  }, []);

  const saveConsent = (newConsent: ConsentState) => {
    const expiry = new Date().getTime() + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ consent: newConsent, expiry }));
    setConsent(newConsent);
    setIsOpen(false);
    
    // Trigger analytics load if consented
    if (newConsent.analytics) {
      window.dispatchEvent(new Event('cookie-consent-analytics'));
    }
    if (newConsent.marketing) {
      window.dispatchEvent(new Event('cookie-consent-marketing'));
    }
  };

  const acceptAll = () => {
    saveConsent({ essential: true, analytics: true, marketing: true });
  };

  const rejectNonEssential = () => {
    saveConsent({ essential: true, analytics: false, marketing: false });
  };

  const savePreferences = () => {
    saveConsent(consent);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 bg-slate-950/95 border-t border-slate-800 backdrop-blur-sm shadow-2xl animate-in slide-in-from-bottom-10">
      <div className="container mx-auto max-w-6xl">
        {!showPreferences ? (
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="space-y-2 flex-1">
              <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                <Cookie className="h-5 w-5 text-blue-400" />
                We value your privacy
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed max-w-3xl">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                In compliance with GDPR and ePrivacy Directive, we need your consent to use non-essential cookies.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Button variant="outline" onClick={() => setShowPreferences(true)}>
                Manage Preferences
              </Button>
              <Button variant="secondary" onClick={rejectNonEssential}>
                Reject Non-Essential
              </Button>
              <Button onClick={acceptAll} className="bg-blue-600 hover:bg-blue-500 text-white">
                Accept All
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Cookie Preferences</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowPreferences(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-4 bg-slate-900 border-slate-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-200 font-medium">
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                    Strictly Necessary
                  </div>
                  <input type="checkbox" checked disabled className="accent-blue-600 h-4 w-4" />
                </div>
                <p className="text-xs text-slate-400">
                  Essential for the website to function (auth, security, session). Cannot be disabled.
                </p>
              </Card>

              <Card className="p-4 bg-slate-900 border-slate-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-200 font-medium">
                    <BarChart className="h-4 w-4 text-blue-400" />
                    Analytics
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consent.analytics}
                    onChange={(e) => setConsent({...consent, analytics: e.target.checked})}
                    className="accent-blue-600 h-4 w-4 cursor-pointer" 
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Help us understand how visitors interact with the website. Data is anonymized.
                </p>
              </Card>

              <Card className="p-4 bg-slate-900 border-slate-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-slate-200 font-medium">
                    <Megaphone className="h-4 w-4 text-purple-400" />
                    Marketing
                  </div>
                  <input 
                    type="checkbox" 
                    checked={consent.marketing}
                    onChange={(e) => setConsent({...consent, marketing: e.target.checked})}
                    className="accent-blue-600 h-4 w-4 cursor-pointer" 
                  />
                </div>
                <p className="text-xs text-slate-400">
                  Used to track visitors across websites to display relevant ads.
                </p>
              </Card>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" onClick={() => setShowPreferences(false)}>Back</Button>
              <Button onClick={savePreferences} className="bg-blue-600 hover:bg-blue-500">
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
