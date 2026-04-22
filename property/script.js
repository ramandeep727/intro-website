/* ============================================
   PRESTIGE ESTATES — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Navbar scroll effect ──
  const navbar = document.getElementById('navbar');
  const scrollTop = document.getElementById('scrollTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar glassmorphism on scroll
    if (scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Scroll-to-top button visibility
    if (scrollY > 500) {
      scrollTop.classList.add('visible');
    } else {
      scrollTop.classList.remove('visible');
    }
  });

  // Scroll to top
  scrollTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Mobile Navigation ──
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // ── Active nav link on scroll ──
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  function updateActiveNav() {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navAnchors.forEach(a => {
          a.classList.remove('active');
          if (a.getAttribute('href') === '#' + sectionId) {
            a.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav);

  // ── Hero Particles ──
  const particlesContainer = document.getElementById('heroParticles');
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (4 + Math.random() * 4) + 's';
    particle.style.opacity = (0.1 + Math.random() * 0.3).toString();
    particle.style.width = (2 + Math.random() * 3) + 'px';
    particle.style.height = particle.style.width;
    particlesContainer.appendChild(particle);
  }

  // ── Counter Animation ──
  const counters = document.querySelectorAll('.hero-stat-number');
  let counterStarted = false;

  function animateCounters() {
    if (counterStarted) return;
    counterStarted = true;

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'));
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCounter = () => {
        current += increment;
        if (current < target) {
          counter.textContent = Math.floor(current).toLocaleString();
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString() + '+';
        }
      };

      updateCounter();
    });
  }

  // Start counters when hero is visible
  const heroObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounters();
      }
    });
  }, { threshold: 0.3 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) heroObserver.observe(heroStats);

  // ── Scroll Reveal Animations ──
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ── Favorite Toggle ──
  function bindFavoriteToggles() {
    document.querySelectorAll('.property-card-favorite').forEach(fav => {
      // Remove existing listener to prevent duplicates
      const newFav = fav.cloneNode(true);
      fav.parentNode.replaceChild(newFav, fav);

      newFav.addEventListener('click', (e) => {
        e.preventDefault();
        newFav.classList.toggle('liked');

        // Micro-animation
        newFav.style.transform = 'scale(1.3)';
        setTimeout(() => {
          newFav.style.transform = 'scale(1)';
        }, 200);
      });
    });
  }

  // ── Property Filter Tabs ──
  const filterTabs = document.querySelectorAll('.featured-tab');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      const propertyCards = document.querySelectorAll('.property-card');

      propertyCards.forEach(card => {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || filter === category) {
          card.style.display = 'block';
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.transition = 'all 0.5s ease';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  // ── Search Functionality ──
  const searchBtn = document.getElementById('searchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const type = document.getElementById('search-type').value;
      const location = document.getElementById('search-location').value;
      const budget = document.getElementById('search-budget').value;

      // Scroll to properties section
      document.getElementById('properties').scrollIntoView({ behavior: 'smooth' });

      // Visual feedback
      searchBtn.textContent = 'Searching...';
      searchBtn.style.opacity = '0.7';

      setTimeout(() => {
        searchBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
          Search
        `;
        searchBtn.style.opacity = '1';
      }, 1000);
    });
  }

  // ── Contact Form ──
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('.form-submit');
      const originalText = submitBtn.innerHTML;

      // Visual feedback
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18" class="spin">
          <circle cx="12" cy="12" r="10" stroke-dasharray="40" stroke-dashoffset="10"></circle>
        </svg>
        Sending...
      `;
      submitBtn.style.opacity = '0.7';
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          Enquiry Sent Successfully!
        `;
        submitBtn.style.opacity = '1';
        submitBtn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';

        // Reset form
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);
      }, 1500);
    });
  }

  // ── Smooth Scroll for all anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // ── Property Card Hover Parallax ──
  function bindHoverParallax() {
    document.querySelectorAll('.property-card-image').forEach(imageContainer => {
      imageContainer.addEventListener('mousemove', (e) => {
        const rect = imageContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        const img = imageContainer.querySelector('img');
        if (img) img.style.transform = `scale(1.08) translate(${x * 10}px, ${y * 10}px)`;
      });

      imageContainer.addEventListener('mouseleave', () => {
        const img = imageContainer.querySelector('img');
        if (img) {
          img.style.transform = 'scale(1)';
          img.style.transition = 'transform 0.5s ease';
        }
      });
    });
  }

  // ── Fetch Properties Dynamically ──
  async function fetchAndRenderProperties() {
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;

    try {
      const res = await fetch('/api/properties', { cache: 'no-store' });
      const properties = await res.json();

      grid.innerHTML = ''; // Clear loading or existing

      let delayCounter = 1;

      properties.forEach(prop => {
        const isRent = prop.type === 'rent';

        const cardHTML = `
          <div class="property-card reveal reveal-delay-${delayCounter}" data-category="${prop.type}">
            <div class="property-card-image">
              <img src="/${prop.image}" alt="${prop.title}">
              <span class="property-card-badge ${isRent ? 'rent' : ''}">For ${isRent ? 'Rent' : 'Sale'}</span>
              <div class="property-card-favorite">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
            </div>
            <div class="property-card-body">
              <div class="property-card-price">${prop.price}</div>
              <h3 class="property-card-title">${prop.title}</h3>
              <div class="property-card-location">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                ${prop.location}
              </div>
              <div class="property-card-features">
                <div class="property-feature">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7"/><path d="M21 7H3l2-4h14l2 4z"/><path d="M12 4v3"/></svg>
                  ${prop.beds} Beds
                </div>
                <div class="property-feature">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v7"/><path d="M4 17v2"/><path d="M20 17v2"/></svg>
                  ${prop.baths} Baths
                </div>
                <div class="property-feature">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                  ${prop.sqft} sqft
                </div>
              </div>
            </div>
          </div>
        `;

        grid.insertAdjacentHTML('beforeend', cardHTML);

        delayCounter++;
        if (delayCounter > 3) delayCounter = 1;
      });

      // Rebind events to new elements
      bindFavoriteToggles();
      bindHoverParallax();

      // Re-observe new reveal elements
      document.querySelectorAll('.property-card.reveal').forEach(el => revealObserver.observe(el));

    } catch (err) {
      console.error('Error fetching properties', err);
      grid.innerHTML = `
        <div style="text-align:center; width:100%; grid-column:1/-1; padding: 4rem; background: rgba(255,255,255,0.05); border-radius: var(--radius-lg); border: 1px dashed var(--color-border);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="48" height="48" style="margin-bottom: 1rem; color: var(--color-text-muted);"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <h3>Server Not Running</h3>
          <p style="color: var(--color-text-muted); margin-top: 0.5rem;">Could not connect to the backend API to fetch properties.</p>
          <p style="color: var(--color-text-muted);">Please make sure you have run <code style="background: rgba(0,0,0,0.5); padding: 0.2rem 0.5rem; border-radius: 4px; color: var(--color-primary);">node server.js</code> in your terminal.</p>
        </div>
      `;
    }
  }

  // Initial load
  fetchAndRenderProperties();

});
