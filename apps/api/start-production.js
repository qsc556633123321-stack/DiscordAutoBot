process.env.DASHBOARD_SERVE_WEB = 'true';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

require('./server');
