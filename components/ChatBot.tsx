
import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Welcome to the Strategy Lab. I am your Gemini 3 Pro expert. How can I assist your marketing goals today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    const newMessages: Message[] = [...messages, { role: 'user', text: userMsg }];
    
    setInput('');
    setMessages(newMessages);
    setIsTyping(true);

    try {
      // Format history for the Gemini SDK
      // Skip the first greeting message from history to keep context clean
      const history = newMessages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      
      // Remove the last message from history as it's passed as the current message
      const historyContext = history.slice(0, -1);

      const response = await getChatResponse(historyContext, userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: response || 'I apologize, I encountered an issue processing that.' }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Expert connection lost. Please check your network.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[500px] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="font-bold text-sm tracking-tight">Gemini 3 Pro Strategy Lab</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-700 rounded p-1 transition-colors">
              <i className="fas fa-times text-xs"></i>
            </button>
          </div>
          
          <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                  : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t bg-white flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for strategy advice..."
              className="flex-grow bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95"
            >
              <i className="fas fa-arrow-up text-xs"></i>
            </button>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group w-14 h-14 bg-slate-900 rounded-full shadow-lg text-white flex items-center justify-center text-xl hover:bg-slate-800 transition-all hover:scale-110 active:scale-95 shadow-slate-200"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-brain'} transition-transform duration-300 group-hover:rotate-12`}></i>
      </button>
    </div>
  );
};

export default ChatBot;
