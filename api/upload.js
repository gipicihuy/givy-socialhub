import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Handle file upload dari client
    const { file } = req.body;
    
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Convert base64 ke buffer
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid file format' });
    }

    const fileBuffer = Buffer.from(matches[2], 'base64');
    const fileName = `avatar_${Date.now()}.jpg`;

    // Buat form data untuk upload ke qu.ax
    const formData = new FormData();
    formData.append('files[]', fileBuffer, {
      filename: fileName,
      contentType: matches[1]
    });

    // Upload ke qu.ax
    const response = await fetch('https://qu.ax/upload.php', {
      method: 'POST',
      body: formData,
      headers: {
        'Referer': 'https://qu.ax/',
        ...formData.getHeaders()
      }
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.files && data.files.length > 0) {
      res.status(200).json({
        success: true,
        url: data.files[0].url
      });
    } else {
      throw new Error('Upload failed - no file URL returned');
    }

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed', 
      details: error.message 
    });
  }
}
