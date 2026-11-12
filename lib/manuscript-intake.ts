/**
 * Lossless, side-effect-free intake for text-first learning manuscripts.
 *
 * This is deliberately NOT the canonical record compiler or a Markdown renderer.
 * It preserves every UTF-16 code unit in the supplied manuscript and emits
 * conservative structural hints. Server-side compilation, editorial choices,
 * admission, IDs, revisions, D1 transactions and rendering are separate steps.
 * Unrecognised Markdown remains literal text; nothing is silently dropped.
 */
export const MANUSCRIPT_INTAKE_VERSION = 1 as const;
export type ManuscriptRole = 'journey' | 'investigation' | 'article' | 'area';
export type ManuscriptDocumentInput = {
  key?: string;
  role: ManuscriptRole;
  markdown: string;
  title?: string;
  learningScope?: import('./learning-spaces').LearningScope;
};
export type ManuscriptSubmission = {
  version: 1;
  brief: string;
  documents: ManuscriptDocumentInput[];
};
export type SourceSpan = {start: number; end: number};
export type ManuscriptBlock = SourceSpan & {
  kind: 'heading' | 'code-fence' | 'text';
  raw: string;
  level?: number;
  heading?: string;
  language?: string;
  code?: string;
};
export type ManuscriptDiagnostic = SourceSpan & {
  code: 'unclosed_fence' | 'missing_heading';
  severity: 'advisory';
  documentKey: string;
  message: string;
};
export type InspectedManuscript = {
  version: 1;
  brief: string;
  bytes: number;
  documents: {
    key: string;
    role: ManuscriptRole;
    source: string;
    suggestedTitle: string | null;
    bytes: number;
    blocks: ManuscriptBlock[];
    diagnostics: ManuscriptDiagnostic[];
  }[];
};

export class ManuscriptIntakeError extends Error {
  readonly code: string;
  readonly path: string;
  constructor(code: string, path: string, message: string) {
    super(message);
    this.code = code;
    this.path = path;
    this.name = 'ManuscriptIntakeError';
  }
}

export const MANUSCRIPT_LIMITS = {requestBytes: 220_000, briefCharacters: 24_000, intakeDocuments: 24, publicationDocuments: 16} as const;
const MAX_BYTES = MANUSCRIPT_LIMITS.requestBytes;
const MAX_BRIEF = MANUSCRIPT_LIMITS.briefCharacters;
const MAX_DOCUMENTS = MANUSCRIPT_LIMITS.intakeDocuments;
const KEY = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/;
const ROLE = new Set<ManuscriptRole>(['journey', 'investigation', 'article', 'area']);
const unpairedSurrogate = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;
const forbiddenControl = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const encoder = new TextEncoder();
function checkedText(value: unknown, path: string, maxCharacters: number) {
  if (typeof value !== 'string') throw new ManuscriptIntakeError('invalid_text', path, path + ' must be a string. Keep the submitted source; no write occurred.');
  if (value.length > maxCharacters) throw new ManuscriptIntakeError('invalid_text', path,
    path + ' has ' + value.length + ' UTF-16 characters; maximum ' + maxCharacters + '. Keep the full source locally and split the material into related bounded publications. If the brief itself exceeds the limit, explicitly scope a smaller publication and supply its relevant brief while retaining the complete original request; never silently truncate or summarise owner intent. No write occurred.');
  if (unpairedSurrogate.test(value) || forbiddenControl.test(value)) {
    throw new ManuscriptIntakeError('invalid_text', path, path + ' requires well-formed Unicode without unsupported control characters. Nothing is silently repaired and no write occurred.');
  }
  return value;
}

