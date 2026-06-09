"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Bot, User } from "lucide-react";
import { AppNav } from "@/components/layout/app-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatMessage } from "@/types";
import { isDemoEnabled } from "@/lib/env";

const IS_DEMO = isDemoEnabled();

const SUGGESTIONS = [
  "Troque meu almoço",
  "Não gosto dessa receita",
  "Tenho apenas ovos em casa",
  "Quero uma receita rápida",
  "Posso comer pizza hoje?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (IS_DEMO) {
      setMessages([
        {
          id: "welcome",
          user_id: "demo",
          role: "assistant",
          content: "Olá Maria! Sou sua Nutricionista IA. Como posso ajudar hoje?",
          created_at: new Date().toISOString(),
        },
      ]);
      return;
    }

    async function loadMessages() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      setMessages(data ?? []);
    }
    loadMessages();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      user_id: "",
      role: "user",
      content: text.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text.trim() }),
    });

    const data = await res.json();

    if (data.reply) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          user_id: "",
          role: "assistant",
          content: data.reply,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <>
      <AppNav />
      <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-2xl flex-col px-4 py-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Nutricionista IA</h1>
          <p className="text-sm text-muted-foreground">Tire dúvidas sobre sua dieta</p>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto pb-4">
          {messages.length <= 1 && (
            <div className="space-y-3 py-8">
              <p className="text-center text-muted-foreground">Como posso ajudar?</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-full border border-border bg-white px-4 py-2 text-sm shadow-sm hover:bg-secondary transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white border border-border shadow-sm"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="rounded-2xl border border-border bg-white px-4 py-3 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex gap-2 border-t border-border pt-4"
        >
          <Input
            placeholder="Digite sua pergunta..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="bg-white"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </>
  );
}
