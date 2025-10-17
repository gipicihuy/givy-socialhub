// File: api/tweet.js (FINAL VERSION: Telegram Block Code dengan Mode Markdown Lama)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendNotificationToTelegram = async (name, username, tweetContent, imageUrl, ipAddress, userAgent) => {
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    // Menggunakan tiga backtick (\x60\x60\x60) untuk Code Block
    // Catatan: \x60 adalah kode ASCII untuk backtick, digunakan agar string ini tidak mengganggu parsing JavaScript
    // Tiga backtick akan diterjemahkan sebagai: ```
    const formattedTweetContent = "\x60\x60\x60\n" + tweetContent.substring(0, 500) + "\n\x60\x60\x60"; 

    // Structure pesan Telegram yang disempurnakan
    const message = `*✨ NEW FAKE TWEET GENERATED ✨*\n\n` + 
                    `*👤 Data Pengguna:*\n` + 
                    `- Name: \`${name}\`\n` + 
                    `- Username: \`@${username}\`\n` +
                    `- Tweet:\n${formattedTweetContent}\n` + // Menggunakan Block Code (3 backtick)
                    `- IP Address: \`${ipAddress}\`\n` + 
                    `- User Agent: \`${userAgent.substring(0, 50)}...\`\n` +
                    `\n_🕒 Dibuat pada: ${timestamp}_`; 

    try {
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                // Menggunakan 'Markdown' (bukan MarkdownV2) seperti yang Anda sebutkan berhasil.
                parse_mode: 'Markdown', 
            }),
        });
        console.log('Telegram notification sent successfully.');
    } catch (error) {
        console.error('Error sending Telegram notification:', error);
    }
};

export default async function handler(request, response) {
    const { imageUrl, download, name, username, comment } = request.query; 

    // --- PENGAMBILAN IP DAN USER AGENT DARI HEADER ---
    const userAgent = request.headers['user-agent'] || 'N/A';
    const ipAddress = request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || 'N/A';
    const cleanIp = ipAddress.split(',')[0].trim(); 
    // --------------------------------------------------


    if (!imageUrl) {
        return response.status(400).json({ status: 'error', message: 'Missing imageUrl parameter.' });
    }

    const isDownload = download === 'true';

    // --- Proses Download Langsung (Direct Download) ---
    if (isDownload) {
        try {
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error('Failed to fetch image from external API.');
            }

            // Set Header untuk Direct Download
            response.setHeader('Content-Type', 'image/png'); 
            response.setHeader('Content-Disposition', `attachment; filename="fake_tweet_${username || 'result'}.png"`);
            
            const buffer = await imageResponse.arrayBuffer();
            return response.send(Buffer.from(buffer)); 
            
        } catch (error) {
            console.error('Download error:', error);
            return response.status(500).json({ status: 'error', message: 'Failed to process download.' });
        }
    }

    // --- Proses Pembuatan (Generate) dan Notifikasi (GET) ---
    
    // 1. Kirim Notifikasi ke Telegram
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const tweetName = name || 'N/A';
        const tweetUsername = username || 'N/A';
        const tweetContent = comment || 'N/A'; 
        
        sendNotificationToTelegram(tweetName, tweetUsername, tweetContent, imageUrl, cleanIp, userAgent);
    }

    // 2. Kirim URL Gambar kembali ke frontend untuk ditampilkan
    return response.status(200).json({ 
        status: 'ok', 
        imageUrl: imageUrl 
    });
}
