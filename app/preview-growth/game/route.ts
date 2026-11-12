import game from '../../../examples/journey-growth/browser-game/index.html?raw';
/** Isolated original local starter; build-time production branch is unreachable. */
export function GET(){if(!import.meta.env.DEV)return new Response('Not found',{status:404});return new Response(game,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Content-Security-Policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"}});}
