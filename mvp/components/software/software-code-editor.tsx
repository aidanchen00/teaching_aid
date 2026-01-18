"use client";

import Editor, { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { useRef } from "react";
import { FileCode } from "lucide-react";

interface SoftwareCodeEditorProps {
  content: string;
  fileName: string | null;
  onChange: (content: string) => void;
}

function getLanguage(fileName: string | null): string {
  if (!fileName) return "plaintext";

  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
      return "javascript";
    case "ts":
    case "tsx":
      return "typescript";
    case "css":
      return "css";
    case "html":
      return "html";
    case "json":
      return "json";
    case "md":
      return "markdown";
    default:
      return "plaintext";
  }
}

export function SoftwareCodeEditor({
  content,
  fileName,
  onChange,
}: SoftwareCodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-[#252526]">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">
            {fileName || "No file selected"}
          </span>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 min-h-0">
        {fileName ? (
          <Editor
            height="100%"
            language={getLanguage(fileName)}
            value={content}
            onChange={(value) => onChange(value || "")}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              padding: { top: 8 },
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              renderLineHighlight: "line",
              cursorBlinking: "smooth",
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <FileCode className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Select a file to edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
