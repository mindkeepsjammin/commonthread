-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can view family members profiles"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT fm.user_id FROM public.family_memberships fm
      WHERE fm.family_id IN (
        SELECT family_id FROM public.family_memberships
        WHERE user_id = auth.uid()
      )
    )
  );

-- Families policies
CREATE POLICY "Users can view their families"
  ON public.families FOR SELECT
  USING (
    id IN (
      SELECT family_id FROM public.family_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create families"
  ON public.families FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update their families"
  ON public.families FOR UPDATE
  USING (
    id IN (
      SELECT family_id FROM public.family_memberships
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Family memberships policies
CREATE POLICY "Users can view memberships of their families"
  ON public.family_memberships FOR SELECT
  USING (
    family_id IN (
      SELECT family_id FROM public.family_memberships
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join families"
  ON public.family_memberships FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Reflections policies
CREATE POLICY "Users can view own reflections"
  ON public.reflections FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view shared reflections"
  ON public.reflections FOR SELECT
  USING (
    is_shareable = TRUE AND auth.uid() = ANY(shared_with)
  );

CREATE POLICY "Users can create own reflections"
  ON public.reflections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reflections"
  ON public.reflections FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own reflections"
  ON public.reflections FOR DELETE
  USING (user_id = auth.uid());

-- Relationships policies
CREATE POLICY "Users can view their relationships"
  ON public.relationships FOR SELECT
  USING (user_a = auth.uid() OR user_b = auth.uid());

-- Relational hearts policies
CREATE POLICY "Users can view hearts of their relationships"
  ON public.relational_hearts FOR SELECT
  USING (
    relationship_id IN (
      SELECT id FROM public.relationships
      WHERE user_a = auth.uid() OR user_b = auth.uid()
    )
  );

-- Alder Wyn conversations policies
CREATE POLICY "Users can view own conversations"
  ON public.alder_wyn_conversations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversations"
  ON public.alder_wyn_conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
  ON public.alder_wyn_conversations FOR UPDATE
  USING (user_id = auth.uid());

-- Sharing settings policies
CREATE POLICY "Users can view own sharing settings"
  ON public.sharing_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own sharing settings"
  ON public.sharing_settings FOR ALL
  USING (user_id = auth.uid());
