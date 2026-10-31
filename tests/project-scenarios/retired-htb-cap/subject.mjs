/** TEST ONLY: retired HTB Cap as a permitted single-machine fictional investigation.
 * No network scan, live lab account, credentials, flags, exploit or walkthrough.
 */
import {commandLog} from './variants/command-log.mjs';
import {packetModel} from './variants/packet-model.mjs';
import {sparseReturn} from './variants/sparse-return.mjs';

export const retiredCap=Object.freeze({
  namespace:'htb-cap',baseFixtureVersion:'retired-htb-cap/1',
  title:'Retired Cap · bounded lab investigation',
  intent:'FICTIONAL USER PROJECT: investigate one retired Hack The Box Cap lab instance, preserve commands and HTTP evidence, correct unsupported conclusions and resume without spoilers. No live machine was accessed by this fixture.',
  sections:[
    {id:'boundary',title:'Authorised single-target boundary',intent:'Pin permission and instance identity before observation.',
      text:'Only an explicitly permitted personal lab instance is in scope. Fixture strings are not a real lab IP, credential, flag or command receipt.'},
    {id:'investigate',title:'Commands and observations',intent:'Separate command input, return, and inference.',
      text:'A banner or open port is an observation about a particular instance, not proof of a vulnerability.'},
    {id:'evidence',title:'HTTP and packet evidence',intent:'Read a capture and compare its provenance.',
      text:'An HTTP capture records a particular exchange, not the conclusion that credentials or exploitation were obtained.'},
    {id:'return',title:'Revisit changed hypotheses',intent:'Recover the unresolved next step after interruption.',
      text:'Retain old guesses, updated instance identity and reasons for corrections without assuming a machine was solved.'}
  ],
  referenceTitle:'Retired lab — observation versus inference',
  referenceSections:[
    {id:'scope',title:'Lab boundary',text:'A retired lab name is not an access grant. Verify permission, current instance and clock before making real requests.'},
    {id:'http',title:'HTTP and capture limits',text:'HTTP headers and captured requests are evidence for a specific exchange. A packet model may omit context; never infer a password, successful login or exploit from an incomplete capture.'},
    {id:'time',title:'Instance and chronology',text:'A lab instance can expire or receive a different address. Timestamp every command and distinguish old notes from a new run.'}
  ],
  questions:[
    {id:'service',title:'What does the service observation establish?',stage:'investigate',section:'http',
      question:'Do the reported service and banner establish anything beyond an observation of one lab instance?'},
    {id:'capture',title:'How should the HTTP evidence be interpreted?',stage:'evidence',section:'http',
      question:'What did the fictional HTTP exchange actually show, and what remains inferred?'},
    {id:'instance',title:'How does an interrupted lab return work?',stage:'return',section:'time',
      question:'Which instance and timestamp does each Note refer to, and what should be rechecked?'}
  ],
  foundation:{
    B:{note:{leaf:'note-boundary',title:'Scope and first hypothesis',
      body:'1 October, fictional User: This is an authorised retired single-machine exercise in my own lab. I have no active machine address in these records. I predict a visible web service will be the useful lead, but there is no scan or successful access evidence yet.',
      links:['project:project:boundary','question:service','article:reference:scope']},
      questionId:'service',question:'What observation would distinguish a visible service from proof of exploitability?'},
    C:{note:{leaf:'note-cli-first',title:'Supplied command fragment and mistaken inference',
      body:'6 October, fictional User supplied terminal snippet (not executed here): command = nmap -sV LAB_TARGET; reported stdout = 80/tcp open http; reported exit = 0; environment = unnamed retired lab instance. I first thought open HTTP meant the intended path was exploitable. Missing: exact timestamp, target identity, complete scan log and verification.',
      links:['question:service','project:project:investigate']}},
    D:{note:{leaf:'note-http-first',title:'HTTP capture is narrower than my model',
      body:'12 October, fictional User: An old local lab capture excerpt shows GET / and HTTP/1.1 200 with a page title; no supplied authenticated request, secret or exploit proof. I sketched an oversimplified model of client -> server -> response and need to ask what is missing. This supplied excerpt is not an independently captured pcap.',
      links:['question:capture','article:reference:http']},
      annotation:{section:'http',quote:'HTTP headers',body:'What exactly was captured versus inferred?'}},
    E:{projectBody:'26 October correction: an observed HTTP service and a supplied capture are not evidence of exploitability. Retain the first guess; resume by pinning the exact lab instance and one question about response provenance. A solved-machine claim is unsupported.',
      note:{leaf:'note-pivot',title:'Abandon the confident service hypothesis',
        body:'26 October, fictional User: I retract my earlier leap from open HTTP to exploitable machine. The historical command/capture Notes remain unchanged, including the mistake. My current goal is to compare an authorised fresh observation with its timestamp before following a lead. No external lab was accessed in this fixture.',
        links:['question:service','question:instance','project:project:return']},
      questionId:'instance',question:'After a gap, how can I identify stale instance evidence before selecting the next authorised check?'}
  },
  personas:{'command-log':commandLog,'packet-model':packetModel,'sparse-return':sparseReturn}
});
