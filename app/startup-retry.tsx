"use client";
export default function StartupRetry(){return <main style={{maxWidth:560,margin:'12vh auto',padding:24}}><h1>Minamo could not open this workspace</h1><p>Check your connection and retry. Your saved work has not been changed.</p><button type="button" onClick={()=>window.location.reload()}>Retry workspace</button></main>}
