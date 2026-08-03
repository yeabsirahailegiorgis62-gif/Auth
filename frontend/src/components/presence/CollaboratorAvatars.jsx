import { useState } from "react";
import { User, Crown, Shield } from "lucide-react";

export default function CollaboratorAvatars({ collaborators = [], onOpenPanel }) {
  const [hoveredUser, setHoveredUser] = useState(null);

  if (!collaborators || collaborators.length === 0) return null;

  const maxDisplay = 4;
  const visible = collaborators.slice(0, maxDisplay);
  const overflowCount = Math.max(0, collaborators.length - maxDisplay);

  return (
    <div className="relative flex items-center">
      <div
        className="flex -space-x-2 overflow-hidden cursor-pointer"
        onClick={onOpenPanel}
        title="View active collaborators"
      >
        {visible.map((collab) => {
          const initials = (collab.user.name || collab.user.email || "U")
            .charAt(0)
            .toUpperCase();
          const color = collab.color || "#4F46E5";

          return (
            <div
              key={collab.socketId}
              onMouseEnter={() => setHoveredUser(collab)}
              onMouseLeave={() => setHoveredUser(null)}
              className="relative inline-block transition-transform hover:z-20 hover:scale-110"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white shadow-md border-2 border-white"
                style={{ backgroundColor: color }}
              >
                {initials}
              </div>
              {/* Online Dot */}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
          );
        })}

        {overflowCount > 0 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600 border-2 border-white shadow-sm">
            +{overflowCount}
          </div>
        )}
      </div>

      {/* Tooltip Card on Hover */}
      {hoveredUser && (
        <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl bg-slate-900 p-3 text-white shadow-2xl backdrop-blur-md animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: hoveredUser.color }}
            >
              {(hoveredUser.user.name || "U").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{hoveredUser.user.name}</p>
              <p className="truncate text-[10px] text-slate-400">{hoveredUser.user.email}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-800 pt-2 text-[10px] text-slate-300">
            <span className="flex items-center gap-1">
              {hoveredUser.role === "Owner" ? (
                <>
                  <Crown className="h-3 w-3 text-amber-400" />
                  <span className="font-medium text-amber-300">Owner</span>
                </>
              ) : (
                <>
                  <Shield className="h-3 w-3 text-indigo-400" />
                  <span>Collaborator</span>
                </>
              )}
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active now
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
