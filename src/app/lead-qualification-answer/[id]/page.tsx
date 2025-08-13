import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ContactData {
  id: string;
  fullName: string;
  email: string;
  linkedinProfile: string;
  companyWebsite: string;
  pitchDeckUrl: string | null;
  calendlyScheduledTime: string | null;
  calendlyScheduledTimeRaw: string | null;
  meetingLink: string | null;
  answers: Record<string, string | string[]>;
  questions: Record<string, {
    type: string;
    label: string;
    options?: string[];
  }>;
  submittedAt: string;
}

async function getContactData(id: string): Promise<ContactData | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/lead-qualification/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching contact data:', error);
    return null;
  }
}

export default async function LeadQualificationAnswerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contactData = await getContactData(id);
  
  if (!contactData) {
    notFound();
  }

  const formatAnswer = (answer: string | string[]): string => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer || 'Not answered';
  };

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

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
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8 pb-8 border-b border-gray-200">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-black">
              Lead Qualification Answers
            </h1>
            <p className="text-gray-600 mb-4">
              Submitted on {formatDate(contactData.submittedAt)}
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✓ Qualification Complete
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6 text-black border-b border-gray-200 pb-2">
              Contact Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-black font-medium">{contactData.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-black font-medium">{contactData.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                <a 
                  href={contactData.linkedinProfile} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium break-all"
                >
                  {contactData.linkedinProfile}
                </a>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Website</label>
                <a 
                  href={contactData.companyWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium break-all"
                >
                  {contactData.companyWebsite}
                </a>
              </div>
            </div>
          </div>

          {/* Pitch Deck Section */}
          {contactData.pitchDeckUrl && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-black border-b border-gray-200 pb-2">
                Pitch Deck
              </h2>
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-black mb-2">Submitted Pitch Deck</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      The prospect has uploaded their pitch deck for review.
                    </p>
                    <a
                      href={contactData.pitchDeckUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Pitch Deck
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meeting Information */}
          {(contactData.calendlyScheduledTime || contactData.meetingLink) && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6 text-black border-b border-gray-200 pb-2">
                Scheduled Meeting
              </h2>
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold text-black mb-2">Discovery Call Scheduled</h3>
                    {contactData.calendlyScheduledTime && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time:</label>
                        <p className="text-black font-medium">{contactData.calendlyScheduledTime}</p>
                        <p className="text-gray-500 text-xs mt-1">(GMT+7 - Asia/Ho Chi Minh Time)</p>
                      </div>
                    )}
                    {contactData.meetingLink && (
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link:</label>
                        <a
                          href={contactData.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Questions and Answers */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-black border-b border-gray-200 pb-2">
              Qualification Answers
            </h2>
            <div className="space-y-6">
              {Object.entries(contactData.questions).map(([key, question]) => {
                const answer = contactData.answers[key];
                const otherAnswer = contactData.answers[`${key}_other`];
                const questionNumber = key.replace('Question ', '');
                
                return (
                  <div key={key} className="bg-gray-50 rounded-lg p-6">
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-black">
                        {questionNumber}. {question.label}
                      </h3>
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {question.type}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer:</label>
                      <p className="text-black font-medium bg-white px-3 py-2 rounded border">
                        {formatAnswer(answer)}
                      </p>
                    </div>
                    
                    {otherAnswer && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details:</label>
                        <p className="text-black font-medium bg-white px-3 py-2 rounded border">
                          {otherAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              This qualification was completed through JD Alchemy&apos;s lead qualification system.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Record ID: {contactData.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contactData = await getContactData(id);
  
  if (!contactData) {
    return {
      title: 'Lead Qualification Not Found',
    };
  }

  return {
    title: `Lead Qualification - ${contactData.fullName}`,
    description: `Lead qualification answers for ${contactData.fullName}`,
  };
}
