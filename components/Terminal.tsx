"use client";

import { useState, useRef, useEffect, FormEvent, KeyboardEvent } from "react";

interface ContentItem {
  slug: string;
  dir: string;
  extension: string;
  title?: string;
  description?: string;
  body: string;
}

const ASCII_BANNER = ` ________  ________   ________  _____ ______   _______   ________  ________  ________  ___  __       
|\\   ____\\|\\   ___  \\|\\   __  \\|\\   _ \\  _   \\|\\  ___ \\ |\\   __  \\|\\   __  \\|\\   ____\\|\\  \\|\\  \\     
\\ \\  \\___|\\ \\  \\\\ \\  \\ \\  \\|\\  \\ \\  \\\\\\__\\ \\  \\ \\   __/|\\ \\  \\|\\  \\ \\  \\|\\  \\ \\  \\___|\\ \\  \\/  /|_   
 \\ \\  \\  __\\ \\  \\\\ \\  \\ \\  \\\\\\  \\ \\  \\\\|__| \\  \\ \\  \\_|/_\\ \\   _  _\\ \\  \\\\\\  \\ \\  \\    \\ \\   ___  \\  
  \\ \\  \\|\\  \\ \\  \\\\ \\  \\ \\  \\\\\\  \\ \\  \\    \\ \\  \\ \\  \\_|\\ \\ \\  \\\\  \\\\ \\  \\\\\\  \\ \\  \\____\\ \\  \\\\ \\  \\ 
   \\ \\_______\\ \\__\\\\ \\__\\ \\_______\\ \\__\\    \\ \\__\\ \\_______\\ \\__\\\\ _\\\\ \\_______\\ \\_______\\ \\__\\\\ \\__\\
    \\|_______|\\|__| \\|__|\\|_______|\\|__|     \\|__|\\|_______|\\|__|\\|__|\\|_______|\\|_______|\\|__| \\|__|`;

