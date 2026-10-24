/**
 * Smart Tech Reviews (STR) - Interactive Client Logic
 * Features:
 * - Search Filter & Modal
 * - 1-Click Affiliate Coupon Copy & Toast Notification
 * - Interactive Hosting Plan Finder Quiz
 * - Interactive Hosting Savings Calculator
 * - Category Tab Filtering
 * - Mobile Menu & Sticky Navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initSearch();
  initCouponCopy();
  initHostingQuiz();
  initSavingsCalculator();
  initCategoryFilter();
});

// ----------------------------------------------------
// 1. Mobile Menu Toggle
// ----------------------------------------------------
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const mainNav = document.getElementById('mainNav');

  if (toggleBtn && mainNav) {
    toggleBtn.addEventListener('click', () => {
      mainNav.classList.toggle('active');
      const isExpanded = mainNav.classList.contains('active');
      toggleBtn.setAttribute('aria-expanded', isExpanded);
      toggleBtn.innerHTML = isExpanded 
        ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
        : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>';
    });
  }
}

// ----------------------------------------------------
// 2. 1-Click Coupon Code Copy with Toast Feedback
// ----------------------------------------------------
function initCouponCopy() {
  const copyButtons = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('toastNotification');

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

        // If data-target-url is present, optionally open the affiliate link in new tab
        const affiliateUrl = btn.getAttribute('data-target-url');
        if (affiliateUrl) {
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
const REVIEWS_DATABASE = [
  {
    title: 'Hostinger Premium Web Hosting Review 2026',
    category: 'Web Hosting',
    score: '9.8',
    url: 'review-hostinger.html',
    desc: 'Unbeatable value, LiteSpeed web server, free domain & SSL. Best for blogs & startups.'
  },
  {
    title: 'Hostinger Cloud Startup vs Bluehost Cloud',
    category: 'Web Hosting',
    score: '9.7',
    url: 'hosting.html',
    desc: 'Deep performance comparison: Dedicated IP, 200GB NVMe storage, and 300 websites.'
  },
  {
    title: 'Apple MacBook Pro 14" (M3 / M4 Pro)',
    category: 'Laptops',
    score: '9.6',
    url: 'gadgets.html#macbook',
    desc: 'The best creator laptop on the market with 22-hour battery life and Liquid Retina XDR.'
  },
  {
    title: 'Sony WH-1000XM5 Wireless ANC Headphones',
    category: 'Audio',
    score: '9.5',
    url: 'gadgets.html#sony-headphones',
    desc: 'Industry-leading noise cancellation, ultra-lightweight ergonomic headband, 30hr battery.'
  },
  {
    title: 'Anker Prime 20,000mAh 200W Power Bank',
    category: 'Accessories',
    score: '9.4',
    url: 'gadgets.html#anker-powerbank',
    desc: 'Charge laptops and phones at top speeds with real-time smart digital status display.'
  },
  {
    title: 'Keychron Q1 Pro Wireless Mechanical Keyboard',
    category: 'Desk Setup',
    score: '9.3',
    url: 'gadgets.html#keychron',
    desc: 'Full aluminum CNC body, hot-swappable switches, wireless Bluetooth 5.1 & QMK/VIA support.'
  },
  {
    title: 'SiteGround GrowBig Hosting Review',
    category: 'Web Hosting',
    score: '9.1',
    url: 'hosting.html#siteground',
    desc: 'High tier managed WordPress hosting with Google Cloud infrastructure.'
  }
];

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

  // Live filter in search modal
  if (modalInput && resultsContainer) {
    modalInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      renderSearchResults(q, resultsContainer);
    });
  }

  // Hero search form redirect to modal or filter
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
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem;">Try searching for "Hostinger", "Hosting", "Laptops", or "Headphones".</p>
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
// 4. Interactive Hosting Plan Finder Quiz
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

      // Update active state in group
      document.querySelectorAll(`.quiz-opt-btn[data-step="${step}"]`).forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      quizState[step] = val;
      computeQuizResult();
    });
  });

  function computeQuizResult() {
    resultCard.classList.add('active');

    if (quizState.type === 'ecommerce' || quizState.traffic === 'heavy') {
      resultTitle.textContent = 'Hostinger Cloud Startup Plan';
      resultDesc.textContent = 'Dedicated IP, 200GB NVMe storage, 3GB RAM, and isolated resources built for serious ecommerce stores and high-traffic sites.';
      resultPrice.innerHTML = '$7.99 <span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">/month</span> <span style="color:#10b981; font-size:0.85rem; font-weight:700;">(Save 68%)</span>';
      resultLink.href = 'review-hostinger.html#cloud-startup';
      resultLink.textContent = 'Claim Hostinger Cloud Deal →';
    } else if (quizState.type === 'business' || quizState.traffic === 'medium') {
      resultTitle.textContent = 'Hostinger Business Web Hosting (Editor’s Pick)';
      resultDesc.textContent = 'Free daily backups, 5X performance boost, free CDN, unlimited SSL, and free domain. Handles up to 100,000 monthly visits effortlessly.';
      resultPrice.innerHTML = '$3.99 <span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">/month</span> <span style="color:#10b981; font-size:0.85rem; font-weight:700;">(Save 75%)</span>';
      resultLink.href = 'review-hostinger.html#business-plan';
      resultLink.textContent = 'Claim Hostinger Business Deal →';
    } else {
      resultTitle.textContent = 'Hostinger Premium Shared Hosting';
      resultDesc.textContent = 'Ideal for personal blogs, portfolios, and new affiliate ventures. Host up to 100 websites with free domain, SSL, and 100GB SSD.';
      resultPrice.innerHTML = '$2.99 <span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">/month</span> <span style="color:#10b981; font-size:0.85rem; font-weight:700;">(Save 78%)</span>';
      resultLink.href = 'review-hostinger.html#premium-plan';
      resultLink.textContent = 'Claim Hostinger Premium Deal →';
    }
  }
}

// ----------------------------------------------------
// 5. Hosting Savings & TCO Calculator
// ----------------------------------------------------
function initSavingsCalculator() {
  const yearsSlider = document.getElementById('calcYearsSlider');
  const yearsVal = document.getElementById('calcYearsVal');
  const sitesSlider = document.getElementById('calcSitesSlider');
  const sitesVal = document.getElementById('calcSitesVal');
  const savingsDisplay = document.getElementById('calcSavingsTotal');
  const hostingerTotal = document.getElementById('calcHostingerTotal');
  const competitorTotal = document.getElementById('calcCompetitorTotal');

  if (!yearsSlider || !savingsDisplay) return;

  function updateCalc() {
    const years = parseInt(yearsSlider.value, 10);
    const sites = parseInt(sitesSlider.value, 10);

    if (yearsVal) yearsVal.textContent = `${years} Year${years > 1 ? 's' : ''}`;
    if (sitesVal) sitesVal.textContent = `${sites} Website${sites > 1 ? 's' : ''}`;

    // Average industry competitor (e.g. SiteGround/Bluehost) standard renewal rate ~$11.99/mo per bundle
    const competitorMonthly = 12.99 + (sites > 5 ? 10 : 0);
    // Hostinger promotional bundle rate with STR affiliate discount ~$2.99/mo
    const hostingerMonthly = 2.99;

    const competitorSum = Math.round(competitorMonthly * 12 * years);
    const hostingerSum = Math.round(hostingerMonthly * 12 * years);
    const totalSavings = competitorSum - hostingerSum;

    savingsDisplay.textContent = `$${totalSavings.toLocaleString()}`;
    if (hostingerTotal) hostingerTotal.textContent = `$${hostingerSum.toLocaleString()}`;
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
  const cards = document.querySelectorAll('.review-card');

  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filterCategory = tab.getAttribute('data-category');

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
