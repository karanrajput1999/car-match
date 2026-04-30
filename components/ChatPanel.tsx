"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage, Car } from "@/lib/types";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cars: Car[];
  onHighlightCar: (carId: string) => void;
}

const STARTER_QUESTIONS = [
  "Best car under 10 lakhs for city driving?",
  "Safest SUV for a family of 5?",
  "Which electric car has the best range?",
  "I need an automatic car with good mileage",
];

export default function ChatPanel({ isOpen, onClose, cars, onHighlightCar }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };

    setMessages([...updatedMessages, assistantMessage]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) throw new Error("Chat request failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter((line) => line.startsWith("data: "));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            fullContent += parsed.content;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id ? { ...m, content: fullContent } : m
              )
            );
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessage.id
            ? { ...m, content: "Sorry, I couldn't process that. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderInline = (text: string, keyPrefix: string) => {
    // Split by bold and car cards
    const parts = text.split(/(\*\*[^*]+\*\*|\[CAR_CARD:\s*[^\]]+?\s*\])/g);
    return parts.map((part, i) => {
      // Car card
      const carMatch = part.match(/^\[CAR_CARD:\s*([^\]]+?)\s*\]$/);
      if (carMatch) {
        const car = cars.find((c) => c.id === carMatch[1].trim());
        if (car) {
          return (
            <button
              key={`${keyPrefix}-${i}`}
              onClick={() => onHighlightCar(car.id)}
              className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              {car.name}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          );
        }
        return <span key={`${keyPrefix}-${i}`} className="text-blue-600 font-medium">{carMatch[1]}</span>;
      }
      // Bold
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        return <strong key={`${keyPrefix}-${i}`} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (!part) return null;
      return <span key={`${keyPrefix}-${i}`}>{part}</span>;
    });
  };

  const renderMessage = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: { text: string; indent: number }[] = [];
    let listType: "ul" | "ol" | null = null;

    const flushList = () => {
      if (listItems.length === 0) return;
      const Tag = listType === "ol" ? "ol" : "ul";
      const listClass = listType === "ol" ? "list-decimal" : "list-disc";
      elements.push(
        <Tag key={`list-${elements.length}`} className={`${listClass} pl-4 my-1 space-y-0.5`}>
          {listItems.map((item, j) => (
            <li key={j} className={item.indent > 0 ? "ml-4" : ""}>
              {renderInline(item.text, `li-${elements.length}-${j}`)}
            </li>
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trimStart();

      // Bullet points: *, -, +
      const bulletMatch = trimmed.match(/^[*\-+]\s+(.*)/);
      if (bulletMatch) {
        if (listType === "ol") flushList();
        listType = "ul";
        const indent = line.length - trimmed.length;
        listItems.push({ text: bulletMatch[1], indent: indent > 2 ? 1 : 0 });
        continue;
      }

      // Numbered lists: 1. 2. etc
      const numMatch = trimmed.match(/^\d+\.\s+(.*)/);
      if (numMatch) {
        if (listType === "ul") flushList();
        listType = "ol";
        listItems.push({ text: numMatch[1], indent: 0 });
        continue;
      }

      flushList();

      // Empty line
      if (!trimmed) {
        elements.push(<div key={`br-${i}`} className="h-2" />);
        continue;
      }

      // Headings: ## text
      const headingMatch = trimmed.match(/^#{1,3}\s+(.*)/);
      if (headingMatch) {
        elements.push(
          <p key={`h-${i}`} className="font-semibold mt-1">
            {renderInline(headingMatch[1], `h-${i}`)}
          </p>
        );
        continue;
      }

      // Regular line
      elements.push(
        <p key={`p-${i}`}>
          {renderInline(trimmed, `p-${i}`)}
        </p>
      );
    }
    flushList();

    return elements;
  };

  return (
    <div
      className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col transition-transform duration-300 ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">CarMatch AI</h3>
            <p className="text-blue-200 text-xs">Your car buying advisor</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-1 cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-1">Hi! I'm CarMatch AI</h4>
            <p className="text-sm text-gray-500 mb-6">
              Tell me what you're looking for and I'll help you find the perfect car.
            </p>
            <div className="space-y-2">
              {STARTER_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-gray-200 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="space-y-1">{renderMessage(msg.content)}</div>
              ) : (
                msg.content
              )}
              {msg.role === "assistant" && !msg.content && isLoading && (
                <div className="flex gap-1 py-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-end gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask about cars..."
            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-2xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none overflow-y-auto"
            rows={1}
            style={{ maxHeight: "120px" }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
