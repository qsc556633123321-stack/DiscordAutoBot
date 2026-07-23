const fs = require('node:fs');
const path = require('node:path');

const COMMUNITY_ROADMAP_FILE = path.join(__dirname, '..', '..', 'data', 'community-roadmap.json');
const DEFAULT_COMMUNITY_ROADMAP = Object.freeze({
  completed: Object.freeze(['Temp Voice', 'LFG 招募', 'Voice Hub', 'Night Crew', 'AI 社群系統']),
  inProgress: Object.freeze(['AI Community Concierge', '活躍成員系統', '遊戲提議系統']),
  future: Object.freeze(['Web Dashboard', 'AI Server Guide', '社群成就', '行動版 Dashboard', 'AI 活躍推薦'])
});

function cloneRoadmap(roadmap) {
  return Object.fromEntries(Object.entries(roadmap).map(([key, items]) => [key, [...items]]));
}

function createCommunityRoadmapGateway({
  filePath = COMMUNITY_ROADMAP_FILE,
  readFile = fs.readFileSync,
  fallback = DEFAULT_COMMUNITY_ROADMAP,
  logger = console
} = {}) {
  return {
    getCommunityRoadmap() {
      try {
        const parsed = JSON.parse(readFile(filePath, 'utf8') || '{}');
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? parsed
          : cloneRoadmap(fallback);
      } catch (error) {
        if (error?.code !== 'ENOENT') logger.error('Read community-roadmap.json failed:', error);
        return cloneRoadmap(fallback);
      }
    }
  };
}

const gateway = createCommunityRoadmapGateway();

module.exports = {
  COMMUNITY_ROADMAP_FILE,
  DEFAULT_COMMUNITY_ROADMAP,
  cloneRoadmap,
  ...gateway,
  createCommunityRoadmapGateway
};
