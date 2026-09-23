const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

loadEnv();
const PORT = Number(process.env.PORT || 8080);
const ROOT = __dirname;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const MAX_QUERY_LENGTH = 500;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 30;
const rateBuckets = new Map();
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

const demoOpportunities = [
  { id: 'demo-business', title: 'Small Business Growth Grant', type: 'Grant', audience: 'business', amount: '$10,000–$50,000', score: 92, deadline: 'Rolling', provider: 'FundMatch demo source', description: 'A sample result used until verified provider feeds are configured.', url: 'https://www.grants.gov/' },
  { id: 'demo-school', title: 'Federal Student Aid and Scholarships', type: 'Grant / aid', audience: 'school', amount: 'Varies', score: 86, deadline: 'Varies', provider: 'Federal Student Aid', description: 'Start with official federal aid guidance and scholarship resources.', url: 'https://studentaid.gov/' },
  { id: 'demo-personal', title: 'Government Benefits Finder', type: 'Benefits', audience: 'personal', amount: 'Varies', score: 84, deadline: 'Varies', provider: 'USA.gov', description: 'Explore benefits and assistance programs based on your situation.', url: 'https://www.usa.gov/benefits' }
];

function loadEnv() {
  try {
    fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    });
  } catch (_) {}
}
function securityHeaders(res, requestId) {
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; upgrade-insecure-requests");
  if (IS_PRODUCTION) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
}
function json(res, status, body, requestId) { securityHeaders(res, requestId); res.setHeader('Content-Type', MIME['.json']); res.setHeader('Cache-Control', 'no-store'); res.writeHead(status); res.end(JSON.stringify(body)); }
function sendFile(res, file, requestId) {
  fs.readFile(file, (error, data) => { if (error) return json(res, 404, { error: 'Not found' }, requestId); securityHeaders(res, requestId); res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(data); });
}
function clientKey(req) { return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim(); }
function allowedRequest(req) {
  const now = Date.now(); const key = clientKey(req); let bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.started > RATE_WINDOW_MS) bucket = { started: now, count: 0 };
  bucket.count += 1; rateBuckets.set(key, bucket);
  if (rateBuckets.size > 5000) for (const [oldKey, oldBucket] of rateBuckets) if (now - oldBucket.started > RATE_WINDOW_MS) rateBuckets.delete(oldKey);
  return bucket.count <= RATE_LIMIT;
}
function safeUrl(value) { try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url : null; } catch (_) { return null; } }
async function fetchJson(url, headers = {}) { const response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) }); if (!response.ok) throw new Error(`Provider returned HTTP ${response.status}`); return response.json(); }
function normalize(item, source, audience) { return { id: `${source}-${item.id || item.opportunityNumber || item.programNumber || crypto.randomUUID()}`, title: item.title || item.opportunityTitle || item.programTitle || 'Funding opportunity', type: item.type || 'Opportunity', audience, amount: item.amount || item.awardCeiling || 'See provider', score: null, deadline: item.deadline || item.closeDate || 'See provider', provider: item.provider || item.agencyName || source, description: item.description || item.synopsis || 'Review eligibility and requirements at the official source.', url: safeUrl(item.url || item.applicationUrl || item.link)?.toString() || sourceUrl(source) }; }
function sourceUrl(source) { return source === 'SAM.gov' ? 'https://sam.gov/assistance-listings' : 'https://www.grants.gov/'; }
async function getOpportunities(query) {
  const audience = ['business', 'school', 'personal'].includes(query.get('path')) ? query.get('path') : null;
  const keyword = (query.get('query') || '').trim().slice(0, MAX_QUERY_LENGTH); const results = []; const sources = [];
  if (!audience) return { results: [], sources: [], live: false, notice: 'Choose a valid funding path.' };
  if (process.env.SAM_API_KEY) {
    try { const url = new URL(process.env.SAM_API_URL || 'https://api.sam.gov/assistance-listings/v1/search'); url.searchParams.set('api_key', process.env.SAM_API_KEY); if (keyword) url.searchParams.set('q', keyword); url.searchParams.set('size', '25'); const data = await fetchJson(url); const items = data.data || data.results || data.assistanceListings || []; results.push(...items.map(item => normalize(item, 'SAM.gov', audience))); sources.push('SAM.gov'); }
    catch (_) { sources.push('SAM.gov unavailable'); }
  }
  if (process.env.GRANTS_GOV_API_URL) {
    try { const url = new URL(process.env.GRANTS_GOV_API_URL); if (keyword) url.searchParams.set('keyword', keyword); const data = await fetchJson(url, process.env.GRANTS_GOV_API_KEY ? { Authorization: `Bearer ${process.env.GRANTS_GOV_API_KEY}` } : {}); const items = data.opportunities || data.results || data.data || []; results.push(...items.map(item => normalize(item, 'Grants.gov', audience))); sources.push('Grants.gov'); }
    catch (_) { sources.push('Grants.gov unavailable'); }
  }
  if (!results.length) results.push(...demoOpportunities.filter(item => item.audience === audience));
  return { results, sources, live: results.some(item => ['SAM.gov', 'Grants.gov'].includes(item.provider)), notice: sources.length ? 'Live provider results are shown when configured; other results are clearly marked as demo resources.' : 'Demo resources are shown. Add provider API keys in .env for live federal results.' };
}
const server = http.createServer(async (req, res) => {
  const requestId = crypto.randomUUID();
  if (!allowedRequest(req)) return json(res, 429, { error: 'Too many requests. Please try again later.', requestId }, requestId);
  const requestUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (requestUrl.pathname === '/api/health') return json(res, 200, { ok: true, providers: { sam: Boolean(process.env.SAM_API_KEY), grantsGov: Boolean(process.env.GRANTS_GOV_API_URL) } }, requestId);
  if (requestUrl.pathname === '/api/opportunities') {
    if (requestUrl.search.length > 1200) return json(res, 413, { error: 'Request too large.', requestId }, requestId);
    return json(res, 200, await getOpportunities(requestUrl.searchParams), requestId);
  }
  const requested = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
  const file = path.resolve(ROOT, `.${requested}`);
  if (!file.startsWith(ROOT + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return json(res, 404, { error: 'Not found', requestId }, requestId);
  sendFile(res, file, requestId);
});
server.listen(PORT, () => console.log(`FundMatch running at http://localhost:${PORT}`));
