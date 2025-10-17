// File: api/tweet.js (FINAL FIX: Menggunakan POST untuk GENERATE)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendPhotoNotificationToTelegram = async (name, username, imageUrl, ipAddress, userAgent) => {
    // ... (Fungsi ini sama seperti sebelumnya)
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    const caption = `*✨ NEW FAKE TWEET GENERATED ✨*\n\n` + 
                    `*👤 Data Pengguna:*\n` + 
                    `- Name: \`${name}\`\n` + 
                    `- Username: \`@${username}\`\n` +
                    `- IP Address: \`${ipAddress}\`\n` + 
                    `- User Agent: \`${userAgent.substring(0, 50)}...\`\n` +
                    `\n_🕒 Dibuat pada: ${timestamp}_`;
    
    try {
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;
        await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                photo: imageUrl,
                caption: caption,
                parse_mode: 'Markdown',
            }),
        });
        console.log('Telegram photo notification sent successfully.');
    } catch (error) {
        console.error('Error sending Telegram photo notification:', error);
    }
};

export default async function handler(request, response) {
    
    // --- PENGAMBILAN IP DAN USER AGENT ---
    const userAgent = request.headers['user-agent'] || 'N/A';
    const ipAddress = request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || 'N/A';
    const cleanIp = ipAddress.split(',')[0].trim();
    // ------------------------------------

    // =========================================================================
    // 1. JIKA DIPANGGIL UNTUK DOWNLOAD (METHOD GET)
    // =========================================================================
    if (request.method === 'GET' && request.query.download === 'true') {
        const { imageUrl } = request.query;
        if (!imageUrl) {
             return response.status(400).json({ status: 'error', message: 'Missing imageUrl for download.' });
        }
        
        try {
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error('Failed to fetch image from external API.');
            }

            response.setHeader('Content-Type', 'image/png'); 
            response.setHeader('Content-Disposition', 'attachment; filename="fake_tweet_by_givy.png"');
            
            const buffer = await imageResponse.arrayBuffer();
            return response.send(Buffer.from(buffer)); 
            
        } catch (error) {
            console.error('Download error:', error);
            return response.status(500).json({ status: 'error', message: 'Failed to process download.' });
        }
    }

    // =========================================================================
    // 2. JIKA DIPANGGIL UNTUK GENERATE (METHOD POST)
    // =========================================================================
    if (request.method === 'POST') {
        const { imageUrl, name, username } = request.body; // Ambil dari body
        
        if (!imageUrl) {
            return response.status(400).json({ status: 'error', message: 'Missing imageUrl parameter.' });
        }
        
        // 1. KIRIM NOTIFIKASI FOTO ke Telegram
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            const tweetName = name || 'N/A';
            const tweetUsername = username || 'N/A';
            
            // Notifikasi berjalan di sini
            sendPhotoNotificationToTelegram(tweetName, tweetUsername, imageUrl, cleanIp, userAgent);
        }

        // 2. Kirim URL Gambar kembali ke frontend (respon utama)
        return response.status(200).json({ 
            status: 'ok', 
            imageUrl: imageUrl 
        });
    }

    // Tanggapan default jika method tidak sesuai
    return response.status(405).json({ status: 'error', message: 'Method Not Allowed' });
}
