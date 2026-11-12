"use client";
import {useState} from "react";
export default function ClientProof(){const [open,setOpen]=useState(false);return <section className="context-panel"><button className="text-button" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?"−":"+"} Client interaction test</button>{open&&<p>React has hydrated this control. This temporary panel state makes no database writes. Close and reopen it to try another event.</p>}</section>}
