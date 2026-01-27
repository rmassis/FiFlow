import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Trash2 } from "lucide-react";
import ChatMessage from "@/react-app/components/agent/ChatMessage";
import QuickActions from "@/react-app/components/agent/QuickActions";
import { DashboardLayout } from "@/react-app/components/dashboard/DashboardLayout";

interface Message {
  id?: number;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

export default function Agent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadHistory = async () => {
    try {
      const response = await fetch("/api/agent/history?limit=50");
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Error loading history:", error);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.response) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const clearHistory = async () => {
    if (
      !confirm(
        "Tem certeza que deseja limpar todo o histórico de conversas?"
      )
    ) {
      return;
    }

    try {
      await fetch("/api/agent/history", { method: "DELETE" });
      setMessages([]);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Assistente Financeiro AI
              </h1>
              <p className="text-sm text-gray-500">
                Tire dúvidas sobre suas finanças
              </p>
            </div>
          </div>
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Limpar histórico
          </button>
        </div>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-10 h-10 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Como posso ajudar?
              </h2>
              <p className="text-gray-600 mb-8 max-w-md">
                Pergunte sobre seus gastos, crie metas, peça análises ou
                solicite relatórios personalizados.
              </p>
              <QuickActions onAction={handleQuickAction} />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id || index}
                  role={message.role}
                  content={message.content}
                />
              ))}
              {isLoading && (
                <ChatMessage role="assistant" content="" isTyping />
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-4xl mx-auto">
            {messages.length > 0 && (
              <QuickActions onAction={handleQuickAction} className="mb-4" />
            )}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua pergunta..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
              >
                <Send className="w-4 h-4" />
                Enviar
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
