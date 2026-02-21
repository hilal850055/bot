const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ],
    }
});

client.on('qr', (qr) => {
    // سيظهر الكود في الـ Logs الخاصة بالسيرفر السحابي
    console.log('QR RECEIVED');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp is ready!');
});

app.post('/send', async (req, res) => {
    const { phone, message, key } = req.body;
    if (key !== "MASTER_KEY_2024") return res.status(403).send('Invalid Key');
    
    try {
        const chatId = `${phone.replace(/\D/g, '')}@c.us`;
        await client.sendMessage(chatId, message);
        res.status(200).send('Sent');
    } catch (e) {
        res.status(500).send(e.message);
    }
});

// مسار للتأكد أن السيرفر حي (Keep-alive)
app.get('/', (req, res) => res.send('Server Running 24/7'));

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('Server started on port ' + port);
    client.initialize();
});