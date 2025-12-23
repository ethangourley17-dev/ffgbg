
import React, { useState } from 'react';
import { analyzeKeyword, getQuickSEOTips } from '../services/geminiService';
import { KeywordData, Timeframe } from '../types';
import { Button, Input, Card } from './Common';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const KeywordAnalyzer: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<KeywordData | null>(null);
  const [fastTips, setFastTips] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKeyword = keyword.trim();
    const cleanLocation = location.trim();
    
    if (!cleanKeyword || !cleanLocation) return;

    setLoading(true);
    setError(null);
    setFastTips(null);
    
    try {
      // 1. Kick off fast feedback first for low-latency feel
      getQuickSEOTips(cleanKeyword).then(tips => setFastTips(tips));
      
      // 2. Main grounded analysis
      const result = await analyzeKeyword(cleanKeyword, cleanLocation, timeframe);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setKeyword('');
    setLocation('');
    setData(null);
    setFastTips(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 h-fit">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <i className="fas fa-magnifying-glass-chart text-blue-600"></i>
            Search Explorer
          </h2>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label htmlFor="keyword-input" className="block text-sm font-semibold text-slate-700 mb-1">
                Keyword
              </label>
              <Input 
                id="keyword-input"
                autoComplete="off"
                placeholder="e.g. cloud security" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="location-input" className="block text-sm font-semibold text-slate-700 mb-1">
                Location
              </label>
              <Input 
                id="location-input"
                autoComplete="off"
                placeholder="e.g. New York, USA" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="timeframe-select" className="block text-sm font-semibold text-slate-700 mb-1">
                Traffic Interval
              </label>
              <select 
                id="timeframe-select"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                disabled={loading}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-900 disabled:opacity-50"
              >
                <option value="daily">Daily Volume</option>
                <option value="weekly">Weekly Volume</option>
                <option value="monthly">Monthly Volume</option>
              </select>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Button type="submit" className="w-full py-3" isLoading={loading}>
                {loading ? 'Synthesizing...' : 'Analyze Market'}
              </Button>
              <Button type="button" variant="outline" className="w-full text-xs" onClick={handleReset} disabled={loading || (!keyword && !location)}>
                Reset Dashboard
              </Button>
            </div>
          </form>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-xs flex items-start gap-2">
              <i className="fas fa-circle-exclamation mt-0.5"></i>
              <span>{error}</span>
            </div>
          )}
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {fastTips && (
            <Card className="bg-blue-50 border-blue-100 py-3">
              <div className="flex items-center gap-2 mb-2">
                <i className="fas fa-bolt text-blue-600 text-sm"></i>
                <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider">Fast Response (Lite)</h4>
              </div>
              <div className="text-xs text-blue-700 whitespace-pre-line leading-relaxed italic">
                {fastTips}
              </div>
            </Card>
          )}

          {!data && !loading && (
            <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 shadow-inner">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <i className="fas fa-chart-simple text-3xl opacity-20"></i>
              </div>
              <h3 className="text-slate-900 font-bold mb-2">Market Data Ready</h3>
              <p className="text-sm text-center max-w-xs">
                Enter your target keyword and location to generate real-time volume estimates grounded in live search results.
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-white border border-slate-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
              <div className="h-[400px] bg-white border border-slate-100 rounded-xl animate-pulse p-8 flex flex-col justify-end">
                <div className="flex items-end gap-2 h-full">
                   <div className="flex-1 bg-slate-100 h-[20%] rounded"></div>
                   <div className="flex-1 bg-slate-100 h-[40%] rounded"></div>
                   <div className="flex-1 bg-slate-100 h-[30%] rounded"></div>
                   <div className="flex-1 bg-slate-100 h-[60%] rounded"></div>
                   <div className="flex-1 bg-slate-100 h-[80%] rounded"></div>
                   <div className="flex-1 bg-slate-100 h-[50%] rounded"></div>
                </div>
              </div>
            </div>
          )}

          {data && !loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-600 flex flex-col justify-center">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Volume ({timeframe})</div>
                  <div className="text-3xl font-black text-slate-900 tabular-nums">
                    {data.volume.toLocaleString()}
                  </div>
                </Card>
                <Card className="border-l-4 border-l-emerald-600 flex flex-col justify-center">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Market Competition</div>
                  <div className="text-3xl font-black text-slate-900">
                    {data.competition}
                  </div>
                </Card>
                <Card className="border-l-4 border-l-purple-600 flex flex-col justify-center">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Target Region</div>
                  <div className="text-3xl font-black text-slate-900 truncate" title={data.location}>
                    {data.location}
                  </div>
                </Card>
              </div>

              <Card>
                <div className="flex justify-between items-center mb-8">
                   <div>
                    <h3 className="text-lg font-bold">Search Volume Trend</h3>
                    <p className="text-xs text-slate-400">Activity based on recent search engine indexing</p>
                   </div>
                  <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 uppercase tracking-tighter">Live Estimate</div>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#2563eb" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorArea)" 
                        name="Queries"
                        animationDuration={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="bg-slate-900 text-white border-none shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <i className="fas fa-brain text-white text-sm"></i>
                  </div>
                  <h3 className="text-lg font-bold">Market Intelligence Report</h3>
                </div>
                <p className="text-slate-300 leading-relaxed text-sm mb-6 antialiased">{data.analysis}</p>
                <div className="pt-6 border-t border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Verification Sources (Grounding)</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.sources.length > 0 ? data.sources.map((s, idx) => (
                      <a 
                        key={idx} 
                        href={s.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-lg border border-slate-700 transition-all flex items-center gap-2"
                      >
                        <i className="fas fa-link text-blue-400"></i>
                        <span className="font-bold truncate max-w-[150px]">{s.title || 'Data Point'}</span>
                      </a>
                    )) : (
                      <span className="text-[11px] text-slate-500 italic">Analytical synthesis based on aggregate indexing data.</span>
                    )}
                  </div>
                </div>
                <div className="mt-6 p-3 bg-blue-900/30 rounded-lg border border-blue-500/20">
                    <p className="text-[10px] text-blue-300/80 leading-snug">
                      <i className="fas fa-info-circle mr-1.5"></i>
                      <strong>Methodology:</strong> Volume data is synthesized from real-time search engine result pages (SERP) via Gemini 3 Flash.
                    </p>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeywordAnalyzer;
