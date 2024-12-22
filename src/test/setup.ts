import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock fetch globalt
global.fetch = vi.fn();

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
  },
})); 