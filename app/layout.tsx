import '@xyflow/react/dist/style.css';
import './educational-diagrams.css';
import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
import "./workspace.css";
export const metadata:Metadata={title:"Minamo",icons:{icon:"/identity/minamo-icon.svg"},description:"Private learning workspace."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
