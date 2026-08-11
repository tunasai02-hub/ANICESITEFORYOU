IP → Telegram sitesi

1) Bilgisayarında Node.js kurulu olsun.
2) Bu klasörde terminal aç:
   npm install

3) .env.example dosyasını .env olarak kopyala.
4) .env içindeki:
   TELEGRAM_BOT_TOKEN
   TELEGRAM_CHAT_ID
   değerlerini doldur.

5) Çalıştır:
   npm start

6) Tarayıcıdan:
   http://localhost:3000

ÖNEMLİ:
- Bot tokenını asla siteye ait frontend JavaScript dosyasına koyma.
- IP adresi kişisel veri sayılabilir. Gerçek bir site yayınlarken ziyaretçileri
  uygun bir gizlilik/aydınlatma metniyle bilgilendir ve yerel mevzuata uy.
- Bu örnek yalnızca gelen IP'yi Telegram'a gönderir; VPN tespiti yapmaz.
