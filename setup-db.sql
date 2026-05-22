-- Database Setup for NaijaPredictor

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  points NUMERIC DEFAULT 10,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.markets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  status TEXT DEFAULT 'open', 
  outcome TEXT, 
  total_yes NUMERIC DEFAULT 0,
  total_no NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.bets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  market_id UUID REFERENCES public.markets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  choice TEXT NOT NULL, 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, points, is_admin)
  VALUES (new.id, new.email, 10, new.email = 'aquilaayokunle@outlook.com');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

CREATE OR REPLACE FUNCTION place_bet(
  p_market_id UUID,
  p_amount NUMERIC,
  p_choice TEXT
) RETURNS VOID AS $$
DECLARE
  v_user_points NUMERIC;
  v_market_status TEXT;
BEGIN
  SELECT points INTO v_user_points FROM public.profiles WHERE id = auth.uid();
  IF v_user_points < p_amount THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;

  SELECT status INTO v_market_status FROM public.markets WHERE id = p_market_id;
  IF v_market_status != 'open' THEN
    RAISE EXCEPTION 'Market is not open';
  END IF;

  UPDATE public.profiles SET points = points - p_amount WHERE id = auth.uid();

  INSERT INTO public.bets (market_id, user_id, amount, choice)
  VALUES (p_market_id, auth.uid(), p_amount, p_choice);

  IF p_choice = 'yes' THEN
    UPDATE public.markets SET total_yes = total_yes + p_amount WHERE id = p_market_id;
  ELSE
    UPDATE public.markets SET total_no = total_no + p_amount WHERE id = p_market_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION resolve_market(
  p_market_id UUID,
  p_outcome TEXT
) RETURNS VOID AS $$
DECLARE
  v_total_yes NUMERIC;
  v_total_no NUMERIC;
  v_total_pool NUMERIC;
  v_winning_pool NUMERIC;
  b RECORD;
  v_payout NUMERIC;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT total_yes, total_no INTO v_total_yes, v_total_no FROM public.markets WHERE id = p_market_id;
  v_total_pool := v_total_yes + v_total_no;
  
  IF p_outcome = 'yes' THEN
    v_winning_pool := v_total_yes;
  ELSE
    v_winning_pool := v_total_no;
  END IF;

  UPDATE public.markets 
  SET status = 'resolved', outcome = p_outcome, resolved_at = now() 
  WHERE id = p_market_id;

  IF v_winning_pool > 0 THEN
    FOR b IN SELECT * FROM public.bets WHERE market_id = p_market_id AND choice = p_outcome
    LOOP
      v_payout := (b.amount / v_winning_pool) * v_total_pool;
      UPDATE public.profiles SET points = points + v_payout WHERE id = b.user_id;
    END LOOP;
  ELSE
    FOR b IN SELECT * FROM public.bets WHERE market_id = p_market_id
    LOOP
      UPDATE public.profiles SET points = points + b.amount WHERE id = b.user_id;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
