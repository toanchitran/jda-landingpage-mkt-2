'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGoogleAnalytics } from '../hooks/useGoogleAnalytics';
import PitchDeckUpload from './PitchDeckUpload';

interface Question {
  id: string;
  label: string;
  type: string;
  required: boolean;
  airtableField?: string;
  options?: string[];
  validation?: {
    type: string;
    blockedDomains?: string[];
    requiredValue?: string;
    errorMessage?: string;
    minValue?: number;
  };
  conditionalQuestions?: Array<{
    condition: {
      field: string;
      operator?: string;
      value: string | string[];
    };
    question: Question;
  }>;
  conditionalDisplay?: {
    field: string;
    operator: string;
    value: string | string[];
  };
  placeholder?: string;
  allowedTypes?: string[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  airtableMapping: string;
  questions: Question[];
}

interface SectionsData {
  sections: Section[];
}

interface FormData {
  [key: string]: string | string[] | File | null;
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

interface ContactFormProps {
  variant?: 'full' | 'minimal';
  prefillName?: string;
  prefillEmail?: string;
  onCalendlyStart?: () => void;
  onCalendlyShow?: () => void;
  appearance?: 'light' | 'dark';
  calendlyHeight?: number;
  showFormHeader?: boolean;
}

export default function ContactForm({ 
  prefillName = '', 
  prefillEmail = '', 
  onCalendlyStart, 
  calendlyHeight = 900, 
  showFormHeader = false 
}: ContactFormProps) {
  const [sectionsData, setSectionsData] = useState<SectionsData>({ sections: [] });
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCalendly, setShowCalendly] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { url: string; fileName: string }>>({});
  const [contactRecordId, setContactRecordId] = useState<string>('');


  const { trackFormFieldInteraction } = useGoogleAnalytics();

  // Load sections data
  useEffect(() => {
    const loadSections = async () => {
      try {
        const response = await fetch('/sections.json');
        const data = await response.json();
        setSectionsData(data);
        
        // Initialize form data
        const initialData: FormData = {};
        data.sections.forEach((section: Section) => {
          section.questions.forEach((question: Question) => {
            if (question.type === 'checkbox') {
              initialData[question.id] = [];
          } else {
              initialData[question.id] = '';
            }
            
            // Initialize conditional questions
            if (question.conditionalQuestions) {
              question.conditionalQuestions.forEach(cq => {
                if (cq.question.type === 'checkbox') {
                  initialData[cq.question.id] = [];
                } else {
                  initialData[cq.question.id] = '';
                }
              });
            }
          });
        });
        
        // Set prefill data
        if (prefillName) initialData.fullName = prefillName;
        if (prefillEmail) initialData.email = prefillEmail;
        
        setFormData(initialData);
      } catch (error) {
        console.error('Error loading sections:', error);
      }
    };

    loadSections();
  }, [prefillName, prefillEmail]);

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
        if (window.Calendly) {
          resolve();
        } else {
          setTimeout(waitForCalendly, 50);
        }
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

  // Helper functions to get contact info from form data
  const getContactName = useCallback((): string => {
    const contactSection = sectionsData.sections.find(s => s.id === 'contact');
    const nameQuestion = contactSection?.questions.find(q => q.id === 'fullName');
    return nameQuestion ? String(formData.fullName || '') : '';
  }, [sectionsData.sections, formData.fullName]);

  const getContactEmail = useCallback((): string => {
    const contactSection = sectionsData.sections.find(s => s.id === 'contact');
    const emailQuestion = contactSection?.questions.find(q => q.id === 'email');
    return emailQuestion ? String(formData.email || '') : '';
  }, [sectionsData.sections, formData.email]);

  useEffect(() => {
    if (!showCalendly) return;
    let cancelled = false;

    const init = async () => {
      try {
      await loadCalendlyScript();
        
        if (cancelled || !calendlyContainerRef.current || !window.Calendly) {
          return;
        }
        
      // Clear node to avoid duplicate widgets
      calendlyContainerRef.current.innerHTML = '';
        
        const prefillData = {
          name: prefillName || getContactName(),
          email: prefillEmail || getContactEmail(),
        };
        
      window.Calendly.initInlineWidget({
        url: calendlyUrl,
        parentElement: calendlyContainerRef.current,
          prefill: prefillData,
      });
      } catch (error) {
        console.error('Error initializing Calendly:', error);
      }
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
              const contactEmail = getContactEmail();
              const lookupUrl = contactEmail 
                ? `/api/calendly-latest-event?invitee_email=${encodeURIComponent(contactEmail)}`
                : '/api/calendly-latest-event';
              const lookup = await fetch(lookupUrl);
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
        // try {
        //   setTimeout(() => {
        //     try {
        //       window.location.href = '/call-confirmed';
        //     } catch {
        //       /* no-op */
        //     }
        //   }, 5000);
        // } catch {
        //   /* no-op */
        // }
      }
    };

    init();
    window.addEventListener('message', handleCalendlyMessage);
    return () => {
      cancelled = true;
      window.removeEventListener('message', handleCalendlyMessage);
    };
  }, [showCalendly, prefillName, prefillEmail, contactRecordId, getContactName, getContactEmail]);

