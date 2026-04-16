-- RLS 활성화 (v2 - uuid::text 캐스팅 수정)

-- 1. RLS 활성화
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
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_fortunes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_analysis_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- 2. 정책 설정 (auth.uid()::text 캐스팅 적용)

CREATE POLICY "users_select" ON public.users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "users_update" ON public.users FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "credits_select" ON public.credits FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "credits_service" ON public.credits FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "saju_select" ON public.saju_results FOR SELECT USING (auth.uid()::text = user_id::text OR user_id IS NULL);
CREATE POLICY "saju_insert" ON public.saju_results FOR INSERT WITH CHECK (true);
CREATE POLICY "saju_service" ON public.saju_results FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "payments_select" ON public.payments FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "payments_service" ON public.payments FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "reports_select" ON public.premium_reports FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "reports_service" ON public.premium_reports FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "push_tokens_all" ON public.push_tokens FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "notif_all" ON public.notification_settings FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "referrals_select" ON public.referrals FOR SELECT USING (auth.uid()::text = referrer_id::text OR auth.uid()::text = referred_id::text);
CREATE POLICY "referrals_service" ON public.referrals FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "credit_merges_service" ON public.credit_merges FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "credit_adj_service" ON public.credit_adjustments FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "analytics_select" ON public.analytics_events FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "analytics_insert" ON public.analytics_events FOR INSERT WITH CHECK (true);

CREATE POLICY "inquiries_insert" ON public.inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "inquiries_service" ON public.inquiries FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "broker_all" ON public.broker_configs FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "push_camp_service" ON public.push_campaigns FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "admin_service" ON public.admin_profiles FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "announcements_select" ON public.announcements FOR SELECT USING (active = true);
CREATE POLICY "announcements_service" ON public.announcements FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "daily_fortunes_select" ON public.daily_fortunes FOR SELECT USING (true);
CREATE POLICY "daily_fortunes_service" ON public.daily_fortunes FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "daily_stats_select" ON public.daily_analysis_stats FOR SELECT USING (true);
CREATE POLICY "daily_stats_service" ON public.daily_analysis_stats FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "analysis_stats_select" ON public.analysis_stats FOR SELECT USING (true);
CREATE POLICY "analysis_stats_service" ON public.analysis_stats FOR ALL USING (auth.role() = 'service_role');
