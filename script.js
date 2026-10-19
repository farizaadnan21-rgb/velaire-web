/**
 * VELAIRE PERFUME — Polished Interactive Logic
 * Includes: Variant Modal, Video Controls, Scent Finder Quiz, Mini Cart Checkout & Scroll Reveal
 */

const VARIANTS_DATA = {
  myotte: {
    id: 'myotte',
    name: 'Velaire MyÓtte',
    subtitle: 'Eau De Parfum (30ml)',
    badge: 'Sweet & Feminine Favorite',
    image: 'assets/canva/MAHYbKwPWeU.jpg',
    priceNum: 20000,
    price: 'from Rp 20.000,-',
    vibe: 'Sweet, Fruity, Floral, Fresh & Elegant',
    description:
      'Kombinasi wewangian yang menghadirkan aroma feminin yang manis, floral, dan gourmand berkelas dengan sentuhan raspberry yang menyegarkan. Memberikan kesan anggun, lembut, dan classy yang ceria, romantis, namun tetap mewah dan menarik perhatian. Cocok bagi Anda yang menyukai wewangian berkarakter manis, feminin, dan elegan untuk tampil percaya diri sehari-hari.',
    topNotes: 'Raspberry',
    heartNotes: 'Peony',
    baseNotes: 'Praline',
    occasion: 'Ideal untuk aktivitas harian, kuliah, ngantor, sampai jalan-jalan / date night.',
    sillage: 'Long-lasting (5 - 7 Jam)',
    ingredients: 'Alcohol Denat., Fragrance (Parfum), Aqua Demineralisata.'
  },
  aurentte: {
    id: 'aurentte',
    name: 'Velaire Auréntte',
    subtitle: 'Eau De Parfum (30ml)',
    badge: 'Best Seller • Featured in Press',
    image: 'assets/canva/MAHYbPIGQrQ.jpg',
    priceNum: 20000,
    price: 'from Rp 20.000,-',
    vibe: 'Aquatic, Fresh & Floral',
    description:
      'Punya aroma fresh yang aquatic, bersih, dan floral dengan kesegaran ocean breeze ala hembusan angin laut. Wanginya memberikan sensasi segar seperti sehabis mandi yang ringan, menenangkan, dan tidak menyengat, cocok untuk kamu yang suka parfum fresh yang elegan alami dan nyaman dipakai seharian.',
    topNotes: 'Ocean Breeze, Freesia, Green Apple, Chamomile',
    heartNotes: 'Lily of the Valley, Peony, Magnolia, Water Lily',
    baseNotes: 'Musk, Cedarwood, Amber, Soft Woods',
    occasion: 'Harian, kegiatan luar ruangan, sampai pemakaian santai.',
    sillage: 'Moderate to Strong (5 - 7 Jam)',
    ingredients: 'Alcohol Denat., Fragrance (Parfum), Aqua Demineralisata.'
  },
  coondette: {
    id: 'coondette',
    name: 'Velaire Coondette',
    subtitle: 'Eau De Parfum (30ml)',
    badge: 'Signature Chic',
    image: 'assets/canva/MAHYbKIxIVQ.jpg',
    priceNum: 20000,
    price: 'from Rp 20.000,-',
    vibe: 'Warm, Woody, Amber & Sophisticated',
    description:
      'Perpaduan karakter modern yang memikat lewat kesegaran Italian Bergamot dan Cardamom di awal, diikuti kehangatan rempah pilihan serta keanggunan kayu cendana (Sandalwood) dan Golden Amber di akhir. Dirancang untuk memancarkan aura tenang, dewasa, dan karismatik di setiap kesempatan.',
    topNotes: 'Italian Bergamot, Cardamom, Mandarin Peel',
    heartNotes: 'French Lavender, White Jasmine, Warm Spices',
    baseNotes: 'Sandalwood, Golden Amber, Vanilla Bean, Soft Woods',
    occasion: 'Acara formal, ngantor, pertemuan bisnis, hingga acara malam spesial.',
    sillage: 'Strong & Classy (6 - 8 Jam)',
    ingredients: 'Alcohol Denat., Fragrance (Parfum), Aqua Demineralisata.'
  }
};

// =========================================================================
// 1. MINI CART STATE & FUNCTIONS
// =========================================================================
let cart = {
  myotte: 0,
  aurentte: 0,
  coondette: 0
};

function formatRupiah(num) {
  return 'Rp ' + num.toLocaleString('id-ID') + ',-';
}

