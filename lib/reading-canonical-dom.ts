/** Ruby readings are visual pronunciation aids, not authored source characters.
 * Keep native selection offsets tied to the exact original passage text. */
export function canonicalDomText(node: Node): string {
  if (node.nodeType === 3) return node.textContent ?? '';
  if (node.nodeType === 1 && /^(RT|RP)$/.test((node as Element).tagName)) return '';
  let result = '';
  for (const child of Array.from(node.childNodes)) result += canonicalDomText(child);
  return result;
}

export function canonicalDomRangeText(range: Range): string {
  return canonicalDomText(range.cloneContents());
}

/** Resolve a saved canonical offset back into a visible DOM text position. */
export function canonicalDomBoundary(element: HTMLElement, offset: number): {node: Text; offset: number} | null {
  const walker = element.ownerDocument.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let candidate: Text | null = null;
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    if (node.parentElement?.closest('rt,rp')) continue;
    candidate = node;
    if (remaining <= node.length) return {node, offset: remaining};
    remaining -= node.length;
  }
  return candidate && remaining === 0 ? {node: candidate, offset: candidate.length} : null;
}
