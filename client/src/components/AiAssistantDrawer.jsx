import { useState, useRef, useEffect } from 'react';
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
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your AI Copilot. Ask me to generate algorithms, debug errors, or convert code into C++, Python, Java, Rust, or JavaScript.',
      codeFix: null,
      detectedLang: null,
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState('');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

  const handleSendPrompt = async (userText) => {
    if (!userText || !userText.trim()) return;
    const cleanPrompt = userText.trim();
    setInputPrompt('');
    setAppliedStatus('');

    // Add user message to chat feed
    const userMsg = { role: 'user', text: cleanPrompt };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${serverUrl}/api/ai/assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'custom',
          code,
          language,
          output: executionOutput,
          prompt: cleanPrompt,
        }),
      });

      const data = await parseResponseJson(res);
      let replyText = data.result || 'AI completed request.';
      let extractedFix = data.codeFix || null;

      let detectedLang = language;
      if (extractedFix) {
        detectedLang = detectLanguageFromCode(extractedFix, language);
      }

      const aiMsg = {
        role: 'assistant',
        text: replyText,
        codeFix: extractedFix,
        detectedLang,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `AI Assistant Error: ${err.message || 'Unable to process request.'}`,
          codeFix: null,
          detectedLang: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendPrompt(inputPrompt);
  };

  const handleApplyCodeToEditor = (codeToApply, targetLang) => {
    if (!codeToApply) return;
    const langToUse = targetLang || detectLanguageFromCode(codeToApply, language);
    onApplyFix(codeToApply, langToUse);
    setAppliedStatus(`Applied to workspace editor as ${langToUse.toUpperCase()}!`);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white border-l border-slate-200 shadow-2xl flex flex-col select-none">
      {/* Copilot Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-900">AI Copilot</h2>
          <p className="text-xs text-slate-500">Ask AI to write code, convert languages & refactor</p>
        </div>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
        >
          Close
        </button>
      </div>

      {/* Applied Status Banner */}
      {appliedStatus && (
        <div className="px-6 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
          <span>{appliedStatus}</span>
          <span className="text-[10px] uppercase font-mono">[UPDATED]</span>
        </div>
      )}

      {/* Conversational Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1">
              <span className="text-[11px] font-bold text-slate-700">
                {msg.role === 'user' ? 'You' : 'AI Copilot'}
              </span>
            </div>

            <div
              className={`max-w-[90%] p-3.5 rounded-xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-800'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans select-text">{msg.text}</pre>

              {msg.codeFix && (
                <div className="mt-3 pt-3 border-t border-slate-200/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Generated Code ({msg.detectedLang?.toUpperCase()})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleApplyCodeToEditor(msg.codeFix, msg.detectedLang)}
                      className="text-xs px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded shadow-2xs cursor-pointer"
                    >
                      Apply to Editor
                    </button>
                  </div>
                  <pre className="text-xs font-mono text-slate-900 bg-white border border-slate-200 rounded p-3 whitespace-pre-wrap overflow-x-auto select-text">
                    {msg.codeFix}
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs text-slate-500 italic">
              AI Copilot is generating response...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => handleSendPrompt('Convert this code to C++')}
          className="text-[11px] font-semibold px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer"
        >
          Convert to C++
        </button>
        <button
          type="button"
          onClick={() => handleSendPrompt('Convert this code to Python')}
          className="text-[11px] font-semibold px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer"
        >
          Convert to Python
        </button>
        <button
          type="button"
          onClick={() => handleSendPrompt('Debug and fix errors in this code')}
          className="text-[11px] font-semibold px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer"
        >
          Fix & Debug
        </button>
        <button
          type="button"
          onClick={() => handleSendPrompt('Refactor and optimize this code')}
          className="text-[11px] font-semibold px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 rounded border border-slate-300 transition-colors cursor-pointer"
        >
          Optimize Code
        </button>
      </div>

      {/* Copilot Input Bar */}
      <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
        <input
          type="text"
          placeholder="Ask AI Copilot to code, convert, or fix..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:border-slate-500 focus:outline-hidden"
        />
        <button
          type="submit"
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default AiAssistantDrawer;
