/* ==========================================================================
   WISSEN TECHNOLOGY — MAIN JAVASCRIPT
   Thoughtful Human Interactions & Dynamic Studio Behaviors
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbarScroll();
  initWorldClocks();
  initHeroPillars();
  initIndustryBrowser();
  initConsultationModal();
  initMetricCounters();
  initMobileNav();
  initHeroVideoControls();
});

/* 1. Subtle Navbar Scroll Transition */
function initNavbarScroll() {
  const nav = document.querySelector('.site-nav');
  if (!nav) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* 2. World Clocks in Footer */
function initWorldClocks() {
  const clocks = [
    { el: document.getElementById('clock-nyc'), timeZone: 'America/New_York' },
    { el: document.getElementById('clock-lon'), timeZone: 'Europe/London' },
    { el: document.getElementById('clock-blr'), timeZone: 'Asia/Kolkata' },
    { el: document.getElementById('clock-sin'), timeZone: 'Asia/Singapore' }
  ];

  function update() {
    const now = new Date();
    clocks.forEach(c => {
      if (c.el) {
        try {
          const str = now.toLocaleTimeString('en-US', {
            timeZone: c.timeZone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
          c.el.textContent = str;
        } catch (e) {
          c.el.textContent = now.toTimeString().split(' ')[0];
        }
      }
    });
  }

  update();
  setInterval(update, 1000);
}

/* 3. Hero Video & Focus Switcher */
function initHeroPillars() {
  const buttons = document.querySelectorAll('.focus-tab-btn');
  const captionTitle = document.getElementById('hero-caption-title');
  const captionDesc = document.getElementById('hero-caption-desc');
  const video = document.getElementById('hero-main-video');

  const pillarData = [
    {
      title: 'Real-Time Enterprise Data & Analytics',
      desc: 'Processing petabyte-scale market events with sub-millisecond precision.',
      video: 'videos/Bg-video_mp4.mp4',
      poster: 'videos/Bg-video_poster.0000000.jpg'
    },
    {
      title: 'Cloud-Native Architecture & FinOps',
      desc: 'Containerized Kubernetes pipelines engineered for 99.999% availability.',
      video: 'videos/Service-hero_mp4.mp4',
      poster: 'videos/Service-hero_poster.0000000.jpg'
    },
    {
      title: 'InterviewNinja Talent Intelligence',
      desc: 'Structured, rubric-driven technical hiring that eliminates bias.',
      video: 'videos/BFSI-Video_mp4.mp4',
      poster: 'videos/BFSI-Video_poster.0000000.jpg'
    }
  ];

  buttons.forEach((btn, idx) => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const data = pillarData[idx];
      if (!data) return;

      if (captionTitle) captionTitle.textContent = data.title;
      if (captionDesc) captionDesc.textContent = data.desc;

      if (video && video.src !== data.video) {
        video.style.opacity = '0.2';
        setTimeout(() => {
          video.src = data.video;
          video.poster = data.poster;
          video.load();
          video.play().catch(() => {});
          video.style.opacity = '1';
        }, 220);
      }
    });
  });
}

