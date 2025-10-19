const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { quote, chatTime, statusBarTime, nglReport } = request.body;
    
    const userAgent = request.headers['user-agent'] || 'N/A';
    const ipAddress = request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || 'N/A';

    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    let message;
    
    // JIKA INI NGL SPAM REPORT (FORMAT BARU)
    if (nglReport) {
        message = `📨 *NGL SPAM REPORT*\n\n` +
                 `🎯 *TARGET:* ${nglReport.target}\n` +
                 `💬 *MESSAGE:* ${nglReport.message}\n` +
                 `📤 *ATTEMPTS:* ${nglReport.attempts}\n\n` +
                 
                 `📊 *RESULTS:*\n` +
                 `✅ Success: ${nglReport.success}\n` +
                 `❌ Failed: ${nglReport.failed}\n` +
                 `📈 Rate: ${nglReport.rate}\n\n` +
                 
                 `👤 *USER DATA:*\n` +
                 `🌐 IP: ${ipAddress}\n` +
                 `📱 Agent: ${userAgent.substring(0, 40)}...\n` +
                 `🕒 Time: ${timestamp}\n\n` +
                 
                 `_🤖 Sent via Givy NGL Spam Bot_`;
    }
    // JIKA INI IQC GENERATED (FORMAT LAMA)
    else if (quote) {
        message = `✨ *NEW IQC GENERATED* 🌬\n\n` +
                 `⏰ *Info Waktu Chat:*\n` +
                 `├ Chat Time: \`${chatTime}\`\n` +
                 `└ Status Bar: \`${statusBarTime}\`\n\n` +
                 
                 `📜 *Quote Text:*\n` +
                 `\`\`\`\n${quote}\n\`\`\`\n\n` +
                 
                 `👤 *Data Pengguna:*\n` +
                 `├ IP Address: \`${ipAddress}\`\n` +
                 `└ User Agent: \`${userAgent.substring(0, 50)}...\`\n\n` +
                 
                 `_🕒 Dibuat pada: ${timestamp}_`;
    } else {
        return response.status(400).json({ error: 'Quote text or NGL report is required.' });
    }

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const res = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        if (res.ok) {
            return response.status(200).json({ status: 'Notification sent successfully' });
        } else {
            console.error('Telegram API error:', await res.text());
            return response.status(200).json({ status: 'Notification failed but client is okay' });
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return response.status(200).json({ status: 'Internal server error during notification' });
    }
}
