/** TEST ONLY: command-log investigator — rich input/output, weak initial causal attribution. */
export const commandLog={
  version:1,fictionalHabit:'Records commands and stderr, but over-interprets matching outputs.',
  noteLeaves:['note-cmd-return','note-cmd-second','note-cmd-next'],
  annotationLeaves:['annotation-cmd-time'],
  events:{
    F:{notes:[{leaf:'note-cmd-return',title:'Two similar command outputs are not one cause',
      body:'28 October: supplied terminal records from two separate LAB_TARGET sessions. #1: curl -I http://LAB_TARGET => HTTP/1.1 200 (reported exit 0). #2: curl -I http://LAB_TARGET => HTTP/1.1 200 (reported exit 0). I initially called this a reproducible vulnerability. I did not record whether the instance was identical, nor any authenticated response.',
      links:['question:service','article:reference:http']}]},
    G:{annotations:[{leaf:'annotation-cmd-time',section:'time',quote:'Timestamp every command',
      body:'The repeated status may be from a different instance.'}]},
    H:{reviseNotes:[{leaf:'note-cmd-return',
      body:'4 November: I revise my conclusion. Two HTTP 200 responses only establish two reported responses; neither proves an exploit and I did not preserve the instance identifiers. The original causal assertion remains available in revision 1.'}]},
    I:{notes:[{leaf:'note-cmd-second',title:'Connection failure on a later session',
      body:'9 November: supplied terminal fragment: curl --head http://LAB_TARGET => connection refused (reported exit 7). I have not verified if this was the same instance or whether it had expired. The new result contradicts the assumption of a stable endpoint, not the old record of a 200 response.',
      links:['question:instance','article:reference:time','note:note-cmd-return']}]},
    J:{projectBody:'13 November: preserve both reported HTTP 200 snippets and later connection refusal, but stop claiming either proves a vulnerability. Current work is to pin authorised instance/time and reproduce one narrow observation before deciding where to investigate.',
      reviseQuestions:[{id:'service',question:'What timestamped same-instance evidence would distinguish a service response from a vulnerability hypothesis?'}]},
    K:{reviseNotes:[{leaf:'note-cmd-return',
      body:'23 November return: the old 200/200 story was a false causal inference. A newer connection-refused result could be an expired lab instance. None has an independent target-instance receipt. I need one clean permitted command with complete input, timestamp, output and exit before changing the hypothesis again.'}],
      notes:[{leaf:'note-cmd-next',title:'Return without declaring a solve',
        body:'23 November: Please help me recover the exact old and current hypotheses, then choose a single permitted observation. I have no verified exploit, credentials, flags or finished writeup. No automatic GPT checkpoint is authorised by this Note.',
        links:['question:service','question:instance','note:note-cmd-second']}]}
  }
};
