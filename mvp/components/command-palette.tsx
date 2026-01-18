"use client";

import { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "cmdk";
import {
  Search,
  Play,
  Pause,
  Square,
  Settings,
  Download,
  RefreshCw,
  Home,
  FileText
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commands: Array<{
    id: string;
    label: string;
    icon: any;
    shortcut?: string;
    onSelect: () => void;
  }>;
}

export function CommandPalette({ open, onOpenChange, commands }: CommandPaletteProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            {commands.map((command) => {
              const Icon = command.icon;
              return (
                <CommandItem
                  key={command.id}
                  onSelect={() => {
                    command.onSelect();
                    onOpenChange(false);
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{command.label}</span>
                  {command.shortcut && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {command.shortcut}
                    </span>
                  )}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return { open, setOpen };
}
