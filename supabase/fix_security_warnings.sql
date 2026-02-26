-- ==============================================================================
-- 🚨 SUPABASE SECURITY ADVISOR FIXES
-- ==============================================================================
-- Run this entire script in your Supabase SQL Editor to resolve the warnings.

-- 1. Fix: Function Search Path Mutable (Security Definer vulnerabilities)
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.mark_attendance(UUID, TEXT) SET search_path = public;

-- ==============================================================================
-- 2. Fix: Auth RLS Initialization Plan
-- Optimizing all policies to use `(select auth.uid())` instead of `auth.uid()`
-- to prevent triggering the `current_setting()` evaluation on every row.
-- ==============================================================================

-- Drop existing suboptimal policies for Students
DROP POLICY IF EXISTS "Users can view own profile" ON public.students;
DROP POLICY IF EXISTS "Users can update own profile" ON public.students;

-- Recreate optimized policies for Students
CREATE POLICY "Users can view own profile" ON public.students FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.students FOR UPDATE USING ((select auth.uid()) = id);

-- ==============================================================================
-- 3. Fix: Multiple Permissive Policies & RLS Plan (Combined fix)
-- Dropping redundant policies (e.g., FOR ALL overlapping with FOR INSERT/UPDATE)
-- and optimizing them to use `(select auth.uid())`.
-- ==============================================================================

-- Academic Years
DROP POLICY IF EXISTS "Users can view own years" ON public.academic_years;
DROP POLICY IF EXISTS "Users can insert own years" ON public.academic_years;
DROP POLICY IF EXISTS "Users can update own years" ON public.academic_years;
DROP POLICY IF EXISTS "Users can delete own years" ON public.academic_years;

CREATE POLICY "Users can view own years" ON public.academic_years FOR SELECT USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can insert own years" ON public.academic_years FOR INSERT WITH CHECK ((select auth.uid()) = student_id);
CREATE POLICY "Users can update own years" ON public.academic_years FOR UPDATE USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can delete own years" ON public.academic_years FOR DELETE USING ((select auth.uid()) = student_id);

-- Semesters
DROP POLICY IF EXISTS "Users can view own semesters" ON public.semesters;
DROP POLICY IF EXISTS "Users can insert own semesters" ON public.semesters;
DROP POLICY IF EXISTS "Users can update own semesters" ON public.semesters;
DROP POLICY IF EXISTS "Users can delete own semesters" ON public.semesters;

CREATE POLICY "Users can view own semesters" ON public.semesters FOR SELECT USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can insert own semesters" ON public.semesters FOR INSERT WITH CHECK ((select auth.uid()) = student_id);
CREATE POLICY "Users can update own semesters" ON public.semesters FOR UPDATE USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can delete own semesters" ON public.semesters FOR DELETE USING ((select auth.uid()) = student_id);

-- Subjects
DROP POLICY IF EXISTS "Users can view own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can insert own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can update own subjects" ON public.subjects;
DROP POLICY IF EXISTS "Users can delete own subjects" ON public.subjects;

CREATE POLICY "Users can view own subjects" ON public.subjects FOR SELECT USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can insert own subjects" ON public.subjects FOR INSERT WITH CHECK ((select auth.uid()) = student_id);
CREATE POLICY "Users can update own subjects" ON public.subjects FOR UPDATE USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can delete own subjects" ON public.subjects FOR DELETE USING ((select auth.uid()) = student_id);

-- Attendance Records
DROP POLICY IF EXISTS "Users can view own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can insert own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can update own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Users can delete own attendance" ON public.attendance_records;

CREATE POLICY "Users can view own attendance" ON public.attendance_records FOR SELECT USING (
    subject_id IN (SELECT id FROM public.subjects WHERE student_id = (select auth.uid()))
);
CREATE POLICY "Users can insert own attendance" ON public.attendance_records FOR INSERT WITH CHECK (
    subject_id IN (SELECT id FROM public.subjects WHERE student_id = (select auth.uid()))
);
CREATE POLICY "Users can update own attendance" ON public.attendance_records FOR UPDATE USING (
    subject_id IN (SELECT id FROM public.subjects WHERE student_id = (select auth.uid()))
);
CREATE POLICY "Users can delete own attendance" ON public.attendance_records FOR DELETE USING (
    subject_id IN (SELECT id FROM public.subjects WHERE student_id = (select auth.uid()))
);

-- Calendar Notes (Since these only exist on Supabase and not in local schema files)
-- PLEASE READ: Assuming your column is named `user_id`. If it's `student_id` or just `id`, change it below!
DROP POLICY IF EXISTS "Users can view own notes" ON public.calendar_notes;
DROP POLICY IF EXISTS "Users can view their own notes" ON public.calendar_notes;
DROP POLICY IF EXISTS "Users can insert own notes" ON public.calendar_notes;
DROP POLICY IF EXISTS "Users can insert their own notes" ON public.calendar_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.calendar_notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.calendar_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.calendar_notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.calendar_notes;
DROP POLICY IF EXISTS "Users can modify their own notes" ON public.calendar_notes;

CREATE POLICY "Users can view own notes" ON public.calendar_notes FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert own notes" ON public.calendar_notes FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can update own notes" ON public.calendar_notes FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete own notes" ON public.calendar_notes FOR DELETE USING ((select auth.uid()) = user_id);
