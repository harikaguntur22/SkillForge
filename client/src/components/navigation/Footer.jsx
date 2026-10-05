import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/80 py-8 px-4 text-center">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-500" />
          <span className="font-semibold text-slate-400">SKILLFORGE</span>
          <span>— Learn. Exchange. Build.</span>
        </div>

        <p className="flex items-center gap-1 justify-center">
          Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for ambitious student developers.
        </p>

        <p>© {new Date().getFullYear()} SkillForge. Production MERN Stack Architecture.</p>
      </div>
    </footer>
  );
};

export default Footer;
