import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

const Editor = ({ code, handleChange, onRun, language, setLanguage }) => {
  const [output, setOutput] = useState('');

  const handleRun = async () => {
    if (!onRun) {
      setOutput('❌ Run function not provided');
      return;
    }
    const result = await onRun(code);
    setOutput(result);
  };

  const getExtensions = () => {
    switch (language) {
      case 'python': return [python()];
      case 'javascript': return [javascript()];
      default: return [javascript()]; // fallback if others aren't supported
    }
  };

  return (
    <div className="bg-gray-800 rounded-2xl shadow-lg p-4">
      <div className="flex justify-between mb-2">
        <select
          className="bg-gray-700 text-white px-3 py-1 rounded-lg"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
        </select>
        <button
          onClick={handleRun}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-semibold"
        >
          Run Code
        </button>
      </div>

      <CodeMirror
        value={code}
        height="500px"
        extensions={getExtensions()}
        theme={oneDark}
        onChange={handleChange}
      />

      <div className="mt-4 bg-black text-green-400 p-4 rounded-lg min-h-[100px]">
        <strong>Output:</strong>
        <pre>{output}</pre>
      </div>
    </div>
  );
};

export default Editor;
