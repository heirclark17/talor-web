import { SignIn as ClerkSignIn } from '@clerk/clerk-react'

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass rounded-2xl p-8 border border-theme-subtle">
        <ClerkSignIn
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-transparent shadow-none',
              headerTitle: 'text-theme',
              headerSubtitle: 'text-theme-secondary',
              socialButtonsBlockButton: 'bg-theme-glass-10 border-theme-muted text-theme hover:bg-theme-glass-20',
              formFieldLabel: 'text-theme-secondary',
              formFieldInput: 'bg-theme-glass-10 border-theme-muted text-theme',
              footerActionLink: 'text-blue-400 hover:text-blue-300',
              formButtonPrimary: 'bg-blue-500 hover:bg-blue-600',
              dividerLine: 'bg-theme-glass-20',
              dividerText: 'text-theme-tertiary',
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
