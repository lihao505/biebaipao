// ===== Location Search Module =====
// Supports two modes:
// 1. Demo fallback: local mock data for common cities
// 2. Real online: calls VITE_LOCATION_SEARCH_ENDPOINT (Serverless/backend)

import type {
  LocationCandidate,
  LocationSearchRequest,
  LocationSearchResult,
} from '../types/location';

// ===== Demo Location Data =====

const demoLocations: Record<string, LocationCandidate[]> = {
  school: [
    {
      id: 'school-1',
      name: '教务处 / 学生事务中心',
      address: '行政楼 1 楼教务处服务大厅',
      city: '桂林',
      district: '七星区',
      distance: '校内',
      phone: '请以学校公示电话为准',
      openingHours: '工作日 8:30-11:30, 14:00-17:00',
      source: 'demo',
      confidence: 'medium',
      mapUrl: 'https://uri.amap.com/search?keyword=教务处',
      navigationUrl: 'https://uri.amap.com/search?keyword=教务处',
      tips: [
        '教务处通常在行政楼，进校后看路牌或问保安',
        '午休时间（12:00-14:00）通常不办公',
        '期末和毕业季排队较长，建议错峰前往',
      ],
    },
    {
      id: 'school-2',
      name: '学院办公室',
      address: '各学院办公楼辅导员办公室',
      city: '桂林',
      district: '七星区',
      distance: '校内',
      phone: '请以学院公示电话为准',
      openingHours: '工作日 9:00-11:30, 14:00-17:00',
      source: 'demo',
      confidence: 'medium',
      mapUrl: 'https://uri.amap.com/search?keyword=学院办公室',
      navigationUrl: 'https://uri.amap.com/search?keyword=学院办公室',
      tips: [
        '辅导员办公室通常在各学院楼内',
        '签字前先确认辅导员今日是否在校',
        '建议提前电话或微信联系辅导员',
      ],
    },
  ],
  hospital: [
    {
      id: 'hospital-1',
      name: '门诊导诊台',
      address: '医院门诊楼 1 楼大厅',
      city: '桂林',
      district: '象山区',
      distance: '约 3.2km',
      phone: '请以医院公示电话为准',
      openingHours: '工作日 8:00-12:00, 14:30-17:30',
      source: 'demo',
      confidence: 'high',
      mapUrl: 'https://uri.amap.com/search?keyword=医院门诊',
      navigationUrl: 'https://uri.amap.com/search?keyword=医院门诊',
      tips: [
        '进门诊楼先到导诊台咨询',
        '复诊建议提前在 APP 或公众号预约',
        '病历复印通常在病案室，不在门诊',
      ],
    },
  ],
  bank: [
    {
      id: 'bank-1',
      name: '银行营业厅（柜台业务）',
      address: '城市主干道支行营业部',
      city: '桂林',
      district: '秀峰区',
      distance: '约 1.5km',
      phone: '请以银行公示电话为准',
      openingHours: '工作日 9:00-17:00',
      source: 'demo',
      confidence: 'high',
      mapUrl: 'https://uri.amap.com/search?keyword=银行营业厅',
      navigationUrl: 'https://uri.amap.com/search?keyword=银行营业厅',
      tips: [
        '银行卡业务需到自营营业厅，不是所有网点都能办',
        '大额业务建议提前预约',
        '携带身份证原件',
      ],
    },
  ],
  phone_card: [
    {
      id: 'phone-1',
      name: '运营商自营营业厅',
      address: '城市中心营业厅',
      city: '桂林',
      district: '七星区',
      distance: '约 2km',
      phone: '请以运营商公示电话为准',
      openingHours: '工作日 9:00-18:00',
      source: 'demo',
      confidence: 'high',
      mapUrl: 'https://uri.amap.com/search?keyword=运营商营业厅',
      navigationUrl: 'https://uri.amap.com/search?keyword=运营商营业厅',
      tips: [
        '补卡需到自营营业厅，加盟店无法办理',
        '携带身份证原件',
        '部分运营商支持线上补卡',
      ],
    },
  ],
  government: [
    {
      id: 'gov-1',
      name: '政务服务中心',
      address: '市政务服务中心大厅',
      city: '桂林',
      district: '临桂区',
      distance: '约 5km',
      phone: '12345',
      openingHours: '工作日 9:00-17:00',
      source: 'demo',
      confidence: 'high',
      mapUrl: 'https://uri.amap.com/search?keyword=政务服务中心',
      navigationUrl: 'https://uri.amap.com/search?keyword=政务服务中心',
      tips: [
        '建议提前通过政务服务网预约取号',
        '进大厅先看引导屏，确认窗口位置',
        '部分业务可全程网办，无需到场',
      ],
    },
  ],
  rent: [
    {
      id: 'rent-1',
      name: '租房合同备案窗口',
      address: '区住建局 / 房管所',
      city: '桂林',
      district: '七星区',
      distance: '约 4km',
      phone: '请以住建局公示电话为准',
      openingHours: '工作日 9:00-12:00, 14:00-17:00',
      source: 'demo',
      confidence: 'medium',
      mapUrl: 'https://uri.amap.com/search?keyword=住建局',
      navigationUrl: 'https://uri.amap.com/search?keyword=住建局',
      tips: [
        '租房备案需房东和租客同时到场',
        '携带身份证、租房合同、房产证复印件',
        '部分城市支持线上备案',
      ],
    },
  ],
};

