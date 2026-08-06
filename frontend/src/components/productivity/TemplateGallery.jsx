import { useState } from "react";
import { FileText, Briefcase, Users, BookOpen, GraduationCap, Building, ClipboardList, X } from "lucide-react";

const TEMPLATES = [
  {
    id: "t_resume",
    title: "Resume",
    icon: Briefcase,
    color: "bg-blue-50 text-blue-600 border-blue-200",
    content: "# Resume\n\n## Contact Information\n\n## Summary\n\n## Experience\n\n## Education"
  },
  {
    id: "t_meeting",
    title: "Meeting Notes",
    icon: Users,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    content: "# Meeting Notes\n\n**Date:**\n**Attendees:**\n\n## Agenda\n- \n\n## Action Items\n- [ ] "
  },
  {
    id: "t_research",
    title: "Research Paper",
    icon: BookOpen,
    color: "bg-purple-50 text-purple-600 border-purple-200",
    content: "# Title\n\n## Abstract\n\n## Introduction\n\n## Methodology\n\n## Results\n\n## Conclusion"
  },
  {
    id: "t_assignment",
    title: "Assignment",
    icon: GraduationCap,
    color: "bg-rose-50 text-rose-600 border-rose-200",
    content: "# Assignment Title\n\n**Course:**\n**Due Date:**\n\n## Requirements\n\n## Solution"
  },
  {
    id: "t_business",
    title: "Business Proposal",
    icon: Building,
    color: "bg-amber-50 text-amber-600 border-amber-200",
    content: "# Business Proposal\n\n## Executive Summary\n\n## Problem Statement\n\n## Proposed Solution\n\n## Pricing"
  },
  {
    id: "t_project",
    title: "Project Report",
    icon: ClipboardList,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    content: "# Project Report\n\n## Overview\n\n## Progress\n\n## Blockers\n\n## Next Steps"
  },
  {
    id: "t_lecture",
    title: "Lecture Notes",
    icon: FileText,
    color: "bg-slate-50 text-slate-600 border-slate-200",
    content: "# Lecture Notes\n\n**Topic:**\n**Date:**\n\n## Key Concepts\n- \n\n## Summary\n"
  }
];

export default function TemplateGallery({ isOpen, onClose, onSelectTemplate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Template Gallery</h2>
            <p className="text-sm text-slate-500">Choose a template to get started quickly</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="p-6 overflow-y-auto bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            
            {/* Blank Document Option */}
            <div 
              onClick={() => onSelectTemplate({ title: "Untitled Document", content: "" })}
              className="group cursor-pointer flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-white hover:border-indigo-400 hover:bg-indigo-50 transition-all text-center h-48"
            >
              <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">Blank Document</h3>
                <p className="text-xs text-slate-400 mt-1">Start from scratch</p>
              </div>
            </div>

            {/* Render Templates */}
            {TEMPLATES.map(template => {
              const Icon = template.icon;
              return (
                <div 
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className="group cursor-pointer flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:-translate-y-1 transition-all text-center h-48"
                >
                  <div className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${template.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">{template.title}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
