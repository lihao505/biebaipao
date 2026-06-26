// ===== Location Types =====

export interface LocationCandidate {
  id: string;
  name: string;
  address: string;
  city: string;
  district?: string;
  distance?: string;
  phone?: string;
  openingHours?: string;
  source: 'amap' | 'baidu' | 'manual' | 'demo';
  confidence: 'high' | 'medium' | 'low';
  mapUrl?: string;
  navigationUrl?: string;
  tips: string[];
}

export interface LocationSearchRequest {
  city: string;
  scenarioId: string;
  scenarioName: string;
  keyword: string;
  userText?: string;
  latitude?: number;
  longitude?: number;
}

export interface LocationSearchResult {
  selected?: LocationCandidate;
  candidates: LocationCandidate[];
  searchedAt: number;
  fallbackUsed: boolean;
}
