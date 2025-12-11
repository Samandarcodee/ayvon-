<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1n_z_MZ1xUN40vmjyGMYI9Nd4euI96btp

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Offlayn va Onlayn ishga tushirish

### Offlayn (internet bo'lmaganida)
1. `npm install`
2. `npm run build`
3. `npm run preview -- --host 0.0.0.0 --port 4173`
4. Brauzerda `http://localhost:4173` manzilini internet ulangan holda bir marta oching. Shu jarayonda servis worker barcha statik fayllarni va `IndexedDB` ma'lumotlarini keshlaydi.
5. Ilovani PWA sifatida o'rnatib qo'ying (brauzer prompti chiqadi). Keyingi tashriflarda internet bo'lmasa ham UI, ma'lumot kiritish va lokal saqlash ishlaydi. Telegram xabarlari esa faqat internet qaytganda yuboriladi.

### Onlayn (internet bilan)
- Tezkor dev rejimi: `npm run dev` – bu rejim Hot Module Reload bilan ishlaydi, tarmoq ulangan bo'lishi lozim.
- Prodakshn serverga chiqarish: `npm run build` → `dist/` papkasini Vercel/Netlify kabi statik hostingga yuklang yoki `npm run preview` bilan lokal tekshiring.
- Onlayn rejimda Telegram bildirishnomalari avtomatik yuboriladi, shuningdek brauzer servis worker yangi versiyani fon rejimida yangilab boradi.
