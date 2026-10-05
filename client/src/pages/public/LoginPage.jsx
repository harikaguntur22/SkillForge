import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { FeedbackAlert } from '../../components/common/FeedbackAlert';
import { Mail, Lock, Sparkles, AlertCircle, ArrowRight, ShieldCheck, User } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const setDemoCredentials = (email, password) => {
    setFormData({ email, password });
    setErrors({});
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 items-center justify-center text-brand-400 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sign In to SkillForge
          </h1>
          <p className="text-sm text-slate-400">
            Access your skills profile, exchange requests, and active projects
          </p>
        </div>

        {/* Quick Demo Fill Buttons */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            Quick Demo Autofill
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDemoCredentials('alex.rivera@mit.edu', 'Alex@123456')}
              className="flex items-center gap-1.5 text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <div className="truncate">
                <span className="font-semibold block text-white">Student Alex</span>
                <span className="text-[10px] text-slate-500">alex.rivera@mit.edu</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('admin@skillforge.dev', 'Admin@123456')}
              className="flex items-center gap-1.5 text-left p-2 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <div className="truncate">
                <span className="font-semibold block text-white">Admin Demo</span>
                <span className="text-[10px] text-slate-500">admin@skillforge.dev</span>
              </div>
            </button>
          </div>
        </div>

        <Card className="border-slate-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <FeedbackAlert
                type="error"
                message={serverError}
                onDismiss={() => setServerError('')}
              />
            )}

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@university.edu"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
            >
              Sign In
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
              Create student account
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
