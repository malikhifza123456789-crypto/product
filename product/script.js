/**
 * OMNIFLOW - LANDING PAGE INTERACTION SCRIPT
 * Vanilla JavaScript, Accessible, Clean, Mobile-First
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initStickyNavbar();
  initMobileNavigation();
  initInteractiveDemoModal();
  initPricingToggle();
  initFaqAccordion();
  initCtaFormValidation();
  initScrollAnimations();
  initCurrentYear();
});

/* --------------------------------------------------------------------------
   1. Theme Management (Light / Dark Mode)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlElement = document.documentElement;
  const STORAGE_KEY = 'omniflow_theme_preference';

  // Determine starting theme: saved in localStorage -> system preference -> default 'dark'
  const savedTheme = localStorage.getItem(STORAGE_KEY);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
      localStorage.setItem(STORAGE_KEY, currentTheme);
    });
  }

  // Listen to system changes if user hasn't explicitly set a preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
  }
}

/* --------------------------------------------------------------------------
   2. Sticky Navbar & Scroll Spy
   -------------------------------------------------------------------------- */
function initStickyNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll styling on header
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Active Link Spy using IntersectionObserver
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));
}

/* --------------------------------------------------------------------------
   3. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNavigation() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');

  if (!menuToggle || !mobileNav) return;

  function toggleMenu(open) {
    const isExpanded = open !== undefined ? open : menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', isExpanded);
    mobileNav.setAttribute('aria-hidden', !isExpanded);
    
    if (isExpanded) {
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    } else {
      mobileNav.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  menuToggle.addEventListener('click', () => toggleMenu());

  // Close when clicking any menu link
  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      toggleMenu(false);
      menuToggle.focus();
    }
  });
}

/* --------------------------------------------------------------------------
   4. Interactive Demo Modal & Chapter Simulation
   -------------------------------------------------------------------------- */
