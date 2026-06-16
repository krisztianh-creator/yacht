import Link from 'next/link'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">yacht.</h1>
          <p className="text-sm text-muted-foreground mt-2">Admin Dashboard</p>
        </div>

        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-amber-800 mb-2">
              Registration Coming Soon
            </h2>
            <p className="text-sm text-amber-700">
              User registration is currently under development. Please contact your administrator to get access to the dashboard.
            </p>
          </div>

          <Link
            href="/login"
            className="inline-block w-full py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-secondary transition-colors text-center"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
