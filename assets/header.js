if (!window.Romanics.loadedScript.has('header.js')) {
  window.Romanics.loadedScript.add('header.js');
  requestAnimationFrame(() => {
    document.addEventListener('alpine:init', () => {
      Alpine.store('xHeaderMenu', {
        headerObserver: null,
        isSticky: false,
        stickyCalulating: false,
        openHamburgerMenu: false,
        isTouch: ('ontouchstart' in window) || window.DocumentTouch && window.document instanceof DocumentTouch || window.navigator.maxTouchPoints || window.navigator.msMaxTouchPoints ? true : false,
        sectionId: '',
        stickyType: 'none',
        lastScrollTop: 0,
        themeModeChanged: false,
        scrollY: 0,
        stickyOffsetHeight: 0,
        announcementOffsetHeight: 0,
        toolbarOffsetHeight: 0,
        mobileHeaderLayout: '',
        show: null,
        subShow: new Map(),
        overlay: false,
        initIndex: new Set(),
        scrollDir: '',
        isMenuOpen: false,
        initialized: false,
        passTop: false,
        passBottom: false,
        announcementBeforeHeader: false,
        isTransparent: false,
        heightHeaderEls: [],
        tshAtTop: true,
        tshHovered: false,
        tshMenuOpen: false,
        tshOpenMega: null,
        tshMegaChild: {},
        tshMegaChildHasChildren: {},
        tshOpenAccordions: [],
        tshRoot: null,
        tshDrawerTrigger: null,
        tshMegaTrigger: null,
        tshMegaCloseTimer: null,
        tshController: null,
        tshScrollFrame: null,
        tshBodyStyles: null,
        reset() {
          this.headerObserver.disconnect();
          if (document.getElementById('x-header-sentinel-top')) document.getElementById('x-header-sentinel-top').remove();
          if (document.getElementById('x-header-sentinel-bottom')) document.getElementById('x-header-sentinel-bottom').remove();
          Alpine.store('xHelper').cancelEvent(`romanics:header-scroll-event`);
          this.isSticky = false;
          this.isTransparent = false;
          this.stickyCalulating = false;
          this.openHamburgerMenu = false;
          this.isTouch = ('ontouchstart' in window) || window.DocumentTouch && window.document instanceof DocumentTouch || window.navigator.maxTouchPoints || window.navigator.msMaxTouchPoints ? true : false;
          this.sectionId = '';
          this.stickyType = 'none';
          this.lastScrollTop = 0;
          this.themeModeChanged = false;
          this.scrollY = 0;
          this.stickyOffsetHeight = 0;
          this.announcementOffsetHeight = 0;
          this.mobileHeaderLayout = '';
          this.show = null;
          this.subShow = new Map();
          this.overlay = false;
          this.initIndex = new Set();
          this.scrollDir = '';
          this.isMenuOpen = false;
          this.initialized = false;
          this.passTop = false;
          this.passBottom = false;
          this.announcementBeforeHeader = false;
          this.destroyTransparentHeader();
        },
        initTransparentHeader(root) {
          this.destroyTransparentHeader(false);
          this.tshRoot = root;
          this.tshHovered = false;
          this.tshMenuOpen = false;
          this.tshOpenMega = null;
          this.tshMegaChild = {};
          this.tshMegaChildHasChildren = {};
          this.tshOpenAccordions = [];

          const threshold = Number.parseInt(root.dataset.scrollThreshold || '40', 10);
          const controller = new AbortController();
          this.tshController = controller;

          const updateScrollState = () => {
            this.tshScrollFrame = null;
            this.tshAtTop = window.scrollY <= threshold;
          };
          const requestScrollUpdate = () => {
            if (this.tshScrollFrame !== null) return;
            this.tshScrollFrame = requestAnimationFrame(updateScrollState);
          };

          updateScrollState();
          window.addEventListener('scroll', requestScrollUpdate, {
            passive: true,
            signal: controller.signal
          });
          window.addEventListener('resize', () => {
            if (window.matchMedia('(min-width: 1024px)').matches && this.tshMenuOpen) {
              this.closeTransparentDrawer(false);
            } else if (this.tshOpenMega !== null) {
              this.positionTransparentMega();
            }
          }, { passive: true, signal: controller.signal });
          document.addEventListener('keydown', (event) => {
            this.handleTransparentHeaderKeydown(event);
          }, { signal: controller.signal });

          if (Shopify.designMode) {
            document.addEventListener('shopify:section:deselect', (event) => {
              if (event.target.contains(root) || root.contains(event.target)) {
                this.closeTransparentDrawer(false);
                this.closeTransparentMega();
              }
            }, { signal: controller.signal });
            document.addEventListener('shopify:section:unload', (event) => {
              if (event.target.contains(root) || root.contains(event.target)) {
                this.destroyTransparentHeader(false);
              }
            }, { signal: controller.signal });
          }
        },
        destroyTransparentHeader(returnFocus = false) {
          clearTimeout(this.tshMegaCloseTimer);
          this.tshMegaCloseTimer = null;
          if (this.tshScrollFrame !== null) {
            cancelAnimationFrame(this.tshScrollFrame);
            this.tshScrollFrame = null;
          }
          this.tshController?.abort();
          this.tshController = null;
          if (this.tshMenuOpen || this.tshBodyStyles) {
            this.closeTransparentDrawer(returnFocus);
          }
          this.tshHovered = false;
          this.tshOpenMega = null;
          this.tshRoot = null;
        },
        openTransparentMega(index, defaultChild, hasChildren, trigger) {
          this.cancelTransparentMegaClose();
          this.tshOpenMega = index;
          this.tshMegaChild = {
            ...this.tshMegaChild,
            [index]: defaultChild
          };
          this.tshMegaChildHasChildren = {
            ...this.tshMegaChildHasChildren,
            [index]: Boolean(hasChildren)
          };
          this.tshMegaTrigger = trigger || this.tshMegaTrigger;
          requestAnimationFrame(() => this.positionTransparentMega(trigger));
        },
        toggleTransparentMega(index, defaultChild, hasChildren, trigger) {
          if (this.tshOpenMega === index) {
            this.closeTransparentMega();
            return;
          }
          this.openTransparentMega(index, defaultChild, hasChildren, trigger);
        },
        closeTransparentMega(returnFocus = false) {
          this.cancelTransparentMegaClose();
          this.tshOpenMega = null;
          if (returnFocus) {
            this.tshMegaTrigger?.focus();
          }
          this.tshMegaTrigger = null;
        },
        positionTransparentMega(trigger = this.tshMegaTrigger) {
          const item = trigger?.closest('.tsh-nav__item');
          const panel = item?.querySelector('.tsh-mega');
          if (!panel) return;

          const itemRect = item.getBoundingClientRect();
          const panelWidth = panel.offsetWidth;
          const viewportGutter = 12;
          let offset = 0;

          if (itemRect.left + panelWidth > window.innerWidth - viewportGutter) {
            offset = window.innerWidth - viewportGutter - itemRect.left - panelWidth;
          }
          if (itemRect.left + offset < viewportGutter) {
            offset += viewportGutter - (itemRect.left + offset);
          }

          panel.style.setProperty('--tsh-mega-clamp-x', `${offset}px`);
        },
        queueTransparentMegaClose(delay = 180) {
          this.cancelTransparentMegaClose();
          this.tshMegaCloseTimer = setTimeout(() => {
            this.closeTransparentMega();
          }, Number(delay));
        },
        cancelTransparentMegaClose() {
          clearTimeout(this.tshMegaCloseTimer);
          this.tshMegaCloseTimer = null;
        },
        setTransparentMegaChild(index, childIndex, childCount) {
          this.tshMegaChild = {
            ...this.tshMegaChild,
            [index]: childIndex
          };
          this.tshMegaChildHasChildren = {
            ...this.tshMegaChildHasChildren,
            [index]: Number(childCount) > 0
          };
          requestAnimationFrame(() => this.positionTransparentMega());
        },
        openTransparentDrawer(trigger) {
          if (this.tshMenuOpen || !this.tshRoot) return;
          this.closeTransparentMega();
          this.tshDrawerTrigger = trigger;
          this.tshMenuOpen = true;
          this.lockTransparentHeaderScroll();
          requestAnimationFrame(() => {
            this.tshRoot?.querySelector('[data-tsh-drawer-close]')?.focus();
          });
        },
        closeTransparentDrawer(returnFocus = true) {
          if (!this.tshMenuOpen && !this.tshBodyStyles) return;
          this.tshMenuOpen = false;
          this.tshOpenAccordions = [];
          this.unlockTransparentHeaderScroll();
          if (returnFocus) {
            requestAnimationFrame(() => this.tshDrawerTrigger?.focus());
          }
          this.tshDrawerTrigger = null;
        },
        lockTransparentHeaderScroll() {
          if (this.tshBodyStyles) return;
          const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
          this.tshBodyStyles = {
            overflow: document.body.style.overflow,
            paddingRight: document.body.style.paddingRight
          };
          document.body.style.overflow = 'hidden';
          if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
          }
        },
        unlockTransparentHeaderScroll() {
          if (!this.tshBodyStyles) return;
          document.body.style.overflow = this.tshBodyStyles.overflow;
          document.body.style.paddingRight = this.tshBodyStyles.paddingRight;
          this.tshBodyStyles = null;
        },
        toggleTransparentAccordion(key) {
          if (this.tshOpenAccordions.includes(key)) {
            this.tshOpenAccordions = this.tshOpenAccordions.filter((item) => item !== key);
          } else {
            this.tshOpenAccordions = [...this.tshOpenAccordions, key];
          }
        },
        isTransparentAccordionOpen(key) {
          return this.tshOpenAccordions.includes(key);
        },
        handleTransparentHeaderKeydown(event) {
          if (event.key === 'Escape') {
            if (this.tshMenuOpen) {
              event.preventDefault();
              this.closeTransparentDrawer();
              return;
            }
            if (this.tshOpenMega !== null) {
              event.preventDefault();
              this.closeTransparentMega(true);
            }
            return;
          }

          if (event.key !== 'Tab' || !this.tshMenuOpen || !this.tshRoot) return;
          const drawer = this.tshRoot.querySelector('.tsh-drawer__panel');
          if (!drawer) return;

          const focusable = Array.from(drawer.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )).filter((element) => element.offsetParent !== null && !element.closest('[inert]'));

          if (focusable.length === 0) {
            event.preventDefault();
            return;
          }

          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
          }
        },
        debounce(func, wait) {
          let timeout;
          return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
          };
        },
        initSticky(headerContainer, stickyType, transparent = false) {
          setTimeout(() => {
            if (stickyType === 'none') return;

            this.isTransparent = transparent;
            const header = document.getElementById(`shopify-section-${this.sectionId}`);
            const announcement = document.getElementById("x-announcement");
            const toolBar = document.getElementById('header-toolbar');

            if (header && announcement) {
              if (Shopify.designMode) {
                let annoucementIndex = 0, headerIndex = 0;
                headerContainer.closest('.main-container')?.querySelectorAll('.shopify-section').forEach((el, index) => {
                  if (el.classList.contains('section-announcement')) annoucementIndex = index;
                  if (el.classList.contains('section-header')) headerIndex = index;
                })
                this.announcementBeforeHeader = headerIndex > annoucementIndex;
              } else {
                this.announcementBeforeHeader = headerContainer?.dataset.sectionIndex > announcement?.dataset.sectionIndex;
              }
            }

            const sentinelTop = document.createElement('div');
            sentinelTop.id = "x-header-sentinel-top"
            const sentinelBottom = document.createElement('div');
            sentinelBottom.id = "x-header-sentinel-bottom"
            header.before(sentinelTop);
            header.after(sentinelBottom);

            this.headerObserver = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.target === header) {
                  if (!this.initialized) {
                    const rect = entry.boundingClientRect;
                    if (transparent) {
                      this.stickyOffsetHeight = document.getElementById('sticky-header-content').offsetHeight;
                    } else {
                      this.stickyOffsetHeight = rect.height;
                    }

                    if (announcement?.dataset.isSticky === 'true') {
                      if (this.announcementBeforeHeader)
                        this.announcementOffsetHeight = announcement?.offsetHeight;
                      else {
                        this.announcementOffsetHeight = 0;
                      }
                    }

                    if (toolBar?.classList.contains('js-hide-toolbar')) this.toolbarOffsetHeight = toolBar?.offsetHeight;

                    this.initVariable(header, headerContainer, stickyType, announcement);
                    this.initScrollEvent(header, headerContainer, stickyType, announcement);
                    this.initHeaderHeightEvent();

                    this.initialized = true;
                  }
                } else if (entry.target === sentinelTop) {
                  this.passTop = !entry.isIntersecting;
                } else {
                  this.passBottom = !entry.isIntersecting;
                }
              })
            })

            this.headerObserver.observe(header);
            this.headerObserver.observe(sentinelTop);
            this.headerObserver.observe(sentinelBottom);
          }, 0)
        },
        initVariable(header, headerContainer, stickyType, announcement) {
          const headerStickyTransform = 0 - this.announcementOffsetHeight - this.stickyOffsetHeight;
          const headerTopOffset = this.announcementOffsetHeight - this.toolbarOffsetHeight;
          const headerStickyHeight = this.stickyOffsetHeight - this.toolbarOffsetHeight;
          requestAnimationFrame(() => {
            header.style.setProperty('--announcement-height', headerTopOffset + "px");
            header.style.setProperty('--header-sticky-transform', `${headerStickyTransform}px`);
            if (!this.announcementBeforeHeader && announcement?.dataset.isSticky === 'true') {
              announcement?.parentElement.style.setProperty('--header-height', `${headerStickyHeight}px`);
              announcement?.parentElement.style.setProperty('--annoucement-z', '40');
            }
            if (this.passBottom) {
              if (stickyType === 'on-scroll-up') {
                header.classList.add('is-sticky', 'is-scrolled');
                this.isSticky = true;
              } else {
                headerContainer.classList.add('is-sticky', 'is-scrolled');
                this.isSticky = true;
              } 
            }
          });
          this.handleStickyScrolling(header, headerContainer, announcement, stickyType);
        },
        initScrollEvent(header, headerContainer, stickyType, announcement) {
          let scrollDebounce = null;
          const onScroll = () => {
            clearTimeout(scrollDebounce);
            scrollDebounce = setTimeout(() => {
              let scrollPos = window.scrollY || document.documentElement.scrollTop;
              this.handleStickyScrolling(header, headerContainer, announcement, stickyType, scrollPos);
            }, 10);
          };
          const headerScrollController = new AbortController();
          Alpine.store('xHelper').eventControllers.set(`romanics:header-scroll-event`, headerScrollController);
          window.addEventListener('scroll', onScroll, { passive: true, signal: headerScrollController.signal });
        },
        handleStickyScrolling(header, headerContainer, announcement, stickyType, scrollPos) {
          const dir = this.scrollY < scrollPos;
          this.scrollY = scrollPos;
          requestAnimationFrame(() => {
            if (stickyType === 'always') {
              if (!this.announcementBeforeHeader && announcement?.dataset.isSticky === 'true') announcement?.parentElement.classList.add('top-header');
              this.setVariableHeightHeader(true);
              if (this.passBottom) {
                headerContainer.classList.add('is-scrolled');
                this.isSticky = true;
              } else {
                headerContainer.classList.remove('is-scrolled');
                this.isSticky = false;
              }
            } else if (stickyType === 'reduce-logo-size') {
              if (!this.announcementBeforeHeader && announcement?.dataset.isSticky === 'true') announcement?.parentElement.classList.add('top-header');
              this.setVariableHeightHeader(true);
              if (this.passBottom) {
                headerContainer.classList.add('reduce-logo-size', 'is-scrolled');
                this.isSticky = true;
              } else {
                headerContainer.classList.remove('reduce-logo-size', 'is-scrolled');
                this.isSticky = false;
              }
            } else {
              let stickyTimeout = null;

              if (!this.passTop) {
                header.classList.remove('is-sticky', 'is-scrolled');
                this.isSticky = false;
              }
              if (!this.passBottom && !dir) {
                headerContainer.style.transition = 'transform 0.1s ease-in';
                headerContainer.classList.remove('on-scroll-up-animation');
                if (!this.announcementBeforeHeader && announcement?.dataset.isSticky === 'true') announcement?.parentElement.classList.add('top-header');
                this.setVariableHeightHeader(true);
                return;
              } else {
                headerContainer.style.transition = '';
              }
              if (this.passBottom && dir) {
                if (!stickyTimeout) {
                  stickyTimeout = setTimeout(() => {
                    header.classList.add('is-sticky', 'is-scrolled');
                    this.isSticky = true;
                  }, 550);
                }
                headerContainer.classList.add('on-scroll-up-animation');
                if (!this.announcementBeforeHeader && announcement?.dataset.isSticky === 'true') announcement?.parentElement.classList.remove('top-header');
                this.setVariableHeightHeader(false);
              } else {
                headerContainer.classList.remove('on-scroll-up-animation');
                if (!this.announcementBeforeHeader && announcement?.dataset.isSticky === 'true') announcement?.parentElement.classList.add('top-header');
                this.setVariableHeightHeader(true);
              }
            }
          });
        },
        initHeaderHeightEvent() {
          this.heightHeaderEls = Array.from(document.querySelectorAll('[class*="--height-header"]'));
          document.addEventListener('romanics:sticky-header-moved', (e) => {
            this.heightHeaderEls.forEach(el => {
              el.style.setProperty('--height-header', e.detail.heightHeader + "px");
            });
          })
        },
        setVariableHeightHeader(isSticky) {
          const heightHeader = (isSticky && !Alpine.store('xMobileDock')?.showDock) ? this.announcementOffsetHeight + this.stickyOffsetHeight - this.toolbarOffsetHeight : this.announcementOffsetHeight;
          document.dispatchEvent(new CustomEvent("romanics:sticky-header-moved", { detail: { heightHeader: heightHeader } }))
        },
        renderAjax(el, id, element) {
          fetch(
            `${window.location.pathname}?sections=${id}`
          ).then(response => response.json())
          .then(response => {
            let html = getSectionInnerHTML(response[id], element);
            if (el?.closest('[data-breakpoint="tablet"]')) {
              html = html?.replace('id="search-in-modal"', 'id="search-in-modal-mobile"');
            }
            el.innerHTML = html;
          }).finally(() => {
            this.heightHeaderEls.push(el);
            this.setVariableHeightHeader(true);
          });
        },
        setPosition(el, level, hamburger=false) {
          if (!hamburger) {
            level = level - 1;
          } else {
            level = level - 0.5;
          }
          requestAnimationFrame(() => {
            const elm = el.closest(".tree-menu");

            const widthEl = elm.getElementsByClassName("toggle-menu")[0];
            const widthElWitdth = widthEl.offsetWidth;
            const viewWidth = window.xViewport.innerWidth || document.documentElement.clientWidth

            const elRect = elm.getBoundingClientRect();

            const left = (elRect.left - (widthElWitdth * level)) < 100;
            const right = (elRect.right + (widthElWitdth * level)) > (viewWidth - 100);

            const isRtl = document.querySelector('body').classList.contains('rtl');

            requestAnimationFrame(() => {
              if (isRtl) {
                if (left) {
                  el.classList.add('right-0');
                  widthEl.classList.add('left-0');
                  elm.classList.remove('position-left');
                } else {
                  el.classList.add('left-0');
                  widthEl.classList.add('right-0');
                  elm.classList.add('position-left');
                }
              } else { 
                if (right) {
                  el.classList.add('left-0');
                  widthEl.classList.add('right-0');
                  elm.classList.add('position-left');
                } else {
                  el.classList.add('right-0');
                  widthEl.classList.add('left-0');
                  elm.classList.remove('position-left');
                }
              }  
            })
          })
        },
        resizeWindow(el,level, hamburger=false) {
          const onResize = this.debounce(() => {
            this.setPosition(el, level, hamburger);
          }, 100);

          addEventListener("resize", onResize);
        },
        toggleMenu(index) {
          this.initIndex.add(index);
          this.show = this.show === index ? 0 : index;
          this.overlay = (this.show !== 0);
        },
        openMenu(index, hasMenu) {
          this.initIndex.add(index);
          this.show = index;
          this.overlay = hasMenu;
        },
        closeMenu() {
          this.show = 0;
          this.overlay = false;
        },
        openSubMenu(key, index) {
          this.subShow.set(key, index);
        },
        updateHeight(el, containerId) {
          const container = document.getElementById(containerId);
          let currentAnimation = null;
          let previousHeight = null;
          
          const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
              const newHeight = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
              
              if (previousHeight !== null && Math.abs(previousHeight - newHeight) >= 1) {
                currentAnimation?.cancel();
                
                currentAnimation = container.animate([
                  { height: `${previousHeight}px` },
                  { height: `${newHeight}px` }
                ], { duration: 300, easing: 'ease-in-out' });
              }
              
              container.style.height = newHeight + 'px';
              previousHeight = newHeight;
            }
          });

          observer.observe(el);
        },
        touchItem(el, isSub = false) {
          const touchClass = isSub ? 'touched-sub' : 'touched';

          el.addEventListener("touchend", (e) => {
            if (el.classList.contains(touchClass)) {
              window.location.replace(el.getAttribute('href'));
            } else {
              e.preventDefault(); 
              var dropdown = document.getElementsByClassName(`${touchClass}`);
              for (var i = 0; i < dropdown.length; i++) { 
                dropdown[i].classList.remove(touchClass); 
              }

              el.classList.add(touchClass);
              this.selectItem(el.closest('.has-dropdown'), isSub);
            }
          });
        },
      });
    });
  });
}
