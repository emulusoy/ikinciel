// Kayseri'de en çok alınıp satılan 2. el inşaat malzemeleri listesi
export const initialProducts = [
  {
    id: "teleskopik-direk",
    title: "Teleskopik Demir Direk (Kalıp Altı Açma Direği)",
    category: "Direk & İskele",
    condition: "Temiz 2. El / Bakımlı",
    size: "3.00m - 3.50m - 4.00m boylarında",
    stock: "Depoda Mevcut (1000+ Adet)",
    description: "Kalıp altı teleskopik demir direkler. Mekanizmaları sorunsuz, vidaları yağlı, eğrilik veya yamukluk bulunmaz. Şantiye çıkışı temizlenmiş, hemen kullanıma hazır.",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80",
    badge: "Çok Satan",
    viewsCount: 428,
    features: ["İç-dış boru et kalınlığı standart", "Ağır yük taşıma kapasitesi", "Yerinde kontrol ve sayım imkanı"]
  },
  {
    id: "fincanli-flansli-iskele",
    title: "Kalıp Altı Fincanlı & Flanşlı İskele Sistemi",
    category: "Direk & İskele",
    condition: "Sıfır Ayarında / 2. El",
    size: "İstenilen metrekareye uygun takım",
    stock: "Takım Halinde Mevcut",
    description: "Yüksek döşeme ve ağır yükler için fincanlı/flanşlı kalıp altı iskele elemanları, yatay ve düşey bağlantı milleri, ayar milleri (alt-üst kriko).",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    badge: "Fırsat Ürünü",
    viewsCount: 312,
    features: ["Hızlı montaj ve söküm", "Yüksek mukavemetli çelik", "Kayseri içi nakliye kolaylığı"]
  },
  {
    id: "guvenlikli-dis-cephe-iskele",
    title: "Dış Cephe Güvenlikli İskele (Belgeli/Standart)",
    category: "Direk & İskele",
    condition: "2. El Temiz",
    size: "Pano, yürüyüş platformu, korkuluk, merdiven",
    stock: "Metrekare bazlı hazır",
    description: "İş güvenliği kurallarına uygun, metal kalaslı, emniyet korkuluklu ve merdivenli modüler dış cephe iskelesi. Sıva, boya, mantolama ve taş yünü işleri için ideal.",
    image: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?auto=format&fit=crop&w=800&q=80",
    badge: "Garantili",
    viewsCount: 285,
    features: ["Sac kalaslı kaymaz yüzey", "Emniyet kilitli korkuluklar", "Komple takım teslim"]
  },
  {
    id: "ikinci-el-plywood",
    title: "2. El Kalıplık Plywood (Huş & Rus & Çam)",
    category: "Ahşap & Plywood",
    condition: "1. ve 2. Kalite Seçilmiş",
    size: "18 mm - 21 mm (1250 x 2500 mm)",
    stock: "Paketli / Sayılmış Stok",
    description: "Beton dökümü sonrası temizlenmiş, köşeleri sağlam, patlak ve kabarma yapmamış kaliteli ikinci el plywood panolar. Tekrar tekrar döküme uygun.",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    badge: "Ekonomik",
    viewsCount: 519,
    features: ["Kürlü ve çift yüzü filmli", "Suya ve neme dayanıklı", "Kayseri merkez teslim"]
  },
  {
    id: "insaat-kerestesi-kalas",
    title: "İnşaatlık 5x10 ve 10x10 Kereste & Kalas",
    category: "Ahşap & Plywood",
    condition: "2. El Kuru Kereste",
    size: "3 metre, 4 metre boylarında",
    stock: "Metreküp bazlı hazır",
    description: "Kalıp takviyesi, tabya altı ızgara ve şantiye kullanımına uygun, çivileri sökülmüş, çürüksüz temiz çam ve kavak kalıp keresteleri.",
    image: "https://images.unsplash.com/photo-1520114878144-6123749968dd?auto=format&fit=crop&w=800&q=80",
    badge: "Hızlı Teslim",
    viewsCount: 394,
    features: ["Çivileri temizlenmiş", "Kuru ve gönyesi düzgün", "Yüksek yük dayanımı"]
  },
  {
    id: "sac-kalip-panosu",
    title: "Sac Kalıp Panosu (Perde & Kolon Kalıbı)",
    category: "Kalıp Sistemleri",
    condition: "Sağlam & Düzgün Gönyeli",
    size: "50x100 - 50x120 - 50x150 cm",
    stock: "Çok Sayıda Mevcut",
    description: "Temel, perde duvar ve kolon betonu için sac kalıp panoları. Kenar delikleri sağlam, kaynakları yerinde, kilitleri kolay geçen temiz panolar.",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    badge: "Fırsat",
    viewsCount: 236,
    features: ["U köşebent takviyeli", "Deformasyonsuz yüzey", "Hemen yüklemeye hazır"]
  },
  {
    id: "insaat-makineleri",
    title: "Betoniyer Harç Karma Makinesi & Vinç",
    category: "Makineler & Ekipman",
    condition: "Çalışır Durumda / Bakımlı",
    size: "150 Litre - 250 Litre - 350 Litre",
    stock: "Deneyerek Teslim",
    description: "Elektrikli ve benzinli harç karma kazanları (betoniyer), şantiye gırgır vinçleri, demir kesme ve bükme makineleri. Motorları ve dişlileri kontrol edilmiş.",
    image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80",
    badge: "Kontrol Edildi",
    viewsCount: 198,
    features: ["Elektrik motoru sağlam", "Dişli ve bilye bakımları yapılmış", "Çalıştırılıp denenerek teslim"]
  },
  {
    id: "ciroz-tierod-baglanti",
    title: "Kalıp Kilidi (Çiroz), Çiroz Kolları & Tie-Rod",
    category: "Kalıp Sistemleri",
    condition: "Sertleştirilmiş Çelik Yaylı",
    size: "Standart boy & Kollar",
    stock: "Çuvallı / Adetli",
    description: "Perde ve kolon kalıplarını sabitlemek için ikinci el çiroz mandalları (kalıp kilitleri), gerdirme kolları, tie-rod demiri ve döküm somunları.",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80",
    badge: "Toplu Alımda İndirim",
    viewsCount: 265,
    features: ["Yayları diri ve kaçırma yapmaz", "Gerdirme kolları mevcut", "Çuvallı temiz teslim"]
  }
];