function getDemoResult(request: LocationSearchRequest): LocationSearchResult {
  const candidates = demoLocations[request.scenarioId] || [];
  // Customize city in candidates
  const customized = candidates.map((c) => ({
    ...c,
    city: request.city,
    mapUrl: `https://uri.amap.com/search?keyword=${encodeURIComponent(request.keyword + ' ' + request.city)}`,
    navigationUrl: `https://uri.amap.com/search?keyword=${encodeURIComponent(request.keyword + ' ' + request.city)}`,
  }));

  return {
    candidates: customized,
    selected: customized[0],
    searchedAt: Date.now(),
    fallbackUsed: true,
  };
}

// ===== Real Online Mode =====

const LOCATION_ENDPOINT = import.meta.env.VITE_LOCATION_SEARCH_ENDPOINT as string | undefined;

async function searchOnline(request: LocationSearchRequest): Promise<LocationSearchResult> {
  if (!LOCATION_ENDPOINT) {
    throw new Error('No location search endpoint configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(LOCATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Location search failed: ${response.status}`);
    }

    const data = await response.json();
    return {
      ...data,
      searchedAt: Date.now(),
      fallbackUsed: false,
    } as LocationSearchResult;
  } finally {
    clearTimeout(timeout);
  }
}

// ===== Main Search Function =====

export async function searchLocation(request: LocationSearchRequest): Promise<LocationSearchResult> {
  // If no endpoint configured, use demo mode directly
  if (!LOCATION_ENDPOINT) {
    await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300));
    return getDemoResult(request);
  }

  // Try online mode, fallback to demo on failure
  try {
    return await searchOnline(request);
  } catch (error) {
    console.warn('[LocationSearch] Online search failed, falling back to demo:', error);
    return getDemoResult(request);
  }
}

// Generate search keyword based on scenario
export function generateLocationKeyword(scenarioId: string, scenarioName: string, city: string): string {
  const keywordMap: Record<string, string> = {
    school: `${city} 教务处 学生事务中心`,
    hospital: `${city} 医院 门诊 导诊台`,
    bank: `${city} 银行营业厅 柜台`,
    phone_card: `${city} 运营商自营营业厅`,
    government: `${city} 政务服务中心`,
    rent: `${city} 住建局 租房备案`,
  };
  return keywordMap[scenarioId] || `${city} ${scenarioName}`;
}
