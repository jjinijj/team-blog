import {createClient} from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'team-blog',
    },
  },
  // ⭐ 중요: realtime 비활성화 (문제 원인일 수 있음)
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 연결 테스트
console.log('✅ Supabase 클라이언트 생성됨');
console.log('📍 URL:', supabaseUrl);