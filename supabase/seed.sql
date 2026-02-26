-- Seed Data for 75% Attendance Tracker

-- Note: This assumes you have created a user via Supabase Auth and know their UUID.
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from auth.users

-- 1. Insert configured Academic Year (optional, if you rely on triggers)
-- INSERT INTO public.academic_years ...

-- 2. Insert Subjects for a specific student
WITH users AS (
    SELECT id FROM auth.users LIMIT 1 -- Just grabs the first user for testing
)
INSERT INTO public.subjects (student_id, name, total_classes, attended_classes, target_attendance)
SELECT 
    users.id, 
    s.name, 
    s.total, 
    s.attended, 
    75
FROM users, (VALUES 
    ('Mathematics', 40, 35),
    ('Physics', 35, 20), -- Low attendance
    ('Computer Science', 50, 48), -- High attendance
    ('Electronics', 30, 22),
    ('English', 25, 18)
) AS s(name, total, attended)
ON CONFLICT DO NOTHING;

-- 3. Insert Attendance Records
-- We'll generate some random records for the last 30 days for these subjects
DO $$
DECLARE
    u_id UUID;
    subj RECORD;
    day_offset INT;
    status TEXT;
BEGIN
    SELECT id INTO u_id FROM auth.users LIMIT 1;
    
    FOR subj IN SELECT * FROM public.subjects WHERE student_id = u_id LOOP
        -- Generate 20 records per subject
        FOR day_offset IN 0..20 LOOP
            -- Random status
            IF (random() > 0.3) THEN
                status := 'present';
            ELSE
                status := 'absent';
            END IF;
            
            INSERT INTO public.attendance_records (subject_id, date, status)
            VALUES (
                subj.id, 
                NOW() - (day_offset || ' days')::INTERVAL, 
                status
            );
        END LOOP;
    END LOOP;
END $$;
