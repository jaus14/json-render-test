import { useState, useCallback, useMemo, useRef } from "react";
import { Renderer, JSONUIProvider, createStateStore } from "@json-render/react";
import type { Spec } from "@json-render/core";
import { registry, handlers, usersToRows, usersToRowIds } from "../lib/registry";
import { sampleUsers } from "../lib/sampleUsers";
import { defaultSpec } from "../lib/defaultSpec";
import { saveSpec, loadSpec, clearSpec } from "../lib/specStorage";
import { ChatPanel } from "./ChatPanel";

export function UserManager() {
  const [currentSpec, setCurrentSpec] = useState<Spec>(
    () => loadSpec() || defaultSpec
  );
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("jr-api-key") || "");

  const specRevision = useRef(0);
  const handleSpecGenerated = useCallback((spec: Spec) => {
    specRevision.current += 1;
    setCurrentSpec(spec);
  }, []);

  const handleSaveSpec = useCallback(() => {
    saveSpec(currentSpec);
    alert("レイアウトを保存しました！");
  }, [currentSpec]);

  const handleResetSpec = useCallback(() => {
    clearSpec();
    setCurrentSpec(defaultSpec);
  }, []);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem("jr-api-key", key);
  }, []);

  // External store so we can resolve defineRegistry's handler getters
  const store = useMemo(
    () =>
      createStateStore({
        users: sampleUsers,
        filteredUsers: sampleUsers,
        userRows: usersToRows(sampleUsers as unknown as Record<string, unknown>[]),
        userRowIds: usersToRowIds(sampleUsers as unknown as Record<string, unknown>[]),
        selectedIds: [] as string[],
        selectedCount: 0,
        searchQuery: "",
        newUserName: "",
        newUserEmail: "",
        newUserRole: "viewer",
        editingUser: null as unknown,
        showEditDialog: false,
      }),
    []
  );

  const resolvedHandlers = useMemo(() => {
    const getSetState = () => (updater: (prev: Record<string, unknown>) => Record<string, unknown>) => {
      const prev = store.getSnapshot();
      const next = updater(prev);
      for (const [key, value] of Object.entries(next)) {
        store.set("/" + key, value);
      }
    };
    const getState = () => store.getSnapshot();
    return handlers(getSetState, getState);
  }, [store]);

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="spec-toolbar">
          <div className="spec-toolbar-left">
            <span className="spec-label">
              現在のレイアウト: <strong>{currentSpec === defaultSpec ? "デフォルト" : "カスタム"}</strong>
            </span>
          </div>
          <div className="spec-toolbar-right">
            <button className="btn btn-outline" onClick={handleResetSpec}>
              デフォルトに戻す
            </button>
            <button className="btn btn-primary" onClick={handleSaveSpec}>
              レイアウトを保存
            </button>
          </div>
        </div>

        {/* json-render rendered area */}
        <div className="rendered-ui">
          <JSONUIProvider
            key={specRevision.current}
            registry={registry}
            store={store}
            handlers={resolvedHandlers}
          >
            <Renderer spec={currentSpec} registry={registry} />
          </JSONUIProvider>
        </div>
      </div>

      {/* Chat sidebar */}
      <ChatPanel
        currentSpec={currentSpec}
        onSpecGenerated={handleSpecGenerated}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />
    </div>
  );
}
