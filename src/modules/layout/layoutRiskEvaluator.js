function evaluateLayoutRisk(action) {
  return action?.risk || 'low';
}

function isHighRisk(action) {
  return evaluateLayoutRisk(action) === 'high';
}

module.exports = { evaluateLayoutRisk, isHighRisk };
