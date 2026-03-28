const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is required');
  process.exit(1);
}
const client = new OpenAI({ apiKey: API_KEY });

const BATCH_SIZE = 20;
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'saju-manual.ts');
const PROGRESS_FILE = path.join(__dirname, 'plain-text-progress.json');

const SYSTEM_PROMPT = `당신은 전통 사주팔자(四柱八字) 전문가이자 현대 한국어 작가입니다.
아래 전통 사주 해설서의 원문을 일반인이 쉽게 이해할 수 있는 현대 한국어로 풀어서 설명해주세요.

## 변환 규칙

1. **한자 용어 → 쉬운 한국어로 풀이**
   - 食傷(식상) → "표현력과 자녀운을 나타내는 식상"
   - 比劫(비겁) → "나와 비슷한 기운(비겁)"  
   - 偏印(편인) → "편인(학문·어머니 기운)"
   - 財(재성) → "재물운", 官(관성) → "직장·명예운"
   - 刑冲(형충) → "충돌하는 기운", 용신 → "나에게 꼭 필요한 기운"
   - 신강 → "기운이 강한 사주", 신약 → "기운이 약한 사주"

2. **○ 표시는 원본에서 깨진 한자** — 앞뒤 문맥으로 유추하여 자연스럽게 번역

3. **축약체 → 자연스러운 완성 문장**
   - "돈탐하다. 사기당한다." → "돈에 대한 욕심이 생기기 쉽고, 사기를 당할 수 있으니 주의하세요."

4. 각 항목은 **2~4문장**, 존댓말(~합니다/~하세요) 사용

5. 의미와 뉘앙스를 보존하되 **공포감을 주는 표현은 부드럽게** 순화
   - "단명한다" → "건강 관리에 특히 신경 쓰셔야 합니다"
   - "과부된다" → "배우자와의 인연이 약할 수 있으니 서로 배려가 필요합니다"

6. 반드시 JSON으로 응답: {"items": [{"id": 0, "plainText": "..."}, ...]}
7. id는 입력의 [번호]와 정확히 일치`;

function parseManualData(content) {
  const startMarker = 'export const SAJU_MANUAL: ManualChapter[] = ';
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) throw new Error('SAJU_MANUAL not found');

  const jsonStart = content.indexOf('[', startIdx + startMarker.length);
  let depth = 0;
  let jsonEnd = -1;
  let inString = false;
  let escape = false;

  for (let i = jsonStart; i < content.length; i++) {
    const ch = content[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '[') depth++;
    if (ch === ']') {
      depth--;
      if (depth === 0) { jsonEnd = i + 1; break; }
    }
  }

  if (jsonEnd === -1) throw new Error('Could not find end of SAJU_MANUAL array');
  return JSON.parse(content.substring(jsonStart, jsonEnd));
}

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  } catch { return {}; }
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress), 'utf8');
}

async function translateBatch(entries, batchNum, totalBatches, retries = 2) {
  const prompt = entries.map(e => `[${e.globalIdx}] ${e.condition} ${e.text}`).join('\n');

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 16000
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      const items = parsed.items || parsed.translations || parsed.results || [];

      if (!Array.isArray(items) || items.length === 0) {
        // Try to handle object-style response { "0": "...", "1": "..." }
        const altItems = [];
        for (const [key, val] of Object.entries(parsed)) {
          if (typeof val === 'string') {
            altItems.push({ id: parseInt(key), plainText: val });
          } else if (val && val.plainText) {
            altItems.push({ id: parseInt(key), plainText: val.plainText });
          }
        }
        if (altItems.length > 0) return altItems;
        throw new Error('Unexpected response structure');
      }

      return items;
    } catch (error) {
      console.error(`  Batch ${batchNum} attempt ${attempt + 1} failed: ${error.message}`);
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 2000 * (attempt + 1)));
      }
    }
  }

  return entries.map(e => ({ id: e.globalIdx, plainText: '' }));
}

async function main() {
  console.log('=== 태을철학 해설서 쉬운해설 생성 스크립트 ===\n');

  const content = fs.readFileSync(DATA_FILE, 'utf8');
  const chapters = parseManualData(content);

  // Flatten entries with global index
  const allEntries = [];
  for (const chapter of chapters) {
    for (const entry of chapter.entries) {
      allEntries.push({
        globalIdx: allEntries.length,
        chapter: chapter.chapter,
        condition: entry.condition,
        text: entry.text
      });
    }
  }

  console.log(`Total entries: ${allEntries.length}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log(`Total batches: ${Math.ceil(allEntries.length / BATCH_SIZE)}\n`);

  // Load previous progress
  const progress = loadProgress();
  const results = {};
  Object.assign(results, progress);
  const alreadyDone = Object.keys(progress).length;
  if (alreadyDone > 0) {
    console.log(`Resuming: ${alreadyDone} entries already translated.\n`);
  }

  const totalBatches = Math.ceil(allEntries.length / BATCH_SIZE);

  for (let i = 0; i < allEntries.length; i += BATCH_SIZE) {
    const batch = allEntries.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    // Skip if all entries in this batch are already done
    const allDone = batch.every(e => results[e.globalIdx]);
    if (allDone) {
      console.log(`Batch ${batchNum}/${totalBatches} — skipped (already done)`);
      continue;
    }

    // Filter to only untranslated entries
    const needTranslation = batch.filter(e => !results[e.globalIdx]);

    console.log(`Batch ${batchNum}/${totalBatches} — translating ${needTranslation.length} entries...`);
    const items = await translateBatch(needTranslation, batchNum, totalBatches);

    let count = 0;
    for (const item of items) {
      if (item.plainText) {
        results[item.id] = item.plainText;
        count++;
      }
    }

    console.log(`  ✓ ${count}/${needTranslation.length} translated`);

    // Save progress
    saveProgress(results);

    // Rate limit delay
    if (i + BATCH_SIZE < allEntries.length) {
      await new Promise(r => setTimeout(r, 800));
    }
  }

  // Apply results to chapters
  let idx = 0;
  let filled = 0;
  let empty = 0;
  for (const chapter of chapters) {
    for (const entry of chapter.entries) {
      entry.plainText = results[idx] || '';
      if (entry.plainText) filled++;
      else empty++;
      idx++;
    }
  }

  // Safety: never write empty data
  if (idx === 0) {
    console.error('ERROR: No entries processed. Aborting write to prevent data loss.');
    process.exit(1);
  }

  // Write updated TS file
  const newContent = `export interface ManualEntry {
  condition: string
  text: string
  plainText: string
  tags: string[]
}

export interface ManualChapter {
  chapter: number
  title: string
  entries: ManualEntry[]
}

export const SAJU_MANUAL: ManualChapter[] = ${JSON.stringify(chapters, null, 2)};
`;

  fs.writeFileSync(DATA_FILE, newContent, 'utf8');

  console.log(`\n=== 완료 ===`);
  console.log(`총 ${idx}개 엔트리 처리`);
  console.log(`성공: ${filled}개 | 실패: ${empty}개`);

  // Cleanup progress file
  if (empty === 0) {
    try { fs.unlinkSync(PROGRESS_FILE); } catch {}
    console.log('Progress file cleaned up.');
  }
}

main().catch(console.error);
