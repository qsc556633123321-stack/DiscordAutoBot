const runtime = require('./legacyLayoutRuntime');

function warn(name) {
  console.warn(`[LegacyFallback] layout decision engine used: ${name}`);
}

module.exports = {
  ...runtime,
  buildLayoutRepairPlan(...args) {
    warn('buildLayoutRepairPlan');
    return runtime.buildLayoutRepairPlan(...args);
  },
  executeLayoutRepairPlan(...args) {
    warn('executeLayoutRepairPlan');
    return runtime.executeLayoutRepairPlan(...args);
  },
  buildLayoutDoctorReport(...args) {
    warn('buildLayoutDoctorReport');
    return runtime.buildLayoutDoctorReport(...args);
  }
};
