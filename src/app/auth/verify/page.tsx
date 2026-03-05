export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-vara-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 bg-vara-navy rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2D7FF9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-2xl text-white mb-3">
          Check your email
        </h1>
        <p className="text-vara-slate font-body leading-relaxed">
          We&apos;ve sent a confirmation link to your email address. Click the link to
          verify your account and access your Vara dashboard.
        </p>
      </div>
    </div>
  );
}
