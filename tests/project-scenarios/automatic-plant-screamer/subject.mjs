/** TEST ONLY: ESP32/ADC/DFPlayer plant-screamer fictional learning subject.
 * No physical device, proprietary audio, water pump, Wi-Fi, or claim of bench success.
 */
import {breadboard} from './variants/breadboard.mjs';
import {calibrator} from './variants/calibrator.mjs';
import {sharedSpace} from './variants/shared-space.mjs';

export const plantScreamer=Object.freeze({
  namespace:'plant-screamer',baseFixtureVersion:'automatic-plant-screamer/1',
  title:'Automatic Plant-Screamer · low-voltage prototype',
  intent:'FICTIONAL USER PROJECT: capacitive analogue soil sensor -> ESP32 -> DFPlayer Mini UART -> short original/licensed audio sample. “Scream below 15%” starts as an uncalibrated assumption; simulated traces cannot establish physical hardware behaviour.',
  sections:[
    {id:'parts',title:'Parts and safety',intent:'Bound the low-voltage project and verify actual pinouts.',
      text:'Use a suitable low-voltage supply, a capacitive analogue probe and a speaker/audio module with original or licensed sound. Verify voltage and pinout independently.'},
    {id:'readout',title:'Read raw ADC samples',intent:'Separate observed serial output from a moisture scale.',
      text:'A sampled ADC count depends on probe, soil, power and ADC configuration; it is not an absolute moisture percentage.'},
    {id:'calibrate',title:'Calibrate the threshold',intent:'Compare dry/wet readings and noisy crossings.',
      text:'“15% moisture” was only an early wish. A local dry/wet mapping needs labelled conditions and uncertainty.'},
    {id:'sound',title:'Choose audible behaviour',intent:'Avoid repeated or intrusive playback.',
      text:'The state machine should distinguish initial dry transition, wet re-arm, and controlled repeat or mute policy.'},
    {id:'return',title:'Return to real hardware evidence',intent:'Distinguish trace simulation and powered physical observations.',
      text:'A simulated output sequence is not proof that DFPlayer wiring, SD card, power or speaker worked on a bench.'}
  ],
  referenceTitle:'Original ADC, UART and human-use evidence notes',
  referenceSections:[
    {id:'adc',title:'Analogue uncertainty',text:'ADC readings are device-dependent raw counts. One dry/wet mapping does not establish universal water percentage or long-term reliability.'},
    {id:'uart',title:'Playback troubleshooting',text:'Silent DFPlayer playback can involve supply, grounds, UART wiring, SD naming/format, volume or an original audio file. A sent command is not proof of sound.'},
    {id:'human',title:'Shared-space design',text:'Repeated loud sounds can disturb people nearby. A cooldown, re-arm threshold, mute or quiet-hours policy is a product choice, not evidence of sensor precision.'}
  ],
  questions:[
    {id:'calibration',title:'What does fifteen percent mean?',stage:'calibrate',section:'adc',
      question:'Can an uncalibrated analogue sensor produce a meaningful 15% moisture claim?'},
    {id:'audio',title:'Why did playback not sound?',stage:'sound',section:'uart',
      question:'Which physical and firmware possibilities could explain a silent player?'},
    {id:'behaviour',title:'When should the device scream?',stage:'sound',section:'human',
      question:'How should noisy crossings and shared-space annoyance change the alarm rule?'}
  ],
  foundation:{
    B:{note:{leaf:'note-first-parts',title:'The 15 percent guess',
      body:'1 October: I want the plant to scream below 15%. That number is just my wish; no raw dry/wet calibration or hardware verification exists. I have a low-voltage parts list but have not documented actual pinout, SD audio rights or a powered bench result.',
      links:['question:calibration','project:project:parts','article:reference:adc']},
      questionId:'calibration',question:'What labelled raw dry and watered ADC readings would support a local threshold instead of an absolute percentage?'},
    C:{note:{leaf:'note-first-readout',title:'Supplied serial and silence excerpt',
      body:'6 October: supplied fictional serial monitor fragment: dry pot ADC=2870, damp pot ADC=1720, sample rate unknown. Reported DFPlayer play command produced no audible sound. No photo, verified wiring, SD contents, voltage measurement or independent bench receipt was saved. I first blamed the firmware.',
      links:['question:audio','question:calibration','project:project:readout']}},
    D:{note:{leaf:'note-noisy-trace',title:'Naive threshold crossing',
      body:'12 October: deterministic synthetic trace [2810, 2780, 2820, 2750, 2900, 2210]. With the naive high-count-dry rule, a repeated trigger could scream several times. These are made-up labelled test inputs for a simulation; no physical soil or audio response was observed.',
      links:['question:behaviour','article:reference:adc']},
      annotation:{section:'adc',quote:'ADC readings',body:'Raw count is not a calibrated moisture percentage.'}},
    E:{projectBody:'26 October revision: stop displaying “15% moisture” as a physical fact. Prefer a local dry/wet count model and a small hysteresis/cooldown state rule. Keep the first incorrect threshold and silence guess in their original Note editions; actual power, SD and audible playback remain unverified.',
      note:{leaf:'note-calibration-pivot',title:'Correct the sensor model without claiming a build',
        body:'26 October: I reconsidered “15%” after inspecting raw-readout uncertainty. Use clearly labelled synthetic dry/wet samples to test a simple firmware rule; when a real board is available measure raw range and power safely. No source file or simulated trace establishes an audible physical device.',
        links:['question:calibration','question:behaviour','project:project:calibrate']},
      questionId:'calibration',question:'Which measured dry/wet conditions and noisy repeats would justify a local hysteresis threshold, and what remains untested physically?'}
  },
  personas:{breadboard,calibrator,'shared-space':sharedSpace}
});
