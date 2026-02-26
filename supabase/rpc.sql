-- RPC function to mark attendance
CREATE OR REPLACE FUNCTION public.mark_attendance(subj_id UUID, status_type TEXT)
RETURNS VOID AS $$
BEGIN
  -- Insert record
  INSERT INTO public.attendance_records (subject_id, status)
  VALUES (subj_id, status_type);

  -- Update subject counters
  IF status_type = 'present' THEN
    UPDATE public.subjects 
    SET total_classes = total_classes + 1, 
        attended_classes = attended_classes + 1
    WHERE id = subj_id;
  ELSIF status_type = 'absent' THEN
    UPDATE public.subjects 
    SET total_classes = total_classes + 1
    WHERE id = subj_id;
  END IF;
  
  -- 'leave' or 'cancelled' might not affect total/attended in the same way depending on rules
  -- For now assuming they don't count towards total classes attended logic, but 'leave' might be 'total+0, attended+0' 
  -- or exempt.
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
