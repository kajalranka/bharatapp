import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://ogpmmmseicotmgyyzeyg.supabase.co"; // your actual URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ncG1tbXNlaWNvdG1neXl6ZXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMDAwNTcsImV4cCI6MjA2MTY3NjA1N30.gjZWOydIS3Xiu1T9LurNiTv1XxcfOaOgWiuedZ4wSAc"; // your public API key

const supabase = createClient(supabaseUrl, supabaseKey);
export default supabase;
