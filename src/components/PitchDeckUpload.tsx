'use client';

import { useState } from 'react';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

interface PitchDeckUploadProps {
  onUploadComplete: (fileUrl: string) => void;
  onSkip: () => void;
  title?: string;
  description?: string;
  acceptedTypes?: string[];
  contactRecordId?: string;
  questionId?: string;
  onPitchDeckFileUpload?: (questionId: string, file: File, url: string) => void;
}

export default function PitchDeckUpload({ 
  onUploadComplete, 
  title = "Upload Your Pitch Deck",
  description = "Please upload your teaser deck or pitch deck here to increase your chance of being selected for our program",
  acceptedTypes = ['.pdf'],
  contactRecordId,
  questionId,
  onPitchDeckFileUpload
}: Omit<PitchDeckUploadProps, 'onSkip'>) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentView, setCurrentView] = useState<'upload' | 'uploading'>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);


  const [isUploading, setIsUploading] = useState(false);

  const { trackAnalyzeClick } = useGoogleAnalytics();



  const uploadFileWithProgress = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('pitchDeckFile', file);
      formData.append('fileName', file.name);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response.fileUrl);
          } catch (parseError) {
            console.error('Response parsing error:', parseError);
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', '/api/upload-pitch-deck');
      xhr.send(formData);
    });
  };



  const handleFileUpload = async (file: File) => {
    // Track analyze button click
    trackAnalyzeClick(file.name, file.size);
    
    // File validation
    const maxSizeInBytes = 10 * 1024 * 1024; // 10MB in bytes
    
    // Determine allowed MIME types based on accepted file extensions
    const mimeTypeMap: { [key: string]: string[] } = {
      '.pdf': ['application/pdf'],
      '.pptx': ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      '.key': ['application/x-iwork-keynote-sffkey']
    };
    
    const allowedMimeTypes = acceptedTypes.flatMap(ext => mimeTypeMap[ext] || []);
    const allowedExtensions = acceptedTypes.join(', ');
    
    // Check file type
    if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.type)) {
      alert(`Please upload a file with one of these formats: ${allowedExtensions}. Other file formats are not supported.`);
      return;
    }
    
    // Check file size
    if (file.size > maxSizeInBytes) {
      const fileSizeInMB = (file.size / (1024 * 1024)).toFixed(2);
      alert(`File size (${fileSizeInMB}MB) exceeds the maximum limit of 10MB. Please choose a smaller file.`);
      return;
    }
    
    // Additional check for file extension as backup
    const fileName = file.name.toLowerCase();
    const hasValidExtension = acceptedTypes.some(ext => fileName.endsWith(ext));
    if (!hasValidExtension) {
      alert(`Please upload a file with one of these extensions: ${allowedExtensions}.`);
      return;
    }
    
    setUploadedFile(file);
    setCurrentView('uploading');
    setUploadProgress(0);
    setIsUploading(true);
    
    try {

      
      // Start real file upload with progress tracking
      const fileUrl = await uploadFileWithProgress(file);
      
      console.log('File upload successful, fileUrl:', fileUrl);
      
      // Upload complete
      setUploadProgress(100);
      
      console.log('File upload complete, checking for pitch deck analysis...');
      console.log('Question ID:', questionId);
      console.log('Title:', title);
      console.log('Contact Record ID:', contactRecordId);
      
      // Check if this is a pitch deck question
      const isPitchDeckQuestion = title.toLowerCase().includes('pitch deck') || 
                                 title.toLowerCase().includes('teaser') ||
                                 questionId === 'pitchDeckUpload';
      
      if (isPitchDeckQuestion && questionId && onPitchDeckFileUpload) {
        console.log('This is a pitch deck upload, storing for later analysis');
        onPitchDeckFileUpload(questionId, file, fileUrl);
      }
      
      setTimeout(() => {
        console.log('Upload complete, calling onUploadComplete with:', fileUrl);
        onUploadComplete(fileUrl);
      }, 500);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
      setCurrentView('upload');
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  if (currentView === 'uploading') {
    return (
      <div className="text-center p-8">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">
            Uploading your file...
          </h3>
          <p className="text-sm text-gray-600">
            {uploadedFile?.name}
          </p>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-600">
          {Math.round(uploadProgress)}% complete
        </p>
      </div>
    );
  }



  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-800">
          {title}
        </h2>
        <p className="text-sm md:text-base text-gray-600">
          {description}
        </p>
      </div>

      <div 
        className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-gray-100 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => document.getElementById('pitch-deck-input')?.click()}
      >
        <div className="mb-4">
          <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-lg font-medium mb-2 text-gray-800">
          Drop your file here or click to browse
        </p>
        <p className="text-sm text-gray-600">
          Maximum file size: 10MB • {acceptedTypes.join(', ')} format{acceptedTypes.length > 1 ? 's' : ''} only
        </p>
        <input
          id="pitch-deck-input"
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* <div className="flex gap-4 mt-6">
        <button
          onClick={onSkip}
          disabled={isUploading}
          className="flex-1 px-6 py-3 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          style={{
            borderColor: 'var(--dividers-borders)',
            color: 'var(--secondary-text)',
            backgroundColor: 'var(--card-accent-1)'
          }}
        >
          Skip for now
        </button>
      </div> */}
    </div>
  );
}
