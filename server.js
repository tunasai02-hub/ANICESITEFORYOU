require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

// Render/Cloudflare gibi bir proxy arkasında çalışırken istemci IP'sini alabilmek için.
// Güvenmediğin proxy'leri kullanıyorsan bu ayarı ona göre değiştir.
app.set("trust proxy", true);

function getClientIp(req) {
  let ip = req.ip || req.socket.remoteAddress || "";
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  return ip;
}

async function sendTelegram(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.log("Telegram ayarları eksik.");
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  });

  if (!response.ok) {
    console.error("Telegram hatası:", await response.text());
  }
}

app.get("/", async (req, res) => {
  const ip = getClientIp(req);
  const time = new Date().toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul"
  });

  const message =
`🌐 Yeni ziyaretçi

IP: ${ip}
Saat: ${time}`;

  console.log(message);
  await sendTelegram(message);

  res.send(`<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hoş Geldin</title>
<style>
body{font-family:Arial,sans-serif;background:#111;color:#fff;display:grid;place-items:center;height:100vh;margin:0}
.card{padding:30px;border-radius:18px;background:#1d1d1d;text-align:center;max-width:500px}
</style>
</head>
<body>
<div class="card">
<h1>Hoş geldin 👋</h1>
<p>Siteye başarıyla bağlandın.</p>
</div>
</body>
</html>`);
});

app.listen(PORT, () => {
  console.log(`Site http://localhost:${PORT} adresinde çalışıyor.`);
});
