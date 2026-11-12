/** TEST ONLY: careful calibrator; raw CSV-style data is scripted, not physical measurement. */
export const calibrator={
  version:1,fictionalHabit:'Records repeated raw readings and corrects a false universal percentage scale.',
  noteLeaves:['note-raw-series','note-hysteresis','note-cal-next'],
  annotationLeaves:['annotation-adc'],
  events:{
    F:{notes:[{leaf:'note-raw-series',title:'Raw readings across two labelled pots',
      body:'28 October: synthetic CSV samples, all fictional: dry pot, trial1 2840, trial2 2805, trial3 2890; watered pot, trial1 1710, trial2 1660, trial3 1800. Board/attenuation/soil are not documented, so the average cannot be a universal moisture %. My earlier "15%" claim is unsupported.',
      links:['question:calibration','article:reference:adc']}]},
    G:{annotations:[{leaf:'annotation-adc',section:'adc',quote:'device-dependent raw counts',
      body:'Report raw units and conditions, not universal %.'}]},
    H:{reviseNotes:[{leaf:'note-raw-series',
      body:'4 November: I plotted the synthetic dry and watered counts and noticed variation. I had mistaken the two labelled groups for a calibrated percentage scale. Revision 1 preserves the original table. I now need an explicit local threshold and re-arm gap; no wet soil was physically tested.'}]},
    I:{notes:[{leaf:'note-hysteresis',title:'Noisy threshold test in code',
      body:'9 November: test the source trace [2750,2810,2780,2820,2750,2900,2210,2810] with a dry threshold of 2800 and wet re-arm of 2400. A naive rule could trigger repeatedly; the deterministic state model should only trigger on distinct dry transitions. This is synthetic data, not a long-term sensor study.',
      links:['question:behaviour','question:calibration','note:note-raw-series']}]},
    J:{reviseQuestions:[{id:'calibration',question:'Which raw threshold, re-arm band and real multi-day pot observations would make this prototype repeatable without claiming absolute water percent?'}],
      projectBody:'13 November: use a raw ADC count and documented dry/wet band with hysteresis; stop displaying a universal 15%. A simulated state sequence may pass, but actual sensor drift, voltage and watering recovery remain untested.'},
    K:{reviseNotes:[{leaf:'note-raw-series',
      body:'23 November: my first CSV was wholly synthetic. Later state-model checks are deterministic code evidence, not a physical calibration. Next: take labelled dry/wet readings on the actual board and record attenuation, soil and time before choosing a stable threshold.'}],
      notes:[{leaf:'note-cal-next',title:'Return with calibration still provisional',
        body:'23 November: compare the earlier guessed 15% and the raw-count proposal, then tell me one bench measurement to collect. Do not claim moisture accuracy or an independently tested plant.',
        links:['question:calibration','note:note-hysteresis']}]}
  }
};
