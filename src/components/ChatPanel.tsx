import { useState, useRef, useEffect } from "react";
import { Settings, Send } from "lucide-react";
import type { Spec } from "@json-render/core";
import { generateMockResponse } from "../lib/mockAi";
import { buildSystemPrompt } from "../lib/promptBuilder";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  currentSpec: Spec;
  onSpecGenerated: (spec: Spec) => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export function ChatPanel({
  currentSpec,
  onSpecGenerated,
  apiKey,
  onApiKeyChange,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "こんにちは！UIの見た目を変えたい場合は、どんなデザインにしたいか教えてください。\n\n例：「カードレイアウトにして」「コンパクトにして」「ダッシュボード風にして」\n\nAPIキーを設定すると、より自由なUI生成が可能です。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      if (apiKey) {
        // Real AI API call
        const systemPrompt = buildSystemPrompt(currentSpec);
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "anthropic-dangerous-direct-browser-access": "true",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: systemPrompt,
            messages: [
              ...messages
                .filter((m) => m.role === "user")
                .map((m) => ({ role: "user" as const, content: m.content })),
              { role: "user", content: trimmed },
            ],
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`API error: ${response.status} - ${err}`);
        }

        const data = await response.json();
        const text =
          data.content?.[0]?.text || "スペックの生成に失敗しました。";

        // Try to parse as JSON spec - strip markdown code fences if present
        try {
          let jsonText = text.trim();
          const fenceMatch = jsonText.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
          if (fenceMatch) {
            jsonText = fenceMatch[1].trim();
          }
          const spec = JSON.parse(jsonText) as Spec;
          if (spec.root && spec.elements) {
            onSpecGenerated(spec);
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: "UIを更新しました！新しいレイアウトが反映されています。",
              },
            ]);
          } else {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: text },
            ]);
          }
        } catch {
          // Not JSON, show as message
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: text },
          ]);
        }
      } else {
        // Mock AI
        const result = generateMockResponse(trimmed);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: result.message },
        ]);
        if (result.spec) {
          onSpecGenerated(result.spec);
        }
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `エラーが発生しました: ${err instanceof Error ? err.message : "不明なエラー"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h3>AI UIデザイナー</h3>
        <button
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          title="API設定"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {showSettings && (
        <div className="chat-settings">
          <label>
            <span>Anthropic API Key</span>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="sk-ant-..."
            />
          </label>
          <p className="settings-hint">
            {apiKey ? "✓ APIキー設定済み（AI生成モード）" : "未設定（プリセットモード）"}
          </p>
        </div>
      )}

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <div className="message-bubble">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-message assistant">
            <div className="message-bubble loading">考え中...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="UIの変更を指示..."
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
