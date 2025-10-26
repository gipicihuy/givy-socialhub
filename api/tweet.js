// File: api/tweet.js (UPDATED: Support V1 & V2 with Telegram Notification)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const sendNotificationToTelegram = async (version, name, username, tweetContent, avatarUrl, ipAddress, userAgent, v2Data = null) => {
    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    const formattedTweetContent = "\x60\x60\x60\n" + tweetContent.substring(0, 500) + "\n\x60\x60\x60"; 

    let message;
    
    if (version === 'v2') {
        // Format untuk Tweet V2 (Advanced)
        message = `*✨ NEW FAKE TWEET V2 GENERATED ✨*\n\n` + 
                  `*👤 Data Pengguna:*\n` + 
                  `- Name: \`${name}\`\n` + 
                  `- Username: \`@${username}\`\n` +
                  `- Tweet:\n${formattedTweetContent}\n` +
                  `- Avatar URL: ${avatarUrl}\n` +
                  `\n*🎨 V2 Settings:*\n` +
                  `- Theme: \`${v2Data.theme}\`\n` +
                  `- Client: \`${v2Data.client}\`\n` +
                  `- Retweets: \`${v2Data.retweets}\`\n` +
                  `- Quotes: \`${v2Data.quotes}\`\n` +
                  `- Likes: \`${v2Data.likes}\`\n` +
                  `- Tweet Image: ${v2Data.tweetImage !== 'null' ? v2Data.tweetImage : 'None'}\n` +
                  `\n*📡 Connection Info:*\n` +
                  `- IP Address: \`${ipAddress}\`\n` + 
                  `- User Agent: \`${userAgent.substring(0, 50)}...\`\n` +
                  `\n_🕒 Dibuat pada: ${timestamp}_`; 
    } else {
        // Format untuk Tweet V1 (Simple)
        message = `*✨ NEW FAKE TWEET V1 GENERATED ✨*\n\n` + 
                  `*👤 Data Pengguna:*\n` + 
                  `- Name: \`${name}\`\n` + 
                  `- Username: \`@${username}\`\n` +
                  `- Tweet:\n${formattedTweetContent}\n` + 
                  `- Avatar URL: ${avatarUrl}\n` + 
                  `- IP Address: \`${ipAddress}\`\n` + 
                  `- User Agent: \`${userAgent.substring(0, 50)}...\`\n` +
                  `\n_🕒 Dibuat pada: ${timestamp}_`; 
    }

    try {
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const res = await fetch(telegramApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown', 
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
