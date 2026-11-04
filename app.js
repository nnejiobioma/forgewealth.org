/**
 * Smart Tech Reviews (STR) - Interactive Client & Dynamic Landing Page Engine
 * Features:
 * - Dynamic Landing Page & Post Renderer (post.html?slug=...)
 * - Automatic CMS Sync (loads local JSONs + live GitHub repo posts from /admin)
 * - Search Filter & Modal
 * - 1-Click Affiliate Coupon Copy & Toast Notification
 * - Interactive Cloud Plan Finder Quiz & Savings Calculator
 * - Category Tab Filtering & Mobile Menu
 */

const GITHUB_REPO = 'nnejiobioma/forgewealth.org';
const DEFAULT_SLUGS = [
  'macbook-pro-14',
  'sony-wh-1000xm5',
  'siteground-cloud',
  'cloudways-managed',
  'anker-prime-20000',
  'keychron-q1-pro'
];

let REVIEWS_DATABASE = [
  {
    slug: 'macbook-pro-14',
    title: 'Apple MacBook Pro 14" (M3 / M4 Pro)',
    category: 'Laptops',
    score: '9.6',
    url: 'post.html?slug=macbook-pro-14',
    desc: 'The best creator laptop on the market with 22-hour battery life and Liquid Retina XDR.'
  },
  {
    slug: 'siteground-cloud',
    title: 'SiteGround GrowBig Managed Hosting Review',
    category: 'Web Hosting',
    score: '9.6',
    url: 'post.html?slug=siteground-cloud',
    desc: 'High-speed managed WordPress hosting powered by Google Cloud infrastructure and daily backups.'
  },
  {
    slug: 'sony-wh-1000xm5',
    title: 'Sony WH-1000XM5 Wireless ANC Headphones',
    category: 'Audio',
    score: '9.5',
    url: 'post.html?slug=sony-wh-1000xm5',
    desc: 'Industry-leading noise cancellation, ultra-lightweight ergonomic headband, 30hr battery.'
  },
  {
    slug: 'cloudways-managed',
    title: 'Cloudways Managed Cloud Hosting',
    category: 'Cloud Hosting',
    score: '9.5',
    url: 'post.html?slug=cloudways-managed',
    desc: 'Dedicated DigitalOcean & AWS cloud servers with NVMe caching and pay-as-you-go billing.'
  },
  {
    slug: 'anker-prime-20000',
    title: 'Anker Prime 20,000mAh 200W Power Bank',
    category: 'Accessories',
    score: '9.4',
    url: 'post.html?slug=anker-prime-20000',
    desc: 'Charge laptops and phones at top speeds with real-time smart digital status display.'
  },
  {
    slug: 'keychron-q1-pro',
    title: 'Keychron Q1 Pro Wireless Mechanical Keyboard',
    category: 'Desk Setup',
    score: '9.3',
    url: 'post.html?slug=keychron-q1-pro',
    desc: 'Full aluminum CNC body, hot-swappable switches, wireless Bluetooth 5.1 & QMK/VIA support.'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSearch();
  initCouponCopy();
  initHostingQuiz();
  initSavingsCalculator();
  initCategoryFilter();
  initDynamicCMSPosts();
  initPostPage();
});

// ----------------------------------------------------
// 0. Dynamic Landing Page & CMS Sync Engine
// ----------------------------------------------------
async function fetchPostJson(slug) {
  try {
    const localRes = await fetch(`content/reviews/${encodeURIComponent(slug)}.json`, { cache: 'no-cache' });
    if (localRes.ok) return await localRes.json();
  } catch (_) {}

  try {
    const ghRes = await fetch(`https://raw.githubusercontent.com/${GITHUB_REPO}/main/content/reviews/${encodeURIComponent(slug)}.json`, { cache: 'no-cache' });
    if (ghRes.ok) return await ghRes.json();
  } catch (_) {}

  return null;
}

function renderMarkdown(md) {
  if (!md) return '';
  const escaped = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const lines = escaped.split('\n');
  let html = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    const formatInline = (str) => str
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener sponsored">$1</a>');

    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3>${formatInline(line.slice(4))}</h3>`;
    } else if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${formatInline(line.slice(3))}</h2>`;
    } else if (line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${formatInline(line.slice(2))}</h2>`;
    } else if (line.startsWith('&gt; ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<blockquote>${formatInline(line.slice(5))}</blockquote>`;
    } else if (line.startsWith('* ') || line.startsWith('- ')) {
      if (!inList) {
        html += '<ul>';
        inList = true;
      }
      html += `<li>${formatInline(line.slice(2))}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${formatInline(line)}</p>`;
    }
  }

  if (inList) html += '</ul>';
  return html;
}