export default function Terminal() {
  const prompt = "nuttakorn@gnomestudio ➜  ~ ";
  const helpText = "type help to list all available commands...";

  const [histories, setHistories] = useState<string[]>([]);
  const [command, setCommand] = useState("");
  const [workDirectory, setWorkDirectory] = useState("/");
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const intro = `Last login: ${new Date().toString()} on ttys001`;

  // Load content on mount
  useEffect(() => {
    fetch("/content.json")
      .then((res) => res.json())
      .then((data) => {
        setAllContent(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load content:", err);
        setIsLoading(false);
      });
  }, []);

  const getEntriesAtPath = (path: string) => {
    const normalizedPath = path === "/" ? "/" : path;
    const entries = new Set<string>();
    const items: Array<{ name: string; type: "file" | "directory" }> = [];

    allContent.forEach((item) => {
      if (item.dir === normalizedPath) {
        const name = item.slug + item.extension;
        if (!entries.has(name)) {
          entries.add(name);
          items.push({ name, type: "file" });
        }
      } else if (
        item.dir.startsWith(normalizedPath === "/" ? "/" : `${normalizedPath}/`)
      ) {
        const dirPrefix = normalizedPath === "/" ? "/" : `${normalizedPath}/`;
        let relativeDir = item.dir.substring(dirPrefix.length);
        if (normalizedPath === "/") {
          relativeDir = item.dir.substring(1);
        }

        if (relativeDir) {
          const subdirectory = relativeDir.split("/")[0];
          if (subdirectory && !entries.has(subdirectory + "/")) {
            entries.add(subdirectory + "/");
            items.push({ name: subdirectory + "/", type: "directory" });
          }
        }
      }
    });

    return items.sort((a, b) => a.name.localeCompare(b.name));
  };

  const getFileContent = (filePath: string): ContentItem | null => {
    const normalizedPath = filePath.replace(/\.md$/, "");
    const parts = normalizedPath.split("/").filter(Boolean);
    const slug = parts.pop() || "";
    const dir = parts.length > 0 ? `/${parts.join("/")}` : "/";

    return (
      allContent.find((item) => item.slug === slug && item.dir === dir) || null
    );
  };

  const commands: Record<
    string,
    {
      name: string;
      description: string;
      execute: (arg?: string) => void;
    }
  > = {
    help: {
      name: "help",
      description: "list all available commands",
      execute: () => {
        const newHistories = ["This is all available commands."];
        for (const cmd in commands) {
          newHistories.push(
            `${commands[cmd].name} \t\t => ${commands[cmd].description}`
          );
        }
        setHistories((prev) => [...prev, ...newHistories]);
      },
    },
    clear: {
      name: "clear",
      description: "clear the terminal screen",
      execute: () => {
        setHistories([]);
      },
    },
    ls: {
      name: "ls   ",
      description: "list directory contents",
      execute: () => {
        if (isLoading) {
          setHistories((prev) => [...prev, "Loading content..."]);
          return;
        }

        const items = getEntriesAtPath(workDirectory);

        if (items.length === 0) {
          setHistories((prev) => [
            ...prev,
            `ls: cannot access '${workDirectory}': No such file or directory`,
          ]);
          return;
        }

        items.forEach((item) => {
          setHistories((prev) => [...prev, item.name]);
        });
      },
    },
    cd: {
      name: "cd   ",
      description: "change directory",
      execute: (arg?: string) => {
        if (!arg || arg === "~") {
          setWorkDirectory("/");
          return;
        }

        if (arg === "..") {
          if (workDirectory === "/") return;
          const parts = workDirectory.split("/").filter((p) => p);
          parts.pop();
          const newPath = "/" + parts.join("/");
          setWorkDirectory(newPath || "/");
          return;
        }

        // Path building
        let newPath: string;
        if (arg.startsWith("/")) {
          newPath = arg;
        } else {
          newPath =
            workDirectory === "/" ? `/${arg}` : `${workDirectory}/${arg}`;
        }

        const items = getEntriesAtPath(newPath);

        if (items.length === 0) {
          setHistories((prev) => [
            ...prev,
            `cd: no such file or directory: ${arg}`,
          ]);
          return;
        }

        setWorkDirectory(newPath.replace(/\/$/, "") || "/");
      },
    },
    pwd: {
      name: "pwd  ",
      description: "print working directory",
      execute: () => {
        setHistories((prev) => [...prev, workDirectory]);
      },
    },
    cat: {
      name: "cat  ",
      description: "concatenate and print files",
      execute: (arg?: string) => {
        if (!arg) {
          setHistories((prev) => [...prev, "usage: cat [file]"]);
          return;
        }

        if (!arg.endsWith(".md")) {
          setHistories((prev) => [
            ...prev,
            `cat: ${arg}: is a directory or not a text file`,
          ]);
          return;
        }

        let filePath: string;
        if (arg.startsWith("/")) {
          filePath = arg;
        } else {
          filePath =
            workDirectory === "/" ? `/${arg}` : `${workDirectory}/${arg}`;
        }

        const content = getFileContent(filePath);

        if (!content) {
          setHistories((prev) => [
            ...prev,
            `cat: ${arg}: No such file or directory`,
          ]);
          return;
        }

        setHistories((prev) => [...prev, content.body]);
      },
    },
    open: {
      name: "open ",
      description: "open link",
      execute: (arg?: string) => {
        if (!arg) {
          setHistories((prev) => [...prev, "usage: open [url]"]);
          return;
        }
        window.open(arg, "_blank");
      },
    },
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setHistories((prev) => [...prev, `${prompt} ${command}`]);

    const [cmd, ...args] = command.split(" ");
    const arg = args.join(" ");

    if (cmd && commands[cmd]) {
      commands[cmd].execute(arg);
    } else if (cmd) {
      setHistories((prev) => [...prev, `command not found: ${cmd}`]);
    }

    setCommand("");
    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setHistories([]);
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  useEffect(() => {
    focusInput();
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "l" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setHistories([]);
      }
    };
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <div
      className="bg-gray-900 min-h-screen text-white overflow-x-auto p-2 pb-10 font-mono"
      onClick={focusInput}
    >
      <pre className="text-green-400">{ASCII_BANNER}</pre>
      <pre>{intro}</pre>
      {histories.map((stdout, index) => (
        <pre key={index} className="whitespace-pre-wrap break-words">
          {stdout}
        </pre>
      ))}
      <form onSubmit={handleSubmit}>
        <pre className="flex">
          <span>{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            placeholder={helpText}
            className="flex-1 bg-gray-900 focus:outline-none ml-2 placeholder:text-gray-600"
            autoFocus
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </pre>
      </form>
    </div>
  );
}
