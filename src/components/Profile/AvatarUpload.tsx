import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useSupabaseImage } from '../../hooks/useSupabaseImage';

interface AvatarUploadProps {
  userId: string;
  avatarUrl: string | null;
  onUploadComplete: (url: string) => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ userId, avatarUrl, onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const imageUrl = useSupabaseImage(avatarUrl);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      onUploadComplete(filePath);
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Avatar"
          className="h-20 w-20 rounded-full object-cover"
        />
      ) : (
        <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No image</span>
        </div>
      )}
      <label className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-lg cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? (
          <span className="block h-8 w-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
        ) : (
          <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        )}
      </label>
    </div>
  );
};

export default AvatarUpload; 