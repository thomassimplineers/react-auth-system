import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useSupabaseImage = (path: string | null | undefined) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!path) {
      console.log('No image path provided');
      setImageUrl(null);
      return;
    }

    console.log('Fetching image for path:', path);
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    console.log('Got public URL:', data?.publicUrl);
    
    if (data?.publicUrl) {
      setImageUrl(data.publicUrl);
    }
  }, [path]);

  return imageUrl;
}; 