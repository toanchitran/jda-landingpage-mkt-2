import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pitchDeckFile') as File;
    const fileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'pitch-decks');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${timestamp}_${sanitizedName}`;
    const filePath = path.join(uploadsDir, uniqueFileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Set proper file permissions
    await import('fs').then(fs => {
      try {
        fs.chmodSync(filePath, 0o644); // Read permissions for owner, group, and others
      } catch (error) {
        console.warn('Could not set file permissions:', error);
      }
    });

    // Generate the correct URL based on the current environment
    const protocol = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http');
    const host = request.headers.get('host') || 'localhost:3000';
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
