export default function TypingIndicator({ typingUsers = [] }) {
  if (!typingUsers || typingUsers.length === 0) return null;

  let label = "";
  if (typingUsers.length === 1) {
    label = `${typingUsers[0].name || typingUsers[0].email} is typing`;
  } else if (typingUsers.length === 2) {
    label = `${typingUsers[0].name} and ${typingUsers[1].name} are typing`;
  } else {
    label = `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing`;
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-indigo-50/90 px-3.5 py-1.5 text-xs font-medium text-indigo-700 border border-indigo-200/60 shadow-sm backdrop-blur-xs transition-all animate-fadeIn">
      <div className="flex items-center gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" />
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]" />
      </div>
      <span>{label}...</span>
    </div>
  );
}
