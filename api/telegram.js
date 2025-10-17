// File: api/telegram.js (Wajib ada di folder 'api')

// Membaca Environment Variable yang AMAN dari Vercel
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    // Ambil data dari browser pengguna
    const { quote, chatTime, statusBarTime } = request.body;

    if (!quote) {
        return response.status(400).json({ error: 'Quote text is required.' });
    }

    const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const message = `*IQC Generated!*\n\n*Quote:*\n\`\`\`\n${quote}\n\`\`\`\n\n*Chat Time:* ${chatTime}\n*Status Bar Time:* ${statusBarTime}\n*Timestamp:* ${timestamp}`;
    
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
            // Log error di server Vercel, kirim respons sukses ke klien
            console.error('Telegram API error:', await res.text());
            return response.status(200).json({ status: 'Notification failed but client is okay' });
        }
    } catch (error) {
        console.error('Fetch error:', error);
        // Selalu kembalikan 200 ke klien agar user tidak tahu ada error notifikasi
        return response.status(200).json({ status: 'Internal server error during notification' });
    }
}
