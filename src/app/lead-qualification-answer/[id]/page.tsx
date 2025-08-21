import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Question {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  answer?: string | string[];
}

interface SectionAnswer {
  title: string;
  description: string;
  questions: Question[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  airtableMapping: string;
  questions: Question[];
}

interface ContactData {
  id: string;
  fullName: string;
  email: string;
  linkedinProfile: string;
  companyWebsite: string;
  applicantRole: string;
  pitchDeckUrl: string | null;
  pitchDeckAnalysisReportLink: string | null;
  calendlyScheduledTime: string | null;
  calendlyScheduledTimeRaw: string | null;
  meetingLink: string | null;
  aiScreeningScore: string | null;
  aiScreeningDetail: string | null;
  sections: Section[];
  sectionAnswers: Record<string, SectionAnswer>;
  submittedAt: string;
}

async function getContactData(id: string): Promise<ContactData | null> {
  try {
    // For server-side rendering in production, construct the proper URL
    let baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    if (!baseUrl) {
      // Try to determine the base URL from environment
      const host = process.env.VERCEL_URL || process.env.HOST || 'localhost';
      const port = process.env.PORT || '3000';
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      
      if (host.includes('localhost') || host.includes('127.0.0.1')) {
        baseUrl = `http://${host}:${port}`;
      } else if (host.includes(':')) {
        // Host already includes port
        baseUrl = `${protocol}://${host}`;
      } else {
        baseUrl = `${protocol}://${host}:${port}`;
      }
    }
    
    console.log('Environment info:', {
      NODE_ENV: process.env.NODE_ENV,
      HOST: process.env.HOST,
      PORT: process.env.PORT,
      VERCEL_URL: process.env.VERCEL_URL,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      constructedBaseUrl: baseUrl
    });
    
    const apiUrl = `${baseUrl}/api/lead-qualification/${id}`;
    console.log('Fetching contact data from:', apiUrl);
    
    const response = await fetch(apiUrl, {
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

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
}

function formatAnswer(answer: string | string[] | undefined, question: Question): string {
  if (!answer) return 'Not answered';
  
  if (Array.isArray(answer)) {
    return answer.join(', ');
  }
  
  if (question.type === 'checkbox' && typeof answer === 'string') {
    // Handle comma-separated checkbox values
    return answer.split(', ').join(', ');
  }
  
  return String(answer);
}

export default async function LeadQualificationAnswerPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const contactData = await getContactData(id);

  if (!contactData) {
    notFound();
  }

  return (
    <div className="font-sans text-primary-text min-h-screen" style={{backgroundColor: 'var(--primary-bg)'}}>
      {/* Navigation */}
      <nav className="px-4 sm:px-8 py-4 sm:py-6 border-b" style={{borderColor: 'var(--dividers-borders)'}}>
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="text-white font-bold text-xl">
            <Image
              src="/ff_logo.png"
              alt="Fundraising Flywheel"
              width={210}
              height={65}
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
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl sm:shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-gray-200">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-black">
              Lead Qualification Answers
            </h1>
            <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
              Submitted on {formatDate(contactData.submittedAt)}
            </p>
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
              ✓ Qualification Complete
            </div>
          </div>

          {/* AI Screening Section */}
          {(contactData.aiScreeningScore || contactData.aiScreeningDetail) && (
            <div className="mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-black border-b border-gray-200 pb-2">
                AI Screening Results
              </h2>
              
              {contactData.aiScreeningScore && (
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {(() => {
                        const score = contactData.aiScreeningScore;
                        const isAccept = score.includes('ACCEPT');
                        const isWaitlist = score.includes('WAITLIST');
                        const isDecline = score.includes('DECLINE');
                        
                        return (
                          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                            isAccept ? 'bg-green-500' : 
                            isWaitlist ? 'bg-yellow-500' : 
                            isDecline ? 'bg-red-500' : 'bg-gray-500'
                          }`}>
                            {score.split(' ')[0]} {/* Extract score like "11/15" */}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg sm:text-xl font-bold text-black mb-1">
                        Screening Score: {contactData.aiScreeningScore}
                      </h3>
                      <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap gap-2 sm:gap-4">
                        <span className="inline-block">✅ Accept: ≥ 9/15</span>
                        <span className="inline-block">⏳ Waitlist: 7-8/15</span>
                        <span className="inline-block">❌ Decline: ≤ 6/15</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {contactData.aiScreeningDetail && (
                <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                  <h4 className="text-base sm:text-lg font-semibold text-black mb-2 sm:mb-3">Detailed Analysis</h4>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {contactData.aiScreeningDetail}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Contact Information Section */}
          {contactData.sectionAnswers.contact && (
            <div className="mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-black border-b border-gray-200 pb-2">
                {contactData.sectionAnswers.contact.title}
              </h2>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{contactData.sectionAnswers.contact.description}</p>
              
              <div className="space-y-6">
                {contactData.sectionAnswers.contact.questions.map((question, index) => (
                  <div key={`contact-${index}`} className="bg-gray-50 rounded-lg p-4 sm:p-6">
                    <div className="mb-2">
                      <h3 className="text-base sm:text-lg font-semibold text-black mb-1">
                        {question.label}
                      </h3>
                      <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {question.type}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer:</label>
                      <div className="text-black font-medium bg-white px-3 py-2 rounded border text-sm sm:text-base">
                        {(question.type === 'file' || (question.answer && String(question.answer).includes('api/serve-pitch-deck'))) && question.answer ? (
                          <div className="space-y-2">
                            {String(question.answer).split(', ').map((url, fileIndex) => (
                              <a
                                key={fileIndex}
                                href={url.trim()}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium mr-2 mb-2"
                              >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download File {String(question.answer).split(', ').length > 1 ? (fileIndex + 1) : ''}
                              </a>
                            ))}
                          </div>
                        ) : question.type === 'url' && question.answer ? (
                          <a 
                            href={String(question.answer)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 break-all"
                          >
                            {formatAnswer(question.answer, question)}
                          </a>
                        ) : (
                          <div className="whitespace-pre-line">
                            {formatAnswer(question.answer, question)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pitch Deck Section */}
          {contactData.pitchDeckUrl && (
            <div className="mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-black border-b border-gray-200 pb-2">
                Materials
              </h2>
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
                                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-base sm:text-lg font-semibold text-black mb-2">Submitted Materials</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-3">
                        The prospect has uploaded their materials for review.
                      </p>
                    <div className="space-y-2">
                      {contactData.pitchDeckUrl?.split(', ').map((url, index) => (
                        <a
                          key={index}
                          href={url.trim()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium mr-2 mb-2"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download File {contactData.pitchDeckUrl && contactData.pitchDeckUrl.split(', ').length > 1 ? (index + 1) : ''}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pitch Deck Analysis Section */}
          {contactData.pitchDeckAnalysisReportLink && (
            <div className="mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-black border-b border-gray-200 pb-2">
                Pitch Deck Analysis
              </h2>
              <div className="bg-purple-50 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-base sm:text-lg font-semibold text-black mb-2">Automated Analysis Report</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-4">
                      Our AI system has analyzed the submitted pitch deck and generated a comprehensive report with scoring and recommendations.
                    </p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-purple-700 bg-purple-100 px-2 sm:px-3 py-1 rounded-full">
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Analysis Complete
                      </div>
                    </div>
                    <a
                      href={contactData.pitchDeckAnalysisReportLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Analysis Report
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Meeting Information */}
          {(contactData.calendlyScheduledTime || contactData.meetingLink) && (
            <div className="mb-8 sm:mb-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-black border-b border-gray-200 pb-2">
                Scheduled Meeting
              </h2>
              <div className="bg-green-50 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-base sm:text-lg font-semibold text-black mb-2">Discovery Call Scheduled</h3>
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
                          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
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

          {/* MORE INFORMATION NEEDED Section */}
          <div className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-black border-b border-gray-200 pb-2">
              MORE INFORMATION NEEDED
            </h2>
            <div className="bg-orange-50 rounded-lg p-4 sm:p-6">
              <div className="space-y-6">
                {/* Founder's Origin Story */}
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-orange-200">
                  <h3 className="text-base sm:text-lg font-semibold text-black mb-2 flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Founder&apos;s Origin Story
                  </h3>
                  <p className="text-gray-700 text-xs sm:text-sm mb-3">
                    The founder&apos;s personal journey or the specific &quot;aha&quot; moment that led to the company&apos;s creation.
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded border">
                      <p className="font-semibold text-black text-xs sm:text-sm mb-1">Questions to ask:</p>
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-1 ml-4">
                        <li className="list-disc">What was your personal journey that led you to start this company?</li>
                        <li className="list-disc">Was there a specific &quot;aha&quot; moment or experience that sparked the idea?</li>
                        <li className="list-disc">What problem were you personally facing that made you realize this needed to be solved?</li>
                        <li className="list-disc">How did your background/experience uniquely position you to see this opportunity?</li>
                        <li className="list-disc">What made you decide to leave your previous situation to pursue this full-time?</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* List of Competitor Names */}
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-orange-200">
                  <h3 className="text-base sm:text-lg font-semibold text-black mb-2 flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    List of Competitor Names
                  </h3>
                  <p className="text-gray-700 text-xs sm:text-sm mb-3">
                    To map the existing &quot;narrative warfare&quot; in their industry
                  </p>
                  <div className="space-y-3">
                    <div className="p-3 bg-gray-50 rounded border">
                      <p className="font-semibold text-black text-xs sm:text-sm mb-1">Questions to ask:</p>
                      <ul className="text-xs sm:text-sm text-gray-700 space-y-1 ml-4">
                        <li className="list-disc">Who are your top 5-7 direct competitors by name?</li>
                        <li className="list-disc">Which companies do investors typically mention when they hear your pitch?</li>
                        <li className="list-disc">Who are the adjacent/indirect competitors that solve similar problems differently?</li>
                        <li className="list-disc">What are the key narrative themes or messaging angles your competitors use?</li>
                        <li className="list-disc">Which competitor do you get compared to most often, and why?</li>
                        <li className="list-disc">Are there any emerging players or stealth competitors we should be aware of?</li>
                        <li className="list-disc">What narrative gaps exist that your competitors haven&apos;t claimed yet?</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* More Questions */}
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-orange-200">
                  <h3 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4 flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    More Questions Need to be Answered
                  </h3>
                  <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4">
                    <strong>Deep Intake Interview Questions</strong> (for accepted fits; concise but rich)
                  </p>

                  <div className="space-y-4 sm:space-y-6">
                    <ol className="space-y-4 text-xs sm:text-sm">
                      <li className="flex">
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">How do you currently handle founder thought-leadership content?</p>
                          <p className="text-gray-600 text-xs italic mb-2">Choose one: In-house (founder/team), Outsourced agency/PR, Generic AI tools, or No formal process</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Ask about their current content creation process, who writes it, how often they publish, and what platforms they use. This helps understand their existing narrative capabilities.
                          </p>
                        </div>
                      </li>

                      <li className="flex">
                        
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">What are your primary channels & cadence over the last 60 days?</p>
                          <p className="text-gray-600 text-xs italic mb-2">List all that apply: LinkedIn, YouTube, X/Twitter, Podcast, Blog/Newsletter, Other (include average cadence per week by channel)</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Get specific numbers - how many posts per week on each platform, which channels get the most engagement, and what content types perform best. This reveals their current reach and audience.
                          </p>
                        </div>
                      </li>

                      <li className="flex">
                        
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">Which narrative edges can we credibly lean on?</p>
                          <p className="text-gray-600 text-xs italic mb-2">List all that strongly apply: Technical moat, Category creation/contrarian thesis, Regulatory/compliance advantage, Team pedigree/prior exits, Customer proof/ROI evidence, Ecosystem/standards leadership, Data advantage</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Ask for specific examples and proof points for each edge they claim. What patents do they have? What customer ROI can they demonstrate? This determines which narratives are actually defensible.
                          </p>
                        </div>
                      </li>

                      {/* <li className="flex">
                        
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">What are your primary sectors and target markets?</p>
                          <p className="text-gray-600 text-xs italic mb-2">Sectors: AI/ML, SaaS, Fintech, Health/Medtech, Industrial/Robotics, Cybersecurity, Climate/Energy, Gov/Defense, Consumer, Other<br/>
                          Markets: US, Canada, UK/EU, Middle East, APAC (ex-JP/KR), Japan, Korea, Other</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Get their top 2-3 sectors and markets, plus specific sub-sectors or verticals. Ask about their current customer concentration and where they see the biggest growth opportunities.
                          </p>
                        </div>
                      </li> */}

                      {/* <li className="flex">
                        
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">What is your target investor profile?</p>
                          <p className="text-gray-600 text-xs italic mb-2">Check size range: $100–500k, $500k–$1.5M, $1.5–3M, $3–10M, $10M+<br/>
                          Stage focus: Pre-seed, Seed, Series A, Series B+<br/>
                          Preference: Lead, Follow-on, or Either<br/>
                          Must-have filters (if any): e.g., &quot;deeptech specialist,&quot; &quot;fintech infra,&quot; &quot;climate thesis&quot;</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Get their ideal check size, preferred stage, and any specific investor thesis requirements. Ask about their current investor conversations and what feedback they&apos;re getting.
                          </p>
                        </div>
                      </li> */}

                      <li className="flex">
                        
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">What are your top 3 founder proof points?</p>
                          <p className="text-gray-600 text-xs italic mb-2">Select up to 3: Prior exit, Tier-1 employer pedigree, Patents/IP, Marquee customers, Revenue milestones, Notable advisors/board, Awards/accelerators, Technical benchmarks, Publications</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Ask for specific details about each proof point - exit amounts, company names, customer logos, revenue numbers. Get concrete examples that can be used in narratives.
                          </p>
                        </div>
                      </li>

                      <li className="flex">
                        
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">Which investor narrative angles resonate most with your raise?</p>
                          <p className="text-gray-600 text-xs italic mb-2">Pick up to 2: Technical edge (architecture, performance, defensibility), Market insight (category design, timing, wedge), Regulatory moat (compliance, standards), Team execution (velocity, GTM, hires), Customer outcomes (ROI, case evidence)</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Ask which angles get the most positive investor reactions and why. What specific feedback have they received? This helps identify the most compelling narrative themes.
                          </p>
                        </div>
                      </li>

                      <li className="flex">
                        
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">What are the top 3 investor objections you expect and your responses?</p>
                          <p className="text-gray-600 text-xs italic mb-2">Use bullet format: &quot;Objection — Rebuttal/Proof&quot;</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Get their anticipated objections and how they plan to address them. Ask for specific data, examples, or proof points they&apos;ll use to counter each objection.
                          </p>
                        </div>
                      </li>

                      <li className="flex">
                        
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">What is your approvals path for external communications?</p>
                          <p className="text-gray-600 text-xs italic mb-2">Who must approve: Founder/CEO, Legal/Compliance, IR/Finance, Partner/customer, Other<br/>
                          Typical turnaround time: &lt;24h, 24–72h, 4–7 days, &gt;7 days</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Understand their internal approval process and timeline. This affects how quickly we can execute narrative strategies and what types of content they can approve.
                          </p>
                        </div>
                      </li>

                      <li className="flex">
                        
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">What is your approximate monthly content/PR budget?</p>
                          <p className="text-gray-600 text-xs italic mb-2">Choose one: &lt; $2,000, $2,000–$5,000, $5,000–$10,000, $10,000+, Not sure</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Get their current budget allocation and what they&apos;re willing to invest in narrative strategy. This helps determine the scope and scale of services we can provide.
                          </p>
                        </div>
                      </li>

                      <li className="flex">
                        
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">Share three specific time windows for your 90-minute discovery call (next 7 days)</p>
                          <p className="text-gray-600 text-xs italic mb-2">Please include your time zone</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Get specific dates and times with time zones. Ask for their preferred meeting format (Zoom, Teams, etc.) and who else should attend from their team.
                          </p>
                        </div>
                      </li>

                      <li className="flex">
                        
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">Do you understand this is a strategy consultation only (no media bookings or investor meetings)?</p>
                          <p className="text-gray-600 text-xs italic mb-2">Confirmation required</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Confirm they understand this is a strategic planning session, not execution. We&apos;re providing narrative strategy and recommendations, not direct media or investor outreach.
                          </p>
                        </div>
                      </li>

                                            <li className="flex">
                       
                        <div className="pl-0 sm:pl-0">
                          <p className="font-semibold text-black mb-1">After the consultation, what are you interested in? (Optional)</p>
                          <p className="text-gray-600 text-xs italic mb-2">Options: TL Engine (hands-on execution), Ongoing PR execution, Self-serve templates only, Not sure yet</p>
                          <p className="text-gray-500 text-xs bg-gray-50 p-2 rounded border-l-2 border-orange-200">
                            <strong>Guidance:</strong> Gauge their interest in ongoing services. This helps understand their long-term needs and potential for follow-on work after the initial consultation.
                          </p>
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs sm:text-sm text-yellow-800">
                      <strong>Note:</strong> These questions will be covered during the 90-minute discovery call interview.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Qualification Sections */}
          {contactData.sections
            .filter(section => section.id !== 'contact')
            .map(section => {
              const sectionAnswer = contactData.sectionAnswers[section.id];
              if (!sectionAnswer || !sectionAnswer.questions.length) return null;

              return (
                <div key={section.id} className="mb-8 sm:mb-10">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 text-black border-b border-gray-200 pb-2">
                    {sectionAnswer.title}
                  </h2>
                  <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{sectionAnswer.description}</p>
                  
                  <div className="space-y-6">
                    {sectionAnswer.questions.map((question, index) => (
                      <div key={`${section.id}-${index}`} className="bg-gray-50 rounded-lg p-4 sm:p-6">
                        <div className="mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-black mb-1">
                            {question.label}
                          </h3>
                          <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {question.type}
                          </span>
                        </div>
                        
                        <div className="mb-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Answer:</label>
                          <div className="text-black font-medium bg-white px-3 py-2 rounded border text-sm sm:text-base">
                            {formatAnswer(question.answer, question)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

          {/* Footer */}
          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-xs sm:text-sm">
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

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const contactData = await getContactData(id);
  
  if (!contactData) {
    return {
      title: 'Lead Qualification Not Found'
    };
  }

  return {
    title: `Lead Qualification - ${contactData.fullName}`,
    description: `Lead qualification answers submitted by ${contactData.fullName}`,
  };
}