function showToast(msg) {
  const toast = document.getElementById('toastNotification');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

function addToCart(key, openDrawer = false) {
  if (!VARIANTS_DATA[key]) return;
  cart[key] = (cart[key] || 0) + 1;
  renderCart();
  showToast(`✓ ${VARIANTS_DATA[key].name} ditambahkan ke Tas Belanja`);
  if (openDrawer) {
    const drawer = document.getElementById('cartDrawer');
    if (!drawer.classList.contains('active')) {
      toggleCartDrawer();
    }
  }
}

function updateCartQty(key, delta) {
  if (!VARIANTS_DATA[key]) return;
  cart[key] = Math.max(0, (cart[key] || 0) + delta);
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartItemsContainer');
  const badge = document.getElementById('cartCountBadge');
  const totalEl = document.getElementById('cartTotalPrice');

  let totalItems = 0;
  let totalPrice = 0;
  let html = '';

  Object.keys(cart).forEach(key => {
    const qty = cart[key];
    if (qty > 0) {
      const item = VARIANTS_DATA[key];
      const sub = qty * item.priceNum;
      totalItems += qty;
      totalPrice += sub;

      html += `
        <div class="cart-item-card">
          <img src="${item.image}" alt="${item.name}" class="cart-item-img">
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <div class="cart-item-price">${formatRupiah(item.priceNum)} × ${qty} = <strong>${formatRupiah(sub)}</strong></div>
            <div class="cart-qty-controls">
              <button class="qty-btn" onclick="updateCartQty('${key}', -1)">−</button>
              <span>${qty} botol</span>
              <button class="qty-btn" onclick="updateCartQty('${key}', 1)">+</button>
            </div>
          </div>
        </div>
      `;
    }
  });

  if (totalItems === 0) {
    html = `
      <div class="cart-empty-state">
        <i class="fa-solid fa-spray-can-sparkles"></i>
        <p>Tas belanja Anda masih kosong.</p>
        <small>Pilih varian MyÓtte, Auréntte, atau Coondette untuk mulai memesan.</small>
      </div>
    `;
  }

  if (container) container.innerHTML = html;
  if (badge) badge.textContent = totalItems;
  if (totalEl) totalEl.textContent = formatRupiah(totalPrice);
}

function toggleCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (!drawer || !backdrop) return;
  drawer.classList.toggle('active');
  backdrop.classList.toggle('active');
}

function checkoutCartToWhatsApp() {
  const lines = [];
  let totalQty = 0;
  let totalPrice = 0;

  Object.keys(cart).forEach(key => {
    const qty = cart[key];
    if (qty > 0) {
      const item = VARIANTS_DATA[key];
      const sub = qty * item.priceNum;
      totalQty += qty;
      totalPrice += sub;
      lines.push(`- *${item.name} (30ml)* × ${qty} pcs (${formatRupiah(sub)})`);
    }
  });

  if (totalQty === 0) {
    showToast('Pilih minimal 1 varian parfum terlebih dahulu!');
    return;
  }

  const text =
    `Halo Admin *VELAIRE PERFUME*! ✨\n` +
    `Saya ingin memesan parfum berikut:\n\n` +
    lines.join('\n') +
    `\n\n*Total Pesanan:* ${totalQty} botol (Estimasi ${formatRupiah(totalPrice)})\n` +
    `Mohon info ketersediaan stok & ongkos kirim. Terima kasih!`;

  window.open(`https://wa.me/6283872023645?text=${encodeURIComponent(text)}`, '_blank');
}

