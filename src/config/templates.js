const templates = {
  studio: {
    label: '接案工作室',
    description: '適合自由接案、設計、開發與客戶協作。',
    categories: [
      {
        name: '資訊中心',
        channels: [
          { name: '規則', key: 'rules', topic: '伺服器規則與使用說明' },
          { name: '公告', key: 'announcements', topic: '重要公告與更新' },
          { name: '驗證區', key: 'verification', topic: '訪客驗證與加入流程' }
        ]
      },
      {
        name: '工作室大廳',
        channels: [
          { name: '一般聊天', key: 'general', topic: '成員日常交流' },
          { name: '作品展示', key: 'showcase', topic: '作品、案例與靈感分享' },
          { name: '需求討論', key: 'requests', topic: '專案需求與初步討論' }
        ]
      },
      {
        name: '管理員後台',
        adminOnly: true,
        channels: [
          { name: '管理員頻道', key: 'admin', topic: '管理團隊內部討論' },
          { name: '專案控管', key: 'project-control', topic: '專案排程與控管' }
        ]
      }
    ],
    rules: [
      '請尊重所有成員與客戶，不做人身攻擊或騷擾。',
      '禁止張貼垃圾訊息、惡意連結與未經授權的廣告。',
      '討論專案時請避免公開敏感資料、合約與個人資訊。',
      '作品分享請確認你擁有發布權利。',
      '違反規則者可能會被禁言、踢出或封鎖。'
    ]
  },
  gaming: {
    label: '遊戲社群',
    description: '適合玩家交流、組隊、活動與戰隊管理。',
    categories: [
      {
        name: '資訊中心',
        channels: [
          { name: '規則', key: 'rules', topic: '伺服器規則與使用說明' },
          { name: '公告', key: 'announcements', topic: '活動公告與更新' },
          { name: '驗證區', key: 'verification', topic: '訪客驗證與加入流程' }
        ]
      },
      {
        name: '玩家大廳',
        channels: [
          { name: '一般聊天', key: 'general', topic: '玩家聊天交流' },
          { name: '找隊友', key: 'lfg', topic: '尋找隊友與組隊' },
          { name: '戰績分享', key: 'highlights', topic: '精華、戰績與截圖分享' }
        ]
      },
      {
        name: '管理員後台',
        adminOnly: true,
        channels: [
          { name: '管理員頻道', key: 'admin', topic: '管理團隊內部討論' },
          { name: '活動規劃', key: 'events-planning', topic: '活動與賽事規劃' }
        ]
      }
    ],
    rules: [
      '保持友善，禁止辱罵、挑釁、騷擾或歧視。',
      '禁止外掛、作弊、交易詐騙與散播惡意連結。',
      '組隊請清楚說明遊戲、區服、模式與需求。',
      '請將遊戲討論放在合適頻道，避免洗版。',
      '管理員會依情節採取警告、禁言或移除處置。'
    ]
  },
  stocks: {
    label: '股票社群',
    description: '適合投資討論、資訊整理與會員交流。',
    categories: [
      {
        name: '資訊中心',
        channels: [
          { name: '規則', key: 'rules', topic: '伺服器規則與投資討論規範' },
          { name: '公告', key: 'announcements', topic: '重要公告與社群更新' },
          { name: '驗證區', key: 'verification', topic: '訪客驗證與加入流程' }
        ]
      },
      {
        name: '投資大廳',
        channels: [
          { name: '一般聊天', key: 'general', topic: '投資與市場交流' },
          { name: '盤勢討論', key: 'market-talk', topic: '盤勢、新聞與個股討論' },
          { name: '資料分享', key: 'research', topic: '研究資料與觀點分享' }
        ]
      },
      {
        name: '管理員後台',
        adminOnly: true,
        channels: [
          { name: '管理員頻道', key: 'admin', topic: '管理團隊內部討論' },
          { name: '內容審核', key: 'moderation', topic: '內容審核與社群管理' }
        ]
      }
    ],
    rules: [
      '本社群內容僅供討論與學習，不構成投資建議。',
      '禁止保證獲利、帶單詐騙、惡意喊盤與未揭露利益衝突。',
      '分享資訊請附來源，避免散播未證實消息。',
      '禁止人身攻擊、洗版、垃圾廣告與惡意連結。',
      '投資有風險，請自行判斷並承擔決策結果。'
    ]
  },
  private_team: {
    label: '私人團隊',
    description: '適合小型團隊、朋友群或內部協作。',
    categories: [
      {
        name: '資訊中心',
        channels: [
          { name: '規則', key: 'rules', topic: '伺服器規則與使用說明' },
          { name: '公告', key: 'announcements', topic: '重要公告與更新' },
          { name: '驗證區', key: 'verification', topic: '訪客驗證與加入流程' }
        ]
      },
      {
        name: '團隊大廳',
        channels: [
          { name: '一般聊天', key: 'general', topic: '團隊日常交流' },
          { name: '任務討論', key: 'tasks', topic: '任務、進度與協作討論' },
          { name: '資源分享', key: 'resources', topic: '文件、連結與資源整理' }
        ]
      },
      {
        name: '管理員後台',
        adminOnly: true,
        channels: [
          { name: '管理員頻道', key: 'admin', topic: '管理團隊內部討論' },
          { name: '內部決策', key: 'decisions', topic: '內部決策與敏感討論' }
        ]
      }
    ],
    rules: [
      '請尊重團隊成員，保持理性溝通。',
      '內部資訊、文件與討論內容請勿外流。',
      '請將任務與資源放在對應頻道，方便查找。',
      '禁止垃圾訊息、惡意連結與無關廣告。',
      '管理員可依情況調整頻道、角色與權限。'
    ]
  }
};

module.exports = templates;
