import React, { useState } from 'react';
import { Bot, Mail, Lock, User, Building, ArrowRight, Eye, EyeOff, Check, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import api from '../lib/api';
import { useToast } from '../context/ToastContext';

export function Signup() {
  const [formData, setFormData] = useState({
    tenantName: '',
    name: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  // Password Requirements
  const requirements = [
    { label: 'At least 8 characters', valid: formData.password.length >= 8 },
    { label: 'Contains uppercase letter', valid: /[A-Z]/.test(formData.password) },
    { label: 'Contains number', valid: /[0-9]/.test(formData.password) },
    { label: 'Contains special character', valid: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  const allValid = requirements.every((r) => r.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allValid) {
      setError('Please meet all password requirements.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await api.post('/auth/signup', formData);
      const { access_token } = res.data;
      localStorage.setItem('access_token', access_token);
      toast.success('Account created successfully!');
      setIsSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create account. Email might be taken.';
      setError(msg);
      toast.error(msg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/social-login', {
        provider,
        email: formData.email || `user-${Date.now()}@example.com`,
        name: formData.name || provider,
      });
      const { access_token } = res.data;
      localStorage.setItem('access_token', access_token);
      toast.success('Signed in successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error || 'Social login failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-[100px]" />
        </div>

        <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative z-10 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-6 mx-auto">
            <Mail className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-3">
            Check your email
          </h2>
          <p className="text-text-muted mb-6">
            We've sent a verification link to{' '}
            <span className="font-medium text-text-primary">{formData.email}</span>. Please click
            the link to verify your account.
          </p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/dashboard?welcome=true')} className="w-full">
              Skip for now
            </Button>
            <p className="text-xs text-text-muted">
              You can verify your email later from your profile settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-300/30 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative z-10">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-grad-main text-white mb-4 shadow-lg shadow-blue-500/30">
            <Bot size={24} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">Create Account</h1>
          <p className="text-text-muted mt-2">Join OpsFlow and upgrade your support.</p>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all text-sm font-medium text-text-primary"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('apple')}
            className="flex items-center justify-center gap-2 h-10 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-all text-sm font-medium text-text-primary"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.11 3.67-1.11 1.67.11 2.53.84 3.07 1.34-.35.48-1.54 1.67-1.54 3.55 0 2.27 1.84 3.35 1.94 3.41-.05.29-.68 2.08-1.63 3.47-1.05 1.57-2.3 3.2-4.59 1.57zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Apple
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white/80 backdrop-blur-sm px-2 text-text-muted">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-500 text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-primary ml-1">Agency Name</label>
            <div className="relative">
              <Building
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <input
                name="tenantName"
                value={formData.tenantName}
                onChange={handleChange}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                placeholder="Acme Corp"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-primary ml-1">Full Name</label>
            <div className="relative">
              <User
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-primary ml-1">Email</label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                placeholder="you@agency.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary ml-1">Password</label>
            <div className="relative">
              <Lock
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setPasswordFocused(true)}
                className="w-full h-10 pl-10 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all"
                placeholder="Create a strong password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Requirements */}
            {passwordFocused && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 animate-fade-in-up">
                <p className="text-xs font-medium text-text-muted mb-2">Password must contain:</p>
                <div className="grid grid-cols-1 gap-1">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {req.valid ? (
                        <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                          <Check size={10} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                          <X size={10} />
                        </div>
                      )}
                      <span
                        className={`text-xs ${req.valid ? 'text-text-primary' : 'text-text-muted'}`}
                      >
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-10 shadow-lg shadow-blue-500/20"
            disabled={isLoading || !allValid}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}{' '}
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-primary font-medium hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
