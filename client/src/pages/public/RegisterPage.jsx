import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { FeedbackAlert } from '../../components/common/FeedbackAlert';
import { 
  User, 
  Mail, 
  Lock, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Sparkles, 
  AlertCircle, 
  ArrowRight,
  Briefcase
} from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    college: '',
    branch: '',
    graduationYear: 2026,
    targetRole: 'Full Stack Developer',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'graduationYear' ? parseInt(value, 10) || '' : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.college.trim()) newErrors.college = 'College/University name is required';
    if (!formData.branch.trim()) newErrors.branch = 'Branch/Major is required';

    const gradYear = parseInt(formData.graduationYear, 10);
    if (!gradYear || gradYear < 2000 || gradYear > 2035) {
      newErrors.graduationYear = 'Graduation year must be between 2000 and 2035';
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
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        college: formData.college.trim(),
        branch: formData.branch.trim(),
        graduationYear: parseInt(formData.graduationYear, 10),
        targetRole: formData.targetRole.trim(),
      };

      await register(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.errors && Array.isArray(err.errors)) {
        const fieldErrors = {};
        err.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
      }
      setServerError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 items-center justify-center text-brand-400 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Create Your SkillForge Profile
          </h1>
          <p className="text-sm text-slate-400">
            Join a network of student builders exchanging skills and shipping production projects
          </p>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                placeholder="Alex Rivera"
                icon={User}
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                autoComplete="name"
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="alex@mit.edu"
                icon={Mail}
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                autoComplete="email"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="At least 6 characters"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                autoComplete="new-password"
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
                icon={Lock}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                autoComplete="new-password"
              />
            </div>

            <div className="border-t border-slate-800/80 pt-4 space-y-4">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Academic Background
              </div>

              <Input
                label="College or University"
                name="college"
                placeholder="e.g. Massachusetts Institute of Technology"
                icon={GraduationCap}
                value={formData.college}
                onChange={handleChange}
                error={errors.college}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Branch / Major"
                  name="branch"
                  placeholder="e.g. Computer Science"
                  icon={BookOpen}
                  value={formData.branch}
                  onChange={handleChange}
                  error={errors.branch}
                />

                <Input
                  label="Graduation Year"
                  name="graduationYear"
                  type="number"
                  placeholder="2026"
                  icon={Calendar}
                  value={formData.graduationYear}
                  onChange={handleChange}
                  error={errors.graduationYear}
                />
              </div>

              <Input
                label="Target Engineering Role"
                name="targetRole"
                placeholder="e.g. Full Stack Developer, ML Engineer"
                icon={Briefcase}
                value={formData.targetRole}
                onChange={handleChange}
                helperText="Used by the recommendation engine in Phase 5"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Complete Registration & Enter
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 hover:underline">
              Sign In here
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
