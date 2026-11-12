/**
 * Bounded, host-independent transport for selected Minamo content.
 *
 * This module deliberately does NOT decide what the owner may export/import,
 * which record is valid, or how target records are saved. Those decisions
 * remain with current Site authority and the normal domain writers. In
 * particular, a decoded page must NEVER be inserted directly into D1.
 *
 * The format supports independently downloadable pages to avoid the previous
 * single-request, whole-Library recovery timeout. Each page can be read and
 * authenticated for accidental corruption without assembling all pages.
 */
export const CONTENT_PAGE_FORMAT = 'minamo-portable-page@1' as const;
const MAGIC = new TextEncoder().encode('MINAPG01');
const MAX_HEADER = 16384;
const MAX_RECORD = 2 * 1024 * 1024;
const MAX_ASSET = 80 * 1024 * 1024;
const MAX_PAGE = 90 * 1024 * 1024;
const MAX_RECORDS = 128;
const MAX_ASSETS = 64;
const enc = new TextEncoder();
const dec = new TextDecoder('utf-8', { fatal: true });
const idPattern = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/;
const digestPattern = /^[a-f0-9]{64}$/;
const recordFamilies = ['journey','article','area','source'] as const;
export type PortableFamily = typeof recordFamilies[number];
export type PortableKind = 'project' | 'library';
export type PortableRecord = {
  family: PortableFamily;
  id: string;
  revision: number;
  rendition?: string;
  /** Canonical, authority-projected record at the saved source revision. */
  canonical: Record<string, unknown>;
};
export type PortableAsset = {
  kind: 'image' | 'media';
  id: string;
  mime: string;
  bytes: number;
  sha256: string;
};
export type PortableHeader = {
  format: typeof CONTENT_PAGE_FORMAT;
  kind: PortableKind;
  exportId: string;
  page: number;
  exportedAt: string;
  source: { application: 'minamo'; version: string };
  recordCount: number;
  assetCount: number;
};
export type PortableContentPage = { header: PortableHeader; records: PortableRecord[]; assets: { metadata: PortableAsset; bytes: Uint8Array }[] };

