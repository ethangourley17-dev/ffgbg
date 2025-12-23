
export type Timeframe = 'daily' | 'weekly' | 'monthly';

export interface KeywordData {
  keyword: string;
  volume: number;
  trend: { date: string; value: number }[];
  location: string;
  competition: 'Low' | 'Medium' | 'High';
  analysis: string;
  sources: { uri: string; title: string }[];
}

export interface ImageHistoryItem {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}
