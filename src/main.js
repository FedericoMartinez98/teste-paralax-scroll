import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { WebGLScene } from './three-scene.js';

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

class App {
  constructor() {
    this.initLenis();
    this.initWebGL();
    this.initCursor();
    this.initSpotlights();
    this.initHeader();
    this.initAudioEngine();
    this.initParallaxAnimations();
    this.initUIControls();
  }

  /* ------------------------------------------------------------------------
     1. Smooth Scrolling (Lenis + GSAP ScrollTrigger Integration)
     ------------------------------------------------------------------------ */
  initLenis() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
      infinite: false,
    });

    // Synchronize Lenis with GSAP ScrollTrigger
    this.lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      if (this.webglScene) {
        const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalScroll > 0 ? e.scroll / totalScroll : 0;
        this.webglScene.setScrollProgress(progress);
      }
    });

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
  }

  /* ------------------------------------------------------------------------
     2. WebGL 3D Background & Hero Sculpture
     ------------------------------------------------------------------------ */
  initWebGL() {
    try {
      this.webglScene = new WebGLScene('webgl-container');
    } catch (err) {
      console.warn('WebGL initialization failed, fallback to CSS styling:', err);
    }
  }

  /* ------------------------------------------------------------------------
     3. Custom Fluid Magnetic Cursor System
     ------------------------------------------------------------------------ */
  initCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      // Instant update for center dot
      gsap.to(dot, {
        x: mouseX,
        y: mouseY,
        duration: 0.08,
        ease: 'power2.out',
      });
    });

    // Fluid trailing lerp for outer ring
    const renderRing = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderRing);
    };
    requestAnimationFrame(renderRing);

    // Interactive Hover States for Links, Buttons & Cards
    const interactiveElements = document.querySelectorAll(
      'a, button, .magnetic-target, .glass-card, .gallery-card, .step-nav-item'
    );

    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor-hover');
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. Dynamic Mouse Spotlight on Glass Cards
     ------------------------------------------------------------------------ */
  initSpotlights() {
    const spotlights = document.querySelectorAll('.magnetic-spotlight');

    spotlights.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Subtle 3D card tilt
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        gsap.to(card, {
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 0.4,
          ease: 'power2.out',
          transformPerspective: 1000,
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.6,
          ease: 'power2.out',
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     5. Luxury Navigation Header Behavior
     ------------------------------------------------------------------------ */
  initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });

    // Smooth Anchor Navigation via Lenis
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            this.lenis.scrollTo(targetEl, { offset: -60, duration: 1.6 });
          }
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. GSAP Parallax Timelines & ScrollTrigger Choreography
     ------------------------------------------------------------------------ */
  initParallaxAnimations() {
    // ----------------------------------------------------------------------
    // SEÇÃO 1: Hero Parallax Exit Timeline
    // ----------------------------------------------------------------------
    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#hero-section',
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    heroTl
      .to('.hero-headline .reveal-inner', {
        y: -120,
        opacity: 0,
        filter: 'blur(16px)',
        stagger: 0.05,
        ease: 'none',
      }, 0)
      .to('.hero-badge-wrap, .hero-subline', {
        y: -90,
        opacity: 0,
        filter: 'blur(10px)',
        ease: 'none',
      }, 0)
      .to('.hero-meta-grid', {
        y: -60,
        opacity: 0,
        scale: 0.95,
        filter: 'blur(8px)',
        ease: 'none',
      }, 0)
      .to('.scroll-indicator', {
        opacity: 0,
        y: -40,
        ease: 'none',
      }, 0)
      .to('.hero-volumetric-glow', {
        scale: 1.8,
        opacity: 0,
        ease: 'none',
      }, 0);


    // ----------------------------------------------------------------------
    // SEÇÃO 2: Profundidade (Multi-Camadas 3D Parallax)
    // ----------------------------------------------------------------------
    const depthTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#depth-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      },
    });

    // Layer 1: Background Distante (Velocidade Lenta)
    depthTl.to('.layer-back', {
      yPercent: 25,
      ease: 'none',
    }, 0);

    // Layer 2: Elemento Intermediário (Velocidade Normal)
    depthTl.to('.layer-mid', {
      yPercent: -15,
      ease: 'none',
    }, 0);

    // Layer 3: Elemento em Primeiro Plano (Velocidade Ultra Rápida)
    depthTl.to('.layer-fore .foreground-monolith', {
      yPercent: -80,
      scale: 1.15,
      rotation: -6,
      ease: 'none',
    }, 0);

    depthTl.to('.layer-fore .foreground-orb', {
      yPercent: -110,
      scale: 1.25,
      ease: 'none',
    }, 0);

    // Reveal of Midground Cards
    gsap.from('.glass-card', {
      scrollTrigger: {
        trigger: '#depth-section',
        start: 'top 70%',
      },
      y: 60,
      opacity: 0,
      stagger: 0.2,
      duration: 1.2,
      ease: 'power3.out',
    });


    // ----------------------------------------------------------------------
    // SEÇÃO 3: Storytelling (Pinned Phrase-by-Phrase)
    // ----------------------------------------------------------------------
    const phrases = document.querySelectorAll('.story-phrase');
    const storyTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#story-section',
        start: 'top top',
        end: '+=2800',
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
    });

    // Animate Progress Fill Bar
    storyTl.to('.story-progress-fill', {
      width: '100%',
      ease: 'none',
      duration: phrases.length,
    }, 0);

    // Sequential Sentence Crossfades
    phrases.forEach((phrase, index) => {
      const pText = phrase.querySelector('.phrase-text');
      const pIdx = phrase.querySelector('.phrase-index');

      // Entry phase
      storyTl
        .fromTo(phrase, 
          { autoAlpha: 0 }, 
          { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 
          index
        )
        .fromTo([pIdx, pText],
          { y: 50, filter: 'blur(14px)', scale: 0.94 },
          { y: 0, filter: 'blur(0px)', scale: 1, stagger: 0.08, duration: 0.5, ease: 'power3.out' },
          index
        );

      // Exit phase (unless last phrase)
      if (index < phrases.length - 1) {
        storyTl
          .to([pIdx, pText], {
            y: -50,
            filter: 'blur(14px)',
            scale: 0.94,
            stagger: 0.05,
            duration: 0.4,
            ease: 'power2.in',
          }, index + 0.65)
          .to(phrase, {
            autoAlpha: 0,
            duration: 0.35,
          }, index + 0.7);
      } else {
        // Hold the last statement with a subtle breathing pulse
        storyTl.to(phrase, {
          scale: 1.03,
          duration: 0.4,
        }, index + 0.6);
      }
    });


    // ----------------------------------------------------------------------
    // SEÇÃO 4: Galeria Parallax Assimétrica (Velocidades Desacopladas)
    // ----------------------------------------------------------------------
    gsap.to('.col-left', {
      scrollTrigger: {
        trigger: '#gallery-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
      yPercent: -18,
      ease: 'none',
    });

    gsap.to('.col-right', {
      scrollTrigger: {
        trigger: '#gallery-section',
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2.2,
      },
      yPercent: -38,
      ease: 'none',
    });


    // ----------------------------------------------------------------------
    // SEÇÃO 5: Sticky Scroll (Modular Feature Transformation)
    // ----------------------------------------------------------------------
    const stateCards = document.querySelectorAll('.sticky-state-card');
    const stageVisuals = document.querySelectorAll('.morph-layer');
    const stepNavs = document.querySelectorAll('.step-nav-item');

    const stickyTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#sticky-section',
        start: 'top top',
        end: '+=2400',
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
      },
    });

    const updateActiveState = (stepIndex) => {
      stepNavs.forEach((nav, i) => {
        nav.classList.toggle('active', i === stepIndex);
      });
      stateCards.forEach((card, i) => {
        card.classList.toggle('active', i === stepIndex);
      });
      stageVisuals.forEach((vis, i) => {
        vis.classList.toggle('active', i === stepIndex);
      });
    };

    // Stage 1 -> Stage 2
    stickyTl
      .to('.stage-vis-1', { autoAlpha: 0, scale: 0.85, duration: 0.5, ease: 'power2.in' }, 0.5)
      .to('.state-1', { autoAlpha: 0, y: -20, duration: 0.5, ease: 'power2.in' }, 0.5)
      .fromTo('.stage-vis-2', 
        { autoAlpha: 0, scale: 1.15 }, 
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out', onStart: () => updateActiveState(1) }, 
        1.0
      )
      .fromTo('.state-2', 
        { autoAlpha: 0, y: 20 }, 
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 
        1.0
      );

    // Stage 2 -> Stage 3
    stickyTl
      .to('.stage-vis-2', { autoAlpha: 0, scale: 0.85, duration: 0.5, ease: 'power2.in' }, 1.8)
      .to('.state-2', { autoAlpha: 0, y: -20, duration: 0.5, ease: 'power2.in' }, 1.8)
      .fromTo('.stage-vis-3', 
        { autoAlpha: 0, scale: 1.15 }, 
        { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'power2.out', onStart: () => updateActiveState(2) }, 
        2.3
      )
      .fromTo('.state-3', 
        { autoAlpha: 0, y: 20 }, 
        { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 
        2.3
      );


    // ----------------------------------------------------------------------
    // SEÇÃO 6: Final Cinematográfico & Mask Reveal
    // ----------------------------------------------------------------------
    const finalTl = gsap.timeline({
      scrollTrigger: {
        trigger: '#final-section',
        start: 'top 80%',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    // Expanding central portal
    finalTl.fromTo('.final-portal-scaler', 
      { scale: 0.5, opacity: 0.2 },
      { scale: 2.6, opacity: 0.9, ease: 'none' },
      0
    );

    // Mask reveal typography
    gsap.from('.mask-inner', {
      scrollTrigger: {
        trigger: '#final-section',
        start: 'top 60%',
      },
      y: '105%',
      stagger: 0.12,
      duration: 1.4,
      ease: 'power4.out',
    });

    gsap.from('.final-badge, .final-subtext, .final-actions', {
      scrollTrigger: {
        trigger: '#final-section',
        start: 'top 50%',
      },
      y: 40,
      opacity: 0,
      stagger: 0.15,
      duration: 1.2,
      ease: 'power3.out',
    });
  }

  /* ------------------------------------------------------------------------
     7. Audio Engine (Web Audio API Ambient Hum & Feedback)
     ------------------------------------------------------------------------ */
  initAudioEngine() {
    this.isPlayingAudio = false;
    this.audioCtx = null;
    this.osc1 = null;
    this.osc2 = null;
    this.gainNode = null;

    const soundBtn = document.getElementById('sound-toggle');
    if (!soundBtn) return;

    soundBtn.addEventListener('click', () => {
      this.toggleAudio(soundBtn);
    });
  }

  toggleAudio(btn) {
    if (!this.isPlayingAudio) {
      // Start ambient synth
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();

        // Sub bass warm drone (55Hz / A1)
        this.osc1 = this.audioCtx.createOscillator();
        this.osc1.type = 'sine';
        this.osc1.frequency.setValueAtTime(55, this.audioCtx.currentTime);

        // Harmonic shimmer (165Hz / E3)
        this.osc2 = this.audioCtx.createOscillator();
        this.osc2.type = 'triangle';
        this.osc2.frequency.setValueAtTime(165, this.audioCtx.currentTime);

        // Lowpass filter for warm cinematic feel
        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, this.audioCtx.currentTime);

        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
        this.gainNode.gain.exponentialRampToValueAtTime(0.12, this.audioCtx.currentTime + 2);

        this.osc1.connect(filter);
        this.osc2.connect(filter);
        filter.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);

        this.osc1.start();
        this.osc2.start();

        this.isPlayingAudio = true;
        btn.classList.add('playing');
        btn.querySelector('.sound-label').textContent = 'AUDIO: ON';
      } catch (e) {
        console.warn('Audio context unavailable:', e);
      }
    } else {
      // Fade out
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.8);
        setTimeout(() => {
          this.osc1?.stop();
          this.osc2?.stop();
          this.audioCtx?.close();
          this.isPlayingAudio = false;
        }, 800);
      }
      btn.classList.remove('playing');
      btn.querySelector('.sound-label').textContent = 'AUDIO: OFF';
    }
  }

  /* ------------------------------------------------------------------------
     8. UI Controls & Accessibility
     ------------------------------------------------------------------------ */
  initUIControls() {
    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.lenis.scrollTo('#hero-section', { duration: 2 });
      });
    }

    // Scroll indicator click
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
      scrollIndicator.addEventListener('click', () => {
        this.lenis.scrollTo('#depth-section', { duration: 1.4 });
      });
    }

    // Motion reduction toggle
    const reduceMotionBtn = document.getElementById('reduce-motion-btn');
    if (reduceMotionBtn) {
      let isReduced = false;
      reduceMotionBtn.addEventListener('click', () => {
        isReduced = !isReduced;
        reduceMotionBtn.textContent = isReduced ? 'PREFERS MOTION: OFF' : 'PREFERS MOTION: ON';
        if (isReduced) {
          ScrollTrigger.getAll().forEach((t) => t.disable());
        } else {
          ScrollTrigger.getAll().forEach((t) => t.enable());
        }
      });
    }
  }
}

// Instantiate on DOM Load
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
