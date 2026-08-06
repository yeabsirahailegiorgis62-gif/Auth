import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import DemoModal from "../components/DemoModal";
import {
  Users,
  Zap,
  ShieldCheck,
  Sparkles,
  FileText,
  Clock,
  Share2,
  MessageSquare,
  Bell,
  WifiOff,
  Lock,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Layers,
  Activity,
  Award,
  Globe2,
  Play,
  Star,
  Terminal,
  MousePointer,
} from "lucide-react";

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [demoOpen, setDemoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [openFaq, setOpenFaq] = useState(0);

  // Redirect authenticated users visiting "/" to "/dashboard"
  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  // Smooth scroll handler for state navigation
  useEffect(() => {
    if (location.state?.scrollTo) {
      const elem = document.getElementById(location.state.scrollTo);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Loading CollabWrite Studio...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Users,
      title: "Real-Time Collaboration",
      description: "Edits synchronize in under 10ms using optimistic WebSocket event routing.",
      badge: "Core Engine",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: FileText,
      title: "Rich Text Editing",
      description: "Powered by TipTap with full markdown, lists, code blocks, tables, and links.",
      badge: "TipTap Pro",
      color: "from-indigo-500 to-purple-600",
    },
    {
      icon: MousePointer,
      title: "Live Presence & Cursors",
      description: "See exact cursor positions and selection highlights of teammates live.",
      badge: "Interactive",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: Zap,
      title: "Automated Auto-Save",
      description: "Never lose a keystroke with debounced real-time cloud persistence.",
      badge: "Zero-Data Loss",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: Clock,
      title: "Version History & Diff",
      description: "Restore previous document versions and inspect exact visual revision diffs.",
      badge: "Audit Ready",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: ShieldCheck,
      title: "Secure Verified Auth",
      description: "JWT access tokens, HTTP-only refresh cookies, and email verification.",
      badge: "Enterprise Security",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: Share2,
      title: "Sharing & RBAC Permissions",
      description: "Invite teammates with Viewer, Commenter, Editor, or Owner roles.",
      badge: "Granular Access",
      color: "from-indigo-600 to-blue-500",
    },
    {
      icon: MessageSquare,
      title: "Threaded Comments",
      description: "Annotate specific text ranges, reply in threads, and resolve discussions.",
      badge: "Discussion",
      color: "from-violet-500 to-purple-600",
    },
    {
      icon: Bell,
      title: "Real-Time Notifications",
      description: "Stay informed on document invites, comment mentions, and role changes.",
      badge: "Instant Alerts",
      color: "from-pink-500 to-rose-600",
    },
    {
      icon: WifiOff,
      title: "Offline Support",
      description: "Local queue buffering and background synchronization coming soon.",
      badge: "Coming Soon",
      color: "from-slate-600 to-slate-800",
    },
  ];

  const advantages = [
    { title: "Modern Architecture", desc: "Built with Node.js 22, Express, Socket.IO, and Prisma PostgreSQL." },
    { title: "Ultra Fast Latency", desc: "Sub-10ms event broadcasts with optimized PostgreSQL connection pools." },
    { title: "Enterprise Grade", desc: "Strict RBAC security models, password hashing, and token revocation." },
    { title: "Cloud Native & Reliable", desc: "Containerized with Docker and ready for Kubernetes cluster deployment." },
  ];

  const steps = [
    { num: "01", title: "Create Account", desc: "Sign up in seconds with email or Google OAuth integration." },
    { num: "02", title: "Verify Email", desc: "Receive a secure verification link to activate your workspace account." },
    { num: "03", title: "Sign In", desc: "Log in securely to access your private dashboard workstation." },
    { num: "04", title: "Create Document", desc: "Start from scratch or pick a template with full rich-text formatting." },
    { num: "05", title: "Invite Teammates", desc: "Share document links with Viewer, Commenter, or Editor roles." },
    { num: "06", title: "Collaborate Instantly", desc: "Edit simultaneously with live presence cursors and instant sync." },
    { num: "07", title: "Auto Save", desc: "Every keystroke is automatically persisted safely to the cloud." },
    { num: "08", title: "Version History", desc: "Inspect diffs and restore any revision snapshot with one click." },
  ];

  const previews = {
    dashboard: {
      title: "Enterprise Document Dashboard",
      desc: "Search, filter, favorite, organize, and manage permissions across all your team documents in one sleek interface.",
      imageText: "Dashboard Workspace Overview (Search, Filters, Favorites, Recent Activity)",
    },
    editor: {
      title: "TipTap Powered Collaborative Editor",
      desc: "Full rich-text formatting toolbar with live collaborator avatars, real-time typing indicators, and presence.",
      imageText: "Live Editor Workspace (Rich Formatting, Cursors, Formatting Toolbar)",
    },
    sharing: {
      title: "Role-Based Access Control",
      desc: "Manage document visibility, grant specific permissions (Owner, Editor, Commenter, Viewer), and revoke access safely.",
      imageText: "Sharing Modal (Role Dropdowns, Email Invitations, Access Revocation)",
    },
    comments: {
      title: "Inline Discussion Threads",
      desc: "Highlight document text, add comments, reply to teammates, and mark threads as resolved.",
      imageText: "Threaded Comments Sidebar (Text Annotations, Replies, Resolutions)",
    },
    revisions: {
      title: "Version History & Revision Diff",
      desc: "Compare document checkpoints, review author contributions, and restore previous versions seamlessly.",
      imageText: "Version History Timeline (Version Cards, Restore Button, Revision Diffs)",
    },
    darkmode: {
      title: "System-Wide Light & Dark Mode",
      desc: "Full dark mode support crafted with accessible color palettes and crisp glassmorphic elements.",
      imageText: "Dark Mode Theme Preview (Persistent Local Storage Theme)",
    },
  };

  const faqs = [
    {
      q: "How does real-time collaboration work in CollabWrite Studio?",
      a: "CollabWrite Studio uses a high-performance Socket.IO WebSocket server paired with Optimistic UI updates. When you edit a document, your changes are broadcast to all connected room members in under 10ms while automatically syncing to PostgreSQL.",
    },
    {
      q: "Is email verification required for new signups?",
      a: "Yes! To protect enterprise accounts, new password registrations require email verification via a secure, time-expiring token link before granting full login access. Google OAuth users are verified automatically.",
    },
    {
      q: "Can I control who can view or edit my documents?",
      a: "Absolutely. Every document has granular Role-Based Access Control (RBAC). You can assign users as Owner, Editor, Commenter, or Viewer, and revoke access at any time.",
    },
    {
      q: "How does version history work?",
      a: "CollabWrite Studio automatically logs document revision checkpoints whenever significant updates or manual snapshots occur. You can view the complete version history log and restore any prior snapshot with a single click.",
    },
    {
      q: "What technologies power the backend and database?",
      a: "The platform is engineered with Node.js 22, Express, Socket.IO, Prisma ORM, PostgreSQL database, and Tailwind CSS on React 19.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white font-sans antialiased overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/30 via-blue-600/20 to-purple-600/30 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-inner text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            <span>CollabWrite Studio v2.0 Enterprise Release</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            <span className="text-slate-400 font-normal">Real-Time Event Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Where Enterprise Teams{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300">
              Create, Collaborate & Scale
            </span>{" "}
            in Real-Time
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            Experience seamless rich text editing, instant multi-user presence,
            granular role permissions, and automated version history in one
            unified, commercial-grade workstation.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-blue-500 shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Sign In
            </Link>
            <button
              onClick={() => setDemoOpen(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl font-semibold text-base text-indigo-300 hover:text-white bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-800/50 transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-indigo-300" />
              Watch Interactive Demo
            </button>
          </div>

          {/* Floating Workspace Preview Illustration */}
          <div className="pt-12 relative max-w-5xl mx-auto">
            <div className="relative rounded-3xl p-1 bg-gradient-to-b from-indigo-500/30 via-slate-800/40 to-slate-950 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl border border-slate-800">
              <div className="bg-slate-900/90 rounded-[22px] overflow-hidden border border-slate-800/80 p-6 sm:p-8 space-y-6 text-left">
                {/* Editor Header Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                    <span className="text-xs font-mono text-slate-400 ml-2">
                      CollabWrite Workspace / Enterprise Architecture Blueprint.md
                    </span>
                  </div>

                  {/* Active Collaborators Badges */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-500 text-white font-bold text-xs flex items-center justify-center border-2 border-slate-900">
                        YH
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center border-2 border-slate-900">
                        SC
                      </div>
                      <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center border-2 border-slate-900">
                        AR
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      3 Live Collaborators
                    </span>
                  </div>
                </div>

                {/* Editor Content Canvas */}
                <div className="space-y-4 font-mono text-sm leading-relaxed text-slate-300">
                  <h2 className="text-xl font-bold text-white font-sans">
                    1. Low-Latency Real-Time Event Architecture
                  </h2>
                  <p className="text-slate-400">
                    CollabWrite Studio utilizes Socket.IO WebSocket namespaces to establish persistent bidirectional communication channels between client workspaces and backend services.
                  </p>
                  
                  {/* Simulated Live Cursor */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-indigo-900/50 relative overflow-hidden">
                    <div className="absolute top-2 right-4 text-[10px] font-sans font-semibold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                      Cursor: Yeabsira Hailegiorgis (Owner)
                    </div>
                    <p className="text-indigo-200">
                      `socket.emit("edit_document", &#123; documentId, delta, version &#125;)`
                    </p>
                    <div className="inline-block w-0.5 h-5 bg-cyan-400 animate-pulse align-middle ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trusted Ticker */}
          <div className="pt-12 space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Trusted by Engineering Teams & University Researchers Worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-slate-500 font-semibold text-sm">
              <span>STANFORD RESEARCH</span>
              <span>•</span>
              <span>FINTECH LABS</span>
              <span>•</span>
              <span>OPEN SOURCE FELLOWS</span>
              <span>•</span>
              <span>ENTERPRISE SAAS</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider">
              Product Capabilities
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Engineered for Enterprise Product Teams
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Everything you need for real-time document creation, team presence, security, and version management.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="group relative p-8 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-950/40 hover:-translate-y-1 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} p-3 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-full h-full" />
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Why Choose CollabWrite Studio?
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Designed from the ground up to solve latency, collaboration friction, and security risks.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((adv, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                  0{i + 1}
                </div>
                <h4 className="text-lg font-bold text-white">{adv.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{adv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-900/30 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold uppercase tracking-wider">
              Step-By-Step Workflow
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              How CollabWrite Works
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              From account signup to instant multi-user editing in 8 streamlined steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-colors"
              >
                <span className="text-2xl font-extrabold text-indigo-400 font-mono">
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-white">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Showcase Section */}
      <section id="showcase" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Live Team Collaboration Showcase
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Experience how multiple teammates type, comment, and review together simultaneously.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Active Session: Project Roadmap 2026
              </div>
              <span className="text-xs text-indigo-400 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
                Optimistic WebSocket Sync Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-indigo-400">Collaborator 1</div>
                <div className="text-sm font-semibold text-white">Yeabsira Hailegiorgis</div>
                <p className="text-xs text-slate-400">Editing Section: Database Schema & Authentication Controllers</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-emerald-400">Collaborator 2</div>
                <div className="text-sm font-semibold text-white">Sarah Connor</div>
                <p className="text-xs text-slate-400">Reviewing Version History Checkpoint #14</p>
              </div>
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-400">Collaborator 3</div>
                <div className="text-sm font-semibold text-white">Alex Rivera</div>
                <p className="text-xs text-slate-400">Added Inline Comment to Section 2.1</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-b from-indigo-950/40 via-slate-900 to-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono">10K+</div>
              <div className="text-xs sm:text-sm font-medium text-indigo-300 uppercase tracking-wider">
                Documents Created
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono">500+</div>
              <div className="text-xs sm:text-sm font-medium text-indigo-300 uppercase tracking-wider">
                Active Teams
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono">99.9%</div>
              <div className="text-xs sm:text-sm font-medium text-indigo-300 uppercase tracking-wider">
                Uptime Availability
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono">&lt;10ms</div>
              <div className="text-xs sm:text-sm font-medium text-indigo-300 uppercase tracking-wider">
                Real-Time Sync Speed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots & Interactive Gallery Section */}
      <section className="py-24 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Product Interface Previews
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Take a closer look at CollabWrite Studio's clean, modern workspace.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {Object.keys(previews).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  activeTab === key
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {key}
              </button>
            ))}
          </div>

          {/* Active Preview Display */}
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {previews[activeTab].title}
              </h3>
              <p className="text-sm text-slate-400">{previews[activeTab].desc}</p>
            </div>
            <div className="h-64 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-6 text-center text-slate-400 font-mono text-sm">
              <div className="space-y-2">
                <FileText className="w-10 h-10 text-indigo-400 mx-auto" />
                <p className="text-white font-semibold">{previews[activeTab].imageText}</p>
                <p className="text-xs text-slate-500">Interactive live UI component rendered directly in client workstation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Loved by Engineering Leaders
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Here is what developers and product managers say about CollabWrite Studio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "CollabWrite Studio delivers the instant real-time sync performance of Google Docs with the modern aesthetic of Notion. Incredible architecture!",
                author: "Marcus Vance",
                role: "Staff Software Engineer, SaaS Corp",
              },
              {
                quote: "The role-based permissions and version revision diffs gave our team complete confidence when editing enterprise documentation.",
                author: "Elena Rostova",
                role: "Director of Product, Fintech Systems",
              },
              {
                quote: "Sub-10ms event broadcasts with clean email verification and Google Auth makes this a commercial-grade product.",
                author: "David Chen",
                role: "VP of Engineering, Cloud Native Labs",
              },
            ].map((item, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "{item.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-800">
                  <div className="text-sm font-bold text-white">{item.author}</div>
                  <div className="text-xs text-indigo-400">{item.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-base">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full p-6 text-left font-bold text-base text-white flex items-center justify-between gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-indigo-400 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section & Developer Credit */}
      <section id="about" className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
            About CollabWrite Studio
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Built for Modern Enterprise Productivity
          </h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto leading-relaxed">
            CollabWrite Studio is an open-architecture, commercial-grade collaborative text workspace designed and built by <span className="font-semibold text-white">Yeabsira Hailegiorgis</span>.
          </p>
          <div className="pt-4 flex justify-center">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all"
            >
              Start Creating Now
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Get in Touch</h3>
          <p className="text-slate-400 text-sm">
            Have questions about enterprise deployment, custom integrations, or partnerships?
          </p>
          <a
            href="mailto:yeabsira@example.com"
            className="inline-block text-indigo-400 hover:text-indigo-300 font-semibold text-base underline"
          >
            Contact Engineering Team
          </a>
        </div>
      </section>

      <Footer />

      {/* Demo Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