type SourceLine = {start: number; end: number; body: string};
function sourceLines(source: string): SourceLine[] {
  const lines: SourceLine[] = [];
  const matcher = /([^\r\n]*)(\r\n|\r|\n|$)/g;
  for (const match of source.matchAll(matcher)) {
    if (!match[0]) continue;
    const start = match.index;
    lines.push({start, end: start + match[0].length, body: match[1]});
  }
  return lines;
}
function headingLine(body: string): {level: number; heading: string} | null {
  const match = /^ {0,3}(#{1,6})[ \t]+(.+?)[ \t]*$/.exec(body);
  if (!match) return null;
  const heading = match[2].replace(/[ \t]+#+[ \t]*$/, '').trim();
  return heading ? {level: match[1].length, heading} : null;
}
function fenceLine(body: string): {character: string; width: number; language: string} | null {
  const match = /^ {0,3}(`{3,}|~{3,})([^\r\n]*)$/.exec(body);
  if (!match) return null;
  if (match[1][0] === '`' && match[2].includes('`')) return null;
  return {character: match[1][0], width: match[1].length, language: match[2].trim().split(/[ \t]/)[0] ?? ''};
}
function closesFence(body: string, delimiter: {character: string; width: number}) {
  const match = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(body);
  return !!match && match[1][0] === delimiter.character && match[1].length >= delimiter.width;
}

/** Preserve the exact original source, including CRLF, punctuation and unknown syntax. */
export function scanManuscript(source: string, documentKey = 'document-1'):
  {blocks: ManuscriptBlock[]; diagnostics: ManuscriptDiagnostic[]} {
  checkedText(source, 'markdown', MAX_BYTES);
  const lines = sourceLines(source);
  const blocks: ManuscriptBlock[] = [];
  const diagnostics: ManuscriptDiagnostic[] = [];
  let index = 0;
  while (index < lines.length) {
    const current = lines[index];
    const fence = fenceLine(current.body);
    if (fence) {
      let endIndex = index + 1;
      while (endIndex < lines.length && !closesFence(lines[endIndex].body, fence)) endIndex++;
      if (endIndex < lines.length) {
        const end = lines[endIndex].end;
        blocks.push({kind: 'code-fence', start: current.start, end,
          raw: source.slice(current.start, end), language: fence.language,
          code: source.slice(current.end, lines[endIndex].start)});
        index = endIndex + 1;
        continue;
      }
      const end = source.length;
      blocks.push({kind: 'text', start: current.start, end, raw: source.slice(current.start, end)});
      diagnostics.push({code: 'unclosed_fence', severity: 'advisory', documentKey,
        start: current.start, end, message: 'Unclosed code fence is retained as literal text; inspect before publication.'});
      break;
    }
    const heading = headingLine(current.body);
    if (heading) {
      blocks.push({kind: 'heading', start: current.start, end: current.end,
        raw: source.slice(current.start, current.end), ...heading});
      index++;
      continue;
    }
    const start = current.start;
    index++;
    while (index < lines.length && !headingLine(lines[index].body) && !fenceLine(lines[index].body)) index++;
    const end = lines[index - 1].end;
    blocks.push({kind: 'text', start, end, raw: source.slice(start, end)});
  }
  if (!blocks.some(block => block.kind === 'heading')) {
    diagnostics.push({code: 'missing_heading', severity: 'advisory', documentKey,
      start: 0, end: source.length, message: 'No heading was found. The full manuscript is retained.'});
  }
  if (blocks.map(block => block.raw).join('') !== source ||
      blocks.some(block => source.slice(block.start, block.end) !== block.raw)) {
    throw new ManuscriptIntakeError('non_lossless_scan', 'markdown', 'Manuscript scanner failed to preserve exact source.');
  }
  return {blocks, diagnostics};
}

/**
 * No network calls, HTML rendering, record creation, learning claims or D1 writes.
 * The caller separately authenticates the owner and enforces its mutation scope.
 */
export function inspectManuscriptSubmission(input: unknown): InspectedManuscript {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ManuscriptIntakeError('invalid_submission', 'submission', 'Expected a versioned manuscript object.');
  }
  const data = input as Record<string, unknown>;
  if (data.version !== MANUSCRIPT_INTAKE_VERSION || !Array.isArray(data.documents) ||
      data.documents.length < 1 || data.documents.length > MAX_DOCUMENTS) {
    throw new ManuscriptIntakeError('invalid_submission', 'documents', 'Use version 1 and 1–24 documents.');
  }
  const brief = checkedText(data.brief, 'brief', MAX_BRIEF);
  if (!brief.trim()) throw new ManuscriptIntakeError('empty_brief', 'brief', 'Preserve the complete, non-empty owner brief.');
  const keys = new Set<string>();
  let bytes = encoder.encode(brief).length;
  const documents = data.documents.map((entry, index) => {
    const path = 'documents[' + index + ']';
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new ManuscriptIntakeError('invalid_document', path, 'Expected a document.');
    }
    const doc = entry as Record<string, unknown>;
    if (!ROLE.has(doc.role as ManuscriptRole)) {
      throw new ManuscriptIntakeError('invalid_role', path + '.role', 'Use a supported learning role.');
    }
    const key = doc.key === undefined ? 'document-' + (index + 1) : doc.key;
    if (typeof key !== 'string' || !KEY.test(key) || keys.has(key)) {
      throw new ManuscriptIntakeError('invalid_key', path + '.key', 'Keys must be unique, short, and stable.');
    }
    keys.add(key);
    const markdown = checkedText(doc.markdown, path + '.markdown', MAX_BYTES);
    if (!markdown.trim()) throw new ManuscriptIntakeError('empty_document', path + '.markdown', 'Document source cannot be empty.');
    const suppliedTitle = doc.title === undefined ? null : checkedText(doc.title, path + '.title', 180);
    const parsed = scanManuscript(markdown, key);
    bytes += encoder.encode(markdown).length;
    return {key, role: doc.role as ManuscriptRole, source: markdown,
      suggestedTitle: suppliedTitle || parsed.blocks.find(block => block.kind === 'heading' && block.level === 1)?.heading || null,
      bytes: encoder.encode(markdown).length, blocks: parsed.blocks, diagnostics: parsed.diagnostics};
  });
  if (bytes > MAX_BYTES) {
    throw new ManuscriptIntakeError('manuscript_too_large', 'submission', 'The manuscript exceeds 220 KB; retain the complete source and use a supported bounded continuation rather than truncating.');
  }
  return {version: MANUSCRIPT_INTAKE_VERSION, brief, bytes, documents};
}

