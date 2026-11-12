/** TEST ONLY: packet/model explainer — diagrams and reference anchors first. */
export const packetModel={
  version:1,fictionalHabit:'Builds packet sketches and revises the meaning of incomplete captures.',
  noteLeaves:['note-model','note-missing','note-model-return'],
  annotationLeaves:['annotation-model-http'],
  events:{
    F:{notes:[{leaf:'note-model',title:'Sketching the HTTP exchange',
      body:'28 October: my sketch is browser -> HTTP GET / -> 200 page. I used to treat a successful page load as a successful sensitive operation. The supplied text lacks cookies, authentication state, request timing and exact capture identity. This model is a question, not a captured packet trace.',
      links:['question:capture','article:reference:http']}]},
    G:{annotations:[{leaf:'annotation-model-http',section:'http',quote:'A packet model may omit context',
      body:'Do I have actual request headers or just a diagram?'}]},
    H:{reviseNotes:[{leaf:'note-model',
      body:'4 November correction: the first diagram omitted authentication state and session boundaries. The alleged “successful operation” was only an HTTP 200 page load. Earlier model survives as revision 1; no secret or exploit is proven.'}],
      notes:[{leaf:'note-missing',title:'Missing capture fields',
        body:'4 November: checklist for a properly authorised future lab observation: timestamp, local instance identity, request method/path, response status and whether a body was actually captured. I found a reference paragraph, but did not watch any tutorial or run a new capture.',
        links:['question:capture','article:reference:http','note:note-model']}]},
    I:{reviseQuestions:[{id:'capture',question:'What original request/response fields would distinguish my model from a verified capture, without inferring credentials?'}]},
    J:{projectBody:'13 November: investigate how an HTTP model misrepresents the evidence before writing any exploitation narrative. Preserve the naive diagram and its later correction; one source-linked, authorised capture is an optional next step.'},
    K:{reviseNotes:[{leaf:'note-model',
      body:'23 November return: I can now separate my first simplified HTTP drawing, my later correction, and the missing packet evidence. I have not independently captured the request. Next: open the reference and specify exactly which field would answer the open question.'}],
      notes:[{leaf:'note-model-return',title:'Model after interruption',
        body:'23 November: I want to reconstruct the old diagram and the changed interpretation, not read a solution writeup. Please keep open what has not been captured and avoid declaring a solved lab.',
        links:['question:capture','note:note-model','article:reference:http']}]}
  }
};
