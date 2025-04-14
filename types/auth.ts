export interface UserProfile {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  plan: 'free' | 'mensal' | 'anual';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    user_metadata: {
      avatar_url?: string;
      full_name?: string;
      name?: string;
    };
  } | null;
  profile: UserProfile | null;
}