export class PortablePageError extends Error {
  code: string;
  constructor(code: string, message: string) { super(message); this.name = 'PortablePageError'; this.code = code; }
}
function fail(code: string, message: string): never { throw new PortablePageError(code, message); }
function obj(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function exact(value: Record<string, unknown>, names: string[]) {
  if (Object.keys(value).some(name => !names.includes(name))) fail('unknown_fields', 'Portable content contains unexpected metadata.');
}
function uid(value: unknown) { return typeof value === 'string' && idPattern.test(value); }
function count(value: unknown, max: number) { return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 && value <= max; }
function headerValid(value: unknown): asserts value is PortableHeader {
  if (!obj(value)) fail('invalid_header','Invalid portable page header.');
  exact(value, ['format','kind','exportId','page','exportedAt','source','recordCount','assetCount']);
  const source = value.source;
  if (value.format !== CONTENT_PAGE_FORMAT || !['project','library'].includes(String(value.kind)) ||
      !uid(value.exportId) || !count(value.page, 999999) || !count(value.recordCount, MAX_RECORDS) ||
      !count(value.assetCount, MAX_ASSETS) || typeof value.exportedAt !== 'string' ||
      !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(value.exportedAt) ||
      !obj(source) || source.application !== 'minamo' || typeof source.version !== 'string' ||
      source.version.length > 100) fail('invalid_header', 'Unsupported or invalid portable page header.');
  exact(source,['application','version']);
  if (value.kind === 'project' && value.recordCount !== 1) fail('invalid_project_page','A Project export page must contain exactly its Project.');
}
function recordValid(value: unknown, kind: PortableKind): asserts value is PortableRecord {
  if (!obj(value)) fail('invalid_record','Invalid portable record.');
  exact(value,['family','id','revision','rendition','canonical']);
  if (!recordFamilies.includes(value.family as PortableFamily) ||
      (kind === 'project' ? value.family !== 'journey' : value.family === 'journey') ||
      !uid(value.id) || !Number.isSafeInteger(value.revision) || (value.revision as number) < 1 ||
      (value.rendition !== undefined && (typeof value.rendition !== 'string' || value.rendition.length > 180)) ||
      !obj(value.canonical) || value.canonical.family !== value.family || value.canonical.id !== value.id) {
    fail('invalid_record','Record identity, revision or archive kind is invalid.');
  }
}
function assetValid(value: unknown): asserts value is PortableAsset {
  if (!obj(value)) fail('invalid_asset','Invalid portable asset.');
  exact(value,['kind','id','mime','bytes','sha256']);
  const kind = value.kind;
  if (!['image','media'].includes(String(kind)) || typeof value.id !== 'string' ||
      (kind === 'image' ? !/^image-[a-f0-9]{64}$/.test(value.id) : !/^media-[a-f0-9]{64}$/.test(value.id)) ||
      typeof value.mime !== 'string' || value.mime.length > 120 || !count(value.bytes, MAX_ASSET) ||
      value.bytes === 0 || typeof value.sha256 !== 'string' || !digestPattern.test(value.sha256)) {
    fail('invalid_asset','Invalid asset identity, digest or size.');
  }
}
const u32 = (n: number) => { const buf = new Uint8Array(4); new DataView(buf.buffer).setUint32(0,n,false); return buf; };
const fromU32 = (bytes: Uint8Array) => new DataView(bytes.buffer,bytes.byteOffset,4).getUint32(0,false);
const asHex = (bytes: Uint8Array) => Array.from(bytes,n => n.toString(16).padStart(2,'0')).join('');
const hexBytes = (hex: string) => Uint8Array.from(hex.match(/.{2}/g)!.map(part => Number.parseInt(part,16)));

async function sha(bytes: Uint8Array) { return asHex(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>))); }
function encodeJson(value: unknown, max: number) {
  let encoded: Uint8Array;
  try { encoded = enc.encode(JSON.stringify(value)); } catch { return fail('invalid_json','Unable to serialize portable content.'); }
  if (!encoded.length || encoded.length > max) fail('size_limit','Portable metadata exceeds its bounded size.');
  return encoded;
}
function readJson(bytes: Uint8Array): unknown {
  try { return JSON.parse(dec.decode(bytes)); } catch { return fail('invalid_json','Portable content contains invalid UTF-8 JSON.'); }
}
/** Encode ONE independently downloadable page; the owner/rights checks precede this call. */
export async function encodePortablePage(page: PortableContentPage): Promise<Uint8Array> {
  headerValid(page.header);
  if (page.header.recordCount !== page.records.length || page.header.assetCount !== page.assets.length) fail('count_mismatch','The page inventory differs from its content.');
  const uniqueRecords = new Set<string>(), uniqueAssets = new Set<string>();
  const payload: Uint8Array[] = [MAGIC, u32(0)];
  const h = encodeJson(page.header,MAX_HEADER); payload[1] = u32(h.length); payload.push(h);
  let total = MAGIC.length + 4 + h.length;
  for (const record of page.records) {
    recordValid(record,page.header.kind);
    const key = record.family+':'+record.id;
    if (uniqueRecords.has(key)) fail('duplicate_record','Duplicate record identity in portable page.');
    uniqueRecords.add(key);
    const bytes = encodeJson(record,MAX_RECORD);
    payload.push(u32(bytes.length),hexBytes(await sha(bytes)),bytes); total += 4+32+bytes.length;
  }
  for (const asset of page.assets) {
    assetValid(asset.metadata);
    if (uniqueAssets.has(asset.metadata.id)) fail('duplicate_asset','Duplicate asset identity in portable page.');
    uniqueAssets.add(asset.metadata.id);
    if (!(asset.bytes instanceof Uint8Array) || asset.bytes.length !== asset.metadata.bytes ||
        await sha(asset.bytes) !== asset.metadata.sha256) fail('asset_integrity','Original asset bytes do not match their declared digest and size.');
    const metadata = encodeJson(asset.metadata,2048);
    payload.push(u32(metadata.length),metadata,asset.bytes); total+=4+metadata.length+asset.bytes.length;
    if (total > MAX_PAGE) fail('page_too_large','Split the export into smaller independently downloadable pages.');
  }
  if (total > MAX_PAGE) fail('page_too_large','Split the export into smaller independently downloadable pages.');
  const result=new Uint8Array(total);let offset=0;
  for (const segment of payload) { result.set(segment,offset); offset+=segment.length; }
  return result;
}
/** Strictly decode content only; caller must still authenticate, authorise and validate before writes. */
export async function decodePortablePage(input: Uint8Array): Promise<PortableContentPage> {
  if (!(input instanceof Uint8Array) || input.length > MAX_PAGE || input.length < 12) fail('page_size','Invalid portable page size.');
  let at=0;
  const take = (size:number) => {
    if (!Number.isSafeInteger(size) || size < 0 || at + size > input.length) fail('truncated','Truncated portable content page.');
    const segment=input.subarray(at,at+size); at+=size; return segment;
  };
  if (asHex(take(MAGIC.length)) !== asHex(MAGIC)) fail('format','Not a Minamo portable content page.');
  const headSize=fromU32(take(4));
  if (headSize === 0 || headSize > MAX_HEADER) fail('header_size','Portable page header is too large.');
  const h=readJson(take(headSize)); headerValid(h);
  const records: PortableRecord[] = []; const uniqueRecords=new Set<string>();
  for (let i=0;i<h.recordCount;i++) {
    const size=fromU32(take(4));
    if (size===0 || size>MAX_RECORD) fail('record_size','Portable record is too large.');
    const expectedDigest=asHex(take(32)); const jsonBytes=take(size);
    if (await sha(jsonBytes) !== expectedDigest) fail('record_integrity','A saved record was corrupted in transit.');
    const record=readJson(jsonBytes);recordValid(record,h.kind);
    const key=record.family+':'+record.id;
    if(uniqueRecords.has(key))fail('duplicate_record','Duplicate record identity in portable page.');
    uniqueRecords.add(key);records.push(record);
  }
  const assets: PortableContentPage['assets']=[];const uniqueAssets=new Set<string>();
  for (let i=0;i<h.assetCount;i++) {
    const size=fromU32(take(4));if(size===0||size>2048)fail('asset_header_size','Asset metadata is too large.');
    const metadata=readJson(take(size));assetValid(metadata);
    if (uniqueAssets.has(metadata.id)) fail('duplicate_asset','Duplicate asset identity in portable page.');
    uniqueAssets.add(metadata.id);
    const bytes=take(metadata.bytes);
    if (await sha(bytes)!==metadata.sha256)fail('asset_integrity','An asset was corrupted in transit.');
    assets.push({metadata,bytes});
  }
  if (at!==input.length)fail('trailing_bytes','Unexpected data follows the portable page.');
  return {header:h,records,assets};
}
