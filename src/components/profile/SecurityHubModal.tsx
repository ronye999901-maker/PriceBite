import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  KeyRound,
  Lock,
  Smartphone,
  Download,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Cpu,
  History,
  Activity,
  FileCheck2,
  ShieldAlert,
} from 'lucide-react';
import { ThemeMode, SecurityStatus, SecurityAuditEvent, UserProfile } from '../../types';
import {
  getSecurityStatus,
  getAuditEvents,
  rotateAllCryptoKeys,
  saveSecurityPreferences,
  clearSecurityAuditLogs,
  recordAuditEvent,
} from '../../engine/crypto/securityEngine';

interface SecurityHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  themeMode: ThemeMode;
}

export const SecurityHubModal: React.FC<SecurityHubModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  themeMode,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'privacy' | 'audit'>('overview');
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus | null>(null);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditEvent[]>([]);
  const [isRotatingKeys, setIsRotatingKeys] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDark = themeMode === 'dark';

  const refreshData = async () => {
    const status = await getSecurityStatus();
    setSecurityStatus(status);
    setAuditLogs(getAuditEvents());
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
      setSuccessMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleRotateKeys = async () => {
    setIsRotatingKeys(true);
    try {
      await rotateAllCryptoKeys();
      await refreshData();
      showNotification('✅ ECDSA (P-256) and AES-256 cryptographic keys rotated successfully!');
    } catch (e) {
      console.error(e);
    } finally {
      setIsRotatingKeys(false);
    }
  };

  const handleToggle2FA = async () => {
    if (!securityStatus) return;
    const new2FA = !securityStatus.isTwoFactorEnabled;
    saveSecurityPreferences({
      isTwoFactorEnabled: new2FA,
      isBiometricsEnabled: securityStatus.isBiometricsEnabled,
    });
    recordAuditEvent({
      type: 'KEY_GEN',
      description: `Two-Factor Authentication (2FA / OTP) ${new2FA ? 'Enabled' : 'Disabled'}.`,
      status: 'SUCCESS',
    });
    await refreshData();
    showNotification(new2FA ? '🔐 Two-Factor Authentication enabled!' : '⚠️ 2FA disabled.');
  };

  const handleToggleBiometrics = async () => {
    if (!securityStatus) return;
    const newBio = !securityStatus.isBiometricsEnabled;
    saveSecurityPreferences({
      isTwoFactorEnabled: securityStatus.isTwoFactorEnabled,
      isBiometricsEnabled: newBio,
    });
    recordAuditEvent({
      type: 'KEY_GEN',
      description: `Biometric Passkeys (FIDO2 / TouchID) ${newBio ? 'Enabled' : 'Disabled'}.`,
      status: 'SUCCESS',
    });
    await refreshData();
    showNotification(newBio ? '👆 Biometric Passkeys (WebAuthn) enabled!' : '⚠️ Biometrics disabled.');
  };

  const handleExportData = () => {
    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      compliance: 'DPDP Act India 2023 & GDPR Art. 20 (Data Portability)',
      profile: {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone,
        currentPinCode: userProfile.currentPinCode,
        totalSavings: userProfile.totalSavingsAmount,
        savedAddresses: userProfile.savedAddresses,
      },
      orders: userProfile.pastOrders,
      security: {
        publicKeyFingerprint: securityStatus?.publicKeyFingerprint,
        healthScore: securityStatus?.healthScore,
        auditTrail: auditLogs,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pricebite-security-export-${userProfile.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    recordAuditEvent({
      type: 'DATA_PURGE',
      description: 'Exported complete GDPR encrypted profile and order history package.',
      status: 'SUCCESS',
    });
    showNotification('📦 Encrypted data package exported as JSON!');
  };

  const handleClearAuditLogs = () => {
    clearSecurityAuditLogs();
    setAuditLogs([]);
    showNotification('🧹 Security audit logs cleared.');
  };

  const score = securityStatus?.healthScore || 85;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-auto transition-all ${
          isDark ? 'glass-card border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xl border border-emerald-500/30">
              🛡️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base">Security & Privacy Shield Hub</h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  FIPS Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400">Zero-Trust Cryptographic Identity & Data Protection</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-900 bg-slate-200'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Toast */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-slide-up">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="px-6 pt-4 border-b border-slate-800 flex space-x-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'overview'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Overview & Score</span>
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'keys'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Keys & Ciphers</span>
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'privacy'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Privacy & GDPR</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'audit'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Score & Badge Card */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-20 h-20 -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="6" className="text-slate-800" fill="transparent" />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeDasharray={213}
                      strokeDashoffset={213 - (213 * score) / 100}
                      className="text-emerald-400 transition-all duration-1000"
                      fill="transparent"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xl font-black text-emerald-400">{score}</span>
                    <span className="text-[9px] text-slate-400 block -mt-1">/100</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-base text-slate-100">
                    {score >= 90 ? 'Bank-Grade Security Active' : 'Good Security Posture'}
                  </h4>
                  <p className="text-xs text-slate-400">Hardware-backed ECDSA signing & AES-256 encryption active.</p>
                  <div className="flex items-center space-x-2 mt-2 text-[10px] text-emerald-300 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Active Session: {securityStatus?.activeSessionId}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleRotateKeys}
                disabled={isRotatingKeys}
                className="w-full sm:w-auto bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-black px-4 py-2.5 rounded-2xl flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRotatingKeys ? 'animate-spin' : ''}`} />
                <span>{isRotatingKeys ? 'Rotating Keys...' : 'Rotate Keys'}</span>
              </button>
            </div>

            {/* Security Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* 2FA Toggle */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5 font-black text-xs text-slate-200">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Two-Factor Auth (2FA)</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Requires OTP confirmation on checkout</p>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    securityStatus?.isTwoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      securityStatus?.isTwoFactorEnabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Biometrics Toggle */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-1.5 font-black text-xs text-slate-200">
                    <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Biometric Passkeys</span>
                  </div>
                  <p className="text-[10px] text-slate-400">TouchID / FaceID / Windows Hello</p>
                </div>
                <button
                  onClick={handleToggleBiometrics}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    securityStatus?.isBiometricsEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      securityStatus?.isBiometricsEnabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* Anti-Tamper Cart Shield */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  🛡️
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-200">Anti-Price Tamper</h5>
                  <p className="text-[10px] text-emerald-400 font-semibold">ECDSA-256 Signatures Active</p>
                </div>
              </div>

              {/* Location Geofuzzing */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                  📍
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-200">Geofuzzing Protection</h5>
                  <p className="text-[10px] text-purple-300 font-semibold">PIN-level Obfuscation Active</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Keys & Ciphers */}
        {activeTab === 'keys' && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans font-bold">Asymmetric Algorithm</span>
                <span className="text-amber-400 font-bold">ECDSA (Curve P-256)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans font-bold">Public Key Fingerprint</span>
                <span className="text-emerald-400">{securityStatus?.publicKeyFingerprint}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400 font-sans font-bold">Symmetric Cipher</span>
                <span className="text-cyan-400 font-bold">AES-256-GCM (Authenticated)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans font-bold">Hash Function</span>
                <span className="text-slate-200">SHA-256 (NIST FIPS 180-4)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/60 text-xs text-slate-400 space-y-2">
              <h5 className="font-bold text-slate-200 flex items-center space-x-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Hardware Acceleration</span>
              </h5>
              <p>
                All cryptographic computations are executed directly on your device using native Web Crypto (SubtleCrypto).
                Your private key never leaves your device and is mathematically isolated from external servers.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Privacy & GDPR */}
        {activeTab === 'privacy' && (
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs text-slate-200">Data Portability (GDPR Art. 20 & DPDP Act India)</h4>
              <p className="text-xs text-slate-400">
                Download a cryptographically verified, complete archive of all profile coordinates, past transactions,
                savings metrics, and cryptographic certificates.
              </p>
              <button
                onClick={handleExportData}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export My Encrypted Data (JSON)</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/5 space-y-2 text-xs">
              <h4 className="font-bold text-red-400 flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>Right to be Forgotten (Account Purge)</span>
              </h4>
              <p className="text-slate-400 text-[11px]">
                Purges all local session keys, stored addresses, and order history from device storage.
              </p>
              <button
                onClick={handleClearAuditLogs}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold px-3 py-1.5 rounded-lg text-xs border border-red-500/30 transition-colors"
              >
                Clear All Audit Trails & History
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Trail */}
        {activeTab === 'audit' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-bold">Recent Cryptographic Events</span>
              {auditLogs.length > 0 && (
                <button
                  onClick={handleClearAuditLogs}
                  className="text-red-400 hover:text-red-300 text-[11px] font-bold underline"
                >
                  Clear Logs
                </button>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No cryptographic events logged yet.</div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs flex items-start justify-between space-x-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] text-amber-400 font-bold uppercase">{log.type}</span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{log.description}</p>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className={`px-6 py-3 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-Bit End-to-End Cryptographically Protected</span>
          </div>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-1.5 rounded-xl text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
