import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';
import { 
  Sparkles, 
  Menu, 
  X, 
  LayoutDashboard, 
  FolderGit2, 
  Repeat, 
  User as UserIcon, 
  LogOut,
  Layers,
  GraduationCap
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer whenever location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle ESC key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    if (path === '/projects') return location.pathname.startsWith('/projects');
    return location.pathname === path;
  };

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Skills', path: '/skills', icon: Layers },
    { label: 'Skill Exchange', path: '/skill-exchange', icon: Repeat },
    { label: 'Projects', path: '/projects', icon: FolderGit2 },
    { label: 'Recommendations', path: '/recommendations', icon: Sparkles },
  ];

  return (
    <header className="glass-nav sticky top-0 z-40 transition-colors">
      <nav aria-label="Main Navigation" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-brand-500 rounded-xl p-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">SKILLFORGE</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-1.5 py-0.2 rounded border border-brand-500/20">
                  Campus
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 tracking-tight font-medium hidden sm:block">
                Learn • Exchange • Build
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{link.label}</span>
                  </Link>
                );
              })
            ) : (
              <Link
                to="/"
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white"
              >
                Platform Overview
              </Link>
            )}
          </div>

          {/* Right Action Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                {/* Profile Link */}
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 p-1.5 pr-2.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                    isActive('/profile')
                      ? 'bg-slate-800 border border-slate-700'
                      : 'hover:bg-slate-800/60 border border-transparent'
                  }`}
                  title="View and Edit Profile"
                >
                  <Avatar name={user?.name || 'User'} src={user?.profileImage} size="sm" />
                  <div className="text-left hidden lg:block max-w-[120px]">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {user?.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {user?.college || 'Student'}
                    </div>
                  </div>
                </Link>

                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                  icon={LogOut}
                  title="Sign out"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/register')}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay and Content */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 top-16 z-50 md:hidden bg-slate-950/80 backdrop-blur-md overflow-y-auto"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="bg-slate-900 border-b border-slate-800 p-4 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {isAuthenticated ? (
              <>
                {/* Student Info Card */}
                <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <Avatar name={user?.name || 'User'} src={user?.profileImage} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    <p className="text-[11px] text-brand-400 truncate font-medium mt-0.5">
                      {user?.college || 'Student'}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Profile"
                  >
                    <UserIcon className="w-4 h-4" />
                  </Link>
                </div>

                {/* Nav Links List */}
                <div className="space-y-1 pt-1">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    const active = isActive(link.path);
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          active
                            ? 'bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/25'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-brand-400 shrink-0" aria-hidden="true" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive('/profile')
                        ? 'bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/25'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <UserIcon className="w-4 h-4 text-brand-400 shrink-0" aria-hidden="true" />
                    <span>My Profile</span>
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/register');
                  }}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