// =========================================================================
// 2. VARIANT DETAIL MODAL
// =========================================================================
function openVariantModal(key) {
  const item = VARIANTS_DATA[key];
  if (!item) return;

  const modal = document.getElementById('variantModal');
  const modalContent = document.getElementById('modalContent');

  const waOrderText = encodeURIComponent(
    `Halo Velaire Perfume! Saya ingin memesan ${item.name} (30ml). Mohon info ketersediaan stok & pengiriman.`
  );

  modalContent.innerHTML = `
    <div class="modal-img-col">
      <img src="${item.image}" alt="${item.name}">
    </div>
    <div class="modal-body-col">
      <span class="modal-badge">${item.badge}</span>
      <h3 class="modal-title">${item.name}</h3>
      <div class="modal-price">${item.price} • <small style="font-weight:400; color:#73594b;">${item.subtitle}</small></div>
      <p style="font-weight:600; color:#c5a059; font-size:0.82rem; margin-bottom:10px;">Vibe: ${item.vibe}</p>
      <p class="modal-desc">${item.description}</p>

      <div class="modal-pyramid">
        <div class="pyramid-level">
          <span class="pyramid-title">Top Notes:</span>
          <span>${item.topNotes}</span>
        </div>
        <div class="pyramid-level">
          <span class="pyramid-title">Middle:</span>
          <span>${item.heartNotes}</span>
        </div>
        <div class="pyramid-level">
          <span class="pyramid-title">Base Notes:</span>
          <span>${item.baseNotes}</span>
        </div>
        <div class="pyramid-level" style="margin-top:6px; padding-top:6px; border-top:1px dashed rgba(98,62,42,0.18);">
          <span class="pyramid-title">Penggunaan:</span>
          <span>${item.occasion}</span>
        </div>
        <div class="pyramid-level">
          <span class="pyramid-title">Komposisi:</span>
          <span>${item.ingredients}</span>
        </div>
      </div>

      <div class="modal-cta-box">
        <button class="btn-modal-cart" onclick="addToCart('${key}', true); closeVariantModal();">
          <i class="fa-solid fa-bag-shopping"></i> + Tas Belanja
        </button>
        <a href="https://wa.me/6283872023645?text=${waOrderText}" target="_blank" class="btn-modal-wa">
          <i class="fa-brands fa-whatsapp"></i> Beli Langsung
        </a>
      </div>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeVariantModal() {
  const modal = document.getElementById('variantModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

document.getElementById('variantModal')?.addEventListener('click', e => {
  if (e.target.id === 'variantModal') closeVariantModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeVariantModal();
    const drawer = document.getElementById('cartDrawer');
    if (drawer?.classList.contains('active')) toggleCartDrawer();
  }
});

// =========================================================================
// 3. INTERACTIVE SCENT FINDER QUIZ & HIGHLIGHTER
// =========================================================================
function recommendScent(type) {
  const map = {
    fresh: 'aurentte',
    sweet: 'myotte',
    warm: 'coondette'
  };
  const key = map[type] || 'aurentte';
  const item = VARIANTS_DATA[key];
  const resEl = document.getElementById('finderResult');

  document.querySelectorAll('.finder-choice-btn').forEach(btn => btn.classList.remove('active'));
  event?.currentTarget?.classList.add('active');

  if (resEl && item) {
    resEl.style.display = 'block';
    resEl.innerHTML = `
      <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <img src="${item.image}" alt="${item.name}" style="width:74px; height:74px; object-fit:cover; border-radius:8px; border:1px solid #623e2a;">
          <div>
            <span style="font-size:0.72rem; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; color:#c5a059;">REKOMENDASI TERBAIK UNTUKMU</span>
            <h4 style="font-family:var(--font-serif); font-size:1.6rem; color:#623e2a; margin:2px 0;">${item.name} (30ml)</h4>
            <p style="font-size:0.86rem; color:#73594b; max-width:560px;">${item.description}</p>
          </div>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn btn-card-details" onclick="openVariantModal('${key}')">Lihat Notes</button>
          <button class="btn btn-card-cart" style="padding:10px 18px;" onclick="addToCart('${key}', true)">
            <i class="fa-solid fa-bag-shopping"></i> Pilih Varian Ini
          </button>
        </div>
      </div>
    `;
  }
}

function highlightVariantCard(key) {
  const card = document.getElementById(`card-${key}`);
  if (!card) return;
  document.querySelectorAll('.product-card').forEach(c => c.classList.remove('pulse-highlight'));
  card.classList.add('pulse-highlight');
  setTimeout(() => card.classList.remove('pulse-highlight'), 2500);
}

// =========================================================================
// 4. LUXURY POSTER & AMBIENT SOUNDTRACK STUDIO CONTROLS
// =========================================================================
const POSTER_SCENES = {
  atelier: {
    type: 'poster',
    src: 'assets/posters/poster-atelier.jpg',
    tag: 'THE TRIO COLLECTION • ATELIER EDITION',
    caption: '“In the Heart of the Fragrant Velaire — Classic soul, modern scent.”'
  },
  botanical: {
    type: 'poster',
    src: 'assets/posters/poster-botanical.jpg',
    tag: 'BOTANICAL CHAMOMILE GARDEN • AURÉNTTE',
    caption: '“Your secret scent, bottled amidst fresh blooming meadow flowers.”'
  },
  'silk-video': {
    type: 'video',
    src: 'assets/canva/VAGfmGxAaiQ.mp4',
    poster: 'assets/posters/poster-silk.jpg',
    tag: 'GOLDEN SILK MOTION • EAU DE PARFUM',
    caption: '“Kemewahan aroma yang mengalir lembut bagai helai sutra emas.”'
  }
};

const AMBIENT_TRACKS = {
  atelier: {
    title: 'Parisian Atelier (Lounge Piano)',
    src: 'assets/audio/parisian-atelier.mp3'
  },
  garden: {
    title: 'Secret Garden (Botanical Harp & Chimes)',
    src: 'assets/audio/secret-garden.mp3'
  },
  classic: {
    title: 'Classic Lounge (Original Track)',
    src: 'assets/audio/classic-canva.mp3'
  }
};

function switchShowcasePoster(sceneKey, btnEl) {
  const scene = POSTER_SCENES[sceneKey];
  if (!scene) return;

  const posterImg = document.getElementById('featuredPosterImg');
  const videoEl = document.getElementById('featuredVideo');
  const tagEl = document.getElementById('posterSceneTag');
  const capEl = document.getElementById('posterSceneCaption');

  if (btnEl) {
    btnEl.parentElement.querySelectorAll('.dock-pill').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }

  if (tagEl) tagEl.textContent = scene.tag;
  if (capEl) capEl.textContent = scene.caption;

  if (scene.type === 'video') {
    if (posterImg) posterImg.classList.remove('active-poster');
    if (videoEl) {
      videoEl.currentTime = 0;
      videoEl.play().catch(() => {});
    }
  } else {
    if (posterImg) {
      posterImg.classList.remove('active-poster');
      posterImg.src = scene.src;
      // Trigger smooth Ken Burns zoom-in
      requestAnimationFrame(() => {
        posterImg.classList.add('active-poster');
      });
    }
  }
}

function updateAudioUI(isPlaying) {
  const btn = document.getElementById('audioToggleBtn');
  const eq = document.getElementById('eqBars');
  if (!btn) return;
  if (isPlaying) {
    btn.classList.add('playing');
    btn.innerHTML = '<i class="fa-solid fa-pause"></i> <span>Jeda Lagu Ambient</span>';
    eq?.classList.add('playing');
  } else {
    btn.classList.remove('playing');
    btn.innerHTML = '<i class="fa-solid fa-play"></i> <span>Putar Lagu Ambient</span>';
    eq?.classList.remove('playing');
  }
}

function toggleAmbientMusic() {
  const audio = document.getElementById('ambientAudioPlayer');
  if (!audio) return;
  if (audio.paused) {
    audio.volume = 0.75;
    audio.play().then(() => {
      updateAudioUI(true);
    }).catch(() => {
      showToast('Klik sekali lagi untuk mengaktifkan audio di browser Anda');
    });
  } else {
    audio.pause();
    updateAudioUI(false);
  }
}

function switchAmbientTrack(trackKey, btnEl) {
  const track = AMBIENT_TRACKS[trackKey];
  const audio = document.getElementById('ambientAudioPlayer');
  const titleEl = document.getElementById('nowPlayingTitle');
  if (!track || !audio) return;

  if (btnEl) {
    btnEl.parentElement.querySelectorAll('.dock-pill').forEach(b => b.classList.remove('active'));
    btnEl.classList.add('active');
  }

  if (titleEl) titleEl.textContent = track.title;
  audio.src = track.src;
  audio.volume = 0.75;
  audio.play().then(() => {
    updateAudioUI(true);
    showToast(`🎵 Memutar: ${track.title}`);
  }).catch(() => {
    updateAudioUI(false);
  });
}

// =========================================================================
// 5. FILTER TABS, NAVBAR SCROLLSPY & SCROLL REVEAL
// =========================================================================
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filterVal = btn.getAttribute('data-filter');

    productCards.forEach(card => {
      const cat = card.getAttribute('data-category');
      card.style.display = filterVal === 'all' || cat === filterVal ? 'flex' : 'none';
    });
  });
});

const navbar = document.getElementById('navbar');
const backToTopBtn = document.getElementById('backToTop');
const navItems = document.querySelectorAll('.nav-links .nav-item');
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  navbar?.classList.toggle('scrolled', currentScroll > 60);
  backToTopBtn?.classList.toggle('visible', currentScroll > 450);

  let currentSec = '';
  sections.forEach(sec => {
    const secTop = sec.offsetTop - 130;
    const secHeight = sec.clientHeight;
    if (currentScroll >= secTop && currentScroll < secTop + secHeight) {
      currentSec = sec.getAttribute('id');
    }
  });

  navItems.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentSec}`);
  });
});

// Mobile Menu
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => navLinks.classList.remove('active'));
  });
}

// IntersectionObserver for smooth scroll-reveal
const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal-up').forEach(el => revealObserver.observe(el));

// Initialize Cart UI
renderCart();

// Contact Form Handler
function handleContactSubmit(event) {
  event.preventDefault();
  const name = document.getElementById('name').value.trim();
  const variant = document.getElementById('variant-select').value;
  const message = document.getElementById('message').value.trim();

  const fullText =
    `Halo Admin *VELAIRE PERFUME*!\n\n` +
    `*Nama:* ${name}\n` +
    `*Varian Diminati:* ${variant}\n` +
    `*Catatan:* ${message || 'Mohon info pemesanan'}`;

  window.open(`https://wa.me/6283872023645?text=${encodeURIComponent(fullText)}`, '_blank');
}
