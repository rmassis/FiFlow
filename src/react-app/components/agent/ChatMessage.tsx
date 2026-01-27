import { User, Sparkles } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

export default function ChatMessage({
  role,
  content,
  isTyping,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={`max-w-2xl rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
            : "bg-white border border-gray-200 text-gray-900"
        }`}
      >
        {isTyping ? (
          <div className="flex gap-1 py-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{content}</div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  );
}
