import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="font-sans text-primary-text min-h-screen" style={{backgroundColor: 'var(--primary-bg)'}}>
      {/* Navigation */}
      <nav className="px-4 sm:px-8 py-4 sm:py-6 border-b" style={{borderColor: 'var(--dividers-borders)'}}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-xl">
            <Image
              src="/jda-logo-horizontal.png"
              alt="JD Alchemy"
              width={180}
              height={60}
              className="h-8 sm:h-12 w-auto"
            />
          </div>
          <Link 
            href="/"
            className="button relative z-10 cursor-pointer hover:!bg-yellow-400 hover:!text-black transition-colors text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          {/* Error Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-black">
            Lead Qualification Not Found
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            The lead qualification you&apos;re looking for could not be found. This might happen if:
          </p>

          {/* Possible Reasons */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                The link is incorrect or has been modified
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                The qualification record has been removed
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                The link has expired or is no longer valid
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                There was a technical issue accessing the data
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book-a-call"
              className="button hover:!bg-yellow-400 hover:!text-black transition-colors inline-block"
            >
              Complete New Qualification
            </Link>
            <Link
              href="/"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors inline-block"
            >
              Return to Home
            </Link>
          </div>

          {/* Contact Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Need help? Contact our support team for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
