import { useState, useRef, useEffect, useCallback } from "react";
import { Settings, Send, Square } from "lucide-react";
import type { Spec } from "@json-render/core";
import { createMixedStreamParser, applySpecPatch } from "@json-render/core";
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

/**
 * Parse Anthropic SSE stream and yield text deltas.
 */
async function* parseAnthropicSSE(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<string> {
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6);
      if (data === "[DONE]") return;

      try {
        const event = JSON.parse(data);
        if (
          event.type === "content_block_delta" &&
          event.delta?.type === "text_delta"
        ) {
          yield event.delta.text;
        }
      } catch {
        // skip malformed lines
      }
    }
  }
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
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      if (apiKey) {
        // Streaming AI API call
        const systemPrompt = buildSystemPrompt(currentSpec);

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

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
            stream: true,
            system: systemPrompt,
            messages: [
              ...messages
                .filter((m) => m.role === "user")
                .map((m) => ({ role: "user" as const, content: m.content })),
              { role: "user", content: trimmed },
            ],
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const err = await response.text();
          throw new Error(`API error: ${response.status} - ${err}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        // Add placeholder assistant message
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        let accumulatedText = "";
        const streamSpec: Spec = { root: "", elements: {} };
        let hasSpec = false;
        const prevSpec = currentSpec;

        const parser = createMixedStreamParser({
          onPatch(patch) {
            hasSpec = true;
            applySpecPatch(streamSpec, patch);
            // Only update rendered spec once root is set
            if (streamSpec.root) {
              onSpecGenerated({
                root: streamSpec.root,
                elements: { ...streamSpec.elements },
              });
            }
          },
          onText(line) {
            accumulatedText += (accumulatedText ? "\n" : "") + line;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: accumulatedText,
              };
              return updated;
            });
          },
        });

        // Process SSE stream and feed text deltas to the mixed parser
        for await (const textDelta of parseAnthropicSSE(reader)) {
          parser.push(textDelta);
        }
        parser.flush();

        // If spec patches were received but root is still empty, rollback
        if (hasSpec && !streamSpec.root) {
          onSpecGenerated(prevSpec);
          hasSpec = false;
        }

        // Final message update
        const finalContent = hasSpec
          ? accumulatedText
            ? accumulatedText + "\n\nUIを更新しました！"
            : "UIを更新しました！"
          : accumulatedText || "スペックの生成に失敗しました。";

        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: finalContent,
          };
          return updated;
        });
      } else {
        // Mock AI (non-streaming)
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
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled - keep accumulated text, rollback incomplete spec
        onSpecGenerated(currentSpec);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      } else {
        // Rollback spec on error
        onSpecGenerated(currentSpec);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `エラーが発生しました: ${err instanceof Error ? err.message : "不明なエラー"}`,
          },
        ]);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
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
            {apiKey ? "✓ APIキー設定済み（ストリーミングAI生成モード）" : "未設定（プリセットモード）"}
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
            <div className="message-bubble loading">
              ストリーミング中...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-row">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && handleSend()}
          placeholder="UIの変更を指示..."
          disabled={loading}
        />
        {loading ? (
          <button onClick={handleStop} title="停止">
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSend} disabled={!input.trim()}>
            <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
