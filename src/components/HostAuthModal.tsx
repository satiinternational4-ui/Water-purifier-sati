import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface HostAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
  currentIsHost: boolean;
  onExitHostMode: () => void;
}

export const HostAuthModal: React.FC<HostAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentIsHost,
  onExitHostMode,
}) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on modal open
  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setErrorMessage(null);
      setShowHint(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Handle lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds((prev) => (prev && prev > 1 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  if (!isOpen) return null;

  // Clean raw input to numeric characters only, limit to 20 digits
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 20);
    setPasscode(rawVal);
    setErrorMessage(null);
  };

  // Format the 20-digit passcode into 4 readable blocks of 5 digits: 12345 - 67890 - 12345 - 67890
  const getFormattedDisplay = () => {
    if (!passcode) return '';
    const parts = [];
    for (let i = 0; i < passcode.length; i += 5) {
      parts.push(passcode.slice(i, i + 5));
    }
    return parts.join(' - ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length !== 20) {
      setErrorMessage('Passcode must be exactly 20 digits.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/verify-host-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: passcode }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.locked && data.waitSeconds) {
          setLockoutSeconds(data.waitSeconds);
        }
        setErrorMessage(data.error || 'Authentication failed. Please check your 20-digit code.');
        setIsLoading(false);
        return;
      }

      // Success
      setIsLoading(false);
      onSuccess(data.token);
    } catch (err) {
      console.error('Host authentication request failed:', err);
      setErrorMessage('Network error communicating with the authentication server. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950/50 to-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
                Security Protection
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Host Mode Authentication
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {currentIsHost ? (
            <div className="text-center py-3 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Host Mode is Currently ACTIVE</h4>
                <p className="text-xs text-slate-400 mt-1">
                  You are authenticated with full catalog management permissions (add/edit items, replace photos, and update price tags).
                </p>
              </div>
              <div className="pt-2 flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Continue as Host
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExitHostMode();
                    onClose();
                  }}
                  className="py-2 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold transition-colors cursor-pointer"
                >
                  Exit Host Mode
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-xs text-slate-300 leading-relaxed">
                Enter your confidential <span className="text-cyan-400 font-bold">20-digit security passcode</span> to unlock Host Mode.
              </div>

              {/* Lockout notification */}
              {lockoutSeconds !== null && lockoutSeconds > 0 && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-bold">Security Lockout Active:</span> Too many failed attempts. Try again in{' '}
                    <span className="font-mono font-bold text-rose-100">{lockoutSeconds}s</span>.
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && !lockoutSeconds && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="leading-tight">{errorMessage}</div>
                </div>
              )}

              {/* 20-Digit Input Group */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    20-Digit Passcode
                  </label>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      passcode.length === 20
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {passcode.length} / 20 digits
                  </span>
                </div>

                <div className="relative">
                  <input
                    ref={inputRef}
                    type={showPasscode ? 'text' : 'password'}
                    value={passcode}
                    onChange={handleInputChange}
                    disabled={isLoading || (lockoutSeconds !== null && lockoutSeconds > 0)}
                    placeholder="••••••••••••••••••••"
                    maxLength={20}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-11 text-base font-mono tracking-widest text-cyan-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500 transition-colors"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    title={showPasscode ? 'Hide Passcode' : 'Show Passcode'}
                  >
                    {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Formatted visualization preview when typing */}
                {passcode.length > 0 && showPasscode && (
                  <div className="p-2 bg-slate-950/70 border border-slate-800/60 rounded-lg text-center font-mono text-xs text-cyan-400/90 tracking-wider">
                    {getFormattedDisplay()}
                  </div>
                )}
              </div>

              {/* Zero-Knowledge Security Notice */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <strong className="text-slate-200">Server-Side Zero-Knowledge:</strong> This passcode is verified solely on the backend. No passwords or plain hashes exist in the website code.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowHint(!showHint)}
                  className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Passcode Help</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passcode.length !== 20 || isLoading || (lockoutSeconds !== null && lockoutSeconds > 0)}
                    className="py-2.5 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Authenticate</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Passcode Help Box */}
              {showHint && (
                <div className="p-3 rounded-xl bg-slate-950 border border-cyan-900/40 text-xs text-slate-300 space-y-1.5 animate-fade-in">
                  <p className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Confidential Passcode Information
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This 20-digit security key is known only to the shop owner/host and configured on your private server environment. For security against hackers, the passcode is never placed anywhere in the website frontend source code.
                  </p>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
