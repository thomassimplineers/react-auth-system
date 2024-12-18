export interface Thread {
  id: string;
  title: string;
  created_at: string;
  created_by: string;
  updated_at: string;
}

export type NewThread = Omit<Thread, 'id'>;
