import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recordSubject,subjectScope,subjectCommand,sameSubject} from '../lib/record-subject.ts';

test('subject control supports Other, interdisciplinary and language scoping without editing canonical content',()=>{
 const original={family:'journey',id:'cherwell',rev:7,rendition:'exact-edition',title:'River Cherwell',body:'Retained',learningScope:{version:1,spaces:['computing'],provenance:'authored'},learningScopeRev:2};
 assert.equal(recordSubject(original.learningScope),'computing');
 assert.deepEqual(subjectScope('unclassified'),{version:1,spaces:[],provenance:'classification'});
 assert.deepEqual(subjectScope('both','ja'),{version:1,spaces:['computing','languages'],languages:['ja'],provenance:'classification'});
 const command=subjectCommand(original,subjectScope('unclassified'),'operation-1');
 assert.equal(command.expectedRev,7);assert.equal(command.data.classifyLearningScope.expectedScopeRev,2);
 assert.equal(command.data.classifyLearningScope.learningScope.spaces.length,0);
 assert.equal(command.data.title,undefined);assert.equal(command.data.body,undefined);
 assert.equal(original.title,'River Cherwell');assert.equal(original.rendition,'exact-edition');
 assert.equal(sameSubject(original,subjectScope('computing')),true);
 assert.equal(sameSubject(original,subjectScope('unclassified')),false);
});
