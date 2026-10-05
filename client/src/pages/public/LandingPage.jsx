import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { 
  Sparkles, 
  Repeat, 
  Compass, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Code2, 
  GraduationCap, 
  Zap,
  Layers
} from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="space-y-24 py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Continuous Developer Learning Cycle</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Learn. Exchange.{' '}
          <span className="text-gradient">Build Together.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 leading-relaxed">
          The collaborative platform for college students and developers to exchange technical skills, 
          discover projects fitted to their current skill levels, and build real-world software in teams.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto group">
              Start Free Today
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Sign In to Demo
            </Button>
          </Link>
        </div>

        {/* Live Seed Credentials Banner */}
        <div className="pt-6">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Instant Demo Credentials (Pre-seeded)
              </span>
              <Badge variant="brand" size="xs">Demo Ready</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <p className="font-semibold text-white">Student / Mentor:</p>
                <p className="text-slate-400">alex.rivera@mit.edu</p>
                <p className="text-slate-400">Alex@123456</p>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                <p className="font-semibold text-white">Admin Account:</p>
                <p className="text-slate-400">admin@skillforge.dev</p>
                <p className="text-slate-400">Admin@123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card hoverEffect className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-brand-400">
            <Repeat className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">1. Peer Skill Exchange</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Specify what you can teach and what you want to learn. Our bilateral matching algorithm pairs you with students on campus or globally.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Compatibility scoring & mutual interest detection</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Scheduled learning sessions & peer endorsements</span>
            </li>
          </ul>
        </Card>

        <Card hoverEffect className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">2. Skill-to-Project Engine</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Never wonder what to code next. Our transparent 5-factor scoring engine identifies projects matching your exact skill profile.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Skill gap analysis: Ready vs Need Improvement</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Actionable, step-by-step readiness pathways</span>
            </li>
          </ul>
        </Card>

        <Card hoverEffect className="space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">3. Team Collaboration</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Form balanced project teams, manage Kanban tasks, achieve milestones, and add real proof of work directly to your skill profile.
          </p>
          <ul className="text-xs text-slate-400 space-y-1.5 pt-2">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Integrated project workspaces with task boards</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Turn completed deliverables into verified skill evidence</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Value Loop Architecture Visual */}
      <Card className="p-8 sm:p-10 border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/80">
        <div className="max-w-2xl mx-auto text-center space-y-4 mb-8">
          <Badge variant="brand">Continuous Loop</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            From Learning to Verifiable Proof
          </h2>
          <p className="text-sm text-slate-400">
            Traditional tutorials leave you stuck in tutorial hell. SkillForge powers every stage from skill acquisition to production release.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <GraduationCap className="w-6 h-6 text-brand-400 mx-auto mb-2" />
            <p className="font-semibold text-sm text-white">1. Current Skills</p>
            <p className="text-xs text-slate-400 mt-1">Self-reported & evidence backed</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <Repeat className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <p className="font-semibold text-sm text-white">2. Skill Exchange</p>
            <p className="text-xs text-slate-400 mt-1">Peer learning sessions</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <Layers className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-sm text-white">3. Build Projects</p>
            <p className="text-xs text-slate-400 mt-1">Collaborative team sprints</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <p className="font-semibold text-sm text-white">4. Verified Proof</p>
            <p className="text-xs text-slate-400 mt-1">Updated project recommendations</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LandingPage;
