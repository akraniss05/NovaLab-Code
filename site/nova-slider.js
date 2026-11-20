/* Each mounted slider owns its playback, observers and listeners. */
class NovaSlider extends HTMLElement {
 connectedCallback() {
  this.slides = [...this.querySelectorAll('.nova-slide')];
  if (!this.slides.length) return;
  this.dots = [...this.querySelectorAll('[data-slide]')];
  this.toggle = this.querySelector('[data-pause]');
  this.index = 0;
  this.userPaused = false;
  this.inView = false;
  this.hovering = false;
  this.motion = matchMedia('(prefers-reduced-motion: reduce)');
  this.listeners = new AbortController();
  const on = (element, event, handler) => element.addEventListener(event, handler, {signal: this.listeners.signal});
  on(this, 'click', event => {
   const dot = event.target.closest('[data-slide]');
   if (dot) this.show(Number(dot.dataset.slide));
   if (event.target.closest('[data-pause]')) this.userPaused = !this.userPaused;
   this.sync();
  });
  on(this, 'pointerenter', e => { this.hovering = e.pointerType === 'mouse'; this.sync(); });
  on(this, 'pointerleave', () => { this.hovering = false; this.sync(); });
  on(this, 'focusin', () => this.sync());
  on(this, 'focusout', () => queueMicrotask(() => this.isConnected && this.sync()));
  on(this.motion, 'change', () => this.sync());
  on(document, 'visibilitychange', () => this.sync());
  this.visibility = new IntersectionObserver(([entry]) => { this.inView = entry.isIntersecting; this.sync(); });
  this.visibility.observe(this);
  this.preferences = new MutationObserver(() => this.sync());
  this.preferences.observe(document.body, {attributes:true, attributeFilter:['class']});
  this.sync();
 }
 show(index) {
  this.index = index;
  this.slides.forEach((slide, i) => { slide.hidden = i !== index; });
  this.dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
 }
 sync() {
  clearTimeout(this.timer);
  const reduced = this.motion.matches || document.body.classList.contains('less-motion');
  this.toggle.hidden = reduced;
  this.toggle.textContent = this.userPaused ? '▶' : 'Ⅱ';
  this.toggle.setAttribute('aria-pressed', String(this.userPaused));
  // A toggle keeps its accessible name while aria-pressed conveys its state.
  if (this.inView && !this.hovering && !document.hidden && !reduced && !this.userPaused && !this.contains(document.activeElement)) {
   this.timer = setTimeout(() => { this.show((this.index + 1) % this.slides.length); this.sync(); }, 7000);
  }
 }
 disconnectedCallback() {
  this.listeners?.abort();
  this.visibility?.disconnect();
  this.preferences?.disconnect();
  clearTimeout(this.timer);
 }
}
customElements.define('nova-slider', NovaSlider);
