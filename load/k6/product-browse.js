import http from 'k6/http';
import { check, sleep } from 'k6';

const baseUrl = __ENV.BASE_URL || 'http://localhost:8080';
const browseProfile = __ENV.K6_BROWSE_PROFILE || 'gateway-safe';

const stageProfiles = {
  'gateway-safe': [
    { duration: '20s', target: 5 },
    { duration: '40s', target: 10 },
    { duration: '20s', target: 15 },
    { duration: '20s', target: 0 },
  ],
  stress: [
    { duration: '30s', target: 20 },
    { duration: '60s', target: 80 },
    { duration: '30s', target: 120 },
    { duration: '20s', target: 0 },
  ],
};

export const options = {
  stages: stageProfiles[browseProfile] || stageProfiles['gateway-safe'],
  thresholds: {
    http_req_failed: [browseProfile === 'stress' ? 'rate<0.20' : 'rate<0.10'],
    http_req_duration: ['p(95)<800', 'p(99)<1200'],
  },
};

export default function () {
  const listRes = http.get(`${baseUrl}/api/products`);
  check(listRes, {
    'products list status 200/429': (r) => r.status === 200 || r.status === 429,
    'products list non-5xx': (r) => r.status < 500,
  });

  if (listRes.status === 200) {
    const products = listRes.json();
    if (Array.isArray(products) && products.length > 0) {
      const product = products[Math.floor(Math.random() * products.length)];
      const detailsRes = http.get(`${baseUrl}/api/products/${product._id}`);
      check(detailsRes, {
        'product details status 200/429': (r) => r.status === 200 || r.status === 429,
        'product details non-5xx': (r) => r.status < 500,
      });
    }
  }

  sleep(0.5);
}
