// File: api/tweet.js (FINAL VERSION)

// Menggunakan TELEGRAM_CHAT_ID sesuai permintaan Anda
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendNotificationToTelegram = async (name, username, imageUrl) => {
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    // Structure pesan Telegram (mirip dengan notifikasi IQC)
    const message = `*✨ NEW FAKE TWEET GENERATED ✨*\n\n` + 
                    `*👤 Data Pengguna:*\n` + 
                    `- Name: \`${name}\`\n` + 
                    `- Username: \`@${username}\`\n` +
                    `- IP Address: \`N/A (API)\`\n` + 
                    `\n_🕒 Dibuat pada: ${timestamp}_\n\n` +
                    `[Lihat Gambar Hasil](https://t.me/share/url?url=${encodeURIComponent(imageUrl)})`;

    try {
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID, // Perbaikan CHAT_ID
                text: message,
                parse_mode: 'Markdown',
            }),
        });
        console.log('Telegram notification sent successfully.');
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
};

export default async function handler(request, response) {
    const { imageUrl, download, name, username } = request.query;

    if (!imageUrl) {
        return response.status(400).json({ status: 'error', message: 'Missing imageUrl parameter.' });
    }

    const isDownload = download === 'true';

    // --- FIX: Proses Download Langsung (Direct Download) ---
    if (isDownload) {
        try {
            // 1. Fetch konten gambar secara langsung
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error('Failed to fetch image from external API.');
            }

            // 2. Set Header untuk Direct Download
            response.setHeader('Content-Type', 'image/png'); 
            response.setHeader('Content-Disposition', 'attachment; filename="fake_tweet_by_givy.png"');
            
            // 3. Streaming konten gambar kembali ke klien
            // Menggunakan response.send() atau pipeline stream untuk binary data
            // Di lingkungan Vercel/Node, kita bisa menggunakan response.send(Buffer)
            const buffer = await imageResponse.arrayBuffer();
            return response.send(Buffer.from(buffer)); 
            
        } catch (error) {
            console.error('Download error:', error);
            return response.status(500).json({ status: 'error', message: 'Failed to process download.' });
        }
    }

    // --- Proses Pembuatan (Generate) dan Notifikasi ---
    
    // 1. Kirim Notifikasi ke Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const tweetName = name || 'N/A';
        const tweetUsername = username || 'N/A';
        sendNotificationToTelegram(tweetName, tweetUsername, imageUrl);
    }

    // 2. Kirim URL Gambar kembali ke frontend untuk ditampilkan
    return response.status(200).json({ 
        status: 'ok', 
        imageUrl: imageUrl 
    });
}
