/** TEST ONLY: interrupted sparse recorder — short Notes and expiring lab context. */
export const sparseReturn={
  version:1,fictionalHabit:'Records little, returns after an expired lab instance and resists walkthrough spoilers.',
  noteLeaves:['note-sparse','note-expired','note-restart'],
  annotationLeaves:['annotation-sparse-instance'],
  events:{
    F:{notes:[{leaf:'note-sparse',title:'Short lab Note before stopping',
      body:'28 October: LAB_TARGET, web looked alive, maybe check capture later. No exact address, session ID, screenshot, command stderr or flag. I think I saw HTTP 200 but did not retain proof.',
      links:['question:service']}]},
    G:{annotations:[{leaf:'annotation-sparse-instance',section:'time',quote:'A lab instance can expire',
      body:'This likely explains the missing endpoint after a break.'}]},
    H:{notes:[{leaf:'note-expired',title:'Old address no longer responds',
      body:'4 November: I returned and my old tab failed to connect. I believe the permitted instance expired, but did not record the platform status. Do not replay old outputs against an unknown new target.',
      links:['question:instance','article:reference:time']}]},
    I:{reviseNotes:[{leaf:'note-sparse',
      body:'9 November: original “web looked alive” Note has almost no provenance. The later failed connection cannot tell whether the old response was wrong or the instance expired. Keep that distinction visible.'}]},
    J:{reviseQuestions:[{id:'instance',question:'How can I verify a newly authorised lab instance before comparing it with my sparse October Notes?'}],
      projectBody:'13 November: after the stale-instance interruption, the immediate aim is to establish a permitted new instance identity and evidence ledger, not assume progress or consult a full walkthrough.'},
    K:{reviseNotes:[{leaf:'note-sparse',
      body:'23 November: after another gap I only remember that I was looking at HTTP and lost the instance. My first Note lacks details; I must start with new authorisation and one harmless observation, leaving past inference explicitly unverified.'}],
      notes:[{leaf:'note-restart',title:'Fresh start with spoiler boundaries',
        body:'23 November: please ask me for the current authorised instance before suggesting commands. I saw a walkthrough link but have not opened it; do not spoil the machine or claim I captured credentials or flags.',
        links:['question:instance','note:note-expired']}]}
  }
};
