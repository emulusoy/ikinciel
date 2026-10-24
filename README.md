# Kayseri İkinci El İnşaat Malzemeleri - Web Sitesi

Babanızın Kayseri'deki ikinci el inşaat malzemeleri işletmesi için özel olarak hazırlanmış; **Google arama motorunda (SEO) en öne çıkacak şekilde optimize edilmiş**, **30-80 yaş arası ustalar ve müteahhitler için büyük puntolu ve dev arama/WhatsApp butonlarına sahip**, **canlı ziyaretçi sayaçlı** ve **Facebook anlık paylaşımlar vitrini** içeren yüksek performanslı web sitesi.

---

## ⚡ 1. Babanızın Telefon Numarası ve Facebook Linkini Güncelleme

Tüm işletme bilgileri tek bir dosyadan yönetilir:
👉 **Dosya Yolu:** `src/siteConfig.js`

Bu dosyayı açarak aşağıdaki alanları babanızın gerçek bilgileriyle doldurmanız yeterlidir:

```javascript
export const siteConfig = {
  // İşletme & Babanızın Bilgileri
  businessName: "Kayseri Güven İkinci El İnşaat Malzemeleri",
  
  // Telefon (Arama ve WhatsApp için)
  phoneDisplay: "0532 123 45 67",    // Ekranda büyük harflerle gözükecek numara
  phoneRaw: "+905321234567",         // Tek tıkla arama için numara
  whatsappNumber: "905321234567",     // Başında 0 olmadan WhatsApp numarası
  
  // Adres
  addressFull: "Eski Sanayi / Yeni Sanayi Bölgesi, Kocasinan / Kayseri",
  
  // Facebook Sayfası
  facebookPageUrl: "https://www.facebook.com/kayseriikincielinsaat",
  ...
};
```

---

## 🚀 2. Cloudflare Pages ile Yayına Alma (1 Dakika)

Bu site Cloudflare Pages için optimize edilmiştir:

### Yöntem A: GitHub ile Otomatik Deploy (Tavsiye Edilen)
1. Bu projeyi GitHub hesabınızda bir depoya (repository) yükleyin.
2. [dash.cloudflare.com](https://dash.cloudflare.com/) adresine gidin.
3. Sol menüden **Workers & Pages** > **Create application** > **Pages** > **Connect to Git** seçeneğini tıklayın.
4. GitHub deponuzu seçin:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
5. **Save and Deploy** butonuna basın. Siteniz saniyeler içinde `https://proje-adiniz.pages.dev` olarak ücretsiz ve SSL sertifikalı olarak yayına girer.

### Yöntem B: Doğrudan `dist` Klasörünü Yükleme
1. Terminalde `npm run build` çalıştırın.
2. Cloudflare Dashboard > **Workers & Pages** > **Upload assets** seçin.
3. Oluşan `dist` klasörünü sürükleyip bırakın.

---

## 🎯 3. Google'da "Kayseri İkinci El İnşaat Malzemesi" Aramasında 1. Sıraya Çıkma Rehberi

Site içerisinde aşağıdaki SEO altyapıları eksiksiz olarak kurulmuştur:
1. **Schema.org (LocalBusiness & Store):** Google botları sitenin Kayseri'de fiziksel bir dükkan olduğunu anlar.
2. **Schema.org (FAQPage):** Google aramalarında arama sonuçlarının altında geniş soru-cevap kutucukları çıkarır.
3. **Geo-Location Meta Tags:** `TR-38` (Kayseri) koordinatları gömülmüştür.
4. **Sitemap.xml ve Robots.txt:** Arama motorlarının tüm malzemeleri anında taraması için hazır durumdadır.

### En Öne Çıkmak İçin Yapılması Gereken 2 Kritik Adım:
1. **Google İşletme Profili (Google Haritalar):** 
   - [business.google.com](https://business.google.com/) adresinden babanızın dükkanını "Kayseri İkinci El İnşaat Malzemeleri" başlığıyla haritaya ekleyin. Web sitesi kısmına Cloudflare'deki site linkinizi yapıştırın.
2. **Google Search Console Kaydı:**
   - [search.google.com/search-console](https://search.google.com/search-console) üzerinden sitenizi ekleyin ve `sitemap.xml` dosyasını gönderin. Birkaç gün içinde Google aramalarında zirveye tırmanacaktır.
