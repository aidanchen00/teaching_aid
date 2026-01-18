"use client";

import { cn } from "@/lib/utils";
import { Folder, FileCode, FileText, File } from "lucide-react";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
}

interface SoftwareFileExplorerProps {
  files: Record<string, string>;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}

function buildFileTree(files: Record<string, string>): FileNode[] {
  const root: FileNode[] = [];
  const dirs = new Map<string, FileNode>();

  const sortedPaths = Object.keys(files).sort();

  for (const path of sortedPaths) {
    const parts = path.split("/");
    let currentLevel = root;
    let currentPath = "";

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (i === parts.length - 1) {
        currentLevel.push({
          name: part,
          path: path,
          type: "file",
        });
      } else {
        let dir = dirs.get(currentPath);
        if (!dir) {
          dir = {
            name: part,
            path: currentPath,
            type: "directory",
            children: [],
          };
          dirs.set(currentPath, dir);
          currentLevel.push(dir);
        }
        currentLevel = dir.children!;
      }
    }
  }

  return root;
}

function getFileIcon(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
      return <FileCode className="h-4 w-4 text-yellow-500" />;
    case "css":
      return <FileCode className="h-4 w-4 text-blue-500" />;
    case "html":
      return <FileCode className="h-4 w-4 text-orange-500" />;
    case "json":
      return <FileText className="h-4 w-4 text-green-500" />;
    case "md":
      return <FileText className="h-4 w-4 text-gray-500" />;
    default:
      return <File className="h-4 w-4 text-gray-400" />;
  }
}

function FileTreeItem({
  node,
  selectedFile,
  onSelectFile,
  depth = 0,
}: {
  node: FileNode;
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  depth?: number;
}) {
  const isSelected = node.path === selectedFile;
  const paddingLeft = depth * 12 + 8;

  if (node.type === "directory") {
    return (
      <div>
        <div
          className="flex items-center gap-2 py-1 px-2 text-sm text-gray-600"
          style={{ paddingLeft }}
        >
          <Folder className="h-4 w-4 text-purple-400" />
          <span className="font-medium">{node.name}</span>
        </div>
        {node.children?.map((child) => (
          <FileTreeItem
            key={child.path}
            node={child}
            selectedFile={selectedFile}
            onSelectFile={onSelectFile}
            depth={depth + 1}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1 px-2 text-sm cursor-pointer transition-colors",
        isSelected
          ? "bg-purple-100 text-purple-900"
          : "text-gray-700 hover:bg-gray-100"
      )}
      style={{ paddingLeft }}
      onClick={() => onSelectFile(node.path)}
    >
      {getFileIcon(node.name)}
      <span>{node.name}</span>
    </div>
  );
}

export function SoftwareFileExplorer({
  files,
  selectedFile,
  onSelectFile,
}: SoftwareFileExplorerProps) {
  const fileTree = buildFileTree(files);
  const fileCount = Object.keys(files).length;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
        <span className="text-sm font-medium text-gray-700">
          Files ({fileCount})
        </span>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-2">
        {fileCount === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Folder className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No files yet</p>
            </div>
          </div>
        ) : (
          fileTree.map((node) => (
            <FileTreeItem
              key={node.path}
              node={node}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
            />
          ))
        )}
      </div>
    </div>
  );
}
