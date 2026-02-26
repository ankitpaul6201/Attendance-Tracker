-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Students Table (Extends Supabase Auth)
CREATE TABLE public.students (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    mode TEXT CHECK (mode IN ('school', 'college')) NOT NULL DEFAULT 'college',
    overall_target_attendance INT DEFAULT 75,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Academic Years (For School Mode)
CREATE TABLE public.academic_years (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    year_label TEXT NOT NULL, -- e.g., "Class 10 (2025-2026)"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Semesters (For College Mode)
CREATE TABLE public.semesters (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Semester 1", "Semester 6"
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Subjects
CREATE TABLE public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES public.semesters(id) ON DELETE CASCADE, -- Nullable if school mode
    academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE, -- Nullable if college mode
    name TEXT NOT NULL,
    total_classes INT DEFAULT 0,
    attended_classes INT DEFAULT 0,
    target_attendance INT DEFAULT 75,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Attendance Records (Granular logs)
CREATE TABLE public.attendance_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT CHECK (status IN ('present', 'absent', 'leave', 'cancelled')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see/edit their own data
CREATE POLICY "Users can view own profile" ON public.students FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.students FOR UPDATE USING ((select auth.uid()) = id);

CREATE POLICY "Users can view own years" ON public.academic_years FOR SELECT USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can insert own years" ON public.academic_years FOR INSERT WITH CHECK ((select auth.uid()) = student_id);
CREATE POLICY "Users can update own years" ON public.academic_years FOR UPDATE USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can delete own years" ON public.academic_years FOR DELETE USING ((select auth.uid()) = student_id);

CREATE POLICY "Users can view own semesters" ON public.semesters FOR SELECT USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can insert own semesters" ON public.semesters FOR INSERT WITH CHECK ((select auth.uid()) = student_id);
CREATE POLICY "Users can update own semesters" ON public.semesters FOR UPDATE USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can delete own semesters" ON public.semesters FOR DELETE USING ((select auth.uid()) = student_id);

CREATE POLICY "Users can view own subjects" ON public.subjects FOR SELECT USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can insert own subjects" ON public.subjects FOR INSERT WITH CHECK ((select auth.uid()) = student_id);
CREATE POLICY "Users can update own subjects" ON public.subjects FOR UPDATE USING ((select auth.uid()) = student_id);
CREATE POLICY "Users can delete own subjects" ON public.subjects FOR DELETE USING ((select auth.uid()) = student_id);

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

-- Trigger to handle new user signup
-- Note: 'mode' and 'full_name' must be passed in raw_user_meta_data during signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.students (id, email, full_name, mode)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'Student'), 
    COALESCE(new.raw_user_meta_data->>'mode', 'college')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists to avoid error on rerun
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