  const handleFieldFocus = useCallback((fieldId: string) => {
    trackFormFieldInteraction(fieldId, 'focus');
  }, [trackFormFieldInteraction]);

  const handleFieldBlur = useCallback((fieldId: string) => {
    trackFormFieldInteraction(fieldId, 'blur');
  }, [trackFormFieldInteraction]);

  const handleFieldChange = useCallback((fieldId: string, value: string | string[] | File | null) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    trackFormFieldInteraction(fieldId, 'change');
    
    // Clear errors for this field
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  }, [trackFormFieldInteraction, errors]);

  const checkConditionalDisplay = (condition: { field: string; operator?: string; value: string | string[] }, formData: FormData): boolean => {
    const fieldValue = formData[condition.field];
    
    // Don't show conditional questions if the parent field has no value
    if (!fieldValue || fieldValue === '') {
      return false;
    }
    
    switch (condition.operator) {
      case 'equals':
        return String(fieldValue) === condition.value;
      case 'not_equals':
        return String(fieldValue) !== condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(String(fieldValue));
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(String(fieldValue));
      default:
        return true;
    }
  };

  const getConditionalQuestions = (question: Question): Question[] => {
    if (!question.conditionalQuestions) return [];
    
    return question.conditionalQuestions
      .filter(cq => checkConditionalDisplay(cq.condition, formData))
      .map(cq => cq.question);
  };

  const validateSection = (section: Section): FormErrors => {
    const sectionErrors: FormErrors = {};
    
    const validateQuestion = (question: Question) => {
      const value = formData[question.id];
      
      // Check if question should be displayed
      if (question.conditionalDisplay && !checkConditionalDisplay(question.conditionalDisplay, formData)) {
        return;
      }
      
      // Required validation
      if (question.required) {
        if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
          sectionErrors[question.id] = `${question.label} is required`;
          return;
        }
      }
      
      // Custom validation
      if (question.validation && value) {
        switch (question.validation.type) {
          case 'company_domain':
            if (typeof value === 'string') {
              const email = value.toLowerCase();
              const domain = email.split('@')[1];
              if (question.validation.blockedDomains?.includes(domain)) {
                sectionErrors[question.id] = 'Please use your work email address. Personal email domains are not allowed.';
              }
            }
            break;
          case 'required_value':
            if (value !== question.validation.requiredValue) {
              sectionErrors[question.id] = question.validation.errorMessage || `Must select "${question.validation.requiredValue}"`;
            }
            break;
          case 'min_value':
            if (typeof value === 'string' && question.validation.minValue !== undefined) {
              const numValue = parseFloat(value);
              if (isNaN(numValue) || numValue < question.validation.minValue) {
                sectionErrors[question.id] = `Must be at least ${question.validation.minValue}`;
              }
            }
            break;
        }
      }
      
      // Email format validation
      if (question.type === 'email' && value && typeof value === 'string') {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          sectionErrors[question.id] = 'Please enter a valid email format';
        }
      }
      
      // URL validation - auto-correct instead of showing error
      if (question.type === 'url' && value && typeof value === 'string') {
        const trimmedValue = value.trim();
        if (trimmedValue && !trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
          // Auto-correct by adding https://
          const correctedUrl = `https://${trimmedValue}`;
          setFormData(prev => ({ ...prev, [question.id]: correctedUrl }));
        }
      }
      
      // Number validation
      if (question.type === 'number' && value && typeof value === 'string') {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          sectionErrors[question.id] = 'Please enter a valid number';
        }
      }
    };
    
    // Validate main questions
    section.questions.forEach(validateQuestion);
    
    // Validate conditional questions
    section.questions.forEach(question => {
      getConditionalQuestions(question).forEach(validateQuestion);
    });
    
    return sectionErrors;
  };

  const handleNext = () => {
    const currentSection = sectionsData.sections[currentSectionIndex];
    const sectionErrors = validateSection(currentSection);
    
    if (Object.keys(sectionErrors).length > 0) {
      setErrors(sectionErrors);
      return;
    }
    
    setErrors({});
    
    // Check for hard stops
    if (currentSection.id === 'founder_availability' && formData.founderAvailability !== 'Yes') {
      setMessage('This consultation requires founder participation. Please reapply when available.');
      setStatus('error');
      return;
    }
    
    if (currentSection.id === 'commercial_terms' && formData.termsAcceptance !== 'Yes, I accept') {
      setMessage('Thanks—this engagement requires acceptance of terms.');
      setStatus('error');
      return;
    }

    if (currentSectionIndex < sectionsData.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      setErrors({});
      setMessage('');
      setStatus('idle');
    }
  };

  const handleSubmit = async () => {
    setStatus('loading');
    
    try {
      // Prepare submission data
      const submissionData: Record<string, string> = {};
      
      // Handle file uploads - combine multiple files into single string
      const fileUrls: string[] = [];
      Object.values(uploadedFiles).forEach(file => {
        if (file.url) {
          fileUrls.push(file.url);
        }
      });
      
      // Store as single string with URLs separated by commas, or individual URLs
      if (fileUrls.length === 1) {
        submissionData.pitchDeckUrl = fileUrls[0];
      } else if (fileUrls.length === 2) {
        submissionData.pitchDeckUrl = `${fileUrls[0]}, ${fileUrls[1]}`;
      } else if (fileUrls.length > 0) {
        submissionData.pitchDeckUrl = fileUrls.join(', ');
        } else {
        submissionData.pitchDeckUrl = '';
      }
      
      // Map contact section data
      const contactSection = sectionsData.sections.find(s => s.id === 'contact');
      if (contactSection) {
        contactSection.questions.forEach(question => {
          if (question.airtableField) {
            if (question.id === 'applicantRole') {
              // Format applicant role data
              let roleFormatted = `Applicant Role: ${formData[question.id]}`;
              if (formData[question.id] === 'Other' && formData.applicantRoleOther) {
                roleFormatted += ` (${formData.applicantRoleOther})`;
              }
              if (formData[question.id] !== 'Founder/CEO' && formData.founderCeoAttendance) {
                roleFormatted += `\nFounder/CEO will attend call: ${formData.founderCeoAttendance}`;
              }
              submissionData[question.airtableField] = roleFormatted;
      } else {
              submissionData[question.airtableField] = String(formData[question.id] || '');
            }
          }
        });
      }
      
      // Map other sections to Question fields
      let questionIndex = 1;
      sectionsData.sections.forEach(section => {
        if (section.id !== 'contact') {
          const sectionAnswers: string[] = [];
          
          section.questions.forEach(question => {
            const value = formData[question.id];
            if (value) {
              sectionAnswers.push(`Question:\n${question.label}\nAnswer:\n${Array.isArray(value) ? value.join(', ') : value}`);
            }
            
            // Add conditional questions
            getConditionalQuestions(question).forEach(cq => {
              const cqValue = formData[cq.id];
              if (cqValue) {
                sectionAnswers.push(`Question:\n${cq.label}\nAnswer:\n${Array.isArray(cqValue) ? cqValue.join(', ') : cqValue}`);
              }
            });
          });
          
          if (sectionAnswers.length > 0) {
            submissionData[`Question ${questionIndex}`] = sectionAnswers.join('\n\n');
            questionIndex++;
          }
        }
      });

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
      const result = await response.json();
        setStatus('success');
        setMessage('Thank you! Your qualification has been submitted successfully.');
        setContactRecordId(result.id);
        
        // Trigger n8n webhook with the record ID
        try {
          const webhookUrl = `https://n8n.brandbeam.io/webhook/35cdd99a-fc8e-42ae-b298-99cf41216b3c?record_id=${result.id}`;
          const webhookResponse = await fetch(webhookUrl, {
            method: 'GET',
          });
          
          if (webhookResponse.ok) {
            console.log('n8n webhook triggered successfully');
      } else {
            console.warn('n8n webhook failed:', webhookResponse.status);
      }
        } catch (webhookError) {
          console.warn('Failed to trigger n8n webhook:', webhookError);
    }

        // Automatically show Calendly instead of pitch deck prompt
    setShowCalendly(true);
        onCalendlyStart?.();
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
      setMessage('There was an error submitting your information. Please try again.');
    }
  };

  const renderQuestion = (question: Question) => {
    const value = formData[question.id];
    const error = errors[question.id];
    
    // Check conditional display
    if (question.conditionalDisplay && !checkConditionalDisplay(question.conditionalDisplay, formData)) {
      return null;
    }
    
    const commonProps = {
      className: "w-full p-2.5 md:p-3 rounded text-sm",
      style: {
        backgroundColor: '#ffffff',
        color: 'var(--base-color-neutral--black)',
        border: `1px solid ${error ? '#dc2626' : '#d1d5db'}`,
        outline: 'none'
      }
    };
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      e.target.style.borderColor = '#3b82f6';
      handleFieldFocus(question.id);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      e.target.style.borderColor = error ? '#dc2626' : '#d1d5db';
      handleFieldBlur(question.id);
      
      // Auto-correct URLs on blur
      if (question.type === 'url' && e.target.value) {
        const trimmedValue = e.target.value.trim();
        if (trimmedValue && !trimmedValue.startsWith('http://') && !trimmedValue.startsWith('https://')) {
          const correctedUrl = `https://${trimmedValue}`;
          handleFieldChange(question.id, correctedUrl);
          e.target.value = correctedUrl; // Update the input field immediately
        }
      }
    };

    switch (question.type) {
      case 'text':
      case 'email':
      case 'url':
      case 'number':
        return (
          <div key={question.id} className="mb-4 md:mb-5">
            <label htmlFor={question.id} className="block text-base md:text-lg mb-1 font-medium text-black">
              {question.label} {question.required && '*'}
            </label>
            <input
              {...commonProps}
              id={question.id}
              name={question.id}
              type={question.type}
              value={String(value || '')}
              onChange={(e) => handleFieldChange(question.id, e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={question.placeholder}
              // Add number-specific attributes
              {...(question.type === 'number' && {
                min: question.validation?.minValue,
                step: 'any'
              })}
            />
            {error && <p className="text-xs md:text-sm mt-1 text-red-600">{error}</p>}
          </div>
        );
        
      case 'textarea':
        return (
          <div key={question.id} className="mb-4 md:mb-5">
            <label htmlFor={question.id} className="block text-base md:text-lg mb-1 font-medium text-black">
              {question.label} {question.required && '*'}
            </label>
            <textarea
              {...commonProps}
              id={question.id}
              name={question.id}
              value={String(value || '')}
              onChange={(e) => handleFieldChange(question.id, e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={question.placeholder}
              rows={4}
            />
            {error && <p className="text-xs md:text-sm mt-1 text-red-600">{error}</p>}
          </div>
        );
        
      case 'select':
        return (
          <div key={question.id} className="mb-4 md:mb-5">
            <label htmlFor={question.id} className="block text-base md:text-lg mb-1 font-medium text-black">
              {question.label} {question.required && '*'}
            </label>
            <select
              {...commonProps}
              id={question.id}
              name={question.id}
              value={String(value || '')}
              onChange={(e) => handleFieldChange(question.id, e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            >
              <option value="">Select an option</option>
              {question.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {error && <p className="text-xs md:text-sm mt-1 text-red-600">{error}</p>}
          </div>
        );
        
      case 'radio':
        return (
          <div key={question.id} className="mb-4 md:mb-5">
            <label className="block text-base md:text-lg mb-3 font-medium text-black">
              {question.label} {question.required && '*'}
            </label>
            <div className="space-y-2">
              {question.options?.map(option => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleFieldChange(question.id, e.target.value)}
                    onFocus={() => handleFieldFocus(question.id)}
                    onBlur={() => handleFieldBlur(question.id)}
                    className="mr-2"
                  />
                  <span className="text-black">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-xs md:text-sm mt-1 text-red-600">{error}</p>}
          </div>
        );

      case 'checkbox':
          return (
          <div key={question.id} className="mb-4 md:mb-5">
            <label className="block text-base md:text-lg mb-3 font-medium text-black">
              {question.label} {question.required && '*'}
            </label>
            <div className="space-y-2">
              {question.options?.map(option => (
                <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                    value={option}
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleFieldChange(question.id, [...currentValues, option]);
                      } else {
                        handleFieldChange(question.id, currentValues.filter(v => v !== option));
                      }
                    }}
                    onFocus={() => handleFieldFocus(question.id)}
                    onBlur={() => handleFieldBlur(question.id)}
                  className="mr-2"
                />
                  <span className="text-black">{option}</span>
              </label>
              ))}
            </div>
            {error && <p className="text-xs md:text-sm mt-1 text-red-600">{error}</p>}
            </div>
          );
        
      case 'date':
          return (
          <div key={question.id} className="mb-4 md:mb-5">
            <label htmlFor={question.id} className="block text-base md:text-lg mb-1 font-medium text-black">
              {question.label} {question.required && '*'}
              </label>
                    <input
              {...commonProps}
              id={question.id}
              name={question.id}
              type="date"
              value={String(value || '')}
              onChange={(e) => handleFieldChange(question.id, e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {error && <p className="text-xs md:text-sm mt-1 text-red-600">{error}</p>}
          </div>
        );
        
            case 'file':
        const uploadedFile = uploadedFiles[question.id];
        return (
          <div key={question.id} className="mb-4 md:mb-5">
            <label htmlFor={question.id} className="block text-base md:text-lg mb-1 font-medium text-black">
              {question.label} {question.required && '*'}
                  </label>
            
            {uploadedFile ? (
              <div className="border border-green-300 bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium" style={{color: 'var(--base-color-neutral--black)'}}>{uploadedFile.fileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadedFiles(prev => {
                        const updated = { ...prev };
                        delete updated[question.id];
                        return updated;
                      });
                      handleFieldChange(question.id, '');
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <PitchDeckUpload
                title={question.label}
                description="Please upload your file here"
                acceptedTypes={question.allowedTypes || ['.pdf']}
                onUploadComplete={(url: string) => {
                  // Extract filename from URL - remove timestamp prefix and clean up
                  let fileName = url.split('/').pop() || 'Uploaded file';
                  // Remove timestamp prefix (numbers_) from filename
                  fileName = fileName.replace(/^\d+_/, '').replace(/_/g, ' ');
                  
                  setUploadedFiles(prev => ({
                          ...prev,
                    [question.id]: { url, fileName }
                  }));
                  handleFieldChange(question.id, url);

                }}

              />
            )}
            
            {error && <p className="text-xs md:text-sm mt-1 text-red-600">{error}</p>}
            </div>
          );

      default:
        return null;
    }
  };

  if (sectionsData.sections.length === 0) {
    return <div>Loading...</div>;
  }



      if (showCalendly) {
  return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-black mb-2">
            Thank you for your submission!
            </h2>
          <p className="mb-4" style={{color: 'var(--deep-grey)'}}>
            Now let&apos;s schedule your 90-minute discovery call
            </p>
          </div>
        <div
          ref={calendlyContainerRef}
          className="w-full bg-white rounded-lg shadow-lg"
          style={{ height: `${calendlyHeight}px`, minWidth: '320px' }}
        />
                  </div>
    );
  }

  const currentSection = sectionsData.sections[currentSectionIndex];
  const progress = ((currentSectionIndex + 1) / sectionsData.sections.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {showFormHeader && (
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-black">
            Get Started with JD Alchemy
          </h2>
          <p className="text-base md:text-lg" style={{color: 'var(--deep-grey)'}}>
            Please fill out this quick form to help us prepare for your call
          </p>
              </div>
            )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2" style={{color: 'var(--deep-grey)'}}>
          <span>Step {currentSectionIndex + 1} of {sectionsData.sections.length}</span>
          <span>{Math.round(progress)}% Complete</span>
              </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300"
                  style={{
              width: `${progress}%`,
              backgroundColor: 'var(--deep-blue)'
            }}
          ></div>
              </div>
            </div>

      {/* Section Card */}
      <div className="p-6 rounded-lg mb-6 bg-white shadow-lg">
        <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-bold mb-2 text-black">
            {currentSection.title}
          </h3>
          <p style={{color: 'var(--deep-grey)'}}>
            {currentSection.description}
          </p>
              </div>

        {/* Questions */}
              <div>
          {currentSection.questions.map(question => (
            <div key={question.id}>
              {renderQuestion(question)}
              {/* Render conditional questions */}
              {getConditionalQuestions(question).map(cq => renderQuestion(cq))}
              </div>
          ))}
            </div>

        {/* Status Message */}
            {message && (
          <div className={`p-4 rounded-lg mb-4 ${status === 'error' ? 'bg-red-100 text-red-800' : status === 'success' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                {message}
              </div>
            )}
            
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-gray-300">
              <button
            type="button"
            onClick={handlePrevious}
            disabled={currentSectionIndex === 0}
            className="px-4 py-2 border rounded disabled:opacity-50"
            style={{
              borderColor: '#d1d5db',
              color: 'var(--deep-grey)'
            }}
          >
            Previous
          </button>
          
              <button
            type="button"
            onClick={handleNext}
                disabled={status === 'loading'}
            className="button px-6 py-2"
              >
            {status === 'loading' ? 'Processing...' : 
             currentSectionIndex === sectionsData.sections.length - 1 ? 'Submit' : 'Next'}
              </button>
            </div>
      </div>
    </div>
  );
} 
