import React, { useState, useEffect } from 'react';
import { User, Listing } from '../types';
import {
  X,
  Shield,
  Lock,
  User as UserIcon,
  KeyRound,
  Loader2,
  CheckCircle2,
  Smartphone,
  Send,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Edit,
} from 'lucide-react';
import { api } from '../services/api';

interface AuthModalsProps {
  isAdminLoginOpen: boolean;
  onCloseAdminLogin: () => void;
  onAdminLoginSuccess: () => void;

  isUserAuthOpen: boolean;
  onCloseUserAuth: () => void;
  onUserAuthSuccess: (user: User) => void;

  isChangePasswordOpen: boolean;
  onCloseChangePassword: () => void;

  currentUser: User | null;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;

  targetListingForEdit?: Listing | null;
  onTargetListingVerified?: (listing: Listing) => void;
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  isAdminLoginOpen,
  onCloseAdminLogin,
  onAdminLoginSuccess,
  isUserAuthOpen,
  onCloseUserAuth,
  onUserAuthSuccess,
  isChangePasswordOpen,
  onCloseChangePassword,
  currentUser,
  onToast,
  targetListingForEdit,
  onTargetListingVerified,
}) => {
  // Admin Login State
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [isAdminChangingPassword, setIsAdminChangingPassword] = useState(false);
  const [adminOldPass, setAdminOldPass] = useState('');
  const [adminNewPass, setAdminNewPass] = useState('');
  const [adminConfirmPass, setAdminConfirmPass] = useState('');
  const [isAdminPassChanging, setIsAdminPassChanging] = useState(false);

  // User Auth Mode (Login vs Register)
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');

  // Mobile OTP State
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [devOtpCode, setDevOtpCode] = useState('');
  const [otpFullName, setOtpFullName] = useState('');

  // User ID / Password Auth State
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullname, setAuthFullname] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authSecurityQuestion, setAuthSecurityQuestion] = useState('pet');
  const [authSecurityAnswer, setAuthSecurityAnswer] = useState('');
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);

  // When targetListingForEdit changes, focus OTP on the ad's contact phone
  useEffect(() => {
    if (targetListingForEdit) {
      setIsLoginMode(true);
      setLoginMethod('otp');
      setOtpPhone(targetListingForEdit.phone || '');
      setIsOtpSent(false);
      setOtpCode('');
      setDevOtpCode('');
    }
  }, [targetListingForEdit, isUserAuthOpen]);

  // Forgot Password / Reset Modal State
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [fetchedQuestion, setFetchedQuestion] = useState('');
  const [forgotAnswer, setForgotAnswer] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Change Password State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // Handlers
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdminSubmitting(true);
    try {
      await api.adminLogin(adminPassword);
      onAdminLoginSuccess();
      onCloseAdminLogin();
      setAdminPassword('');
      onToast('Admin login successful! Welcome to Control Panel.', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid admin password';
      onToast(msg, 'error');
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const handleAdminChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminNewPass !== adminConfirmPass) {
      onToast('New password and confirmation do not match.', 'error');
      return;
    }
    if (adminNewPass.length < 6) {
      onToast('New password must be at least 6 characters.', 'error');
      return;
    }

    setIsAdminPassChanging(true);
    try {
      const res = await api.changeAdminPassword(adminOldPass, adminNewPass);
      onToast(res.message || 'Admin password updated successfully!', 'success');
      setIsAdminChangingPassword(false);
      setAdminOldPass('');
      setAdminNewPass('');
      setAdminConfirmPass('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update admin password';
      onToast(msg, 'error');
    } finally {
      setIsAdminPassChanging(false);
    }
  };

  // Send Mobile OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanDigits = otpPhone.replace(/[^0-9]/g, '');
    if (cleanDigits.length < 9) {
      onToast('Please enter a valid 9 or 10 digit Sri Lankan mobile number (e.g. 077 123 4567).', 'error');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await api.sendMobileOtp(otpPhone.trim());
      setIsOtpSent(true);
      setDevOtpCode(res.devOtp || '');
      onToast(res.message || 'OTP verification code sent to your mobile number!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP code';
      onToast(msg, 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify Mobile OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      onToast('Please enter the 6-digit OTP verification code.', 'error');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      if (targetListingForEdit) {
        // Direct ad ownership verification
        const res = await api.verifyAdOwnerOtp(
          targetListingForEdit.id,
          otpPhone.trim(),
          otpCode.trim(),
          otpFullName.trim() || undefined
        );
        onUserAuthSuccess(res.user);
        onCloseUserAuth();
        if (onTargetListingVerified) {
          onTargetListingVerified(res.listing);
        }
        onToast('Ad ownership verified! Opening advertisement editor...', 'success');
      } else {
        // Standard customer mobile OTP login/register
        const res = await api.verifyMobileOtp(
          otpPhone.trim(),
          otpCode.trim(),
          otpFullName.trim() || undefined
        );
        onUserAuthSuccess(res.user);
        onCloseUserAuth();
        onToast(`Welcome, ${res.user.fullname || res.user.username}! You are logged in.`, 'success');
      }
      setOtpCode('');
      setIsOtpSent(false);
      setDevOtpCode('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid or expired OTP code';
      onToast(msg, 'error');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Standard User ID / Password Submit
  const handleUserAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthSubmitting(true);

    try {
      if (isLoginMode) {
        const user = await api.userLogin(authUsername.trim(), authPassword);
        onUserAuthSuccess(user);
        onCloseUserAuth();
        setAuthPassword('');
        if (targetListingForEdit && onTargetListingVerified) {
          onTargetListingVerified(targetListingForEdit);
          onToast('Logged in! Opening your advertisement for editing.', 'success');
        } else {
          onToast(`Welcome back, ${user.fullname || user.username}!`, 'success');
        }
      } else {
        if (authPassword.length < 6) {
          onToast('Password must be at least 6 characters.', 'error');
          setIsAuthSubmitting(false);
          return;
        }
        const user = await api.userRegister({
          username: authUsername.trim(),
          fullname: authFullname.trim() || authUsername.trim(),
          email: authEmail.trim(),
          phone: authPhone.trim() || undefined,
          password: authPassword,
          securityQuestion: authSecurityQuestion,
          securityAnswer: authSecurityAnswer.trim(),
        });
        onUserAuthSuccess(user);
        onCloseUserAuth();
        setAuthPassword('');
        if (targetListingForEdit && onTargetListingVerified) {
          onTargetListingVerified(targetListingForEdit);
          onToast('Account created! Opening your advertisement for editing.', 'success');
        } else {
          onToast('Account created successfully! Welcome to HUTA.', 'success');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      onToast(msg, 'error');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  const handleFetchQuestion = async () => {
    if (!forgotUsername.trim()) {
      onToast('Please enter your username first.', 'error');
      return;
    }
    setIsFetchingQuestion(true);
    try {
      const res = await api.getSecurityQuestion(forgotUsername.trim());
      setFetchedQuestion(res.question);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'User not found';
      onToast(msg, 'error');
      setFetchedQuestion('');
    } finally {
      setIsFetchingQuestion(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotNewPassword.length < 6) {
      onToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      onToast('Passwords do not match.', 'error');
      return;
    }

    setIsResetting(true);
    try {
      await api.resetPassword(forgotUsername.trim(), forgotAnswer.trim(), forgotNewPassword);
      onToast('Password reset successfully! You can now log in.', 'success');
      setIsForgotModalOpen(false);
      setForgotUsername('');
      setFetchedQuestion('');
      setForgotAnswer('');
      setForgotNewPassword('');
      setForgotConfirmPassword('');
      // Open login modal
      setIsLoginMode(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reset password';
      onToast(msg, 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (newPass.length < 6) {
      onToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPass !== confirmNewPass) {
      onToast('Passwords do not match.', 'error');
      return;
    }

    setIsUpdatingPass(true);
    try {
      await api.changePassword(currentUser.id, currentPass, newPass);
      onToast('Password updated successfully!', 'success');
      onCloseChangePassword();
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password update failed';
      onToast(msg, 'error');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  return (
    <>
      {/* 1. Admin Login Modal */}
      {isAdminLoginOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={onCloseAdminLogin}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FF5A36]/15 text-[#FF5A36] flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-lg text-gray-900">
                  {isAdminChangingPassword ? 'Change Admin Password' : 'Admin Login'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAdminChangingPassword(false);
                  onCloseAdminLogin();
                }}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!isAdminChangingPassword ? (
              <form onSubmit={handleAdminSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Admin Master Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter admin password..."
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-gray-400">Protected Administrator Portal</span>
                    <button
                      type="button"
                      onClick={() => setIsAdminChangingPassword(true)}
                      className="text-[11px] font-semibold text-gray-500 hover:text-[#FF5A36] hover:underline"
                    >
                      Reset Password
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAdminSubmitting}
                  className="w-full bg-[#111217] hover:bg-black text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAdminSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Enter Dashboard</span>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleAdminChangePasswordSubmit} className="mt-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Current Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    value={adminOldPass}
                    onChange={(e) => setAdminOldPass(e.target.value)}
                    placeholder="Enter current master password"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    New Admin Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={adminNewPass}
                    onChange={(e) => setAdminNewPass(e.target.value)}
                    placeholder="New password (min 6 characters)"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={adminConfirmPass}
                    onChange={(e) => setAdminConfirmPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>

                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAdminChangingPassword(false)}
                    className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAdminPassChanging}
                    className="w-2/3 bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    {isAdminPassChanging ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <span>Save New Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 2. User Login & Register Modal */}
      {isUserAuthOpen && !isForgotModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={onCloseUserAuth}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF5A36]/15 text-[#FF5A36] flex items-center justify-center font-bold">
                  {targetListingForEdit ? (
                    <Edit className="w-4 h-4" />
                  ) : isLoginMode ? (
                    loginMethod === 'otp' ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <UserIcon className="w-4 h-4" />
                    )
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900 leading-tight">
                    {targetListingForEdit
                      ? 'Verify Ad Ownership'
                      : isLoginMode
                      ? 'Customer Login'
                      : 'Create Free Account'}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {targetListingForEdit
                      ? 'Confirm via Mobile OTP to edit your advertisement'
                      : isLoginMode
                      ? 'Sign in via Mobile OTP or User ID / Password'
                      : 'Manage your ads, inquiries and live views'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseUserAuth}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Listing Notice (If triggered from ad edit request) */}
            {targetListingForEdit && (
              <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 rounded-2xl">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
                      <span className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse" />
                      <span>Editing Ad:</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 line-clamp-1 mt-0.5">
                      {targetListingForEdit.title}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                      Contact phone on ad: <strong className="text-gray-900">{targetListingForEdit.phone}</strong>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-orange-100 text-[#FF5A36] text-[10px] font-black uppercase tracking-wider shrink-0">
                    Self-Service
                  </span>
                </div>
              </div>
            )}

            {/* Login Mode Method Selector Tabs (Only in Login Mode) */}
            {isLoginMode && (
              <div className="mt-4 grid grid-cols-2 p-1 bg-gray-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLoginMethod('otp')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === 'otp'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 text-[#FF5A36]" />
                  <span>Mobile OTP</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded font-black hidden sm:inline">
                    FAST
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    loginMethod === 'password'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5 text-blue-600" />
                  <span>User ID / Pass</span>
                </button>
              </div>
            )}

            {/* Form Container */}
            {isLoginMode && loginMethod === 'otp' ? (
              /* Mobile OTP Form */
              <form onSubmit={handleVerifyOtp} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Mobile Phone Number <span className="text-[#FF5A36]">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3 flex items-center gap-1 text-xs font-bold text-gray-500 pointer-events-none select-none">
                      <span>🇱🇰</span>
                      <span>+94</span>
                      <span className="text-gray-300">|</span>
                    </div>
                    <input
                      type="tel"
                      required
                      value={otpPhone}
                      disabled={isOtpSent}
                      onChange={(e) => setOtpPhone(e.target.value)}
                      placeholder="077 123 4567"
                      className="w-full pl-18 pr-28 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none font-medium disabled:bg-gray-50 disabled:text-gray-600"
                    />
                    {!isOtpSent ? (
                      <button
                        type="button"
                        onClick={() => handleSendOtp()}
                        disabled={isSendingOtp || !otpPhone}
                        className="absolute right-1.5 px-3 py-1.5 bg-[#FF5A36] hover:bg-[#E04826] text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        {isSendingOtp ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        <span>Send OTP</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtpSent(false);
                          setOtpCode('');
                          setDevOtpCode('');
                        }}
                        className="absolute right-2 text-[11px] text-[#FF5A36] font-bold hover:underline cursor-pointer"
                      >
                        Change
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Enter your Sri Lankan mobile number (e.g. 077xxxxxxx, 071xxxxxxx).
                  </p>
                </div>

                {isOtpSent && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Dev OTP Auto-Fill Banner for effortless testing */}
                    {devOtpCode && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            Test Code: <strong className="font-mono text-sm">{devOtpCode}</strong>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setOtpCode(devOtpCode)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-md shadow-2xs transition-colors cursor-pointer"
                        >
                          Auto-Fill Code
                        </button>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          6-Digit OTP Code <span className="text-[#FF5A36]">*</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleSendOtp()}
                          disabled={isSendingOtp}
                          className="text-[11px] text-gray-500 hover:text-[#FF5A36] flex items-center gap-1 font-semibold cursor-pointer"
                        >
                          <RefreshCw className={`w-2.5 h-2.5 ${isSendingOtp ? 'animate-spin' : ''}`} />
                          <span>Resend OTP</span>
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="••••••"
                        autoFocus
                        className="w-full px-3.5 py-2.5 text-center tracking-[0.5em] font-mono text-lg font-black rounded-xl border border-gray-300 focus:border-[#FF5A36] outline-none"
                      />
                    </div>

                    {!targetListingForEdit && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                          Your Name <span className="text-gray-400 font-normal">(Optional for new members)</span>
                        </label>
                        <input
                          type="text"
                          value={otpFullName}
                          onChange={(e) => setOtpFullName(e.target.value)}
                          placeholder="e.g. Kasun Fernando"
                          className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isVerifyingOtp || otpCode.length < 6}
                      className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isVerifyingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying Code...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {targetListingForEdit
                              ? 'Verify Ownership & Edit Ad'
                              : 'Verify & Sign In'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            ) : (
              /* User ID / Password Login OR Registration Form */
              <form onSubmit={handleUserAuthSubmit} className="mt-4 space-y-3.5">
                {/* If Register: Full Name */}
                {!isLoginMode && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={authFullname}
                      onChange={(e) => setAuthFullname(e.target.value)}
                      placeholder="e.g. Kasun Perera"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                  </div>
                )}

                {/* Username / User ID / Mobile */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    {isLoginMode ? (
                      <>
                        User ID, Mobile Phone, or Username <span className="text-[#FF5A36]">*</span>
                      </>
                    ) : (
                      <>
                        Username / User ID <span className="text-[#FF5A36]">*</span>
                      </>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    placeholder={
                      isLoginMode
                        ? 'e.g. user_..., 0771234567, or username'
                        : 'Choose unique username'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                  {isLoginMode && (
                    <p className="text-[11px] text-gray-400 mt-1">
                      You can log in with your assigned User ID, registered mobile number, or username.
                    </p>
                  )}
                </div>

                {/* If Register: Mobile Phone */}
                {!isLoginMode && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Mobile Number <span className="text-[#FF5A36]">*</span>
                    </label>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      placeholder="077 123 4567"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Connects all ads you post to your dashboard and enables fast Mobile OTP login.
                    </p>
                  </div>
                )}

                {/* If Register: Email */}
                {!isLoginMode && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Email Address <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="kasun@example.lk"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Password <span className="text-[#FF5A36]">*</span>
                    </label>
                    {isLoginMode && (
                      <button
                        type="button"
                        onClick={() => setIsForgotModalOpen(true)}
                        className="text-xs text-[#FF5A36] hover:underline font-semibold cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                </div>

                {/* If Register: Security Question */}
                {!isLoginMode && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Security Question (for recovery) <span className="text-[#FF5A36]">*</span>
                      </label>
                      <select
                        value={authSecurityQuestion}
                        onChange={(e) => setAuthSecurityQuestion(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none bg-white cursor-pointer"
                      >
                        <option value="pet">What is your pet's name?</option>
                        <option value="mother">What is your mother's maiden name?</option>
                        <option value="city">What city were you born in?</option>
                        <option value="school">What is your primary school name?</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Security Answer <span className="text-[#FF5A36]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={authSecurityAnswer}
                        onChange={(e) => setAuthSecurityAnswer(e.target.value)}
                        placeholder="Your secret answer..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isAuthSubmitting}
                  className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isAuthSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>
                      {targetListingForEdit
                        ? 'Sign In & Edit Ad'
                        : isLoginMode
                        ? 'Login to Account'
                        : 'Register Account'}
                    </span>
                  )}
                </button>
              </form>
            )}

            <div className="text-center pt-3 border-t border-gray-100 mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  if (!isLoginMode) {
                    setLoginMethod('otp');
                  }
                }}
                className="text-xs text-gray-600 hover:text-gray-900 font-semibold cursor-pointer"
              >
                {isLoginMode ? (
                  <span>
                    Don't have an account? <strong className="text-[#FF5A36]">Create New Account</strong>
                  </span>
                ) : (
                  <span>
                    Already have an account? <strong className="text-[#FF5A36]">Sign In with User ID / OTP</strong>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Password Reset (Forgot Password) Modal */}
      {isForgotModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setIsForgotModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative border border-gray-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FF5A36]" />
                <h3 className="font-extrabold text-lg text-gray-900">Reset Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Your Username
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={forgotUsername}
                    onChange={(e) => {
                      setForgotUsername(e.target.value);
                      setFetchedQuestion('');
                    }}
                    placeholder="Enter registered username"
                    className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleFetchQuestion}
                    disabled={isFetchingQuestion}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    {isFetchingQuestion ? 'Checking...' : 'Find Question'}
                  </button>
                </div>
              </div>

              {fetchedQuestion && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-900 space-y-1">
                  <span className="font-bold">Security Question:</span>
                  <p className="font-medium text-sm text-gray-900">{fetchedQuestion}</p>
                </div>
              )}

              {fetchedQuestion && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Your Security Answer
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotAnswer}
                      onChange={(e) => setForgotAnswer(e.target.value)}
                      placeholder="Type your answer"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full bg-[#FF5A36] hover:bg-[#E04826] text-white font-bold py-2.5 rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    {isResetting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </>
              )}

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="text-xs text-gray-500 hover:text-gray-900 font-semibold"
                >
                  Cancel and return to login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Change Password Modal (For logged in user) */}
      {isChangePasswordOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={onCloseChangePassword}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative border border-gray-100 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#FF5A36]" />
                <h3 className="font-extrabold text-lg text-gray-900">Change Password</h3>
              </div>
              <button
                type="button"
                onClick={onCloseChangePassword}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:border-[#FF5A36] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingPass}
                className="w-full bg-[#111217] hover:bg-black text-white font-bold py-2.5 rounded-xl text-sm transition-colors mt-2 flex items-center justify-center gap-2"
              >
                {isUpdatingPass ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Save New Password</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
