// File: api/upload.js
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const buffer = request.body;
        
        if (!buffer || buffer.length === 0) {
            return response.status(400).json({ error: 'No file data' });
        }

        // Cek magic bytes untuk validasi gambar
        const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8;
        const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
        const isWebp = buffer.toString('utf8', 0, 4) === 'RIFF';
        const isGif = buffer.toString('utf8', 0, 3) === 'GIF';

        if (!isJpeg && !isPng && !isWebp && !isGif) {
            return response.status(400).json({ error: 'Invalid image format' });
        }

        // Buat FormData buat qu.ax
        const formData = new FormData();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        formData.append('files[]', blob, 'avatar.jpg');

        const uploadRes = await fetch('https://qu.ax/upload.php', {
            method: 'POST',
            headers: {
                'Referer': 'https://qu.ax/'
            },
            body: formData
        });

        if (!uploadRes.ok) {
            throw new Error('qu.ax upload failed');
        }

        const data = await uploadRes.json();

        if (data.success && data.files?.[0]?.url) {
            return response.status(200).json({
                success: true,
                url: data.files[0].url
            });
        }

        throw new Error('Invalid response from qu.ax');

    } catch (error) {
        console.error('Upload error:', error);
        return response.status(500).json({ 
            error: 'Upload failed',
            details: error.message 
        });
    }
}
