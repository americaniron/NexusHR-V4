interface QuickReplyProps {
  replies: string[];
  onSelect: (reply: string) => void;
}

export function QuickReply({ replies, onSelect }: QuickReplyProps) {
  if (!replies.length) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-2 max-w-[85%]">
      {replies.map((reply) => (
        <button
          key={reply}
          onClick={() => onSelect(reply)}
          className="px-3 py-1.5 text-xs font-medium rounded-full border border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 active:scale-95"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
