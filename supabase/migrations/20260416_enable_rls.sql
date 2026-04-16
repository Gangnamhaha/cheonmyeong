-- ============================================
-- RLS (Row-Level Security) 활성화 마이그레이션
-- 생성일: 2026-04-16
-- 이유: Supabase 보안 경고 - 전체 테이블 공개 접근 취약점 해결
-- ============================================

-- 1. 모든 테이블에 RLS 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saju_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_merges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_campaigns ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 가능한 테이블 (RLS 활성화 후 읽기 허용)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analysis_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. RLS 정책 설정
-- ============================================

-- [users] 본인 데이터만 접근
CREATE POLICY "users: 본인만 읽기" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users: 본인만 수정" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- [credits] 본인 크레딧만 접근
CREATE POLICY "credits: 본인만 읽기" ON public.credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "credits: 서버만 수정" ON public.credits
  FOR ALL USING (auth.role() = 'service_role');

-- [saju_results] 본인 결과만 접근 (비로그인 시 자신이 생성한 것)
CREATE POLICY "saju_results: 본인만 읽기" ON public.saju_results
  FOR SELECT USING (
    auth.uid() = user_id
    OR user_id IS NULL  -- 비회원 결과도 공개
  );

CREATE POLICY "saju_results: 누구나 생성" ON public.saju_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "saju_results: 서버만 수정" ON public.saju_results
  FOR UPDATE USING (auth.role() = 'service_role');

-- [payments] 본인 결제 내역만
CREATE POLICY "payments: 본인만 읽기" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "payments: 서버만 관리" ON public.payments
  FOR ALL USING (auth.role() = 'service_role');

-- [premium_reports] 본인 리포트만
CREATE POLICY "premium_reports: 본인만 읽기" ON public.premium_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "premium_reports: 서버만 관리" ON public.premium_reports
  FOR ALL USING (auth.role() = 'service_role');

-- [push_tokens] 본인 토큰만
CREATE POLICY "push_tokens: 본인만 접근" ON public.push_tokens
  FOR ALL USING (auth.uid() = user_id);

-- [notification_settings] 본인 설정만
CREATE POLICY "notification_settings: 본인만 접근" ON public.notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- [referrals] 본인 관련만
CREATE POLICY "referrals: 본인만 읽기" ON public.referrals
  FOR SELECT USING (
    auth.uid() = referrer_id
    OR auth.uid() = referred_id
  );

CREATE POLICY "referrals: 서버만 관리" ON public.referrals
  FOR ALL USING (auth.role() = 'service_role');

-- [credit_merges] 서버만
CREATE POLICY "credit_merges: 서버만" ON public.credit_merges
  FOR ALL USING (auth.role() = 'service_role');

-- [credit_adjustments] 서버만
CREATE POLICY "credit_adjustments: 서버만" ON public.credit_adjustments
  FOR ALL USING (auth.role() = 'service_role');

-- [analytics_events] 본인 이벤트만
CREATE POLICY "analytics_events: 본인만" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "analytics_events: 누구나 생성" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

-- [inquiries] 누구나 생성, 본인만 읽기
CREATE POLICY "inquiries: 누구나 생성" ON public.inquiries
  FOR INSERT WITH CHECK (true);

CREATE POLICY "inquiries: 서버만 읽기" ON public.inquiries
  FOR SELECT USING (auth.role() = 'service_role');

-- [broker_configs] 본인만
CREATE POLICY "broker_configs: 본인만" ON public.broker_configs
  FOR ALL USING (auth.uid() = user_id);

-- [push_campaigns] 서버만 관리
CREATE POLICY "push_campaigns: 서버만" ON public.push_campaigns
  FOR ALL USING (auth.role() = 'service_role');

-- [admin_profiles] 관리자만
CREATE POLICY "admin_profiles: 서버만" ON public.admin_profiles
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 공개 읽기 테이블 정책
-- ============================================

-- [announcements] 누구나 읽기
CREATE POLICY "announcements: 공개 읽기" ON public.announcements
  FOR SELECT USING (active = true);

CREATE POLICY "announcements: 서버만 관리" ON public.announcements
  FOR ALL USING (auth.role() = 'service_role');

-- [daily_fortunes] 누구나 읽기
CREATE POLICY "daily_fortunes: 공개 읽기" ON public.daily_fortunes
  FOR SELECT USING (true);

CREATE POLICY "daily_fortunes: 서버만 관리" ON public.daily_fortunes
  FOR ALL USING (auth.role() = 'service_role');

-- [daily_analysis_stats] 공개 읽기
CREATE POLICY "daily_analysis_stats: 공개 읽기" ON public.daily_analysis_stats
  FOR SELECT USING (true);

CREATE POLICY "daily_analysis_stats: 서버만 관리" ON public.daily_analysis_stats
  FOR ALL USING (auth.role() = 'service_role');

-- [analysis_stats] 공개 읽기 (총 분석 수 표시용)
CREATE POLICY "analysis_stats: 공개 읽기" ON public.analysis_stats
  FOR SELECT USING (true);

CREATE POLICY "analysis_stats: 서버만 관리" ON public.analysis_stats
  FOR ALL USING (auth.role() = 'service_role');