function initInteractiveDemoModal() {
  const modal = document.getElementById('demo-modal');
  const openBtn = document.getElementById('open-demo-btn');
  const closeBtn = document.getElementById('close-demo-btn');
  const modalCta = document.getElementById('modal-get-started');
  const chapterButtons = document.querySelectorAll('.chapter-btn');
  const termBody = document.getElementById('demo-term-body');
  const stepBadge = document.getElementById('demo-step-badge');

  if (!modal || !openBtn) return;

  // Chapter content simulations
  const chapters = {
    1: {
      badge: 'Step 1 of 3: Connecting Repositories',
      lines: [
        '<div class="term-line"><span class="t-green">✔</span> Connected to GitHub organization (42 repositories)</div>',
        '<div class="term-line"><span class="t-green">✔</span> Synced Linear project &amp; sprint backlog</div>',
        '<div class="term-line"><span class="t-indigo">⚡</span> OmniFlow autonomous engine initialized</div>',
        '<div class="term-line"><span class="t-yellow">⚠</span> Bottleneck detected: PR #842 waiting on database schema approval (26h)</div>',
        '<div class="term-line"><span class="t-purple">→</span> Suggested auto-reroute: Assigned @dave-db (online now)</div>'
      ]
    },
    2: {
      badge: 'Step 2 of 3: Predictive Radar & Dependency Protection',
      lines: [
        '<div class="term-line"><span class="t-indigo">🔍</span> Scanning AST changes for service: auth-microservice</div>',
        '<div class="term-line"><span class="t-yellow">⚠</span> Breaking schema change detected in endpoint /api/v2/tokens</div>',
        '<div class="term-line"><span class="t-purple">→</span> Downstream consumer flagged: mobile-ios repository</div>',
        '<div class="term-line"><span class="t-green">✔</span> Automated preventive canary check generated</div>',
        '<div class="term-line"><span class="t-green">✔</span> Sprint 48 delivery projection: 99.4% confident</div>'
      ]
    },
    3: {
      badge: 'Step 3 of 3: Zero-Meeting Async Standup Digest',
      lines: [
        '<div class="term-line"><span class="t-indigo">📝</span> Aggregating 38 commits across 6 squads</div>',
        '<div class="term-line"><span class="t-green">✔</span> Auto-transitioned 14 tickets to "Ready for QA" in Jira</div>',
        '<div class="term-line"><span class="t-purple">→</span> Slack digest posted to #eng-announcements: "All sprint goals met"</div>',
        '<div class="term-line"><span class="t-green">✔</span> 45 minutes saved for 18 engineers this morning</div>',
        '<div class="term-line"><span class="t-green">🚀</span> OmniFlow fully operational!</div>'
      ]
    }
  };

  openBtn.addEventListener('click', () => {
    modal.showModal();
    // Trap focus inside modal
    closeBtn.focus();
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.close();
      openBtn.focus();
    });
  }

  if (modalCta) {
    modalCta.addEventListener('click', () => {
      modal.close();
    });
  }

  // Close when clicking modal backdrop
  modal.addEventListener('click', (e) => {
    const dialogDimensions = modal.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      modal.close();
    }
  });

  // Chapter buttons interactivity
  chapterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      chapterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const chapterNum = btn.getAttribute('data-chapter');
      const data = chapters[chapterNum];

      if (data && termBody && stepBadge) {
        stepBadge.textContent = data.badge;
        termBody.style.opacity = '0';
        setTimeout(() => {
          termBody.innerHTML = data.lines.join('');
          termBody.style.opacity = '1';
        }, 150);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. Pricing Toggle (Monthly vs. Annual with 20% Discount)
   -------------------------------------------------------------------------- */
function initPricingToggle() {
  const billingToggle = document.getElementById('billing-toggle');
  const labelMonthly = document.getElementById('label-monthly');
  const labelAnnual = document.getElementById('label-annual');
  const priceGrowth = document.getElementById('price-growth');
  const priceEnterprise = document.getElementById('price-enterprise');
  const growthNote = document.getElementById('growth-billing-note');
  const enterpriseNote = document.getElementById('enterprise-billing-note');

  if (!billingToggle) return;

  let isAnnual = billingToggle.getAttribute('aria-checked') === 'true';

  function updatePricing(annual) {
    isAnnual = annual;
    billingToggle.setAttribute('aria-checked', annual);

    if (annual) {
      labelAnnual.classList.add('active');
      labelMonthly.classList.remove('active');

      if (priceGrowth) priceGrowth.textContent = priceGrowth.dataset.annual;
      if (priceEnterprise) priceEnterprise.textContent = priceEnterprise.dataset.annual;
      if (growthNote) growthNote.textContent = 'Billed annually ($288/yr)';
      if (enterpriseNote) enterpriseNote.textContent = 'Billed annually or custom invoice';
    } else {
      labelMonthly.classList.add('active');
      labelAnnual.classList.remove('active');

      if (priceGrowth) priceGrowth.textContent = priceGrowth.dataset.monthly;
      if (priceEnterprise) priceEnterprise.textContent = priceEnterprise.dataset.monthly;
      if (growthNote) growthNote.textContent = 'Billed monthly ($29/mo)';
      if (enterpriseNote) enterpriseNote.textContent = 'Billed monthly ($69/mo)';
    }
  }

  billingToggle.addEventListener('click', () => {
    updatePricing(!isAnnual);
  });

  if (labelMonthly) {
    labelMonthly.addEventListener('click', () => updatePricing(false));
  }
  if (labelAnnual) {
    labelAnnual.addEventListener('click', () => updatePricing(true));
  }
}

/* --------------------------------------------------------------------------
   6. FAQ Accordion (Accessible with Smooth Transitions)
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const accordion = document.getElementById('faq-accordion');
  if (!accordion) return;

  const faqItems = accordion.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    const answerPanel = item.querySelector('.faq-answer');

    questionBtn.addEventListener('click', () => {
      const isExpanded = questionBtn.getAttribute('aria-expanded') === 'true';

      // Close all other items for a clean single-open accordion experience
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          const otherBtn = otherItem.querySelector('.faq-question');
          const otherAnswer = otherItem.querySelector('.faq-answer');
          otherBtn.setAttribute('aria-expanded', 'false');
          otherItem.classList.remove('active');
          otherAnswer.hidden = true;
          otherAnswer.style.maxHeight = null;
        }
      });

      // Toggle current item
      if (isExpanded) {
        questionBtn.setAttribute('aria-expanded', 'false');
        item.classList.remove('active');
        answerPanel.style.maxHeight = null;
        setTimeout(() => {
          answerPanel.hidden = true;
        }, 200);
      } else {
        questionBtn.setAttribute('aria-expanded', 'true');
        item.classList.add('active');
        answerPanel.hidden = false;
        answerPanel.style.maxHeight = answerPanel.scrollHeight + 'px';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. Email Signup Form Validation & Submission
   -------------------------------------------------------------------------- */
function initCtaFormValidation() {
  const form = document.getElementById('signup-form');
  const emailInput = document.getElementById('user-email');
  const submitBtn = document.getElementById('submit-btn');
  const errorMsg = document.getElementById('email-error');
  const successBanner = document.getElementById('form-success');
  const confirmedEmail = document.getElementById('confirmed-email');
  const resetFormBtn = document.getElementById('reset-form-btn');

  if (!form || !emailInput) return;

  // Real-time email validation regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  function validateEmail(value) {
    const trimmed = value.trim();
    if (!trimmed) {
      return { valid: false, message: 'Please enter your work email address.' };
    }
    if (!emailRegex.test(trimmed)) {
      return { valid: false, message: 'Please provide a valid email format (e.g., alex@company.com).' };
    }
    return { valid: true, message: '' };
  }

  // Clear error on input
  emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('input-error')) {
      const check = validateEmail(emailInput.value);
      if (check.valid) {
        emailInput.classList.remove('input-error');
        errorMsg.textContent = '';
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const check = validateEmail(emailInput.value);

    if (!check.valid) {
      emailInput.classList.add('input-error');
      errorMsg.textContent = check.message;
      emailInput.focus();
      return;
    }

    // Valid submission: simulate async request
    emailInput.classList.remove('input-error');
    errorMsg.textContent = '';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const submittedValue = emailInput.value.trim();

    setTimeout(() => {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
      
      // Hide form, show confirmation banner
      form.hidden = true;
      if (confirmedEmail) confirmedEmail.textContent = submittedValue;
      if (successBanner) {
        successBanner.hidden = false;
        successBanner.focus();
      }
    }, 850);
  });

  // Reset button to allow registering another email
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      form.hidden = false;
      successBanner.hidden = true;
      form.reset();
      emailInput.focus();
    });
  }
}

/* --------------------------------------------------------------------------
   8. IntersectionObserver Scroll Animations
   -------------------------------------------------------------------------- */
function initScrollAnimations() {
  const scrollElements = document.querySelectorAll(
    '.contrast-card, .feature-card, .step-card, .testimonial-card, .pricing-card, .stat-box, .faq-item'
  );

  // If mobile or user prefers reduced motion or no IntersectionObserver, keep them visible
  if (
    window.innerWidth < 768 ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !('IntersectionObserver' in window)
  ) {
    return;
  }

  scrollElements.forEach((el) => {
    el.classList.add('reveal-init');
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  scrollElements.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   9. Footer Dynamic Year
   -------------------------------------------------------------------------- */
function initCurrentYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}
