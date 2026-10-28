"use client";
import {Component,lazy,useState,type ComponentType,type ReactNode} from 'react';
export class FeatureFailureBoundary extends Component<{children:ReactNode;label:string;onRetry:()=>void},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?<section role="alert" className="v2-notice"><div><p>{this.props.label} could not open. Surrounding work remains available.</p><button type="button" className="v2-secondary" onClick={this.props.onRetry}>Retry {this.props.label.toLowerCase()}</button><p>If retry still fails, save your writing and reload this page.</p></div></section>:this.props.children;}
}
/** Initial lazy identity must survive discarded, suspended first renders. Only an
 * explicit retry replaces it, in already-mounted state, after an error boundary. */
export function retryableFeature<P extends object>(load:()=>Promise<{default:ComponentType<P>}>,label:string){
 const InitialFeature=lazy(load);
 return function RetryableFeature(props:P){
  const [Feature,setFeature]=useState(()=>InitialFeature),[attempt,setAttempt]=useState(0);
  function retry(){setFeature(()=>lazy(load));setAttempt(value=>value+1)}
  return <FeatureFailureBoundary key={attempt} label={label} onRetry={retry}><Feature {...props}/></FeatureFailureBoundary>;
 }
}