async function initPostPage() {
  const postTitleEl = document.getElementById('postTitle');
  if (!postTitleEl) return; // Not on post.html

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || 'macbook-pro-14';
  const data = await fetchPostJson(slug);

  if (!data) {
    postTitleEl.textContent = 'Landing Page Not Found';
    const summaryEl = document.getElementById('postSummary');
    if (summaryEl) summaryEl.textContent = `Could not find a post with slug "${slug}". Return home or create one in the Admin Dashboard.`;
    return;
  }

  const categoryLabels = {
    laptops: 'Laptops & PCs',
    audio: 'Audio & Headphones',
    accessories: 'Accessories & Desk',
    hosting: 'Cloud & Hosting',
    software: 'Software & SaaS',
    deals: 'Verified Deal'
  };
  const catLabel = categoryLabels[data.category] || data.category || 'Review';

  document.title = `${data.title} | Smart Tech Reviews`;
  const metaDesc = document.getElementById('pageMetaDesc');
  if (metaDesc && data.summary) metaDesc.setAttribute('content', data.summary);

  document.getElementById('postCategoryBadge').textContent = catLabel;
  document.getElementById('postAwardBadge').textContent = data.badge || 'Verified Lab Pick';
  postTitleEl.textContent = data.title;
  document.getElementById('postSummary').textContent = data.summary || '';
  document.getElementById('postHeroScore').textContent = `${data.score || '9.5'} / 10`;

  const heroImg = document.getElementById('postHeroImage');
  if (heroImg && data.thumbnail) {
    heroImg.src = data.thumbnail;
    heroImg.alt = data.title;
  }

  const shortTitle = data.title.split(':')[0];
  document.getElementById('postVerdictTitle').textContent = `${shortTitle} — Lab Verdict`;
  document.getElementById('postVerdictSummary').textContent = data.summary || '';

  // Pros & Cons
  const prosList = document.getElementById('postProsList');
  const consList = document.getElementById('postConsList');
  if (prosList && Array.isArray(data.pros)) {
    prosList.innerHTML = data.pros.map(p => `<li><span style="color:var(--accent-green);font-weight:700;">✓</span> <span>${p}</span></li>`).join('');
  }
  if (consList && Array.isArray(data.cons)) {
    consList.innerHTML = data.cons.map(c => `<li><span style="color:var(--accent-red);font-weight:700;">✗</span> <span>${c}</span></li>`).join('');
  }

  // Body Content
  const bodyEl = document.getElementById('postBodyContent');
  if (bodyEl) {
    bodyEl.innerHTML = renderMarkdown(data.body || data.summary || '');
  }

  // Bottom CTA & Sticky Sidebar
  const targetUrl = data.affiliate_url || '#';
  const ctaLabel = data.cta_text || 'Claim Deal / Check Best Price →';
  document.getElementById('postBottomTitle').textContent = `Get the Best Price on ${shortTitle}`;
  document.getElementById('postBottomPriceText').textContent = `Starts at ${data.price || 'Verified Partner Pricing'} — tested & recommended by our lab.`;
  const bottomBtn = document.getElementById('postBottomCtaBtn');
  if (bottomBtn) {
    bottomBtn.href = targetUrl;
    bottomBtn.textContent = ctaLabel;
  }

  document.getElementById('sidebarBadge').textContent = data.badge || 'Editor’s Pick';
  document.getElementById('sidebarLogo').textContent = shortTitle.substring(0, 2).toUpperCase();
  document.getElementById('sidebarTitle').textContent = shortTitle;
  document.getElementById('sidebarCategory').textContent = catLabel;
  document.getElementById('sidebarScore').textContent = data.score || '9.5';
  document.getElementById('sidebarPrice').textContent = data.price || 'Check Price';
  document.getElementById('sidebarOriginalPrice').textContent = data.original_price || '';

  const sideCta = document.getElementById('sidebarCtaBtn');
  if (sideCta) {
    sideCta.href = targetUrl;
    sideCta.textContent = ctaLabel;
  }

  const couponBox = document.getElementById('sidebarCouponBox');
  const couponCodeEl = document.getElementById('sidebarCouponCode');
  const copyBtn = document.getElementById('sidebarCopyBtn');
  if (couponBox && data.coupon_code && data.coupon_code.trim() !== '') {
    couponBox.style.display = 'flex';
    couponCodeEl.textContent = data.coupon_code.trim();
    copyBtn.setAttribute('data-coupon', data.coupon_code.trim());
    copyBtn.setAttribute('data-target-url', targetUrl);
  }

  // Related Posts
  const relatedEl = document.getElementById('relatedPostsList');
  if (relatedEl) {
    const others = REVIEWS_DATABASE.filter(r => r.slug !== slug).slice(0, 4);
    relatedEl.innerHTML = others.map(item => `
      <a href="${item.url}" style="display:flex;align-items:center;justify-content:space-between;padding:0.65rem 0.8rem;border-radius:var(--radius-md);background:var(--bg-primary);border:1px solid var(--border-subtle);color:var(--dark-slate);font-size:0.88rem;font-weight:600;">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:0.5rem;">${item.title}</span>
        <span style="font-family:var(--font-mono);font-size:0.78rem;color:var(--accent-green-dark);flex-shrink:0;">★ ${item.score}</span>
      </a>
    `).join('');
  }
}

