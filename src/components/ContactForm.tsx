'use client';

import { useState, useEffect, useRef } from 'react';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';
import PitchDeckUpload from './PitchDeckUpload';

type ThemeVars = {
  '--primary-text'?: string;
  '--secondary-text'?: string;
  '--secondary-text-80'?: string;
  '--dividers-borders'?: string;
  '--input-fields'?: string;
  '--card-accent-1'?: string;
  '--accent-elements'?: string;
};

interface Question {
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  allowOther?: boolean;
  otherPlaceholder?: string;
  standalone?: boolean;
}

interface Questions {
  [key: string]: Question;
}

interface ContactInfo {
  fullName: string;
  email: string;
  linkedinProfile: string;
  companyWebsite: string;
}

interface FormData extends ContactInfo {
  [key: string]: string | string[];
}

interface FormErrors {
  [key: string]: string;
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: { name?: string; email?: string };
      }) => void;
    };
  }
}

type ContactFormProps = {
  variant?: 'full' | 'calendly';
  prefillName?: string;
  prefillEmail?: string;
  onCalendlyStart?: (name: string, email: string) => void;
  onCalendlyShow?: (isShown: boolean) => void;
  appearance?: 'dark' | 'light';
  calendlyHeight?: number;
};

export default function ContactForm({ variant = 'full', prefillName = '', prefillEmail = '', onCalendlyStart, onCalendlyShow, appearance = 'dark', calendlyHeight = 900 }: ContactFormProps) {
  const [questions, setQuestions] = useState<Questions>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    linkedinProfile: '',
    companyWebsite: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCalendly, setShowCalendly] = useState(false);
  const [showPitchDeckPrompt, setShowPitchDeckPrompt] = useState(false);
  const [showPitchDeckUpload, setShowPitchDeckUpload] = useState(false);
  const [contactRecordId, setContactRecordId] = useState<string>('');
  // Removed local pitch deck URL state (not used elsewhere)

  // const CALENDLY_PERSONAL_ACCESS_TOKEN = "eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzU0NjQzMDkzLCJqdGkiOiI1MTY4YjBiNS05YmI1LTQ4YzctOTg5Yi0wNGNiMWJkMWEzZTgiLCJ1c2VyX3V1aWQiOiI0MmQzNTNjMC0zZjEwLTRiMjAtYjc0Zi0xYWM0NDJmMjlmOTYifQ.pWLAZgFEtv9R9HAxicRb-wNESpgnQDNyQPpBDKX5bBO_Lrxm98WQq_897ZCCjRoo_t6wyw-AKs5ss0FJHh7FyQ"
  // const CALENDLY_USER_URI ="https://api.calendly.com/users/42d353c0-3f10-4b20-b74f-1ac442f29f96"
  // URL normalization helpers
  const ensureHttps = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return trimmed;
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  };

  const normalizeLinkedInUrl = (value: string): string => {
    let url = ensureHttps(value);
    if (!url) return url;
    // Standardize linkedin host to include www
    url = url.replace(/^https?:\/\/linkedin\.com/i, 'https://www.linkedin.com');
    return url;
  };

  // Google Analytics tracking
  const {
    trackContactFormStart,
    trackContactFormComplete,
    trackCalendlyStart,
    trackFormFieldInteraction,
  } = useGoogleAnalytics();

  useEffect(() => {
    if (variant !== 'full') return;
    // Track form start when component mounts
    trackContactFormStart();
    
    // Load questions from JSON file
    const loadQuestions = async () => {
      try {
        const response = await fetch('/questions.json');
        const questionsData = await response.json();
        setQuestions(questionsData);
        
        // Initialize form data for questions
        const initialData: Partial<FormData> = {
          fullName: '',
          email: '',
          linkedinProfile: '',
          companyWebsite: '',
        };
        
        Object.keys(questionsData).forEach(key => {
          const question = questionsData[key];
          if (question.type === 'checkbox' && !question.standalone) {
            initialData[key] = [];
          } else {
            initialData[key] = '';
          }
          
          // Initialize "other" field for checkbox questions with allowOther
          if (question.type === 'checkbox' && question.allowOther) {
            initialData[`${key}_other`] = '';
          }
        });
        setFormData(initialData as FormData);
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    };

    loadQuestions();
  }, [trackContactFormStart, variant]);

  useEffect(() => {
    onCalendlyShow?.(showCalendly);
  }, [showCalendly, onCalendlyShow]);

  // Calendly script loader and inline embed setup
  const calendlyContainerRef = useRef<HTMLDivElement | null>(null);
  const calendlyUrl = 'https://calendly.com/jay-jdalchemy/talk-to-our-founders-to-clarify-anything';

  const loadCalendlyScript = () => new Promise<void>((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Calendly) {
      resolve();
      return;
    }
    const existing = document.getElementById('calendly-embed-script');
    if (existing) {
      const waitForCalendly = () => {
        if (window.Calendly) resolve(); else setTimeout(waitForCalendly, 50);
      };
      waitForCalendly();
      return;
    }
    const script = document.createElement('script');
    script.id = 'calendly-embed-script';
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Calendly script'));
    document.head.appendChild(script);
  });

  const shouldInitCalendly = variant === 'calendly' || showCalendly;

  useEffect(() => {
    if (!shouldInitCalendly) return;
    let cancelled = false;

    const init = async () => {
      await loadCalendlyScript();
      if (cancelled || !calendlyContainerRef.current || !window.Calendly) return;
      // Clear node to avoid duplicate widgets
      calendlyContainerRef.current.innerHTML = '';
      window.Calendly.initInlineWidget({
        url: calendlyUrl,
        parentElement: calendlyContainerRef.current,
        prefill: {
          name: prefillName || formData.fullName,
          email: prefillEmail || formData.email,
        },
      });
    };

    type CalendlyPayload = {
      event?: { start_time?: string };
      start_time?: string;
      scheduled_at?: string;
      slot?: { start_time?: string };
      datetime?: string;
      time?: string;
      [key: string]: unknown;
    };

    type CalendlyMessage = {
      event?: string;
      payload?: CalendlyPayload;
    };

    const handleCalendlyMessage = async (e: MessageEvent) => {
      const data = e.data as CalendlyMessage;
      if (!data || typeof data !== 'object') return;
      const pickTime = (payload: CalendlyPayload | undefined): string | undefined => {
        if (!payload) return undefined;
        return (
          payload.event?.start_time ||
          payload.start_time ||
          payload.slot?.start_time ||
          payload.datetime ||
          payload.time ||
          undefined
        );
      };
      if (data.event === 'calendly.date_and_time_selected') {
        const when = pickTime(data.payload);
        console.log('Calendly date/time selected:', when, data.payload);
        // Note: date_and_time_selected is just when user picks a time slot
        // We don't need to save anything here since the actual event isn't created yet
        console.log('Date and time selected, but event not yet scheduled');
      }
      if (data.event === 'calendly.event_scheduled') {
        const scheduledAt = pickTime(data.payload) || data.payload?.scheduled_at;
        console.log('Calendly event scheduled:', scheduledAt, data.payload);
        if (contactRecordId) {
          try {
            let finalStart = scheduledAt;
            let joinLink: string | undefined;
            
            // Query Calendly REST API for the latest event to get both start_time and join_link
            try {
              const lookup = await fetch('/api/calendly-latest-event');
              const lookupJson = await lookup.json();
              finalStart = lookupJson?.start_time || finalStart;
              joinLink = lookupJson?.join_link;
              console.log('Calendly lookup result:', { start_time: finalStart, join_link: joinLink });
            } catch (e) {
              console.warn('Calendly lookup failed', e);
            }

            // Update Airtable with both scheduled time and meeting link
            if (finalStart || joinLink) {
              const updateData: { 
                recordId: string; 
                calendlyEventScheduledTime?: string; 
                joinLink?: string; 
              } = { recordId: contactRecordId };
              if (finalStart) updateData.calendlyEventScheduledTime = String(finalStart);
              if (joinLink) updateData.joinLink = String(joinLink);
              
              const res = await fetch('/api/update-contact', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
              });
              const txt = await res.text();
              console.log('Airtable update (event_scheduled):', res.status, txt);
            } else {
              console.warn('No start time or join link found to save');
            }
          } catch (err) {
            console.warn('Failed to persist calendly.event_scheduled:', err);
          }
        }
        // After the event is scheduled, navigate to confirmation page after 5 seconds
        try {
          setTimeout(() => {
            try {
              window.location.href = '/call-confirmed';
            } catch {
              /* no-op */
            }
          }, 5000);
        } catch {
          /* no-op */
        }
      }
    };

    init();
    window.addEventListener('message', handleCalendlyMessage);
    return () => {
      cancelled = true;
      window.removeEventListener('message', handleCalendlyMessage);
    };
  }, [shouldInitCalendly, formData.fullName, formData.email, prefillName, prefillEmail, contactRecordId]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Validate contact info with helpful guidance
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name (e.g., John Smith)';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address (e.g., john@company.com)';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email format (e.g., john@company.com)';
    }
    
    if (!formData.linkedinProfile.trim()) {
      newErrors.linkedinProfile = 'Please enter your LinkedIn profile URL (e.g., https://www.linkedin.com/in/yourname)';
    } else {
      // Require linkedin.com/in profile pattern
      const linkedinUrl = normalizeLinkedInUrl(formData.linkedinProfile);
      const profilePattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i;
      if (!profilePattern.test(linkedinUrl)) {
        newErrors.linkedinProfile = 'Please enter a valid LinkedIn profile URL like https://www.linkedin.com/in/yourname';
      } else if (linkedinUrl !== formData.linkedinProfile) {
        // Sync normalized value back to state to satisfy browser URL validation
        setFormData(prev => ({ ...prev, linkedinProfile: linkedinUrl }));
      }
    }
    
    if (!formData.companyWebsite.trim()) {
      newErrors.companyWebsite = 'Please enter your company website URL (e.g., https://yourcompany.com)';
    } else if (!/^https?:\/\/.+/.test(formData.companyWebsite.trim())) {
      newErrors.companyWebsite = 'Please start your website URL with "https://" or "http://" (e.g., https://yourcompany.com)';
    }
    
    // Validate all questions are answered with specific guidance
    Object.entries(questions).forEach(([key, question]) => {
      if (question.required) {
        const value = formData[key];
        
        if (question.type === 'checkbox' && !question.standalone) {
          if (Array.isArray(value) && value.length === 0) {
            newErrors[key] = `Please select at least one option for: "${question.label}"`;
          }
        } else if (question.type === 'checkbox' && question.standalone) {
          if (!value) {
            newErrors[key] = `Please check the box to accept: "${question.label}"`;
          }
        } else if (question.type === 'radio') {
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            newErrors[key] = `Please select one option for: "${question.label}"`;
          }
        } else if (!value || (typeof value === 'string' && value.trim() === '')) {
          newErrors[key] = `Please provide an answer for: "${question.label}"`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setStatus('error');
      setMessage('Please fill in all required fields correctly.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      // Send data to Airtable via our API endpoint
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save contact information');
      }

      setStatus('success');
      setMessage('Thank you! Your information has been submitted successfully.');
      setContactRecordId(result.id);
      trackContactFormComplete();
      
      // Show pitch deck prompt instead of going directly to Calendly
      setShowPitchDeckPrompt(true);
      
    } catch (err) {
      console.error('Form submission error:', err);
      setStatus('error');
      setMessage('Failed to submit form. Please check your information and try again.');
    }
  };

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFieldFocus = (fieldName: string) => {
    trackFormFieldInteraction(fieldName, 'focus');
  };

  const handleFieldBlur = (fieldName: string) => {
    trackFormFieldInteraction(fieldName, 'blur');
  };

  const handleFieldChange = (fieldName: string) => {
    trackFormFieldInteraction(fieldName, 'change');
  };

  const handleQuestionChange = (questionKey: string, value: string | string[], checked?: boolean) => {
    const question = questions[questionKey];
    
    setFormData(prev => {
      const newData = { ...prev };
      
      if (checked !== undefined) {
        if (question?.type === 'checkbox' && question.standalone) {
          // Handle standalone checkbox (consent)
          newData[questionKey] = checked ? 'true' : '';
        } else {
          // Handle multiple checkbox questions
          const currentValues = Array.isArray(prev[questionKey]) ? prev[questionKey] as string[] : [];
          if (checked) {
            newData[questionKey] = [...currentValues, value as string];
          } else {
            newData[questionKey] = currentValues.filter(v => v !== value);
          }
        }
      } else {
        // Handle other question types (radio, text, etc.)
        newData[questionKey] = value;
      }
      
      return newData;
    });
    
    // Clear any existing error for this field
    if (errors[questionKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionKey];
        return newErrors;
      });
    }
  };

  const handlePitchDeckYes = () => {
    setShowPitchDeckPrompt(false);
    setShowPitchDeckUpload(true);
  };

  const handlePitchDeckNo = () => {
    setShowPitchDeckPrompt(false);
    trackCalendlyStart();
    setShowCalendly(true);
    onCalendlyStart?.(formData.fullName, formData.email);
  };

  const handlePitchDeckUploadComplete = async (fileUrl: string) => {
    console.log('Pitch deck upload complete:', { fileUrl, contactRecordId });
    
    // Update the Airtable record with the pitch deck URL
    try {
      const response = await fetch('/api/update-contact', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId: contactRecordId,
          pitchDeckUrl: fileUrl,
        }),
      });

      const result = await response.json();
      console.log('Update contact response:', { status: response.status, result });

      if (!response.ok) {
        console.error('Failed to update contact record with pitch deck URL:', result);
        alert('Warning: Your pitch deck was uploaded but we could not update your contact record. Please contact support.');
      } else {
        console.log('Successfully updated contact record with pitch deck URL');
      }
    } catch (error) {
      console.error('Error updating contact record:', error);
      alert('Warning: Your pitch deck was uploaded but we could not update your contact record. Please contact support.');
    }

    setShowPitchDeckUpload(false);
    trackCalendlyStart();
    setShowCalendly(true);
    onCalendlyStart?.(formData.fullName, formData.email);
  };

  const handlePitchDeckSkip = () => {
    setShowPitchDeckUpload(false);
    trackCalendlyStart();
    setShowCalendly(true);
    onCalendlyStart?.(formData.fullName, formData.email);
  };

  const renderQuestion = (key: string, question: Question) => {
    const questionNumber = key.replace('Question ', '');
    const hasError = errors[key];

    switch (question.type) {
      case 'radio':
        return (
          <div key={key}>
            <label className="block text-base md:text-lg mb-2 md:mb-3 font-medium" style={{color: 'var(--primary-text)'}}>
              {questionNumber}. {question.label} {question.required && '*'}
            </label>
            <div className="space-y-2 md:space-y-3">
              {question.options?.map((option, index) => (
                <label key={index} className="flex items-center text-sm" style={{color: 'var(--primary-text)'}}>
                  <input
                    type="radio"
                    name={key}
                    value={option}
                    checked={(formData[key] as string) === option}
                    onChange={(e) => handleQuestionChange(key, e.target.value)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
            {hasError && <p className="text-xs md:text-sm mt-1" style={{color: 'var(--accent-elements)'}}>{hasError}</p>}
          </div>
        );

      case 'checkbox':
        if (question.standalone) {
          return (
            <div key={key}>
              <label className="flex items-center" style={{color: 'var(--primary-text)'}}>
                <input
                  type="checkbox"
                  name={key}
                  checked={(formData[key] as string) === 'true'}
                  onChange={(e) => handleQuestionChange(key, '', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm md:text-base font-medium">
                  {questionNumber}. {question.label} {question.required && '*'}
                </span>
              </label>
              {hasError && <p className="text-xs md:text-sm mt-1" style={{color: 'var(--accent-elements)'}}>{hasError}</p>}
            </div>
          );
        } else {
          return (
            <div key={key}>
              <label className="block text-base md:text-lg mb-2 md:mb-3 font-medium" style={{color: 'var(--primary-text)'}}>
                {questionNumber}. {question.label} {question.required && '*'}
              </label>
              <div className="space-y-2 md:space-y-3">
                {question.options?.map((option, index) => (
                  <label key={index} className="flex items-center text-sm" style={{color: 'var(--primary-text)'}}>
                    <input
                      type="checkbox"
                      name={`${key}-${option}`}
                      checked={Array.isArray(formData[key]) && (formData[key] as string[]).includes(option)}
                      onChange={(e) => handleQuestionChange(key, option, e.target.checked)}
                      className="mr-2"
                    />
                    {option}
                  </label>
                ))}
                {question.allowOther && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder={question.otherPlaceholder}
                      value={(formData[`${key}_other`] as string) || ''}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          [`${key}_other`]: e.target.value,
                        }));
                        // Auto-check "Others" when typing
                        if (e.target.value && !Array.isArray(formData[key])) {
                          handleQuestionChange(key, 'Others', true);
                        }
                      }}
                      className="w-full p-2 rounded text-sm"
                      style={{
                        backgroundColor: 'var(--input-fields)',
                        color: 'var(--primary-text)',
                        border: '1px solid var(--dividers-borders)',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>
              {hasError && <p className="text-xs md:text-sm mt-1" style={{color: 'var(--accent-elements)'}}>{hasError}</p>}
            </div>
          );
        }

      default:
        return null;
    }
  };

  if (Object.keys(questions).length === 0) {
    const lightVars: React.CSSProperties & ThemeVars = appearance === 'light' ? {
      '--primary-text': '#000000',
      '--secondary-text': '#374151',
      '--secondary-text-80': 'rgba(0,0,0,0.8)',
      '--dividers-borders': '#e5e7eb',
      '--input-fields': '#f9fafb',
      '--card-accent-1': '#f3f4f6',
      '--accent-elements': '#fabf01',
    } : {};
    return <div className="text-center" style={{ color: 'var(--primary-text)', ...lightVars }}>Loading form...</div>;
  }

  const lightVars: React.CSSProperties & ThemeVars = appearance === 'light' ? {
    '--primary-text': '#000000',
    '--secondary-text': '#374151',
    '--secondary-text-80': 'rgba(0,0,0,0.8)',
    '--dividers-borders': '#e5e7eb',
    '--input-fields': '#f9fafb',
    '--card-accent-1': '#f3f4f6',
    '--accent-elements': '#fabf01',
  } : {};

  return (
    <div style={lightVars}>
      {showPitchDeckPrompt ? (
        <div className="max-w-2xl mx-auto text-center p-6">
          <div className="mb-6">
            <h2 className="text-xl md:text-2xl font-bold mb-4" style={{color: 'var(--primary-text)'}}>
              Upload Your Pitch Deck
            </h2>
            <p className="text-base md:text-lg mb-6" style={{color: 'var(--secondary-text)'}}>
              Please upload your teaser deck or pitch deck here to increase your chance of being selected for our program
            </p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={handlePitchDeckYes}
              className="px-6 py-3 rounded font-medium text-white transition-colors"
              style={{
                backgroundColor: 'var(--accent-elements)',
                border: 'none'
              }}
            >
              Yes, Upload Pitch Deck
            </button>
            <button
              onClick={handlePitchDeckNo}
              className="px-6 py-3 rounded font-medium transition-colors"
              style={{
                backgroundColor: 'var(--card-accent-1)',
                color: 'var(--secondary-text)',
                border: `1px solid var(--dividers-borders)`
              }}
            >
              No, Continue to Booking
            </button>
          </div>
        </div>
      ) : showPitchDeckUpload ? (
        <PitchDeckUpload 
          onUploadComplete={handlePitchDeckUploadComplete}
          onSkip={handlePitchDeckSkip}
        />
      ) : !showCalendly ? (
        <>
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="rounded-lg p-4 mb-6" style={{backgroundColor: 'var(--card-accent-1)', border: '1px solid var(--dividers-borders)'}}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5" style={{color: 'var(--accent-elements)'}} viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium" style={{color: 'var(--primary-text)'}}>
                      Please fix the following {Object.keys(errors).length === 1 ? 'issue' : 'issues'} to continue:
                    </h3>
                    <div className="mt-2 text-sm" style={{color: 'var(--secondary-text-80)'}}>
                      <ul className="list-disc pl-5 space-y-1">
                        {Object.entries(errors).map(([field, error]) => (
                          <li key={field}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label htmlFor="fullName" className="block text-base md:text-lg mb-1 font-medium" style={{color: 'var(--primary-text)'}}>Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={(e) => {
                    handleContactInfoChange('fullName', e.target.value);
                    handleFieldChange('fullName');
                  }}
                  className={`w-full p-2.5 md:p-3 rounded text-sm ${errors.fullName ? '' : ''}`}
                  style={{
                    backgroundColor: 'var(--input-fields)',
                    color: 'var(--primary-text)',
                    border: `1px solid ${errors.fullName ? 'var(--accent-elements)' : 'var(--dividers-borders)'}`,
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-elements)';
                    handleFieldFocus('fullName');
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.fullName ? 'var(--accent-elements)' : 'var(--dividers-borders)';
                    handleFieldBlur('fullName');
                  }}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p className="text-xs md:text-sm mt-1" style={{color: 'var(--accent-elements)'}}>{errors.fullName}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-base md:text-lg mb-1 font-medium" style={{color: 'var(--primary-text)'}}>Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => {
                    handleContactInfoChange('email', e.target.value);
                    handleFieldChange('email');
                  }}
                  className={`w-full p-2.5 md:p-3 rounded text-sm`}
                  style={{
                    backgroundColor: 'var(--input-fields)',
                    color: 'var(--primary-text)',
                    border: `1px solid ${errors.email ? 'var(--accent-elements)' : 'var(--dividers-borders)'}`,
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-elements)';
                    handleFieldFocus('email');
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.email ? 'var(--accent-elements)' : 'var(--dividers-borders)';
                    handleFieldBlur('email');
                  }}
                  placeholder="name@example.com"
                />
                {errors.email && <p className="text-xs md:text-sm mt-1" style={{color: 'var(--accent-elements)'}}>{errors.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
              <div>
                <label htmlFor="linkedinProfile" className="block text-base md:text-lg mb-1 font-medium" style={{color: 'var(--primary-text)'}}>Your LinkedIn profile *</label>
                <input
                  type="url"
                  id="linkedinProfile"
                  name="linkedinProfile"
                  value={formData.linkedinProfile}
                  onChange={(e) => {
                    handleContactInfoChange('linkedinProfile', e.target.value);
                    handleFieldChange('linkedinProfile');
                  }}
                  className={`w-full p-2.5 md:p-3 rounded text-sm`}
                  style={{
                    backgroundColor: 'var(--input-fields)',
                    color: 'var(--primary-text)',
                    border: `1px solid ${errors.linkedinProfile ? 'var(--accent-elements)' : 'var(--dividers-borders)'}`,
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-elements)';
                    handleFieldFocus('linkedinProfile');
                  }}
                  onBlur={(e) => {
                    const normalized = normalizeLinkedInUrl(e.target.value);
                    if (normalized !== e.target.value) {
                      e.target.value = normalized;
                      handleContactInfoChange('linkedinProfile', normalized);
                    }
                    e.target.style.borderColor = errors.linkedinProfile ? 'var(--accent-elements)' : 'var(--dividers-borders)';
                    handleFieldBlur('linkedinProfile');
                  }}
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  inputMode="url"
                  autoComplete="url"
                  title="Enter a LinkedIn profile URL like https://www.linkedin.com/in/yourname. We will auto-add https:// if omitted."
                />
                {errors.linkedinProfile && <p className="text-xs md:text-sm mt-1" style={{color: 'var(--accent-elements)'}}>{errors.linkedinProfile}</p>}
              </div>
              <div>
                <label htmlFor="companyWebsite" className="block text-base md:text-lg mb-1 font-medium" style={{color: 'var(--primary-text)'}}>Your Company website *</label>
                <input
                  type="url"
                  id="companyWebsite"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={(e) => {
                    handleContactInfoChange('companyWebsite', e.target.value);
                    handleFieldChange('companyWebsite');
                  }}
                  className={`w-full p-2.5 md:p-3 rounded text-sm`}
                  style={{
                    backgroundColor: 'var(--input-fields)',
                    color: 'var(--primary-text)',
                    border: `1px solid ${errors.companyWebsite ? 'var(--accent-elements)' : 'var(--dividers-borders)'}`,
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--accent-elements)';
                    handleFieldFocus('companyWebsite');
                  }}
                  onBlur={(e) => {
                    const normalized = ensureHttps(e.target.value);
                    if (normalized !== e.target.value) {
                      e.target.value = normalized;
                      handleContactInfoChange('companyWebsite', normalized);
                    }
                    e.target.style.borderColor = errors.companyWebsite ? 'var(--accent-elements)' : 'var(--dividers-borders)';
                    handleFieldBlur('companyWebsite');
                  }}
                  placeholder="https://yourcompany.com"
                  inputMode="url"
                  autoComplete="url"
                  title="Enter your company website URL (we will auto-add https:// if omitted)"
                />
                {errors.companyWebsite && <p className="text-xs md:text-sm mt-1" style={{color: 'var(--accent-elements)'}}>{errors.companyWebsite}</p>}
              </div>
            </div>

            {/* Dynamic Questions */}
            {Object.entries(questions).map(([key, question]) => renderQuestion(key, question))}
            
            {message && (
              <div className="p-3 md:p-4 rounded" style={{
                backgroundColor: status === 'success' ? 'var(--success-positive)' : 
                               status === 'error' ? 'var(--accent-elements)' : 
                               'var(--card-accent-1)',
                color: status === 'success' ? 'var(--card-contrast)' : 
                       status === 'error' ? 'var(--card-contrast)' : 
                       'var(--primary-text)'
              }}>
                {message}
              </div>
            )}
            
            <div className="text-right">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="button relative z-10 cursor-pointer hover:!bg-yellow-400 hover:!text-black transition-colors text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Submitting...' : 'Continue'}
              </button>
            </div>
          </form>
        </>
      ) : (
        <div
          ref={calendlyContainerRef}
          className="w-full bg-white"
          style={{ height: `${calendlyHeight}px` }}
        />
      )}
    </div>
  );
} 