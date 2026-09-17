import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, X, Loader2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ChangeHostCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToken: string | null;
  onSuccess: () => void;
}

export const ChangeHostCodeModal: React.FC<ChangeHostCodeModalProps> = ({
  isOpen,
  onClose,
  sessionToken,
  onSuccess,
}) => {
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [showCodes, setShowCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCurrent = currentCode.replace(/\D/g, '');
    const cleanNew = newCode.replace(/\D/g, '');
    const cleanConfirm = confirmCode.replace(/\D/g, '');

    if (cleanCurrent.length !== 20) {
      setErrorMessage('Current passcode must be 20 digits.');
      return;
    }
    if (cleanNew.length !== 20) {
      setErrorMessage('New passcode must be exactly 20 digits.');
      return;
    }
    if (cleanNew !== cleanConfirm) {
      setErrorMessage('New passcode and confirmation do not match.');
      return;
    }
    if (cleanNew === cleanCurrent) {
      setErrorMessage('New passcode must be different from current passcode.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/change-host-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentCode: cleanCurrent,
          newCode: cleanNew,
          sessionToken,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to update passcode.');
        setIsLoading(false);
        return;
      }

      setSuccessMessage('20-digit security passcode successfully updated on the server!');
      setIsLoading(false);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Failed to change host code:', err);
      setErrorMessage('Network error communicating with the server. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border-b border-slate-800 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Security Settings
              </span>
              <h3 className="text-base font-bold text-white">
                Change 20-Digit Passcode
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {successMessage ? (
            <div className="py-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Passcode Updated</h4>
              <p className="text-xs text-slate-300">{successMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>{errorMessage}</div>
                </div>
              )}

              {/* Current Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current 20-Digit Passcode
                </label>
                <input
                  type={showCodes ? 'text' : 'password'}
                  value={currentCode}
                  onChange={(e) => setCurrentCode(e.target.value.replace(/\D/g, '').slice(0, 20))}
                  placeholder="20 digits..."
                  maxLength={20}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* New Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    New 20-Digit Passcode
                  </label>
                  <span className="text-[10px] font-mono text-slate-400">
                    {newCode.length}/20
                  </span>
                </div>
                <input
                  type={showCodes ? 'text' : 'password'}
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.replace(/\D/g, '').slice(0, 20))}
                  placeholder="Enter new 20 digits..."
                  maxLength={20}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Confirm New Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm New 20-Digit Passcode
                </label>
                <input
                  type={showCodes ? 'text' : 'password'}
                  value={confirmCode}
                  onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 20))}
                  placeholder="Re-type new 20 digits..."
                  maxLength={20}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowCodes(!showCodes)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {showCodes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showCodes ? 'Mask Digits' : 'Show Digits'}</span>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || newCode.length !== 20 || currentCode.length !== 20}
                  className="py-2 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Update Passcode</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