// Automatically discover any new posts added via Decap CMS (/admin) on GitHub
async function initDynamicCMSPosts() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/content/reviews`, { cache: 'no-cache' });
    if (!res.ok) return;
    const files = await res.json();
    if (!Array.isArray(files)) return;

    const grids = document.querySelectorAll('.cards-grid');

    for (const file of files) {
      if (!file.name.endsWith('.json')) continue;
      const slug = file.name.replace(/\.json$/, '');
      if (DEFAULT_SLUGS.includes(slug)) continue;

      const postData = await fetchPostJson(slug);
      if (!postData || !postData.title) continue;

      const postUrl = `post.html?slug=${encodeURIComponent(slug)}`;

      // Add to search database
      if (!REVIEWS_DATABASE.some(r => r.slug === slug)) {
        REVIEWS_DATABASE.unshift({
          slug,
          title: postData.title,
          category: postData.category || 'Review',
          score: postData.score || '9.5',
          url: postUrl,
          desc: postData.summary || ''
        });
      }

      // Inject card into homepage / gadgets review grids
      grids.forEach(grid => {
        if (!grid.querySelector('.review-card')) return;
        const prosHtml = Array.isArray(postData.pros)
          ? postData.pros.slice(0, 2).map(p => `<div class="pros-mini"><span class="icon">✓</span><span>${p}</span></div>`).join('')
          : '';
        const consHtml = Array.isArray(postData.cons) && postData.cons[0]
          ? `<div class="cons-mini"><span class="icon">✗</span><span>${postData.cons[0]}</span></div>`
          : '';

        const article = document.createElement('article');
        article.className = 'review-card';
        article.setAttribute('data-category', postData.category || 'laptops');
        article.innerHTML = `
          <div class="review-card-media">
            <img src="${postData.thumbnail || 'assets/tech-gear.jpg'}" alt="${postData.title}" loading="lazy">
            <span class="card-category-badge">${postData.badge || postData.category || 'Review'}</span>
            <span class="card-score-pill"><span>★</span> ${postData.score || '9.5'}</span>
          </div>
          <div class="review-card-body">
            <h3 class="review-card-title">
              <a href="${postUrl}">${postData.title}</a>
            </h3>
            <p class="review-card-summary">${postData.summary || ''}</p>
            <div class="pros-cons-mini">${prosHtml}${consHtml}</div>
            <div class="review-card-footer">
              <div class="card-price-info">
                <span class="card-price-label">Best Price</span>
                <span class="card-price-val">${postData.price || 'Check Deal'}</span>
              </div>
              <a href="${postUrl}" class="btn btn-primary btn-sm">
                Read Review &rarr;
              </a>
            </div>
          </div>
        `;
        grid.prepend(article);
      });
    }
  } catch (_) {}
}

// ----------------------------------------------------
// 1. Mobile Menu Toggle
// ----------------------------------------------------
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');

  if (toggleBtn && mainNav) {
    function closeMenu() {
      mainNav.classList.remove('active');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    }

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mainNav.classList.toggle('active');
      const isExpanded = mainNav.classList.contains('active');
      toggleBtn.setAttribute('aria-expanded', isExpanded);
      toggleBtn.innerHTML = isExpanded 
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });

    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (e) => {
      if (mainNav.classList.contains('active') && !mainNav.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('active')) {
        closeMenu();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mainNav.classList.contains('active')) {
        closeMenu();
      }
    });
  }
}

// ----------------------------------------------------
// 2. 1-Click Coupon Code Copy with Toast Feedback
// ----------------------------------------------------
function initCouponCopy() {
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const code = btn.getAttribute('data-coupon') || 'STRDEAL';
      
      navigator.clipboard.writeText(code).then(() => {
        showToast(`Coupon "${code}" copied! Redirecting to deal...`);
        btn.textContent = 'Copied!';
        btn.style.backgroundColor = '#10b981';
        btn.style.borderColor = '#10b981';
        btn.style.color = '#ffffff';

        setTimeout(() => {
          btn.textContent = 'Copy Code';
          btn.style.backgroundColor = '';
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 3000);

        const affiliateUrl = btn.getAttribute('data-target-url');
        if (affiliateUrl && affiliateUrl !== '#') {
          setTimeout(() => {
            window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
          }, 800);
        }
      }).catch(() => {
        showToast(`Coupon code: ${code}`);
      });
    });
  });
}

function showToast(message) {
  let toast = document.getElementById('toastNotification');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastNotification';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> ${message}`;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ----------------------------------------------------
