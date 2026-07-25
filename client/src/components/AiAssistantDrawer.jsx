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
  const [autoApply, setAutoApply] = useState(true);
  const [appliedStatus, setAppliedStatus] = useState('');

  if (!isOpen) return null;

  const detectLanguageFromCode = (codeStr, fallbackLang) => {
    if (!codeStr) return fallbackLang;
    if (codeStr.includes('#include') || codeStr.includes('std::cout') || codeStr.includes('using namespace std')) {
      return 'cpp';
    }
    if (codeStr.includes('def ') || (codeStr.includes('print(') && !codeStr.includes('console.log'))) {
      return 'python';
    }
    if (codeStr.includes('public class Main') || codeStr.includes('System.out.println')) {
      return 'java';
    }
    if (codeStr.includes('fn main()') || codeStr.includes('println!')) {
      return 'rust';
    }
    if (codeStr.includes('package main') || codeStr.includes('fmt.Println')) {
      return 'go';
    }
    return fallbackLang;
  };

  const handleRequestAi = async (actionType, overridePrompt = '') => {
    setActiveTab(actionType);
    setLoading(true);
    setAiResponse('');
    setCodeFix(null);
    setAppliedStatus('');

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
        const detectedLang = detectLanguageFromCode(data.codeFix, language);
        if (autoApply) {
          onApplyFix(data.codeFix, detectedLang);
          setAppliedStatus(`Code automatically applied to editor (${detectedLang.toUpperCase()})!`);
        }
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
    setCustomPrompt('');
    handleRequestAi('custom', promptToSend);
  };

  const handleManualApply = () => {
    if (codeFix) {
      const detectedLang = detectLanguageFromCode(codeFix, language);
      onApplyFix(codeFix, detectedLang);
      setAppliedStatus(`Code applied to editor (${detectedLang.toUpperCase()})!`);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI Code Assistant</h2>
          <p className="text-xs text-slate-500">Real-time code generation, refactoring & direct editor updates</p>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          Close
        </button>
      </div>

      {/* Control Bar: Auto-Apply Toggle & Quick Action Buttons */}
      <div className="p-4 bg-slate-100 border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={autoApply}
              onChange={(e) => setAutoApply(e.target.checked)}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-400"
            />
            Auto-Apply AI Code Updates to Editor
          </label>
          <span className="text-[10px] text-slate-500 font-medium">
            {autoApply ? 'Direct Edit Enabled' : 'Manual Approval'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-xs font-semibold text-slate-700 mb-1">Generating Code & Updating Editor...</div>
            <div className="text-[11px] text-slate-400">Processing AI prompt</div>
          </div>
        ) : aiResponse ? (
          <div className="space-y-4">
            {appliedStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-lg flex items-center justify-between">
                <span>{appliedStatus}</span>
                <span className="text-[10px] uppercase tracking-wider font-mono">[UPDATED]</span>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                AI Assistant Insights & Instructions
              </div>
              <pre className="text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed select-text">
                {aiResponse}
              </pre>
            </div>

            {codeFix && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Generated Code Result
                  </span>
                  <button
                    onClick={handleManualApply}
                    className="text-xs px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded shadow-xs transition-colors cursor-pointer"
                  >
                    Apply Code to Active File
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
            Ask AI to generate code, convert languages (C++, Python, Java), or fix bugs.
          </div>
        )}
      </div>

      {/* Custom AI Prompt Input Bar */}
      <form onSubmit={handleCustomSubmit} className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
        <input
          type="text"
          placeholder="e.g. make code in cpp, add quicksort, fix syntax..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-hidden"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-md shadow-xs transition-colors cursor-pointer"
        >
          Ask & Apply AI
        </button>
      </form>
    </div>
  );
};

export default AiAssistantDrawer;
