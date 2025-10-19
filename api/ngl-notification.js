// /api/ngl-notification.js - ENDPOINT BARU KHUSUS NGL SPAM
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = request.body;
    
    // Data dari request header
    const userAgent = request.headers['user-agent'] || 'N/A';
    const ipAddress = request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || 'N/A';

    if (!message) {
        return response.status(400).json({ error: 'Message is required.' });
    }

    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    
    // FORMAT KHUSUS UNTUK NGL SPAM (TERPISAH DARI IQC)
    const formattedMessage = `${message}\n\n` +
                    `*👤 Data Pengguna:*\n` +
                    `- IP Address: \`${ipAddress}\`\n` +
                    `- User Agent: \`${userAgent.substring(0, 50)}...\`\n` +
                    `\n_🕒 Dilaporkan pada: ${timestamp}_`;

    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
        const res = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: formattedMessage,
                parse_mode: 'Markdown'
            })
        });

        if (res.ok) {
            return response.status(200).json({ status: 'NGL notification sent successfully' });
        } else {
            console.error('Telegram API error:', await res.text());
            return response.status(200).json({ status: 'Notification failed but client is okay' });
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return response.status(200).json({ status: 'Internal server error during notification' });
    }
}
