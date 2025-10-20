// File: api/upload.js
import FormData from 'form-data';
import fetch from 'node-fetch';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const form = new IncomingForm();
    
    form.parse(request, async (err, fields, files) => {
        if (err) {
            return response.status(500).json({ error: 'Parsing error', details: err.message });
        }

        const file = files.avatar?.[0];
        if (!file) {
            return response.status(400).json({ error: 'No file provided' });
        }

        // Validasi tipe file (hanya gambar)
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedMimes.includes(file.mimetype)) {
            return response.status(400).json({ error: 'Invalid file type. Only images allowed.' });
        }

        // Validasi ukuran file (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return response.status(400).json({ error: 'File too large. Max 5MB.' });
        }

        try {
            // Baca file dari tempat penyimpanan
            const fileStream = fs.createReadStream(file.filepath);
            
            // Buat FormData untuk qu.ax
            const formData = new FormData();
            formData.append('files[]', fileStream, file.originalFilename);

            // Upload ke qu.ax
            const uploadResponse = await fetch('https://qu.ax/upload.php', {
                method: 'POST',
                headers: {
                    ...formData.getHeaders(),
                    'Referer': 'https://qu.ax/'
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error(`Upload failed with status ${uploadResponse.status}`);
            }

            const uploadData = await uploadResponse.json();

            if (uploadData.success && uploadData.files?.[0]?.url) {
                return response.status(200).json({
                    success: true,
                    url: uploadData.files[0].url,
                    message: 'Upload successful'
                });
            } else {
                throw new Error('Upload service returned error');
            }

        } catch (error) {
            console.error('Upload error:', error);
            return response.status(500).json({ 
                error: 'Upload failed', 
                details: error.message 
            });
        }
    });
}