// 3. Search Filter & Modal
// ----------------------------------------------------
function initSearch() {
  const searchToggles = document.querySelectorAll('.search-toggle-btn');
  const searchModal = document.getElementById('searchModal');
  const closeModalBtn = document.getElementById('modalCloseBtn');
  const modalInput = document.getElementById('modalSearchInput');
  const resultsContainer = document.getElementById('modalResultsList');
  const heroSearchInput = document.getElementById('heroSearchInput');
  const heroSearchForm = document.getElementById('heroSearchForm');

  if (searchToggles && searchModal) {
    searchToggles.forEach(btn => {
      btn.addEventListener('click', () => {
        searchModal.classList.add('active');
        setTimeout(() => modalInput && modalInput.focus(), 100);
      });
    });

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        searchModal.classList.remove('active');
      });
    }

    searchModal.addEventListener('click', (e) => {
      if (e.target === searchModal) {
        searchModal.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && searchModal.classList.contains('active')) {
        searchModal.classList.remove('active');
      }
    });
  }

  if (modalInput && resultsContainer) {
    modalInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      renderSearchResults(q, resultsContainer);
    });
  }

  if (heroSearchForm && heroSearchInput) {
    heroSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = heroSearchInput.value.trim();
      if (searchModal) {
        searchModal.classList.add('active');
        if (modalInput) {
          modalInput.value = query;
          renderSearchResults(query.toLowerCase(), resultsContainer);
        }
      }
    });
  }
}

function renderSearchResults(query, container) {
  if (!query) {
    container.innerHTML = `
      <p style="text-align: center; color: var(--text-muted); padding: 2rem 0;">
        Type to search 150+ reviews, comparisons, deals and tech gadgets...
      </p>
    `;
    return;
  }

  const matches = REVIEWS_DATABASE.filter(item => 
    item.title.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    item.desc.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem;">
        <p style="font-weight: 700; color: var(--dark-slate); font-size: 1.1rem;">No matching reviews found</p>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">Try searching for "MacBook", "Cloudways", "SiteGround", or "Headphones".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = matches.map(item => `
    <a href="${item.url}" class="search-result-item" style="text-decoration: none; color: inherit; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding: 0.9rem;">
      <div>
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
          <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--brand-blue); background: var(--brand-blue-light); padding: 0.15rem 0.5rem; border-radius: 4px;">${item.category}</span>
          <strong style="font-size: 1rem; color: var(--dark-slate);">${item.title}</strong>
        </div>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">${item.desc}</p>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; margin-left: 1rem;">
        <span style="font-weight: 800; color: var(--accent-green-dark); background: var(--accent-green-light); padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.85rem;">★ ${item.score}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </div>
    </a>
  `).join('');
}

// ----------------------------------------------------
// 4. Interactive Cloud Plan Finder Quiz
// ----------------------------------------------------
function initHostingQuiz() {
  const quizButtons = document.querySelectorAll('.quiz-opt-btn');
  const resultCard = document.getElementById('quizResultCard');
  const resultTitle = document.getElementById('quizResultTitle');
  const resultDesc = document.getElementById('quizResultDesc');
  const resultPrice = document.getElementById('quizResultPrice');
  const resultLink = document.getElementById('quizResultLink');

  if (!quizButtons.length || !resultCard) return;

  const quizState = {
    type: 'blog',
    traffic: 'medium'
  };

  quizButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = btn.getAttribute('data-step');
      const val = btn.getAttribute('data-val');

      document.querySelectorAll(`.quiz-opt-btn[data-step="${step}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      quizState[step] = val;
      computeQuizResult();
    });
  });

  function computeQuizResult() {
    resultCard.classList.add('active');

    if (quizState.type === 'ecommerce' || quizState.traffic === 'heavy') {
      resultTitle.textContent = 'Cloudways Managed Cloud Plan';
      resultDesc.textContent = 'Dedicated IP, NVMe storage, isolated RAM, and pay-as-you-go scaling built for serious ecommerce stores and high-traffic SaaS sites.';
      resultPrice.innerHTML = '$14.00 <span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">/month</span> <span style="color:#10b981; font-size:0.85rem; font-weight:700;">(Zero Lock-in)</span>';
      resultLink.href = 'post.html?slug=cloudways-managed';
      resultLink.textContent = 'Read Cloudways Review →';
    } else if (quizState.type === 'business' || quizState.traffic === 'medium') {
      resultTitle.textContent = 'SiteGround GrowBig Managed Hosting (Editor’s Pick)';
      resultDesc.textContent = 'Google Cloud SSD infrastructure, on-demand daily backups, Ultrafast PHP, free CDN, and unlimited SSL. Handles up to 100,000 monthly visits.';
      resultPrice.innerHTML = '$4.99 <span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">/month</span> <span style="color:#10b981; font-size:0.85rem; font-weight:700;">(Save 82%)</span>';
      resultLink.href = 'post.html?slug=siteground-cloud';
      resultLink.textContent = 'Claim SiteGround Deal →';
    } else {
      resultTitle.textContent = 'SiteGround StartUp Hosting';
      resultDesc.textContent = 'Ideal for personal blogs, portfolios, and new projects. Includes Google Cloud SSD storage, free daily backups, SSL, and 24/7 support.';
      resultPrice.innerHTML = '$2.99 <span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">/month</span> <span style="color:#10b981; font-size:0.85rem; font-weight:700;">(Save 83%)</span>';
      resultLink.href = 'post.html?slug=siteground-cloud';
      resultLink.textContent = 'Claim StartUp Deal →';
    }
  }
}

