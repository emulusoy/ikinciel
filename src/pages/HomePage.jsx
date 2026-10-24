import { useState, useEffect } from 'react';
import { Phone, MessageCircle, MapPin, Clock, Eye, ExternalLink, Search } from 'lucide-react';
import { siteConfig } from '../siteConfig';
import { defaultProducts, categories, faqList } from '../data/products';

// localStorage'dan ürünleri al, yoksa varsayılanları yükle
function getProducts() {
  try {
    const saved = localStorage.getItem('ikinciel_products');
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return defaultProducts;
}

// Ziyaretçi sayacı
function getVisitorCount() {
  try {
    let count = parseInt(localStorage.getItem('ikinciel_visitors') || '0', 10);
    const lastVisit = localStorage.getItem('ikinciel_last_visit');
    const today = new Date().toDateString();
    if (lastVisit !== today) {
      count++;
      localStorage.setItem('ikinciel_visitors', count.toString());
      localStorage.setItem('ikinciel_last_visit', today);
    }
    return count || 1;
  } catch (e) { return 1; }
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [search, setSearch] = useState('');
  const [visitorCount] = useState(getVisitorCount);

  useEffect(() => {
    setProducts(getProducts());
    // Storage event dinle (admin panelinden ürün eklenince güncelle)
    const onStorage = () => setProducts(getProducts());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const filtered = products.filter(p => {
    const catMatch = selectedCategory === 'Tümü' || p.category === selectedCategory;
    const searchMatch = !search || 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });

  const waLink = (productTitle) => {
    const msg = productTitle
      ? `Merhaba, "${productTitle}" hakkında bilgi almak istiyorum.`
      : siteConfig.whatsappDefaultMessage;
    return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container header-inner">
          <a href="/" className="logo">
            <div className="logo-icon">🏗️</div>
            <div className="logo-text">
              Kayseri İkinci El
              <small>İnşaat Malzemeleri</small>
            </div>
          </a>
          <div className="header-btns">
            <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-call btn-sm">
              <Phone size={16} /> {siteConfig.phoneDisplay}
            </a>
            <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">📍 Kayseri Eski Sanayi / Yeni Sanayi Bölgesi</div>
            <h1>Kayseri <span>İkinci El İnşaat Malzemesi</span> Alım & Satım</h1>
            <p>
              Teleskopik direk, iskele, plywood, kereste ve kalıp malzemeleri. 
              Uygun fiyata satış, değerinde nakit alım, yerinde teslim.
            </p>
            <div className="hero-btns">
              <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-call btn-lg">
                <Phone size={22} /> Hemen Ara: {siteConfig.phoneDisplay}
              </a>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-lg">
                <MessageCircle size={22} /> WhatsApp ile Yaz
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Live Bar */}
      <div className="live-bar">
        <div className="container live-bar-inner">
          <span><span className="live-dot"></span> Sitede şu an aktif ziyaretçiler var</span>
          <span><Eye size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> Toplam {visitorCount} ziyaretçi</span>
          <span><Clock size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} /> {siteConfig.workingHours}</span>
        </div>
      </div>

      {/* Products */}
      <main className="products-section" id="urunler">
        <div className="container">
          <h2 className="section-title">Mevcut Malzemeler</h2>

          <div className="filter-bar">
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
            <input
              type="text"
              className="search-input"
              placeholder="Malzeme ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="products-grid">
            {filtered.map(product => (
              <article key={product.id} className="card">
                <img
                  src={product.image}
                  alt={product.title}
                  className="card-img"
                  loading="lazy"
                />
                <div className="card-body">
                  <div className="card-category">{product.category}</div>
                  <h3 className="card-title">{product.title}</h3>
                  <p className="card-desc">{product.description}</p>
                  <div className="card-meta">
                    <span className="stock">● {product.stock}</span>
                    <span>{product.condition}</span>
                  </div>
                  <div className="card-actions">
                    <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-call btn-sm">
                      <Phone size={15} /> Ara
                    </a>
                    <a href={waLink(product.title)} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp btn-sm">
                      <MessageCircle size={15} /> WhatsApp
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
              <p style={{ fontSize: 18, fontWeight: 600 }}>Aradığınız malzeme bulunamadı.</p>
              <p>Bizi arayarak sormak istediğiniz malzemeyi sorun.</p>
            </div>
          )}
        </div>
      </main>

      {/* Facebook */}
      <section className="facebook-section" id="facebook">
        <div className="container">
          <div className="fb-card">
            <div className="fb-header">
              <div className="fb-title">
                <div className="fb-icon">f</div>
                <div>
                  <div>Facebook Sayfamız</div>
                  <div style={{ fontSize: 14, color: '#64748b', fontWeight: 500 }}>
                    Güncel malzeme paylaşımları için takip edin
                  </div>
                </div>
              </div>
              <a href={siteConfig.facebookPageUrl} target="_blank" rel="noopener noreferrer" className="btn btn-facebook">
                <ExternalLink size={16} /> Facebook'ta Takip Et
              </a>
            </div>
            <iframe
              title="Facebook Sayfası"
              src={`https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(siteConfig.facebookPageUrl)}&tabs=timeline&width=500&height=400&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true`}
              width="100%"
              height="400"
              style={{ border: 'none', borderRadius: 8, maxWidth: 600, display: 'block', margin: '0 auto' }}
              scrolling="no"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq-section" id="sss">
        <div className="container">
          <h2 className="section-title">Sıkça Sorulan Sorular</h2>
          <div className="faq-list">
            {faqList.map((faq, i) => (
              <div key={i} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="iletisim">
        <div className="container">
          <div className="footer-grid">
            <div>
              <h4>{siteConfig.businessName}</h4>
              <p>{siteConfig.description}</p>
            </div>
            <div>
              <h4>İletişim</h4>
              <ul>
                <li>📞 <a href={`tel:${siteConfig.phoneRaw}`} style={{ color: '#fff', fontWeight: 700 }}>{siteConfig.phoneDisplay}</a></li>
                <li>📍 {siteConfig.addressFull}</li>
                <li>🕐 {siteConfig.workingHours}</li>
              </ul>
            </div>
            <div>
              <h4>Bağlantılar</h4>
              <ul>
                <li><a href="#urunler">Malzemeler</a></li>
                <li><a href="#facebook">Facebook</a></li>
                <li><a href="#sss">Sıkça Sorulan Sorular</a></li>
                <li><a href={waLink()} target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e' }}>WhatsApp Hattı</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            © {new Date().getFullYear()} {siteConfig.businessName}
          </div>
        </div>
      </footer>

      {/* Sticky Bottom */}
      <div className="sticky-bar">
        <a href={`tel:${siteConfig.phoneRaw}`} className="btn btn-call">
          <Phone size={20} /> HEMEN ARA
        </a>
        <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-whatsapp">
          <MessageCircle size={20} /> WHATSAPP
        </a>
      </div>
    </>
  );
}
