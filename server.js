require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

// Aynı IP'den tekrar tekrar Telegram mesajı gitmesini engeller.
const seenIps = new Set();

function getClientIp(req) {
  let ip = req.ip || req.socket.remoteAddress || "";

  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }

  return ip;
}

// Link önizleme servislerini ve botları bildirimden hariç tut.
function isPreviewOrBot(req) {
  const ua = (req.get("user-agent") || "").toLowerCase();

  const botWords = [
    "telegrambot",
    "facebookexternalhit",
    "facebot",
    "twitterbot",
    "whatsapp",
    "discordbot",
    "googlebot",
    "bingbot",
    "linkedinbot",
    "slackbot",
    "crawler",
    "spider",
    "preview",
    "bot"
  ];

  return botWords.some(word => ua.includes(word));
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
    headers: {
      "Content-Type": "application/json"
    },
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

  // Aynı IP daha önce geldiyse tekrar Telegram'a gönderme.
  if (!isPreviewOrBot(req) && ip && !seenIps.has(ip)) {
    seenIps.add(ip);

    const message = `🌐 Yeni ziyaretçi

IP: ${ip}
Saat: ${time}`;

    console.log(message);

    await sendTelegram(message);
  } else {
    console.log(
      `Bildirim gönderilmedi: ${ip} (tekrar veya önizleme botu)`
    );
  }

  res.send(`<!doctype html>
<html lang="tr">

<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">

<title>:)</title>

<style>

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  width: 100%;
  min-height: 100%;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  color: #000;
  background: #fff;
  text-align: center;

  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 100vh;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 25px;

  padding: 20px;
}

h1 {
  margin: 0;

  font-size: clamp(28px, 5vw, 56px);

  font-weight: 600;

  letter-spacing: -1px;
}

img {
  display: block;

  max-width: 90vw;
  max-height: 65vh;

  width: auto;
  height: auto;

  object-fit: contain;
}

</style>

</head>

<body>

<div class="content">

  <h1>nası inandın bilmiyorum:)</h1>

  <img
    src="https://i.pinimg.com/736x/d1/d6/89/d1d689d280015331b1a3954e784459b8.jpg"
    alt="Fotoğraf"
  >

</div>

</body>

</html>`);
});

app.listen(PORT, () => {
  console.log(`Site http://localhost:${PORT} adresinde çalışıyor.`);
});
