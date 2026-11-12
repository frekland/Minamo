/** TEST ONLY: shared-space pragmatist; human feedback drives a requirement pivot. */
export const sharedSpace={
  version:1,fictionalHabit:'Short practical Notes, shared-room noise constraints and evolving alert policy.',
  noteLeaves:['note-noise','note-quiet-plan','note-social-return'],
  annotationLeaves:['annotation-human'],
  events:{
    F:{notes:[{leaf:'note-noise',title:'The first alarm would annoy people',
      body:'28 October: I imagined a plant screaming whenever the sensor is dry. Someone nearby said that could be irritating in a shared room. This is a fictional reported preference, not an observed powered prototype or microphone recording. I now care about repeat limits more than a precise percentage.',
      links:['question:behaviour','article:reference:human']}]},
    G:{annotations:[{leaf:'annotation-human',section:'human',quote:'Repeated loud sounds',
      body:'One short sound, then re-arm or mute.'}]},
    H:{reviseNotes:[{leaf:'note-noise',
      body:'4 November: I initially said "scream all the time", then realised the plant could stay dry for hours. The old requirement was unreasonable in a shared office. I prefer one short warning per dry transition and a clear mute choice; no neighbour has tested real audio yet.'}]},
    I:{notes:[{leaf:'note-quiet-plan',title:'Quiet hours and manual mute idea',
      body:'9 November: design note: add a visible mute/test control and avoid startup screaming. The deterministic firmware trace can represent muted steps, but there is no clock, enclosure, phone app or physical audio measurement. Keep the device offline.',
      links:['question:behaviour','note:note-noise']}]},
    J:{reviseQuestions:[{id:'behaviour',question:'Does one warning per dry transition plus manual mute respect shared-room needs without hiding a real watering problem?'}],
      projectBody:'13 November: change the objective from frequent amusing screams to one short dry-state alert followed by silence until wet re-arm, with a user-controlled mute. No Wi-Fi, clock service or pump. This is a product decision, not an observed hardware result.'},
    K:{reviseNotes:[{leaf:'note-noise',
      body:'23 November: the original continuous screaming idea was superseded by one warning and mute. My evidence is fictional feedback plus a deterministic model, not a physical shared-office trial. Next: evaluate short sample loudness with consent if we ever assemble the device.'}],
      notes:[{leaf:'note-social-return',title:'A considerate return experiment',
        body:'23 November: I want to show why the audible rule changed, then run the simulated dry/wet/mute sequence before testing an original sound on a safe powered bench. Do not claim the room accepted it.',
        links:['question:behaviour','note:note-quiet-plan']}]}
  }
};