export const categories = [
  "Tümü",
  "Direk & İskele",
  "Ahşap & Plywood",
  "Kalıp Sistemleri",
  "Makineler & Ekipman"
];

// Müşterilerin en çok sorduğu sorular (Google Rich FAQ Snippet için)
export const faqList = [
  {
    question: "Kayseri'de ikinci el inşaat malzemesi alımı yapıyor musunuz?",
    answer: "Evet! Elinizde kalan, şantiyenizden artan teleskopik direk, iskele, plywood, kereste ve kalıp panolarını adresinizde yerinde görüp güncel piyasa değerinden NAKİT olarak satın alıyoruz."
  },
  {
    question: "Kayseri içine ve çevre ilçelere nakliye imkanı var mı?",
    answer: "Kayseri merkez (Kocasinan, Melikgazi, Talas), organize sanayi bölgeleri ve tüm çevre ilçelere (İncesu, Develi, Yahyalı vb.) kendi araçlarımızla hızlı teslimat ve nakliye desteği sağlıyoruz."
  },
  {
    question: "Malzemeleri yerinde görebilir miyiz?",
    answer: "Elbette. Kayseri depomuzda tüm direkleri, iskeleleri, plywood ve makineleri bizzat görüp, sayıp, test ederek teslim alabilirsiniz. Şeffaf ticaret ilkemizdir."
  },
  {
    question: "Fiyatları nasıl öğrenebilirim?",
    answer: "Sitemizdeki büyük 'Hemen Ara' veya 'WhatsApp'tan Yaz' butonlarına tıklayarak ihtiyacınız olan adet ve ölçüyü söylediğinizde dakikalar içinde en uygun fiyat teklifini sunuyoruz."
  }
];
