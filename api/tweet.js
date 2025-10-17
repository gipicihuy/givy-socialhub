// File: api/tweet.js (FINAL VERSION - TEXT NOTIFICATION ONLY)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendTextNotificationToTelegram = async (name, username, tweetContent, imageUrl, ipAddress, userAgent) => {
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    // Caption untuk foto (data pengguna)
    const message = `*✨ NEW FAKE TWEET GENERATED (Text Only) ✨*\n\n` + 
                    `*📜 Tweet Content:*\n` +
                    `\`\`\`\n${tweetContent.substring(0, 300)}...\n\`\`\`\n` + // Batasi panjang Tweet
                    `\n*👤 Data Pengguna:*\n` + 
                    `- Name: \`${name}\`\n` + 
                    `- Username: \`@${username}\`\n` +
                    `- IP Address: \`${ipAddress}\`\n` + 
                    `- User Agent: \`${userAgent.substring(0, 50)}...\`\n` +
                    `\n_🕒 Dibuat pada: ${timestamp}_\n\n` +
                    `[Lihat Hasil Gambar Asli](${imageUrl})`; // Berikan link ke gambar jika diperlukan
    
    // Perhatikan: Menggunakan sendMessage
    try {
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        });
        console.log('Telegram text notification sent successfully.');
    } catch (error) {
        console.error('Error sending Telegram text notification:', error);
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
        // Kita perlu mendapatkan konten Tweet untuk notifikasi
        // Karena konten Tweet (comment) tidak dikirim di body dari index.html, 
        // kita TIDAK BISA mendapatkan konten tweet, hanya name dan username.

        // SOLUSI: KODE FRONTEND HARUS MENGIRIM KOMEN JUGA.
        // Asumsikan kode frontend sudah mengirim 'comment' di body.
        const { imageUrl, name, username, comment } = request.body; 
        
        if (!imageUrl) {
            return response.status(400).json({ status: 'error', message: 'Missing imageUrl parameter.' });
        }
        
        // 1. KIRIM NOTIFIKASI TEKS ke Telegram (Menggunakan data teks yang tersedia)
        if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
            const tweetName = name || 'N/A';
            const tweetUsername = username || 'N/A';
            const tweetComment = comment || 'N/A';
            
            // Notifikasi berjalan di sini
            sendTextNotificationToTelegram(tweetName, tweetUsername, tweetComment, imageUrl, cleanIp, userAgent);
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
