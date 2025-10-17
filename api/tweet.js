// File: api/tweet.js (FIXED LOGIC FLOW)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendPhotoNotificationToTelegram = async (name, username, imageUrl, ipAddress, userAgent) => {
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
    const { imageUrl, download, name, username } = request.query;

    // --- PENGAMBILAN IP DAN USER AGENT ---
    const userAgent = request.headers['user-agent'] || 'N/A';
    const ipAddress = request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || 'N/A';
    const cleanIp = ipAddress.split(',')[0].trim();
    // ------------------------------------

    if (!imageUrl) {
        return response.status(400).json({ status: 'error', message: 'Missing imageUrl parameter.' });
    }

    const isDownload = download === 'true';

    // KARENA INI ADALAH ENDPOINT VERCEL YANG SAMA, KITA HARUS TAHU KENAPA DIPANGGIL:
    
    // =========================================================================
    // 1. JIKA DIPANGGIL UNTUK DOWNLOAD (DARI TOMBOL DOWNLOAD)
    // =========================================================================
    if (isDownload) {
        try {
            // TIDAK ADA NOTIFIKASI DI SINI, HANYA DOWNLOAD
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
    // 2. JIKA DIPANGGIL UNTUK GENERATE (DARI TOMBOL GENERATE)
    //    Ini adalah alur yang mengirim notifikasi.
    // =========================================================================

    // 1. KIRIM NOTIFIKASI FOTO ke Telegram (Fire-and-forget untuk kecepatan)
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const tweetName = name || 'N/A';
        const tweetUsername = username || 'N/A';
        
        // Memastikan notifikasi dikirim di sini.
        sendPhotoNotificationToTelegram(tweetName, tweetUsername, imageUrl, cleanIp, userAgent);
    }

    // 2. Kirim URL Gambar kembali ke frontend (respon utama)
    return response.status(200).json({ 
        status: 'ok', 
        imageUrl: imageUrl 
    });
}
