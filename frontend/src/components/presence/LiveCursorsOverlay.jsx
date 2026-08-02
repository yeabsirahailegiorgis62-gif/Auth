export default function LiveCursorsOverlay({ remoteCursors = [], editorContainerRef }) {
  if (!remoteCursors || remoteCursors.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {remoteCursors.map((remote) => {
        if (!remote.cursor) return null;
        const { x, y } = remote.cursor;
        const color = remote.color || "#4F46E5";
        const name = remote.user?.name || remote.user?.email || "Collaborator";

        return (
          <div
            key={remote.socketId}
            className="absolute transition-all duration-75 ease-out"
            style={{
              transform: `translate(${x}px, ${y}px)`,
            }}
          >
            {/* SVG Cursor Pointer */}
            <svg
              className="h-5 w-5 drop-shadow-md"
              style={{ color }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5.653 3.123A.75.75 0 004.5 3.75v16.5a.75.75 0 001.248.56l4.757-4.228 3.523 7.046a.75.75 0 001.342-.67l-3.523-7.047 6.425.568a.75.75 0 00.415-1.343L5.653 3.123z" />
            </svg>

            {/* User Name Flag */}
            <div
              className="ml-4 -mt-2 rounded-md px-2 py-0.5 text-[10px] font-bold text-white shadow-md whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
