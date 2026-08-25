/** Build Leaflet tooltip content without interpreting untrusted text as HTML. */
export function safeTooltipContent(documentRef, value) {
  const element = documentRef.createElement('span');
  element.textContent = String(value ?? '');
  return element;
}