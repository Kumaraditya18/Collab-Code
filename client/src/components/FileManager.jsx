import { useRef, useState } from 'react';

const LANGUAGE_EXT_MAP = {
  js: 'javascript',
  jsx: 'javascript',
  ts: 'typescript',
  tsx: 'typescript',
  py: 'python',
  cpp: 'cpp',
  cc: 'cpp',
  h: 'cpp',
  hpp: 'cpp',
  java: 'java',
  cs: 'csharp',
  go: 'go',
  rs: 'rust',
};

const FileManager = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onImportFile,
  onExportAll,
}) => {
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const trimmed = newFileName.trim();
    const ext = trimmed.split('.').pop().toLowerCase();
    const lang = LANGUAGE_EXT_MAP[ext] || 'javascript';

    const newFile = {
      id: 'file_' + Math.random().toString(36).substring(2, 9),
      name: trimmed,
      content: `// File: ${trimmed}\n`,
      language: lang,
    };

    onCreateFile(newFile);
    setNewFileName('');
    setShowNewFileInput(false);
  };

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result;
      if (typeof content === 'string') {
        const ext = uploadedFile.name.split('.').pop()?.toLowerCase() || '';
        const lang = LANGUAGE_EXT_MAP[ext] || 'javascript';

        const importedFileObj = {
          id: 'file_' + Math.random().toString(36).substring(2, 9),
          name: uploadedFile.name,
          content: content,
          language: lang,
        };

        onImportFile(importedFileObj);
      }
    };
    reader.readAsText(uploadedFile);
    e.target.value = '';
  };

  return (
    <div className="bg-slate-100 border-b border-slate-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2">
      {/* File Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto max-w-full py-0.5">
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          return (
            <div
              key={file.id}
              className={`flex items-center gap-2 px-3 py-1 text-xs font-mono rounded-t-md transition-colors cursor-pointer border ${
                isActive
                  ? 'bg-white border-slate-300 text-slate-900 font-semibold border-b-transparent shadow-2xs'
                  : 'bg-slate-200/70 border-transparent text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
              onClick={() => onSelectFile(file.id)}
            >
              <span>{file.name}</span>

              {files.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.id);
                  }}
                  className="text-[10px] text-slate-400 hover:text-rose-600 font-bold ml-1 px-1 rounded cursor-pointer"
                  title="Close file"
                >
                  X
                </button>
              )}
            </div>
          );
        })}

        {/* New File Inline Form */}
        {showNewFileInput ? (
          <form onSubmit={handleCreateSubmit} className="flex items-center gap-1">
            <input
              type="text"
              placeholder="filename.js"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              autoFocus
              className="px-2 py-0.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-900 focus:outline-hidden"
            />
            <button
              type="submit"
              className="text-[11px] px-2 py-0.5 bg-slate-900 text-white rounded font-medium cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setShowNewFileInput(false)}
              className="text-[11px] px-1.5 py-0.5 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewFileInput(true)}
            className="text-xs px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded transition-colors cursor-pointer"
          >
            + New File
          </button>
        )}
      </div>

      {/* Action buttons: Import & Export */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".js,.jsx,.ts,.tsx,.py,.cpp,.c,.h,.java,.cs,.go,.rs,.json,.html,.css,.txt,.md"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 font-medium rounded border border-slate-300 transition-colors cursor-pointer"
        >
          Import File
        </button>
        <button
          type="button"
          onClick={onExportAll}
          className="text-xs px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 font-medium rounded border border-slate-300 transition-colors cursor-pointer"
        >
          Export All
        </button>
      </div>
    </div>
  );
};

export default FileManager;
