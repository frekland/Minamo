/** Curated display-only readings. Unknown words remain undecorated rather than guessed. */
const authored:readonly (readonly [string,string])[]=[
 ['外国人','がいこくじん'],['日本人','にほんじん'],['国','くに'],['人','ひと'],['自然','しぜん'],['話して','はなして'],['話した','はなした'],['話し','はなし'],
 ['写真','しゃしん'],['週末','しゅうまつ'],['家族','かぞく'],['学校','がっこう'],['電車','でんしゃ'],['勉強','べんきょう'],['日本','にほん'],['英語','えいご'],['時間','じかん'],['友達','ともだち'],['雨','あめ'],['本','ほん'],['道','みち'],['右','みぎ'],['左','ひだり'],['近く','ちかく'],['遠く','とおく'],['歩いて','あるいて'],['朝','あさ'],['夜','よる'],['店員','てんいん'],
 ['仕事','しごと'],['図書館','としょかん'],['閉まって','しまって'],['閉まる','しまる'],['閉める','しめる'],['閉ま','しま'],['開いて','あいて'],['開ける','あける'],['開く','あく'],['終わって','おわって'],['終わった','おわった'],['終わる','おわる'],['終わ','おわ'],
 ['昨日','きのう'],['今日','きょう'],['明日','あした'],['今度','こんど'],['何も','なにも'],['何か','なにか'],['何を','なにを'],['何','なに'],['残念','ざんねん'],['友だち','ともだち'],['買えません','かえません'],['買えた','かえた'],['買える','かえる'],['買う','かう'],['買わ','かわ'],['買え','かえ'],['行きました','いきました'],['行こう','いこう'],['行った','いった'],['行く','いく'],['行き','いき'],['帰る','かえる'],['食べる','たべる'],['飲む','のむ'],['見る','みる'],['聞く','きく'],['読む','よむ'],['書く','かく'],['話す','はなす'],['待つ','まつ'],['会う','あう'],['作る','つくる'],['勉強する','べんきょうする'],['寝る','ねる'],['起きる','おきる'],['働く','はたらく'],['忘れる','わすれる'],['始める','はじめる'],['遅れる','おくれる'],['間に合う','まにあう'],['見つける','みつける'],['歩く','あるく'],['乗る','のる'],['降りる','おりる'],
 ['着いた','ついた'],['着い','つい'],['着こう','つこう'],['早く','はやく'],['遅く','おそく'],['思って','おもって'],['思います','おもいます'],['思う','おもう'],['店','みせ'],['私','わたし'],['日本語','にほんご']
];
export const japaneseReadings=authored.filter((entry):entry is readonly [string,string]=>!!entry[1]).sort((a,b)=>b[0].length-a[0].length);
export type AnnotatedRun={text:string;reading?:string};
/** Kana stay on the base line. Failure to align exactly yields unadorned canonical text. */
export function alignedJapaneseRuns(base:string,reading:string):AnnotatedRun[]{
 if(!/[\p{Script=Han}]/u.test(base)||!reading)return [{text:base}];
 const tokens=base.match(/[\p{Script=Han}]+|[^\p{Script=Han}]+/gu)??[base];
 const runs:AnnotatedRun[]=[];let at=0;
 for(let i=0;i<tokens.length;i++){
  const token=tokens[i];
  if(!/[\p{Script=Han}]/u.test(token)){if(!reading.startsWith(token,at))return [{text:base}];runs.push({text:token});at+=token.length;continue;}
  const next=tokens[i+1],end=next!==undefined?reading.indexOf(next,at):reading.length;
  if(end<=at)return [{text:base}];runs.push({text:token,reading:reading.slice(at,end)});at=end;
 }
 return at===reading.length&&runs.map(run=>run.text).join('')===base?runs:[{text:base}];
}
export function japaneseFuriganaRuns(text:string):AnnotatedRun[]{
 if(!/[\u3400-\u9fff]/u.test(text))return [{text}];
 const runs:AnnotatedRun[]=[];let index=0,plain='';
 while(index<text.length){const match=japaneseReadings.find(([base])=>text.startsWith(base,index));if(match){if(plain){runs.push({text:plain});plain='';}runs.push(...alignedJapaneseRuns(match[0],match[1]));index+=match[0].length;}else{plain+=text[index];index++;}}
 if(plain)runs.push({text:plain});return runs;
}
