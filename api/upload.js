// File: api/upload.js (Simplified Version - Base64)
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { base64 } = request.body;
        
        if (!base64) {
            return response.status(400).json({ error: 'No file data' });
        }

        // Convert base64 to buffer
        const buffer = Buffer.from(base64.split(',')[1] || base64, 'base64');

        // FormData untuk qu.ax
        const formData = new FormData();
        const blob = new Blob([buffer], { type: 'image/jpeg' });
        formData.append('files[]', blob, 'avatar.jpg');

        const uploadRes = await fetch('https://qu.ax/upload.php', {
            method: 'POST',
            headers: {
                'Referer': 'https://qu.ax/'
            },
            body: formData
        });

        const data = await uploadRes.json();

        if (data.success && data.files?.[0]?.url) {
            return response.status(200).json({
                success: true,
                url: data.files[0].url
            });
        }

        return response.status(500).json({ error: 'Upload to qu.ax failed' });

    } catch (error) {
        console.error('Upload error:', error);
        return response.status(500).json({ 
            error: 'Upload failed',
            details: error.message 
        });
    }
}
