declare namespace Cloudflare {
  interface Env {
    TLDRAW_LICENSE_KEY?: string;
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}
