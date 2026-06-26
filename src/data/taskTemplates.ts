// ===== Task Templates =====
// Predefined task templates for each scenario

export interface NavInfo {
  keyword: string;
  cityHint: string;
  addressHint: string;
  tips: string[];
}

export interface TaskTemplate {
  scenarioId: string;
  title: string;
  location: string;
  estimatedTime: string;
  riskTag: string;
  navigation: NavInfo;
}

export const taskTemplates: Record<string, TaskTemplate> = {
  school: {
    scenarioId: 'school',
    title: '学校盖章 / 开证明',
    location: '学校教务处 / 院系办公室',
    estimatedTime: '30-60 分钟',
    riskTag: '中风险',
    navigation: {
      keyword: '学校教务处',
      cityHint: '当前城市 · 校内导航',
      addressHint: '学校教务处 / 院系办公室',
      tips: [
        '教务处通常在行政楼，进校后看路牌或问保安',
        '午休时间（12:00-14:00）通常不办公',
        '期末和毕业季排队较长，建议错峰前往',
      ],
    },
  },
  hospital: {
    scenarioId: 'hospital',
    title: '医院复诊',
    location: '医院门诊楼',
    estimatedTime: '1-2 小时',
    riskTag: '中风险',
    navigation: {
      keyword: '医院门诊楼',
      cityHint: '当前城市 · 医院导航',
      addressHint: '医院门诊楼 · 导诊台',
      tips: [
        '到达后先到一楼导诊台确认科室位置',
        '复诊建议提前在公众号预约挂号',
        '带上既往检查报告和医保卡',
      ],
    },
  },
  bank: {
    scenarioId: 'bank',
    title: '银行办卡 / 解冻',
    location: '银行网点柜台',
    estimatedTime: '30-60 分钟',
    riskTag: '高风险',
    navigation: {
      keyword: '银行网点',
      cityHint: '当前城市 · 银行导航',
      addressHint: '银行网点柜台',
      tips: [
        '到达后先取号，选择对应业务类型',
        '大堂经理会初步审核材料，可先咨询',
        '部分业务需在自助终端预办理',
      ],
    },
  },
  sim: {
    scenarioId: 'sim',
    title: '手机卡补办',
    location: '运营商自营营业厅',
    estimatedTime: '20-40 分钟',
    riskTag: '中风险',
    navigation: {
      keyword: '运营商营业厅',
      cityHint: '当前城市 · 营业厅导航',
      addressHint: '运营商自营营业厅',
      tips: [
        '确认是自营厅而非加盟店，加盟店可能无法补卡',
        '到达后取号，说明补卡需求',
        '部分运营商支持线上预约，可减少等待',
      ],
    },
  },
  government: {
    scenarioId: 'government',
    title: '政务大厅办证',
    location: '政务服务中心',
    estimatedTime: '1-3 小时',
    riskTag: '高风险',
    navigation: {
      keyword: '政务服务中心',
      cityHint: '当前城市 · 政务大厅导航',
      addressHint: '政务服务中心',
      tips: [
        '到达后先在咨询台确认窗口编号',
        '部分业务需先在自助机取号填表',
        '建议上午开门时到达，避免下午排队',
      ],
    },
  },
  rental: {
    scenarioId: 'rental',
    title: '租房签约 / 退租',
    location: '租赁房屋 / 中介门店',
    estimatedTime: '30-60 分钟',
    riskTag: '中风险',
    navigation: {
      keyword: '中介门店',
      cityHint: '当前城市 · 中介导航',
      addressHint: '租赁房屋 / 中介门店',
      tips: [
        '签约前确认房屋实际状况与描述一致',
        '退租时带齐合同和押金收据',
        '建议拍照留存房屋交接状态',
      ],
    },
  },
};

export function getTaskTemplate(scenarioId: string): TaskTemplate | undefined {
  return taskTemplates[scenarioId];
}
