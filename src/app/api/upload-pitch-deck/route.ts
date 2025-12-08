import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pitchDeckFile') as File;
    // Get the original filename from the form data or the file object
    const fileName = (formData.get('fileName') as string) || file.name;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // STRICT VALIDATION
    // 1. Validate MIME Type
    const allowedMimeTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX are allowed.' }, { status: 400 });
    }

    // 2. Validate Extension
    const originalName = file.name || 'unknown';
    const ext = path.extname(originalName).toLowerCase();
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    
    if (!allowedExtensions.includes(ext)) {
       return NextResponse.json({ error: 'Invalid file extension.' }, { status: 400 });
    }

    // 3. Secure Storage
    // Store OUTSIDE of public folder to prevent direct access
    const uploadsDir = path.join(process.cwd(), 'uploads', 'pitch-decks');
    await mkdir(uploadsDir, { recursive: true });

    // 4. Sanitize Filename (Keep original name but make it safe)
    // Replace non-alphanumeric chars (except . - _) with _
    // Also remove any directory traversal attempts like ..
    let safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    // Ensure it doesn't start with a dot (hidden file)
    if (safeName.startsWith('.')) {
      safeName = '_' + safeName;
    }

    // Add timestamp to prevent overwriting existing files with same name
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}_${safeName}`;
    
    const filePath = path.join(uploadsDir, uniqueFileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate the correct URL based on the current environment
    const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
    const host = request.headers.get('host') || 'localhost:3000';
    // This URL points to our secure serve API
    const fileUrl = `${protocol}://${host}/api/serve-pitch-deck/${uniqueFileName}`;
    
    console.log('Generated file URL:', fileUrl);

    return NextResponse.json({ 
      success: true, 
      fileUrl,
      fileName: uniqueFileName,
      originalName: fileName,
      size: file.size
    });

  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}
