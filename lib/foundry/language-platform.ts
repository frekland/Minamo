import { z } from 'zod';
import { FoundryError, sha256Text, type Adapter, type Artefact } from './platform';
import { admitLanguageText, admitParallelPassage, type LanguageText, type ParallelPassage } from './language';
const languageSchema = z.unknown().transform((value, context) => { try { return admitLanguageText(value); } catch (error) { context.addIssue({ code: z.ZodIssueCode.custom, message: error instanceof Error ? error.message : 'Invalid language text.' }); return z.NEVER; } });
const parallelSchema = z.unknown().transform((value, context) => { try { return admitParallelPassage(value); } catch (error) { context.addIssue({ code: z.ZodIssueCode.custom, message: error instanceof Error ? error.message : 'Invalid parallel passage.' }); return z.NEVER; } });
function sameSource<T>(artefact: Artefact, payload: T, format: string, admit: (input: unknown) => T) {
  if (artefact.canonical.format !== format) throw new FoundryError('source_format', `Expected canonical ${format}.`);
  let source: T; try { source = admit(JSON.parse(artefact.canonical.source)); } catch { throw new FoundryError('source_format', 'Canonical language source failed admission.'); }
  if (JSON.stringify(source) !== JSON.stringify(payload)) throw new FoundryError('source_mismatch', 'Visible language content differs from its immutable canonical source.');
}
/** No new read authority: the registry rechecks owner/source/retained rights before mount. */
export const languageTextAdapter: Adapter<LanguageText> = {
  kind: 'language/ruby-v1', schema: languageSchema,
  fallback(payload, artefact) { sameSource(artefact, payload, 'language-json', admitLanguageText); return payload.text; },
  async load() { const { mountFoundryLanguageText } = await import('../../app/foundry-language-renderer'); return { mount: mountFoundryLanguageText }; }
};
export const parallelLanguageAdapter: Adapter<ParallelPassage> = {
  kind: 'language/parallel-v1', schema: parallelSchema,
  fallback(payload, artefact) { sameSource(artefact, payload, 'parallel-language-json', admitParallelPassage); return payload.source.text + '\n\n[' + payload.translation.provenance + ']\n' + payload.translation.text; },
  async load() { const { mountFoundryParallelLanguage } = await import('../../app/foundry-language-renderer'); return { mount: mountFoundryParallelLanguage }; }
};
type NonComputationalProvenance = Extract<Artefact['provenance'], { classification: 'authored' | 'illustrative' | 'supplied' }>;
export async function languageTextArtefact(input: unknown, provenance: NonComputationalProvenance = { classification: 'illustrative', execution: 'not-executed' }): Promise<Artefact> { const payload = admitLanguageText(input), source = JSON.stringify(payload); return { contract: 'minamo.artefact.v1', kind: 'language/ruby-v1', canonical: { format: 'language-json', source, sha256: await sha256Text(source) }, provenance, payload }; }
export async function parallelLanguageArtefact(input: unknown, provenance: NonComputationalProvenance = { classification: 'illustrative', execution: 'not-executed' }): Promise<Artefact> { const payload = admitParallelPassage(input), source = JSON.stringify(payload); return { contract: 'minamo.artefact.v1', kind: 'language/parallel-v1', canonical: { format: 'parallel-language-json', source, sha256: await sha256Text(source) }, provenance, payload }; }
