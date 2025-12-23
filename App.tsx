
import React, { useState } from 'react';
import KeywordAnalyzer from './components/KeywordAnalyzer';
import ImageStudio from './components/ImageStudio';
import ChatBot from './components/ChatBot';

enum AppTab {
  KEYWORDS = 'keywords',
  STUDIO = 'studio'
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.KEYWORDS);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg">
              <i className="fas fa-bolt text-xl"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">KeywordPulse & Studio</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Company Intelligence Suite</p>
            </div>
          </div>

          <nav className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab(AppTab.KEYWORDS)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === AppTab.KEYWORDS 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <i className="fas fa-chart-line mr-2"></i>
              Keyword Volume
            </button>
            <button
              onClick={() => setActiveTab(AppTab.STUDIO)}
              className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === AppTab.STUDIO 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <i className="fas fa-wand-magic-sparkles mr-2"></i>
              AI Studio
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900">
            {activeTab === AppTab.KEYWORDS ? 'Keyword Volume Explorer' : 'AI Brand Assets Studio'}
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded uppercase tracking-wider">
              <i className="fas fa-search"></i> Google Grounded
            </span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase tracking-wider">
              <i className="fas fa-bolt"></i> Low Latency
            </span>
          </div>
          <p className="text-slate-500 mt-2 max-w-2xl text-sm">
            {activeTab === AppTab.KEYWORDS 
              ? 'Get exact search volume insights across locations and timeframes powered by Gemini 3 Flash Search Grounding.'
              : 'Transform your brand images with natural language prompts using the Gemini 2.5 Flash Image editor.'}
          </p>
        </div>

        {activeTab === AppTab.KEYWORDS ? <KeywordAnalyzer /> : <ImageStudio />}
      </main>

      {/* Chatbot overlay */}
      <ChatBot />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm gap-4">
          <p>&copy; 2024 KeywordPulse & Studio AI. Enterprise SEO & Creative Tools.</p>
          <div className="flex gap-6 text-xs">
            <span className="flex items-center gap-1"><i className="fas fa-microchip text-[10px]"></i> Gemini 3 Pro Expert Chat</span>
            <span className="flex items-center gap-1"><i className="fas fa-gauge-high text-[10px]"></i> Gemini 2.5 Flash-Lite Tips</span>
          </div>
          <div className="flex gap-6">
            <a href="https://ai.google.dev" className="hover:text-blue-600 transition-colors font-medium">Powered by Gemini</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
