import { SignIn as ClerkSignIn } from '@clerk/clerk-react'

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass rounded-2xl p-8 border border-white/10">
        <ClerkSignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-transparent shadow-none',
              headerTitle: 'text-white',
              headerSubtitle: 'text-gray-400',
              socialButtonsBlockButton: 'bg-white/10 border-white/20 text-white hover:bg-white/20',
              formFieldLabel: 'text-gray-300',
              formFieldInput: 'bg-white/10 border-white/20 text-white',
              footerActionLink: 'text-blue-400 hover:text-blue-300',
              formButtonPrimary: 'bg-blue-500 hover:bg-blue-600',
              dividerLine: 'bg-white/20',
              dividerText: 'text-gray-500',
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/resumes"
        />
      </div>
    </div>
  )
}
