
import React, { useState, useRef, useEffect } from 'react';
import { editImageWithAI } from '../services/geminiService';
import { Button, Input, Card } from './Common';
import { ImageHistoryItem } from '../types';

const STUDIO_LOADING_STEPS = [
  "Uploading to Gemini 2.5 Flash...",
  "Analyzing visual composition...",
  "Interpreting prompt semantics...",
  "Applying neural transformations...",
  "Rendering modified asset...",
  "Optimizing for high-fidelity..."
];

const ImageStudio: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: number;
    if (loading) {
      interval = window.setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % STUDIO_LOADING_STEPS.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => window.clearInterval(interval);
  }, [loading]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!selectedImage || !prompt) return;

    setLoading(true);
    try {
      const resultUrl = await editImageWithAI(selectedImage, prompt);
      
      const newItem: ImageHistoryItem = {
        id: Date.now().toString(),
        url: resultUrl,
        prompt: prompt,
        timestamp: Date.now()
      };

      setHistory(prev => [newItem, ...prev]);
      setSelectedImage(resultUrl);
      setPrompt('');
    } catch (err) {
      alert('Error editing image: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="min-h-[400px] flex flex-col items-center justify-center relative overflow-hidden group">
            {selectedImage ? (
              <div className="w-full h-full flex flex-col items-center relative">
                <img 
                  src={selectedImage} 
                  alt="Current" 
                  className={`max-h-[600px] object-contain rounded-lg shadow-lg transition-all duration-700 ${loading ? 'blur-sm grayscale scale-[0.98]' : ''}`}
                />
                
                {loading && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 animate-in fade-in duration-300">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <div className="bg-white/90 px-6 py-2 rounded-full shadow-xl border border-blue-100 flex flex-col items-center">
                      <p className="text-blue-600 font-bold text-sm tracking-tight">{STUDIO_LOADING_STEPS[loadingStep]}</p>
                      <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full transition-all duration-500"
                          style={{ width: `${((loadingStep + 1) / STUDIO_LOADING_STEPS.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                {!loading && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <i className="fas fa-upload"></i> Change Image
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="flex flex-col items-center cursor-pointer p-20 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fas fa-image text-5xl text-slate-300 mb-4"></i>
                <p className="text-slate-500 font-medium">Click or drag to upload an image</p>
                <p className="text-slate-400 text-sm">Supports PNG, JPG up to 10MB</p>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </Card>

          <Card className={`${loading ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex flex-col md:flex-row gap-4">
              <Input 
                placeholder="Describe your edit (e.g., 'Add a retro filter' or 'Make it look like sunset')" 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                className="flex-grow py-3"
                disabled={loading}
              />
              <Button 
                onClick={handleEdit} 
                isLoading={loading}
                disabled={!selectedImage || !prompt || loading}
                className="whitespace-nowrap px-8"
              >
                Apply AI Edit
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <i className="fas fa-history text-blue-600"></i>
              Session History
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {history.length === 0 ? (
                <div className="text-center py-10 text-slate-400 italic">
                  No edits made yet
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    className="group relative cursor-pointer border border-slate-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all animate-in slide-in-from-right-2"
                    onClick={() => !loading && setSelectedImage(item.url)}
                  >
                    <img src={item.url} alt={item.prompt} className="w-full h-32 object-cover" />
                    <div className="p-2 bg-white">
                      <p className="text-xs text-slate-600 line-clamp-1 italic">"{item.prompt}"</p>
                      <p className="text-[10px] text-slate-400 mt-1 flex justify-between items-center">
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                        <i className="fas fa-check-circle text-emerald-500"></i>
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="secondary" 
                        className="p-1 px-2 text-[10px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          const link = document.createElement('a');
                          link.href = item.url;
                          link.download = `edit-${item.id}.png`;
                          link.click();
                        }}
                      >
                        <i className="fas fa-download"></i>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
