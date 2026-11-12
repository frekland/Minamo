/** Shared lightweight error identity for client-safe validation and server adapters. */
export class DomainError extends Error {constructor(public status:number,public code:string,message:string,public path?:string,public recordKey?:string){super(message)}}