// ----------------------------------------------------
// 5. Cloud Hosting Savings & TCO Calculator
// ----------------------------------------------------
function initSavingsCalculator() {
  const yearsSlider = document.getElementById('calcYearsSlider');
  const yearsVal = document.getElementById('calcYearsVal');
  const sitesSlider = document.getElementById('calcSitesSlider');
  const sitesVal = document.getElementById('calcSitesVal');
  const savingsDisplay = document.getElementById('calcSavingsTotal');
  const promoTotal = document.getElementById('calcPromoTotal');
  const competitorTotal = document.getElementById('calcCompetitorTotal');

  if (!yearsSlider || !savingsDisplay) return;

  function updateCalc() {
    const years = parseInt(yearsSlider.value, 10);
    const sites = parseInt(sitesSlider.value, 10);

    if (yearsVal) yearsVal.textContent = `${years} Year${years > 1 ? 's' : ''}`;
    if (sitesVal) sitesVal.textContent = `${sites} Website${sites > 1 ? 's' : ''}`;

    const competitorMonthly = 12.99 + (sites > 5 ? 10 : 0);
    const promoMonthly = 2.99;

    const competitorSum = Math.round(competitorMonthly * 12 * years);
    const promoSum = Math.round(promoMonthly * 12 * years);
    const totalSavings = competitorSum - promoSum;

    savingsDisplay.textContent = `$${totalSavings.toLocaleString()}`;
    if (promoTotal) promoTotal.textContent = `$${promoSum.toLocaleString()}`;
    if (competitorTotal) competitorTotal.textContent = `$${competitorSum.toLocaleString()}`;
  }

  yearsSlider.addEventListener('input', updateCalc);
  sitesSlider.addEventListener('input', updateCalc);
  updateCalc();
}

// ----------------------------------------------------
// 6. Category Tab Filtering
// ----------------------------------------------------
function initCategoryFilter() {
  const tabs = document.querySelectorAll('.category-tab-btn');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterCategory = tab.getAttribute('data-category');
      const cards = document.querySelectorAll('.review-card');

      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (filterCategory === 'all' || cardCat === filterCategory) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.3s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ----------------------------------------------------
// 7. Newsletter Mock
// ----------------------------------------------------
window.handleNewsletterSubmit = function(e) {
  e.preventDefault();
  const input = e.target.querySelector('input[type="email"]');
  if (input && input.value) {
    showToast(`Subscribed! Check ${input.value} for secret discount codes.`);
    input.value = '';
  }
};
