import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import FileManager from './FileManager';

const CODE_TEMPLATES = {
  javascript: `// JavaScript Environment\nconsole.log("Hello, CollabCode!");\n\nfunction calculate(a, b) {\n  return a + b;\n}\n\nconsole.log("Result:", calculate(10, 20));\n`,
  typescript: `// TypeScript Environment\nconst greeting: string = "Hello, CollabCode!";\nconsole.log(greeting);\n`,
  python: `# Python Environment\nprint("Hello, CollabCode!")\n\ndef calculate(a, b):\n    return a + b\n\nprint("Result:", calculate(10, 20))\n`,
  cpp: `// C++ Environment\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, CollabCode!" << std::endl;\n    return 0;\n}\n`,
  java: `// Java Environment\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CollabCode!");\n    }\n}\n`,
  csharp: `// C# Environment\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, CollabCode!");\n    }\n}\n`,
  go: `// Go Environment\npackage main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, CollabCode!")\n}\n`,
  rust: `// Rust Environment\nfn main() {\n    println!("Hello, CollabCode!");\n}\n`
};

const FILE_EXTENSIONS = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  cpp: 'cpp',
  java: 'java',
  csharp: 'cs',
  go: 'go',
  rust: 'rs'
};

const Editor = ({
  code,
  handleChange,
  onRun,
  language,
  setLanguage,
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onImportFile,
  onExportAll,
  onToggleAi,
  onAskAiToDebug,
}) => {
  const [output, setOutput] = useState('');
  const [stdin, setStdin] = useState('');
  const [activeConsoleTab, setActiveConsoleTab] = useState('stdout');
  const [fontSize, setFontSize] = useState('14px');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);

  const handleRun = async () => {
    if (!code || !code.trim()) {
      setOutput('No code to run.');
      setActiveConsoleTab('stdout');
      return;
    }

    setIsRunning(true);
    setActiveConsoleTab('stdout');
    setOutput('Executing program...');
    const startTime = performance.now();

    try {
      const result = await onRun(code, stdin);
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      setOutput(result || 'Program executed successfully with no output.');
    } catch (err) {
      setOutput(`Execution error: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    if (!code || code.trim() === '' || Object.values(CODE_TEMPLATES).includes(code)) {
      handleChange(CODE_TEMPLATES[newLang] || '');
    }
  };

  const handleFormatCode = () => {
    if (!code) return;
    try {
      if (language === 'javascript' || language === 'json') {
        try {
          const parsed = JSON.parse(code);
          handleChange(JSON.stringify(parsed, null, 2));
          return;
        } catch {
          // fallback to line formatting
        }
      }
      const formatted = code
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n');
      handleChange(formatted);
    } catch {
      // Ignore
    }
  };

  const handleDownloadSingle = () => {
    const ext = FILE_EXTENSIONS[language] || 'txt';
    const activeFileObj = files?.find((f) => f.id === activeFileId);
    const fileName = activeFileObj ? activeFileObj.name : `main.${ext}`;

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getExtensions = () => {
    switch (language) {
      case 'python':
        return [python()];
      case 'javascript':
        return [javascript({ jsx: true })];
      case 'typescript':
        return [javascript({ typescript: true })];
      case 'cpp':
      case 'csharp':
        return [cpp()];
      case 'java':
        return [java()];
      default:
        return [javascript()];
    }
  };

  const lineCount = code ? code.split('\n').length : 1;
  const charCount = code ? code.length : 0;

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* File Explorer Tab Bar */}
      {files && files.length > 0 && (
        <FileManager
          files={files}
          activeFileId={activeFileId}
          onSelectFile={onSelectFile}
          onCreateFile={onCreateFile}
          onDeleteFile={onDeleteFile}
          onImportFile={onImportFile}
          onExportAll={onExportAll}
        />
      )}

      {/* Editor Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <label htmlFor="languageSelect" className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Language:
          </label>
          <select
            id="languageSelect"
            className="bg-white border border-slate-300 text-slate-800 text-xs font-medium rounded-md px-3 py-1.5 focus:border-slate-500 focus:outline-hidden cursor-pointer"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC)</option>
            <option value="java">Java 15</option>
            <option value="csharp">C# (.NET)</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
          </select>

          <div className="h-4 w-px bg-slate-200" />

          <label htmlFor="fontSelect" className="text-xs font-semibold text-slate-600 uppercase tracking-wider hidden sm:inline">
            Size:
          </label>
          <select
            id="fontSelect"
            className="bg-white border border-slate-300 text-slate-800 text-xs font-medium rounded-md px-2 py-1.5 focus:border-slate-500 focus:outline-hidden cursor-pointer hidden sm:inline"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
          >
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAi}
            className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded border border-slate-300 transition-colors cursor-pointer"
          >
            AI Support
          </button>
          <button
            onClick={handleFormatCode}
            className="text-xs px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded border border-slate-300 transition-colors cursor-pointer"
          >
            Format
          </button>
          <button
            onClick={handleDownloadSingle}
            className="text-xs px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-medium rounded border border-slate-300 transition-colors cursor-pointer"
          >
            Download
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`text-xs px-4 py-1.5 font-medium rounded text-white shadow-xs transition-colors cursor-pointer ${
              isRunning
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-slate-900 hover:bg-slate-800'
            }`}
          >
            {isRunning ? 'Executing...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* CodeMirror Light Workspace */}
      <div className="relative flex-1 min-h-[350px] border-b border-slate-200 cm-theme-light" style={{ fontSize }}>
        <CodeMirror
          value={code}
          height="100%"
          minHeight="350px"
          extensions={getExtensions()}
          theme="light"
          onChange={handleChange}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            history: true,
            foldGutter: true,
            drawSelection: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: true,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
        />
      </div>

      {/* Editor Status Bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50 text-[11px] text-slate-500 font-mono border-b border-slate-200">
        <div>
          Lines: <span className="text-slate-700 font-semibold">{lineCount}</span> | Characters: <span className="text-slate-700 font-semibold">{charCount}</span>
        </div>
        <div className="uppercase tracking-wider">
          UTF-8 | {language}
        </div>
      </div>

      {/* Terminal / Stdin Console Pane */}
      <div className="p-4 bg-slate-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveConsoleTab('stdout')}
              className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeConsoleTab === 'stdout'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Output Terminal
            </button>
            <button
              onClick={() => setActiveConsoleTab('stdin')}
              className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded transition-colors cursor-pointer ${
                activeConsoleTab === 'stdin'
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Stdin Input {stdin.trim() ? '(Set)' : ''}
            </button>

            {executionTime !== null && !isRunning && (
              <span className="text-[11px] font-mono text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                {executionTime} ms
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {output && (
              <button
                onClick={() => onAskAiToDebug(output)}
                className="text-xs text-slate-800 bg-slate-200 hover:bg-slate-300 font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer"
              >
                Ask AI to Fix
              </button>
            )}
            {output && activeConsoleTab === 'stdout' && (
              <button
                onClick={() => {
                  setOutput('');
                  setExecutionTime(null);
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium underline underline-offset-2 cursor-pointer"
              >
                Clear Terminal
              </button>
            )}
          </div>
        </div>

        {activeConsoleTab === 'stdout' ? (
          <div className="bg-white border border-slate-200 rounded-md p-3.5 min-h-[100px] max-h-[220px] overflow-y-auto">
            <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed">
              {output || 'Click "Run Code" to execute script and view terminal output.'}
            </pre>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-md p-3 min-h-[100px]">
            <textarea
              placeholder="Enter standard input (stdin) for programs that require user input..."
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="w-full h-24 text-xs font-mono text-slate-800 focus:outline-hidden resize-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
