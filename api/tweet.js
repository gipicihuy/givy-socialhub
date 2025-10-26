// File: api/tweet.js (UPDATED: Support V1 & V2 with Telegram Notification)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendNotificationToTelegram = async (version, name, username, tweetContent, avatarUrl, ipAddress, userAgent, v2Data = null) => {
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    // Escape HTML special characters
    const escapeHtml = (text) => {
        return text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;');
    };

    const safeName = escapeHtml(name);
    const safeUsername = escapeHtml(username);
    const safeTweetContent = escapeHtml(tweetContent.substring(0, 500));
    const safeUserAgent = escapeHtml(userAgent.substring(0, 50));

    let message;
    
    if (version === 'v2') {
        // Format untuk Tweet V2 (Advanced) - HTML
        message = `<b>✨ NEW FAKE TWEET V2 GENERATED ✨</b>\n\n` + 
                  `<b>👤 Data Pengguna:</b>\n` + 
                  `├ <b>Name:</b> <code>${safeName}</code>\n` + 
                  `├ <b>Username:</b> <code>@${safeUsername}</code>\n` +
                  `└ <b>Tweet:</b>\n<pre>${safeTweetContent}</pre>\n\n` +
                  `<b>🖼 Media:</b>\n` +
                  `├ <b>Avatar:</b> <a href="${avatarUrl}">View Profile Pic</a>\n` +
                  `└ <b>Tweet Image:</b> ${v2Data.tweetImage !== 'null' ? `<a href="${v2Data.tweetImage}">View Image</a>` : 'None'}\n\n` +
                  `<b>🎨 V2 Settings:</b>\n` +
                  `├ <b>Theme:</b> <code>${v2Data.theme}</code>\n` +
                  `├ <b>Client:</b> <code>${v2Data.client}</code>\n` +
                  `├ <b>Retweets:</b> <code>${v2Data.retweets}</code>\n` +
                  `├ <b>Quotes:</b> <code>${v2Data.quotes}</code>\n` +
                  `└ <b>Likes:</b> <code>${v2Data.likes}</code>\n\n` +
                  `<b>📡 Connection Info:</b>\n` +
                  `├ <b>IP Address:</b> <code>${ipAddress}</code>\n` + 
                  `└ <b>User Agent:</b> <code>${safeUserAgent}...</code>\n\n` +
                  `<i>🕒 ${timestamp}</i>`; 
    } else {
        // Format untuk Tweet V1 (Simple) - HTML
        message = `<b>✨ NEW FAKE TWEET V1 GENERATED ✨</b>\n\n` + 
                  `<b>👤 Data Pengguna:</b>\n` + 
                  `├ <b>Name:</b> <code>${safeName}</code>\n` + 
                  `├ <b>Username:</b> <code>@${safeUsername}</code>\n` +
                  `└ <b>Tweet:</b>\n<pre>${safeTweetContent}</pre>\n\n` +
                  `<b>🖼 Media:</b>\n` +
                  `└ <b>Avatar:</b> <a href="${avatarUrl}">View Profile Pic</a>\n\n` +
                  `<b>📡 Connection Info:</b>\n` +
                  `├ <b>IP Address:</b> <code>${ipAddress}</code>\n` + 
                  `└ <b>User Agent:</b> <code>${safeUserAgent}...</code>\n\n` +
                  `<i>🕒 ${timestamp}</i>`; 
    }

    try {
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const res = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML', 
                disable_web_page_preview: true, 
            }),
        });

        if (res.ok) {
            console.log('✅ Telegram notification sent successfully.');
            return true;
        } else {
            console.error('❌ Telegram API error:', await res.text());
            return false;
        }
    } catch (error) {
        console.error('❌ Error sending Telegram notification:', error);
        return false;
    }
};

export default async function handler(request, response) {
    const { 
        imageUrl, 
        download, 
        name, 
        username, 
        comment, 
        avatarUrl, 
        version,
        theme,
        client,
        retweets,
        quotes,
        likes,
        tweetImage
    } = request.query; 

    const userAgent = request.headers['user-agent'] || 'N/A';
    const ipAddress = request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || 'N/A';
    const cleanIp = ipAddress.split(',')[0].trim(); 

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
    
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        const tweetName = name || 'N/A';
        const tweetUsername = username || 'N/A';
        const tweetContent = comment || 'N/A'; 
        const urlAvatar = avatarUrl || 'N/A';
        const tweetVersion = version || 'v1';
        
        // Data tambahan untuk V2
        let v2Data = null;
        if (tweetVersion === 'v2') {
            v2Data = {
                theme: theme || 'light',
                client: client || 'Twitter for iPhone',
                retweets: retweets || '0',
                quotes: quotes || '0',
                likes: likes || '0',
                tweetImage: tweetImage || 'null'
            };
        }
        
        // Tunggu sampai Telegram notification berhasil dikirim
        await sendNotificationToTelegram(tweetVersion, tweetName, tweetUsername, tweetContent, urlAvatar, cleanIp, userAgent, v2Data);
    }

    // Setelah notifikasi berhasil, baru kirim respons ke frontend
    return response.status(200).json({ 
        status: 'ok', 
        imageUrl: imageUrl 
    });
}
