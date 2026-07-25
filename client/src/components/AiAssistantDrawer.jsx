import { useState } from 'react';
import { parseResponseJson } from '../utils/api';

const AiAssistantDrawer = ({
  isOpen,
  onClose,
  code,
  language,
  executionOutput,
  onApplyFix,
  serverUrl,
}) => {
  const [activeTab, setActiveTab] = useState('explain'); // explain | debug | refactor | test | custom
  const [customPrompt, setCustomPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [codeFix, setCodeFix] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestAi = async (actionType, overridePrompt = '') => {
    setActiveTab(actionType);
    setLoading(true);
    setAiResponse('');
    setCodeFix(null);

    const promptToSend = overridePrompt || customPrompt;

    try {
      const res = await fetch(`${serverUrl}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionType,
          code,
          language,
          output: executionOutput,
          prompt: promptToSend,
        }),
      });

      const data = await parseResponseJson(res);
      if (data.result) {
        setAiResponse(data.result);
      } else {
        setAiResponse('AI analysis completed.');
      }
      if (data.codeFix) {
        setCodeFix(data.codeFix);
      }
    } catch (err) {
      setAiResponse(`AI Assistant Error: ${err.message || 'Unable to process request.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    const promptToSend = customPrompt.trim();
    setCustomPrompt(''); // Clear typebar input immediately
    handleRequestAi('custom', promptToSend);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI Code Assistant</h2>
          <p className="text-xs text-slate-500">Real-time intelligent code analysis, debugging & refactoring</p>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          Close
        </button>
      </div>

      {/* Quick Action Buttons */}
      <div className="p-4 bg-slate-100 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={() => handleRequestAi('explain')}
          className={`py-2 px-2.5 text-xs font-medium rounded border text-center transition-colors cursor-pointer ${
            activeTab === 'explain'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          Explain Code
        </button>
        <button
          onClick={() => handleRequestAi('debug')}
          className={`py-2 px-2.5 text-xs font-medium rounded border text-center transition-colors cursor-pointer ${
            activeTab === 'debug'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          Fix & Debug
        </button>
        <button
          onClick={() => handleRequestAi('refactor')}
          className={`py-2 px-2.5 text-xs font-medium rounded border text-center transition-colors cursor-pointer ${
            activeTab === 'refactor'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          Refactor
        </button>
        <button
          onClick={() => handleRequestAi('test')}
          className={`py-2 px-2.5 text-xs font-medium rounded border text-center transition-colors cursor-pointer ${
            activeTab === 'test'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-200'
          }`}
        >
          Unit Tests
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-xs font-semibold text-slate-700 mb-1">Analyzing Workspace Code...</div>
            <div className="text-[11px] text-slate-400">Generating AI response</div>
          </div>
        ) : aiResponse ? (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                AI Assistant Response
              </div>
              <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed select-text">
                {aiResponse}
              </pre>
            </div>

            {codeFix && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Generated Code Patch
                  </span>
                  <button
                    onClick={() => onApplyFix(codeFix)}
                    className="text-xs px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded shadow-xs transition-colors cursor-pointer"
                  >
                    Apply Fix to Editor
                  </button>
                </div>
                <pre className="text-xs font-mono text-slate-800 bg-white border border-slate-200 rounded p-3 whitespace-pre-wrap select-text">
                  {codeFix}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Select a quick action above or type custom questions to get AI code assistance.
          </div>
        )}
      </div>

      {/* Custom AI Prompt Input Bar */}
      <form onSubmit={handleCustomSubmit} className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
        <input
          type="text"
          placeholder="Ask AI anything about this code..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-hidden"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer"
        >
          Ask AI
        </button>
      </form>
    </div>
  );
};

export default AiAssistantDrawer;
