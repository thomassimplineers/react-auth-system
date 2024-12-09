import { Auth } from '@supabase/ui'
import { supabaseClient } from '../../lib/supabaseClient'

export default function LoginForm() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Sign in to your account
          </h2>
        </div>
        <Auth.UserContextProvider supabaseClient={supabaseClient}>
          <Auth
            supabaseClient={supabaseClient}
            providers={['google', 'github']}
            view='sign_in'
          />
        </Auth.UserContextProvider>
      </div>
    </div>
  )
}