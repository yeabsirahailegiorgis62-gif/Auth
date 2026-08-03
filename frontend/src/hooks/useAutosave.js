import { useState, useRef, useCallback, useEffect } from "react";
import { updateDocument } from "../services/documentService";

export function useAutosave(documentId, canEdit = true, debounceMs = 2000) {
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved' | 'saving' | 'failed' | 'retrying'
  const [lastSavedAt, setLastSavedAt] = useState(new Date());
  const [error, setError] = useState(null);

  const debounceTimerRef = useRef(null);
  const pendingDataRef = useRef(null);
  const retryCountRef = useRef(0);

  const executeSave = useCallback(
    async (dataToSave) => {
      if (!documentId || !canEdit || !dataToSave) return;

      try {
        setSaveStatus("saving");
        setError(null);

        const serializedContent =
          typeof dataToSave.content === "object"
            ? JSON.stringify(dataToSave.content)
            : dataToSave.content;

        await updateDocument(documentId, {
          title: dataToSave.title,
          content: serializedContent,
        });

        setSaveStatus("saved");
        setLastSavedAt(new Date());
        retryCountRef.current = 0;
        pendingDataRef.current = null;
      } catch (err) {
        console.error("[Autosave] Save failed:", err);
        setError(err.response?.data?.message || "Failed to save changes");

        if (retryCountRef.current < 3) {
          retryCountRef.current += 1;
          setSaveStatus("retrying");
          setTimeout(() => {
            if (pendingDataRef.current) {
              executeSave(pendingDataRef.current);
            }
          }, 3000 * retryCountRef.current);
        } else {
          setSaveStatus("failed");
        }
      }
    },
    [documentId, canEdit]
  );

  const scheduleSave = useCallback(
    (newContent, newTitle) => {
      if (!canEdit) return;

      pendingDataRef.current = { content: newContent, title: newTitle };
      setSaveStatus("saving");

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (pendingDataRef.current) {
          executeSave(pendingDataRef.current);
        }
      }, debounceMs);
    },
    [canEdit, debounceMs, executeSave]
  );

  const forceSaveNow = useCallback(
    async (currentContent, currentTitle) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      return executeSave({ content: currentContent, title: currentTitle });
    },
    [executeSave]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    saveStatus,
    setSaveStatus,
    lastSavedAt,
    error,
    scheduleSave,
    forceSaveNow,
  };
}
