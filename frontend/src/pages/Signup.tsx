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
      const isTimeout = err?.code === 'ECONNABORTED';
      const msg =
        err.response?.data?.error ||
        (isTimeout
          ? 'Request timed out. Please try again.'
          : 'Failed to create account. Email might be taken.');
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

        {/* Social Signup removed */}

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
