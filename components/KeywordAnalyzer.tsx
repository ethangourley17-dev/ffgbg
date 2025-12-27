
import React, { useState, useEffect } from 'react';
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

const LOADING_STEPS = [
  "Connecting to Google Search indices...",
  "Retrieving regional search volume...",
  "Applying MSV timeframe scaling...",
  "Cross-referencing domain data...",
  "Rendering market intelligence..."
];

const KeywordAnalyzer: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [data, setData] = useState<KeywordData | null>(null);
  const [fastTips, setFastTips] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => window.clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKeyword = keyword.trim();
    const cleanLocation = location.trim();
    
    if (!cleanKeyword || !cleanLocation) return;

    setLoading(true);
    setError(null);
    setFastTips(null);
    
    try {
      getQuickSEOTips(cleanKeyword).then(tips => setFastTips(tips));
      const result = await analyzeKeyword(cleanKeyword, cleanLocation, timeframe);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 py-4">
      {/* Centered Search Engine Interface */}
      <section className={`transition-all duration-700 ${data || loading ? 'mb-10' : 'py-12'}`}>
        <div className="text-center mb-8">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Enterprise Keyword Search</h2>
          <p className="text-slate-500 font-medium">Get exact grounded search volumes across any global region.</p>
        </div>

        <Card className="shadow-2xl border-blue-100 p-2">
          <form onSubmit={handleAnalyze} className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-grow">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <Input 
                autoComplete="off"
                placeholder="Enter keyword (e.g. 'SaaS Security')" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                required
                className="pl-11 py-4 border-none focus:ring-0 text-lg font-medium"
              />
            </div>
            <div className="h-10 w-px bg-slate-200 hidden md:block self-center mx-2"></div>
            <div className="relative md:w-64">
              <i className="fas fa-location-dot absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <Input 
                autoComplete="off"
                placeholder="Location..." 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="pl-11 py-4 border-none focus:ring-0 text-lg font-medium"
              />
            </div>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as Timeframe)}
              className="px-4 py-4 bg-slate-50 border-none rounded-lg text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="daily">Daily Volume</option>
              <option value="weekly">Weekly Volume</option>
              <option value="monthly">Monthly Volume</option>
            </select>
            <Button type="submit" className="md:px-10 py-4 rounded-lg font-black text-lg" isLoading={loading}>
              {loading ? 'Crunching' : 'Search'}
            </Button>
          </form>
        </Card>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
            <i className="fas fa-triangle-exclamation"></i>
            {error}
          </div>
        )}
      </section>

      {/* Loading State */}
      {loading && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
           <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-bold text-slate-900">{LOADING_STEPS[loadingStep]}</h3>
              <p className="text-slate-400 text-sm mt-1">Grounding data with Gemini 3 Search Tool...</p>
           </div>
           <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl animate-pulse"></div>)}
           </div>
        </div>
      )}

      {/* Results Dashboard */}
      {data && !loading && (
        <div className="animate-in slide-in-from-bottom-8 duration-700 space-y-8 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-blue-600 text-white border-none shadow-blue-200">
              <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">
                {timeframe.toUpperCase()} VOLUME
              </div>
              <div className="text-5xl font-black tracking-tighter tabular-nums">
                {data.volume.toLocaleString()}
              </div>
              <div className="mt-4 text-xs font-medium opacity-80">
                <i className="fas fa-check-circle mr-1"></i> Exact {timeframe} index grounded
              </div>
            </Card>
            
            <Card className="flex flex-col justify-center">
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Market Intensity</div>
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-slate-900">{data.competition}</span>
                <div className={`h-3 w-12 rounded-full ${
                  data.competition === 'High' ? 'bg-red-500' : 
                  data.competition === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}></div>
              </div>
            </Card>

            <Card className="flex flex-col justify-center">
              <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-2">Regional Filter</div>
              <div className="text-2xl font-black text-slate-900 truncate">
                {data.location}
              </div>
              <div className="text-xs text-blue-600 font-bold mt-1">Validated across {data.sources.length} sources</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Historical Trend</h3>
                  <p className="text-xs text-slate-400">Activity index for {data.keyword}</p>
                </div>
                <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                  Unit: {timeframe} searches
                </div>
              </div>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trend}>
                    <defs>
                      <linearGradient id="chartColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} 
                      tickFormatter={(val) => val.toLocaleString()}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
                      cursor={{ stroke: '#2563eb', strokeWidth: 2, strokeDasharray: '5 5' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#2563eb" 
                      strokeWidth={4}
                      fill="url(#chartColor)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <div className="space-y-6">
              {fastTips && (
                <Card className="bg-amber-50 border-amber-100">
                  <div className="flex items-center gap-2 mb-3">
                    <i className="fas fa-lightbulb text-amber-600"></i>
                    <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest">Growth Tactics</h4>
                  </div>
                  <div className="text-sm text-amber-800 leading-relaxed font-medium">
                    {fastTips}
                  </div>
                </Card>
              )}
              
              <Card className="bg-slate-900 text-white border-none h-full">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <i className="fas fa-brain text-blue-400"></i>
                  Intelligence Report
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {data.analysis}
                </p>
                <div className="pt-6 border-t border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Verified Sources</p>
                  <div className="flex flex-col gap-2">
                    {data.sources.map((s, i) => (
                      <a 
                        key={i} 
                        href={s.uri} 
                        target="_blank" 
                        className="text-[11px] text-blue-400 hover:text-blue-300 truncate transition-colors flex items-center gap-2"
                      >
                        <i className="fas fa-link text-[9px]"></i>
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeywordAnalyzer;
