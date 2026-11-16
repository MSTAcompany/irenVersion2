/* ИРЭН — единый слой интерактивности */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year.
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Fixed header state.
  const header = $('.site-header');
  if (header) {
    let ticking = false;
    const updateHeader = () => {
      header.classList.toggle('scrolled', window.scrollY > 40);
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
    updateHeader();
  }

  // Mobile menu — keeps ARIA state, closes on navigation, Escape and outside click.
  const menuToggle = $('.menu-toggle');
  const mobileMenu = $('.mobile-menu');
  const mobileLinks = $$('.mobile-menu a, .mobile-booking-cta');
  const setMenu = (open) => {
    if (!menuToggle || !mobileMenu) return;
    mobileMenu.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
    if (open) {
      const firstLink = $('.mobile-menu a');
      if (firstLink) firstLink.focus({ preventScroll: true });
    } else {
      menuToggle.focus({ preventScroll: true });
    }
  };
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
    mobileLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', (event) => {
      if (mobileMenu.classList.contains('open') && !mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
        setMenu(false);
      }
    });
  }

  // Booking modal uses one canonical dialog. The contact form is cloned into it.
  const bookingBackdrop = $('#booking-backdrop');
  const bookingDialog = $('.booking-dialog', bookingBackdrop || document);
  const bookingClose = $('.booking-close', bookingBackdrop || document);
  const contactForm = $('#booking-form');
  const formSlot = $('#booking-modal-form-slot');
  if (contactForm && formSlot && !$('#booking-modal-form')) {
    const modalForm = contactForm.cloneNode(true);
    modalForm.id = 'booking-modal-form';
    const status = $('.form-status', modalForm);
    if (status) status.removeAttribute('id');
    formSlot.appendChild(modalForm);
  }

  const setBooking = (open, returnFocus = true) => {
    if (!bookingBackdrop) return;
    bookingBackdrop.classList.toggle('open', open);
    bookingBackdrop.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('booking-open', open);
    if (open) {
      const first = $('input:not([type="hidden"]), select, textarea, button', bookingDialog || bookingBackdrop);
      window.setTimeout(() => first && first.focus({ preventScroll: true }), 40);
    } else if (returnFocus && document.activeElement) {
      const trigger = document.querySelector('[data-booking-open], [data-open-booking], .nav-cta, .footer-booking-btn');
      if (trigger) trigger.focus({ preventScroll: true });
    }
  };

  $$('[data-booking-open], [data-open-booking], .nav-cta, .footer-booking-btn, .mobile-booking-cta').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      if (mobileMenu && mobileMenu.classList.contains('open')) setMenu(false);
      setBooking(true, false);
    });
  });
  if (bookingClose) bookingClose.addEventListener('click', () => setBooking(false));
  if (bookingBackdrop) {
    bookingBackdrop.addEventListener('click', (event) => {
      if (event.target === bookingBackdrop) setBooking(false);
    });
  }

  // Content for all buttons marked with data-modal.
  const modalContent = {
    'small-hall': {
      eyebrow: 'ПЕРВЫЙ ЭТАЖ · ДО 25 ГОСТЕЙ',
      title: 'Малый зал',
      body: '<p>Камерное пространство для дней рождения, семейных ужинов, годовщин и встреч в кругу самых близких.</p><ul><li>Вместимость — до 25 гостей.</li><li>Подходит для уютного банкета и спокойного общения.</li><li>Формат меню и оформление можно обсудить заранее.</li></ul>'
    },
    'large-hall': {
      eyebrow: 'ВТОРОЙ ЭТАЖ · ДО 60 ГОСТЕЙ',
      title: 'Большой зал',
      body: '<p>Просторный зал для свадеб, юбилеев, корпоративов и других масштабных торжеств.</p><ul><li>Вместимость — до 60 гостей.</li><li>Пространство для праздничной программы и танцев.</li><li>Рассадку, меню и детали мероприятия согласуем индивидуально.</li></ul>'
    },
    'event-wedding': { eyebrow: 'ПОВОД СОБРАТЬСЯ', title: 'Свадьба', body: '<p>Поможем обсудить банкет, вместимость, сервировку и детали вашего свадебного вечера. Для торжества такого формата обычно рассматривают большой зал до 60 гостей.</p>' },
    'event-anniversary': { eyebrow: 'ПОВОД СОБРАТЬСЯ', title: 'Юбилей', body: '<p>Семейный праздник, где важно собрать за одним столом близких людей. В зависимости от количества гостей можно рассмотреть малый или большой зал.</p>' },
    'event-corporate': { eyebrow: 'ПОВОД СОБРАТЬСЯ', title: 'Корпоратив', body: '<p>Обсудим формат встречи команды, банкетную подачу, рассадку и возможную программу. Большой зал рассчитан на компании до 60 гостей.</p>' },
    'event-birthday': { eyebrow: 'ПОВОД СОБРАТЬСЯ', title: 'День рождения', body: '<p>Уютный вечер в кругу друзей и семьи. Малый зал подходит для камерных событий до 25 гостей.</p>' },
    'event-family': { eyebrow: 'ПОВОД СОБРАТЬСЯ', title: 'Семейный ужин', body: '<p>Неспешная встреча, вкусная еда и возможность побыть вместе. Детали стола и меню можно обсудить с администратором.</p>' },
    'event-buffet': { eyebrow: 'ПОВОД СОБРАТЬСЯ', title: 'Фуршет', body: '<p>Лёгкий формат для общения, презентаций и праздничных встреч. Состав меню, расстановку столов и количество гостей согласуем отдельно.</p>' },
    'menu-request': { eyebrow: 'СВОЯ КУХНЯ · ЕВРОПЕЙСКИЕ ВКУСЫ', title: 'Запросить меню', body: '<p>Актуальное банкетное меню, стоимость и условия зависят от даты и формата события. Оставьте заявку — подготовим вопросы для обсуждения и поможем подобрать вариант.</p><p><strong>Средний чек и точные цены необходимо уточнить у администратора.</strong></p>' },
    'privacy': { eyebrow: 'ИНФОРМАЦИЯ О САЙТЕ', title: 'Политика конфиденциальности', body: '<p>В этой версии сайта нет серверного хранилища заявок: данные из формы не сохраняются на сайте и передаются только в подготовленный текст сообщения WhatsApp после вашего действия.</p><p>Перед публикацией сайта владельцу необходимо разместить утверждённую политику обработки персональных данных с актуальными сведениями об операторе, целях, основаниях, сроках обработки и контактах для обращений. Этот демонстрационный текст не заменяет юридический документ.</p>' }
  };

  const modalBackdrop = $('#modal-backdrop');
  const modalDialog = $('.modal-dialog', modalBackdrop || document);
  const modalClose = $('.modal-close', modalBackdrop || document);
  const modalTitle = $('#modal-title');
  const modalEyebrow = $('#modal-eyebrow');
  const modalBody = $('#modal-body');
  let modalReturnFocus = null;

  const closeInfoModal = () => {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('open');
    modalBackdrop.setAttribute('aria-hidden', 'true');
    body.classList.remove('modal-open');
    if (modalReturnFocus && modalReturnFocus.focus) modalReturnFocus.focus({ preventScroll: true });
  };
  const openInfoModal = (key, trigger) => {
    if (!modalBackdrop || !modalContent[key]) return;
    const item = modalContent[key];
    modalReturnFocus = trigger || document.activeElement;
    if (modalEyebrow) modalEyebrow.textContent = item.eyebrow;
    if (modalTitle) modalTitle.textContent = item.title;
    if (modalBody) modalBody.innerHTML = item.body;
    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');
    body.classList.add('modal-open');
    if (modalDialog) {
      const close = $('.modal-close', modalDialog);
      if (close) close.focus({ preventScroll: true });
    }
  };

  $$('[data-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openInfoModal(trigger.getAttribute('data-modal'), trigger);
    });
  });
  if (modalClose) modalClose.addEventListener('click', closeInfoModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (event) => {
      if (event.target === modalBackdrop) closeInfoModal();
    });
    const action = $('.modal-action', modalBackdrop);
    if (action) action.addEventListener('click', closeInfoModal);
  }

  // Event filters.
  const filterTabs = $$('.filter-tab');
  const eventCards = $$('.event-card');
  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter || 'all';
      filterTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-pressed', String(active));
      });
      eventCards.forEach((card) => {
        const matches = filter === 'all' || card.dataset.category === filter;
        card.hidden = !matches;
      });
    });
  });

  // Gallery horizontal navigation: calculate a step from the actual card size.
  const gallery = $('.gallery-slider');
  const galleryPrev = $('.gallery-prev');
  const galleryNext = $('.gallery-next');
  const updateGalleryControls = () => {
    if (!gallery) return;
    const max = Math.max(0, gallery.scrollWidth - gallery.clientWidth - 2);
    if (galleryPrev) galleryPrev.disabled = gallery.scrollLeft <= 2;
    if (galleryNext) galleryNext.disabled = gallery.scrollLeft >= max;
  };
  if (gallery) {
    const step = () => {
      const item = $('.gallery-item', gallery);
      if (!item) return Math.max(240, gallery.clientWidth * .8);
      const styles = window.getComputedStyle(gallery);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      return item.getBoundingClientRect().width + gap;
    };
    if (galleryPrev) galleryPrev.addEventListener('click', () => gallery.scrollBy({ left: -step(), behavior: reducedMotion ? 'auto' : 'smooth' }));
    if (galleryNext) galleryNext.addEventListener('click', () => gallery.scrollBy({ left: step(), behavior: reducedMotion ? 'auto' : 'smooth' }));
    gallery.addEventListener('scroll', updateGalleryControls, { passive: true });
    window.addEventListener('resize', updateGalleryControls, { passive: true });
    if ('ResizeObserver' in window) new ResizeObserver(updateGalleryControls).observe(gallery);
    updateGalleryControls();
  }

  // Lightbox for all interior / gallery images. Uses only existing local image paths.
  const lightbox = $('#photo-lightbox');
  const lightboxImg = $('.lightbox-figure img', lightbox || document);
  const lightboxCaption = $('.lightbox-figure figcaption', lightbox || document);
  const lightboxCounter = $('.lightbox-counter', lightbox || document);
  const lightboxClose = $('.lightbox-close', lightbox || document);
  const lightboxPrev = $('.lightbox-prev', lightbox || document);
  const lightboxNext = $('.lightbox-next', lightbox || document);
  let lightboxItems = [];
  let lightboxIndex = 0;
  let lightboxReturnFocus = null;

  const collectLightboxItems = () => $$('#photo-lightbox ~ * img[data-lightbox], main img[data-lightbox]')
    .filter((img) => img.getAttribute('src') && !img.classList.contains('image-missing'));
  lightboxItems = collectLightboxItems();

  const showLightboxItem = (index) => {
    if (!lightbox || !lightboxItems.length) return;
    lightboxIndex = (index + lightboxItems.length) % lightboxItems.length;
    const source = lightboxItems[lightboxIndex];
    if (lightboxImg) {
      lightboxImg.src = source.currentSrc || source.src;
      lightboxImg.alt = source.alt || 'Фотография банкетного зала Ирэн';
    }
    if (lightboxCaption) {
      const parentCaption = source.closest('figure')?.querySelector('figcaption')?.textContent?.trim();
      lightboxCaption.textContent = parentCaption || source.alt || '';
    }
    if (lightboxCounter) lightboxCounter.textContent = `${lightboxIndex + 1} / ${lightboxItems.length}`;
  };
  const openLightbox = (source) => {
    if (!lightbox) return;
    lightboxItems = collectLightboxItems();
    const index = lightboxItems.indexOf(source);
    if (index < 0) return;
    lightboxReturnFocus = source.closest('[role="button"]') || source;
    showLightboxItem(index);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('lightbox-open');
    if (lightboxClose) lightboxClose.focus({ preventScroll: true });
  };
  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('lightbox-open');
    if (lightboxImg) lightboxImg.removeAttribute('src');
    if (lightboxReturnFocus?.focus) lightboxReturnFocus.focus({ preventScroll: true });
  };
  $$('img[data-lightbox]').forEach((img) => {
    img.addEventListener('click', (event) => {
      event.stopPropagation();
      openLightbox(img);
    });
  });
  $$('.gallery-item[role="button"]').forEach((figure) => {
    figure.addEventListener('click', (event) => {
      if (event.target.closest('img')) return;
      const img = $('img[data-lightbox]', figure);
      if (img) openLightbox(img);
    });
    figure.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const img = $('img[data-lightbox]', figure);
        if (img) openLightbox(img);
      }
    });
  });
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', () => showLightboxItem(lightboxIndex - 1));
  if (lightboxNext) lightboxNext.addEventListener('click', () => showLightboxItem(lightboxIndex + 1));
  if (lightbox) lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closeLightbox(); });

  // Form submissions prepare a message for the verified number already present in the site source.
  // No server endpoint was supplied, so the website never reports a submission as already sent.
  const businessWhatsApp = '79081081415';
  const normalizeText = (value) => String(value || '').trim();
  const getField = (form, name) => normalizeText(new FormData(form).get(name));
  const setFormStatus = (form, message, linkUrl = '') => {
    const status = $('.form-status', form);
    if (!status) return;
    status.textContent = message;
    status.style.color = '#437052';
    if (linkUrl) {
      const link = document.createElement('a');
      link.href = linkUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Открыть WhatsApp и отправить заявку';
      link.className = 'form-whatsapp-link';
      status.append(' ', link);
    }
  };

  $$('.booking-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const hp = $('.hp-field input, input.hp-field', form);
      if (hp && hp.value.trim()) return; // bot trap

      const name = getField(form, 'name');
      const phone = getField(form, 'phone');
      const phoneDigits = phone.replace(/\D/g, '');
      const consent = $('input[name="consent"]', form);
      if (name.length < 2) {
        const field = $('input[name="name"]', form);
        if (field) { field.setCustomValidity('Введите имя (не менее двух символов).'); field.reportValidity(); field.addEventListener('input', () => field.setCustomValidity(''), { once: true }); }
        return;
      }
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        const field = $('input[name="phone"]', form);
        if (field) { field.setCustomValidity('Проверьте номер телефона.'); field.reportValidity(); field.addEventListener('input', () => field.setCustomValidity(''), { once: true }); }
        return;
      }
      if (consent && !consent.checked) {
        consent.setCustomValidity('Для продолжения необходимо согласие на обработку данных.');
        consent.reportValidity();
        consent.addEventListener('change', () => consent.setCustomValidity(''), { once: true });
        return;
      }

      const hall = getField(form, 'hall') || 'Не выбран';
      const eventType = getField(form, 'event') || 'Не указан';
      const date = getField(form, 'date') || 'Не указана';
      const comment = getField(form, 'comment') || 'Без комментария';
      const message = [
        'Здравствуйте! Хочу обсудить бронирование банкетного зала «Ирэн».',
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        `Зал: ${hall}`,
        `Мероприятие: ${eventType}`,
        `Дата: ${date}`,
        `Комментарий: ${comment}`
      ].join('\n');
      const url = `https://wa.me/${businessWhatsApp}?text=${encodeURIComponent(message)}`;
      const opened = window.open(url, '_blank');
      if (opened) opened.opener = null;
      setFormStatus(form, opened ? 'Сообщение подготовлено. Проверьте данные и отправьте его в WhatsApp.' : 'Браузер заблокировал новое окно. Откройте WhatsApp по ссылке ниже.', url);
    });
  });

  // Global Escape handling and keyboard navigation inside overlays.
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (lightbox?.classList.contains('open')) closeLightbox();
      else if (bookingBackdrop?.classList.contains('open')) setBooking(false);
      else if (modalBackdrop?.classList.contains('open')) closeInfoModal();
      else if (mobileMenu?.classList.contains('open')) setMenu(false);
    }
    if (lightbox?.classList.contains('open')) {
      if (event.key === 'ArrowLeft') showLightboxItem(lightboxIndex - 1);
      if (event.key === 'ArrowRight') showLightboxItem(lightboxIndex + 1);
    }
  });

  // If original photo assets were not included in the upload, show a styled fallback instead of broken-image icons.
  $$('main img').forEach((img) => {
    const markMissing = () => {
      img.classList.add('image-missing');
      const frame = img.closest('.hall-image-frame, .story-photo, .menu-photo, .event-card-photo, .gallery-item');
      if (frame) {
        frame.classList.add('photo-fallback');
        frame.dataset.fallback = 'Добавьте оригинальное фото в папку images';
      }
    };
    img.addEventListener('error', markMissing, { once: true });
    if (img.complete && img.naturalWidth === 0) markMissing();
  });

  // Scroll reveals; content remains visible when JS or IntersectionObserver is unavailable.
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealTargets = [
      ...$$('.section-intro, .hall-world, .story-grid, .story-visuals, .manifesto, .section-heading-row, .menu-content, .menu-photo, .review-card, .contact-heading, .contact-info, .booking-form, .footer-top > *'),
      ...$$('.event-card, .gallery-item')
    ];
    revealTargets.forEach((element, index) => {
      element.classList.add('reveal-on-scroll');
      if (index % 4) element.dataset.revealDelay = String(index % 4);
    });
    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach((element) => observer.observe(element));
  }
});
