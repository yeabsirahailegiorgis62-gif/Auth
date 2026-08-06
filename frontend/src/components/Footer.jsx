import { FileText, Heart, BookOpen, ShieldCheck, Mail, Code } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-blue-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                NexusDocs <span className="text-indigo-400 font-medium">Studio</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Enterprise-grade real-time collaborative document platform.
              Empowering teams to write, edit, and innovate together with
              low latency, live presence, and seamless version control.
            </p>
            <div className="pt-2 flex items-center gap-4 text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors"
                title="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a
                href="/docs"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors"
                title="Documentation"
              >
                <BookOpen className="w-4 h-4" />
              </a>
              <a
                href="#contact"
                className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-colors"
                title="Contact Support"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#showcase" className="hover:text-white transition-colors">
                  Real-time Workspace
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors flex items-center gap-2">
                  Pricing
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Soon
                  </span>
                </a>
              </li>
              <li>
                <a href="#security" className="hover:text-white transition-colors">
                  Enterprise Security
                </a>
              </li>
            </ul>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  GitHub Repository
                </a>
              </li>
              <li>
                <a href="/docs" className="hover:text-white transition-colors">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  FAQ & Support
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Developer Credit Column */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Engineering
            </h4>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs">
                <Code className="w-3.5 h-3.5" />
                Lead Architect & Developer
              </div>
              <p className="text-sm font-semibold text-white">
                Developed by Yeabsira Hailegiorgis
              </p>
              <p className="text-xs text-slate-400">
                Built with Node.js, Express, Socket.IO, Prisma PostgreSQL, React 19, and Tailwind CSS.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} NexusDocs Studio. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Designed & Engineered by</span>
            <span className="font-semibold text-slate-200">Yeabsira Hailegiorgis</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
