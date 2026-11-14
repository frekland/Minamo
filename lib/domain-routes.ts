/** Shared production dispatch and method contract for the domain HTTP API. */
export const DOMAIN_ROUTES: Readonly<Record<string, readonly string[]>> = {
 '/api/test-runs':['GET','POST'], '/api/projects/runtime-config':['GET'], '/api/projects/observation':['POST'], '/mcp':['POST'], '/api/projects/composition':['GET','POST'], '/api/projects/changes':['GET'], '/api/projects/code-package':['GET'], '/api/projects/contributions':['GET','POST'], '/api/projects/update':['POST'], '/api/notes/pin':['POST'], '/api/notes/pins':['GET','POST'],
 '/api/experiences':['GET','POST'], '/api/presentation':['GET','POST'],
 '/api/workspace':['GET'], '/api/records/revision':['GET'], '/api/records/changes':['GET'], '/api/collaboration-preferences':['GET','POST'], '/api/commands':['POST'], '/api/bookmarks':['POST'],
 '/api/preview':['POST'], '/api/query':['GET','POST'], '/api/context':['GET','POST'], '/api/operations':['GET','POST'],
 '/api/editorial-policy':['GET'], '/api/library':['GET','POST'], '/api/investigation-order':['GET'], '/api/project-context':['GET'], '/api/trash/empty':['GET','POST'],
 '/api/manuscripts/source':['GET'], '/api/manuscripts/preview':['POST'], '/api/manuscripts/publish':['POST'],
 '/api/authoring/preview':['POST'], '/api/authoring/apply':['POST'],
 // Legacy Activity cartridges remain readable/downloadable. All submission,
 // attempt, reveal and publication routes are retired; use Project contributions.
 '/api/activities/read':['GET','POST'], '/api/activities/project':['GET'],
 // Old development records remain readable in learning-context. New owner-authored
 // interpretations have their own explicit route; progress checkpoint writes retire.
 '/api/learning-graph':['GET','POST'], '/api/learning-context':['GET','POST'], '/api/learning-scopes':['POST'], '/api/learning-relationships/candidates':['POST'], '/api/learning-relationships/confirm':['POST'], '/api/learning-interpretations':['POST'], '/api/learning-developments':['POST'], '/api/learning-developments/revise':['POST'],
 '/api/recovery':['GET','POST'], '/api/recovery/export':['POST'], '/api/recovery/import':['POST'],
};
export function isDomainPath(path:string){return Object.hasOwn(DOMAIN_ROUTES,path)||path.startsWith('/api/recovery/');}
export function domainMethodAllowed(path:string,method:string){return DOMAIN_ROUTES[path]?.includes(method)??false;}
