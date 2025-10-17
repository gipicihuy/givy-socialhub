// File: api/tweet.js

// Pastikan Anda mendapatkan TELEGRAM_BOT_TOKEN dan CHAT_ID dari environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

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
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        });
        // Console log hanya untuk debugging Vercel
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

    // Jika ini adalah permintaan download, kita tidak perlu kirim notifikasi lagi
    if (isDownload) {
        // Karena ini adalah request GET sederhana, kita hanya perlu mengarahkan
        // browser ke URL gambar dengan header Content-Disposition
        response.setHeader('Content-Type', 'image/png'); // Asumsi output PNG
        response.setHeader('Content-Disposition', 'attachment; filename="fake_tweet_by_givy.png"');
        return response.redirect(302, imageUrl);
    }

    // --- Proses Pembuatan (Generate) dan Notifikasi ---

    // 1. Kirim Notifikasi ke Telegram
    if (TELEGRAM_BOT_TOKEN && CHAT_ID) {
        // Ambil data nama dan username untuk notifikasi
        const tweetName = name || 'N/A';
        const tweetUsername = username || 'N/A';
        // Jalankan notifikasi tanpa menunggu hasilnya (fire-and-forget)
        sendNotificationToTelegram(tweetName, tweetUsername, imageUrl);
    }

    // 2. Kirim URL Gambar kembali ke frontend
    return response.status(200).json({ 
        status: 'ok', 
        imageUrl: imageUrl 
    });
}