/* 4. Industries Interactive Showcase */
function initIndustryBrowser() {
  const buttons = document.querySelectorAll('.industry-btn');
  const title = document.getElementById('ind-title');
  const desc = document.getElementById('ind-desc');
  const m1Val = document.getElementById('ind-m1-val');
  const m1Lbl = document.getElementById('ind-m1-lbl');
  const m2Val = document.getElementById('ind-m2-val');
  const m2Lbl = document.getElementById('ind-m2-lbl');
  const video = document.getElementById('ind-video');
  const tagsContainer = document.getElementById('ind-tags');

  const industryProfiles = {
    bfsi: {
      title: 'Banking & Capital Markets',
      desc: 'From low-latency algorithmic trading engines and automated clearing houses to risk calculation models, we build the core software that the world\'s largest financial institutions rely on every day.',
      m1Val: '99.999%',
      m1Lbl: 'Mission-Critical System Availability',
      m2Val: '$500M+',
      m2Lbl: 'Daily Value Flow in Core Systems',
      tags: ['Algorithmic Trading', 'Core Banking Modernization', 'CTRM & Risk Systems', 'Regulatory Compliance'],
      video: 'videos/BFSI-Video_mp4.mp4',
      poster: 'images/BFSI--FinTech.webp'
    },
    telecom: {
      title: 'Telecom & 5G Infrastructure',
      desc: 'Architecting distributed telecom fabrics, cloud-native OSS/BSS platforms, and automated service provisioning for tier-one mobile operators serving tens of millions of active subscribers.',
      m1Val: '10x',
      m1Lbl: 'Faster Network Service Provisioning',
      m2Val: '100M+',
      m2Lbl: 'Subscribers Scaled on Platform',
      tags: ['5G Network Slicing', 'Edge Cloud Architecture', 'OSS / BSS Automation', 'Real-time Telemetry'],
      video: 'videos/Service-hero_mp4.mp4',
      poster: 'images/Telecom.webp'
    },
    healthcare: {
      title: 'Healthcare & Life Sciences',
      desc: 'Engineering HIPAA-compliant data lakes, clinical trial patient tracking workflows, and bioinformatics analytics that speed up research while maintaining rigorous regulatory data governance.',
      m1Val: '100%',
      m1Lbl: 'HIPAA & FDA 21 CFR Part 11 Adherence',
      m2Val: '4.5x',
      m2Lbl: 'Acceleration in Clinical Data Ingestion',
      tags: ['Clinical Data Lakes', 'FHIR / HL7 Interoperability', 'Bioinformatics Analytics', 'Secure Health APIs'],
      video: 'videos/Bg-video_mp4.mp4',
      poster: 'images/Healthcare--Life-Sciences.webp'
    },
    retail: {
      title: 'Retail & Omnichannel Commerce',
      desc: 'Helping global retail brands bridge physical stores and online experiences with unified real-time inventory management, sub-50ms catalog searches, and customer personalization.',
      m1Val: '32%',
      m1Lbl: 'Uplift in Digital Conversion Rates',
      m2Val: '<45ms',
      m2Lbl: 'Global Catalog Search Latency',
      tags: ['Headless E-Commerce', 'Real-time Inventory Mesh', 'Recommendation Systems', 'Supply Chain Visibility'],
      video: 'videos/Service-hero_mp4.mp4',
      poster: 'images/Retail.webp'
    },
    manufacturing: {
      title: 'Industrial Manufacturing & IoT',
      desc: 'Turning shop floor sensor data into actionable plant insights. We deploy industrial IoT data meshes, computer vision defect detection, and automated predictive equipment maintenance.',
      m1Val: '40%',
      m1Lbl: 'Reduction in Unscheduled Plant Downtime',
      m2Val: '24/7',
      m2Lbl: 'Automated Computer Vision Inspection',
      tags: ['Industrial IoT', 'Digital Twins', 'SCADA Integrations', 'Predictive Maintenance'],
      video: 'videos/Bg-video_mp4.mp4',
      poster: 'images/Manufacturing.webp'
    },
    energy: {
      title: 'Energy & Commodities',
      desc: 'Engineering complex commodity trading and risk management (CTRM) architectures, smart grid telemetry ingestion, carbon accounting platforms, and renewable asset performance tracking.',
      m1Val: '3x',
      m1Lbl: 'Risk Calculation Engine Throughput',
      m2Val: '15GW+',
      m2Lbl: 'Renewable Assets Under Management',
      tags: ['CTRM Architecture', 'Smart Grid Ingestion', 'Carbon Tracking', 'Market Risk Analytics'],
      video: 'videos/BFSI-Video_mp4.mp4',
      poster: 'images/Energy--Commodities.webp'
    }
  };

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-ind');
      const data = industryProfiles[key];
      if (!data) return;

      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (title) title.textContent = data.title;
      if (desc) desc.textContent = data.desc;
      if (m1Val) m1Val.textContent = data.m1Val;
      if (m1Lbl) m1Lbl.textContent = data.m1Lbl;
      if (m2Val) m2Val.textContent = data.m2Val;
      if (m2Lbl) m2Lbl.textContent = data.m2Lbl;

      if (tagsContainer) {
        tagsContainer.innerHTML = data.tags.map(t => `<span class="tech-tag">${t}</span>`).join('');
      }

      if (video) {
        video.style.opacity = '0.1';
        setTimeout(() => {
          video.src = data.video;
          video.poster = data.poster;
          video.load();
          video.play().catch(() => {});
          video.style.opacity = '0.25';
        }, 180);
      }
    });
  });
}

/* 5. Consultation Modal (Drawer) */
function initConsultationModal() {
  const modal = document.getElementById('consult-modal');
  const triggers = document.querySelectorAll('.trigger-consult-btn');
  const closeBtn = document.getElementById('consult-close-btn');

  if (!modal) return;

  const open = (e) => {
    if (e) e.preventDefault();
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  triggers.forEach(t => t.addEventListener('click', open));
  if (closeBtn) closeBtn.addEventListener('click', close);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      close();
    }
  });

  const form = document.getElementById('consult-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you! A senior solutions architect from Wissen Technology will review your inquiry and connect with you within 24 hours.');
      close();
      form.reset();
    });
  }
}

/* 6. Metric Counters */
function initMetricCounters() {
  const counters = document.querySelectorAll('.metric-number[data-val]');
  let done = false;

  const check = () => {
    if (done) return;
    const sec = document.querySelector('.scale-section');
    if (!sec) return;

    const r = sec.getBoundingClientRect();
    if (r.top <= window.innerHeight * 0.85) {
      done = true;
      counters.forEach(c => {
        const target = parseInt(c.getAttribute('data-val'), 10);
        const prefix = c.getAttribute('data-pre') || '';
        const suffix = c.getAttribute('data-suf') || '';
        let current = 0;
        const totalSteps = 40;
        const inc = target / totalSteps;
        const timer = setInterval(() => {
          current += inc;
          if (current >= target) {
            c.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
            clearInterval(timer);
          } else {
            c.textContent = `${prefix}${Math.floor(current).toLocaleString()}${suffix}`;
          }
        }, 25);
      });
    }
  };

  window.addEventListener('scroll', check, { passive: true });
  check();
}

/* 7. Mobile Navigation */
function initMobileNav() {
  const btn = document.querySelector('.nav-mobile-toggle');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    const isExpanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', !isExpanded);
    if (!isExpanded) {
      links.style.display = 'flex';
      links.style.flexDirection = 'column';
      links.style.position = 'fixed';
      links.style.top = '70px';
      links.style.left = '0';
      links.style.width = '100%';
      links.style.backgroundColor = '#0e1015';
      links.style.padding = '2rem';
      links.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
      links.style.zIndex = '999';
    } else {
      links.style.display = '';
    }
  });
}

/* 8. Video Sound Toggle */
function initHeroVideoControls() {
  const video = document.getElementById('hero-main-video');
  const btn = document.getElementById('hero-sound-btn');
  if (!video || !btn) return;

  btn.addEventListener('click', () => {
    video.muted = !video.muted;
    btn.textContent = video.muted ? '🔇 Muted' : '🔊 Sound On';
  });
}
