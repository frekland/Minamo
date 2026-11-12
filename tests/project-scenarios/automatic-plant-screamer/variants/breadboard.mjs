/** TEST ONLY: rapid breadboard tinkerer; supplied physical observations remain unverified. */
export const breadboard={
  version:1,fictionalHabit:'Builds first, documents wiring incompletely and revises a software-blame hypothesis.',
  noteLeaves:['note-quick-wiring','note-audio-correction','note-bench-next'],
  annotationLeaves:['annotation-power'],
  events:{
    F:{notes:[{leaf:'note-quick-wiring',title:'The speaker is silent',
      body:'28 October: I plugged the module in quickly. Serial log says "play(1) sent", but the speaker was silent. I blamed the ESP32 code without noting grounds, supply voltage, microSD naming, file rights or the actual UART pins. This is a reported physical attempt, with no photo or measured voltage.',
      links:['question:audio','article:reference:uart']}]},
    G:{annotations:[{leaf:'annotation-power',section:'uart',quote:'supply, grounds, UART wiring',
      body:'Check bench connections before blaming code.'}]},
    H:{reviseNotes:[{leaf:'note-quick-wiring',
      body:'4 November: my first Note jumped to a firmware diagnosis. I realised I may have labelled the SD file incorrectly and had not measured module power. I cannot prove which cause explains the silence; the original software-blame edition stays visible.'}]},
    I:{notes:[{leaf:'note-audio-correction',title:'SD naming hypothesis remains open',
      body:'9 November: I reported renaming a sample to the module convention and heard a short sound once, but saved neither a recording nor voltage/log evidence. A single reported sound is not evidence that the sensor or alarm state machine works.',
      links:['question:audio','note:note-quick-wiring']}]},
    J:{reviseQuestions:[{id:'audio',question:'Was intermittent silence caused by power, ground, SD naming or UART wiring, and which bench observation distinguishes them?'}],
      projectBody:'13 November: distinguish a simulated threshold rule from unverified bench audio. Check power, grounds and original sound file before blaming firmware. Keep the first silent-playback account and its later uncertain correction.'},
    K:{reviseNotes:[{leaf:'note-quick-wiring',
      body:'23 November: after a break I only know I sent a command and once reported hearing audio after an SD rename. There is no independent powered-hardware receipt; the original firmware blame was premature. Start with one safe measured bench check.'}],
      notes:[{leaf:'note-bench-next',title:'Return to the bench with one check',
        body:'23 November: I want to check the actual DFPlayer power and audio file naming before touching thresholds. The fixed software trace may be green, but I have no proof the real plant screamed reliably.',
        links:['question:audio','note:note-audio-correction']}]}
  }
};
