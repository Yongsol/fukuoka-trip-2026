export function dateTransitionDirection(previousDate, nextDate) {
  if (previousDate === nextDate) return 'still';
  return nextDate > previousDate ? 'forward' : 'backward';
}

export function prefersReducedMotion(matchMedia = globalThis.matchMedia) {
  if (typeof matchMedia !== 'function') return false;
  try {
    return Boolean(matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch {
    return false;
  }
}

export function observeReducedMotion(onChange, matchMedia = globalThis.matchMedia) {
  if (typeof matchMedia !== 'function') return () => {};
  let mediaQuery;
  try {
    mediaQuery = matchMedia('(prefers-reduced-motion: reduce)');
  } catch {
    return () => {};
  }
  const listener = event => onChange(Boolean(event.matches));
  if (typeof mediaQuery?.addEventListener === 'function') {
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener?.('change', listener);
  }
  if (typeof mediaQuery?.addListener === 'function') {
    mediaQuery.addListener(listener);
    return () => mediaQuery.removeListener?.(listener);
  }
  return () => {};
}

export function overviewMotionMode(reducedMotion, overviewActive) {
  if (reducedMotion) return 'static';
  return overviewActive ? 'autoplay' : 'paused';
}

export function applyTimelineMotion(timeline, direction, reducedMotion) {
  timeline.classList.remove('timeline-forward', 'timeline-backward');
  if (reducedMotion || !['forward', 'backward'].includes(direction)) return;
  void timeline.offsetWidth;
  timeline.classList.add(`timeline-${direction}`);
}

export function updateTabIndicator(tabs, activeButton) {
  const indicator = tabs?.querySelector('.tab-indicator');
  if (!indicator || !activeButton) return;
  indicator.style.width = `${activeButton.offsetWidth}px`;
  indicator.style.transform = `translate3d(${activeButton.offsetLeft}px,0,0)`;
}

export function revealElements(root = document) {
  if (prefersReducedMotion()) return;
  const candidates = root.querySelectorAll('.section-head,.status,.chips,.transport-card,.feature-food,.food-card,.check-item,.vault-grid,.notice,.attachment,#leaflet-map,.route-actions,.direct-routes,.official-links');
  candidates.forEach(element => element.classList.add('reveal'));

  if (!('IntersectionObserver' in globalThis)) {
    candidates.forEach(element => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px' });
  candidates.forEach(element => observer.observe(element));
}
