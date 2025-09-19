'use client';

import { useSearchParams } from 'next/navigation';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorType: string | null) => {
    switch (errorType) {
      case 'CredentialsSignin':
        return 'Invalid email or password';
      case 'AccessDenied':
        return 'You do not have permission to sign in';
      case 'Configuration':
        return 'There is a problem with the server configuration';
      default:
        return 'An error occurred during sign in';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Error
          </h2>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{getErrorMessage(error)}</span>
        </div>
        <div className="text-center">
          <a
            href="/auth/signin"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Return to sign in
          </a>
        </div>
      </div>
    </div>
  );
}
