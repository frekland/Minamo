/** Shared production dispatch and method contract for the domain HTTP API. */
export const DOMAIN_ROUTES: Readonly<Record<string, readonly string[]>> = {
 '/mcp':['POST'],
 '/api/workspace':['GET'], '/api/commands':['POST'], '/api/bookmarks':['POST'],
 '/api/preview':['POST'], '/api/query':['GET','POST'], '/api/context':['GET','POST'], '/api/operations':['GET','POST'],
 '/api/editorial-policy':['GET'], '/api/library':['GET','POST'], '/api/investigation-order':['GET'], '/api/project-context':['GET'], '/api/trash/empty':['GET','POST'],
 '/api/manuscripts/source':['GET'], '/api/manuscripts/preview':['POST'], '/api/manuscripts/publish':['POST'],
 '/api/authoring/preview':['POST'], '/api/authoring/apply':['POST'],
 '/api/activities/capabilities':['GET'], '/api/activities/browse':['GET'], '/api/activities/read':['GET','POST'], '/api/activities/project':['GET'],
 '/api/activities/preview':['POST'], '/api/activities/publish':['POST'], '/api/activities/hint':['POST'], '/api/activities/attempt':['POST'], '/api/activities/context':['POST'],
 '/api/learning-graph':['GET','POST'], '/api/learning-context':['GET','POST'], '/api/learning-scopes':['POST'], '/api/learning-relationships/candidates':['POST'], '/api/learning-relationships/confirm':['POST'], '/api/learning-developments':['POST'], '/api/learning-developments/revise':['POST'],
 '/api/recovery':['GET','POST'], '/api/recovery/export':['POST'], '/api/recovery/import':['POST'],
};
export function isDomainPath(path:string){return Object.hasOwn(DOMAIN_ROUTES,path)||path.startsWith('/api/recovery/');}
export function domainMethodAllowed(path:string,method:string){return DOMAIN_ROUTES[path]?.includes(method)??false;}
