import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Sun, Moon, Menu, X, FileText, ArrowRight, Sparkles, User, LogOut } from "lucide-react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
      return;
    }
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-slate-100 dark:to-slate-300">
                NexusDocs
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider ml-1 px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                Studio
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => scrollToSection("hero")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              How It Works
            </button>
            <div className="relative group">
              <button
                onClick={() => scrollToSection("pricing")}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1.5"
              >
                Pricing
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Soon
                </span>
              </button>
            </div>
            <button
              onClick={() => scrollToSection("about")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Contact
            </button>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors"
              title="Toggle Theme"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                >
                  <User className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Sparkles className="w-4 h-4" />
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3 font-medium text-slate-700 dark:text-slate-200">
            <button
              onClick={() => scrollToSection("hero")}
              className="text-left py-2 hover:text-indigo-600"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-left py-2 hover:text-indigo-600"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-left py-2 hover:text-indigo-600"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-left py-2 flex items-center justify-between"
            >
              <span>Pricing</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                Coming Soon
              </span>
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-left py-2 hover:text-indigo-600"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-left py-2 hover:text-indigo-600"
            >
              Contact
            </button>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-3">
            {user ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
