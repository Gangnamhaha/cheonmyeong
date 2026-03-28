/**
 * PortOne KG이니시스 채널 자동 생성 스크립트 v2
 * - 더 많은 디버깅
 * - 각 단계별 스크린샷
 * - 필드 검증 추가
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 설정
const PORTONE_EMAIL = 'any001004@gmail.com';
const PORTONE_PASSWORD = 'Aa5119446@';

const CHANNELS = [
  {
    name: 'KG이니시스 일반결제',
    type: 'onetime',
    paymentModule: '일회성',
    mid: 'MOI1061663',
    signKey: 'NkY1Q3oyRXJnOGZtZFdrMktTRzY2QT09',
  },
  {
    name: 'KG이니시스 정기결제',
    type: 'billing',
    paymentModule: '빌링키',
    mid: 'MOIverce20',
    signKey: 'bW1aQ0tBdk54VzVyK0ZqOW1aejZQZz09',
  },
];

// 스크린샷 저장 헬퍼
let screenshotCounter = 0;
async function saveScreenshot(page, name) {
  screenshotCounter++;
  const filename = `debug-${screenshotCounter.toString().padStart(2, '0')}-${name}.png`;
  await page.screenshot({ path: filename, fullPage: true });
  console.log(`    📸 스크린샷 저장: ${filename}`);
}

// 필드 입력 및 검증 헬퍼
async function fillAndVerify(page, selectors, value, label) {
  for (const selector of selectors) {
    try {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 2000 })) {
        await input.clear();
        await input.fill(value);
        await page.waitForTimeout(500);
        
        // 값 검증
        const actualValue = await input.inputValue();
        if (actualValue === value) {
          console.log(`    ✓ ${label}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
          return true;
        } else {
          console.log(`    ⚠️  ${label} 검증 실패 (입력: ${value.substring(0, 10)}..., 실제: ${actualValue})`);
        }
      }
    } catch (e) {
      continue;
    }
  }
  console.log(`    ❌ ${label} 입력 실패`);
  return false;
}

async function createPortOneChannels() {
  console.log('🚀 PortOne 채널 자동 생성 v2 시작...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000, // 더 느리게
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();

  try {
    // 1. 로그인 (이전과 동일)
    console.log('📝 Step 1: PortOne 로그인...');
    await page.goto('https://admin.portone.io', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 이메일
    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.fill(PORTONE_EMAIL);
    
    // 비밀번호
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(PORTONE_PASSWORD);
    
    // 로그인
    const loginButton = page.locator('button[type="submit"]').first();
    await loginButton.click();
    await page.waitForTimeout(5000);
    console.log('  ✓ 로그인 완료\n');

    // 2. 채널 관리 페이지
    console.log('📝 Step 2: 채널 관리 페이지 이동...');
    await page.goto('https://admin.portone.io/integration-v2/manage/channel', {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3000);
    await saveScreenshot(page, 'channel-page');
    console.log('  ✓ 채널 관리 페이지 로드\n');

    // 3. 실연동 모드
    console.log('📝 Step 3: 실연동 모드 변경...');
    try {
      const liveButton = page.locator('text=실연동').first();
      await liveButton.click();
      await page.waitForTimeout(2000);
      console.log('  ✓ 실연동 모드 활성화\n');
    } catch (e) {
      console.log('  ⚠️  실연동 모드 버튼 찾기 실패 (이미 실연동일 수 있음)\n');
    }

    // 4. 각 채널 생성
    const createdChannels = [];

    for (let i = 0; i < CHANNELS.length; i++) {
      const channel = CHANNELS[i];
      console.log(`\n📝 Step ${4 + i}: "${channel.name}" 채널 생성`);
      console.log('='.repeat(60));

      try {
        // 4.1 채널 추가 버튼
        console.log('  → 채널 추가 버튼 클릭...');
        const addButton = page.locator('button:has-text("채널 추가"), button:has-text("추가")').first();
        await addButton.click();
        await page.waitForTimeout(3000);
        await saveScreenshot(page, `${channel.type}-01-after-add`);

        // 4.2 KG이니시스 선택
        console.log('  → KG이니시스 선택...');
        const kgButton = page.locator('text=KG이니시스').first();
        await kgButton.click();
        await page.waitForTimeout(2000);
        await saveScreenshot(page, `${channel.type}-02-after-kg`);
        console.log('    ✓ KG이니시스 선택 완료');

        // 4.3 결제 모듈 선택 (부분 텍스트 매칭)
        console.log(`  → ${channel.paymentModule} 모듈 선택...`);
        const moduleButton = page.locator(`text=${channel.paymentModule}`).first();
        await moduleButton.click();
        await page.waitForTimeout(2000);
        await saveScreenshot(page, `${channel.type}-03-after-module`);
        console.log(`    ✓ ${channel.paymentModule} 선택 완료`);

        // 다음 버튼 (있으면 클릭)
        try {
          const nextBtn = page.locator('button:has-text("다음")').first();
          if (await nextBtn.isVisible({ timeout: 1000 })) {
            await nextBtn.click();
            await page.waitForTimeout(2000);
            await saveScreenshot(page, `${channel.type}-04-after-next`);
          }
        } catch (e) {
          // 다음 버튼 없음
        }

        // 4.4 폼 필드 입력
        console.log('  → 채널 정보 입력...');
        await page.waitForTimeout(2000);
        
        // 모든 input 필드 확인
        console.log('    → 페이지의 모든 입력 필드 분석 중...');
        const allInputs = await page.locator('input[type="text"], input:not([type])').all();
        console.log(`    → 총 ${allInputs.length}개의 텍스트 입력 필드 발견`);

        // 채널 이름 (다양한 셀렉터 시도)
        const nameSelectors = [
          'input[name="channelName"]',
          'input[name="name"]',
          'input[placeholder*="채널"]',
          'input[placeholder*="이름"]',
        ];
        await fillAndVerify(page, nameSelectors, channel.name, '채널 이름');

        // MID
        const midSelectors = [
          'input[name="mid"]',
          'input[name="merchantId"]',
          'input[name="storeId"]',
          'input[placeholder*="MID"]',
          'input[placeholder*="상점"]',
          'input[placeholder*="가맹점"]',
        ];
        await fillAndVerify(page, midSelectors, channel.mid, 'MID');

        // SignKey
        const signKeySelectors = [
          'input[name="signKey"]',
          'input[name="apiKey"]',
          'input[name="key"]',
          'input[placeholder*="Sign"]',
          'input[placeholder*="사인"]',
          'input[placeholder*="키"]',
        ];
        await fillAndVerify(page, signKeySelectors, channel.signKey, 'SignKey');

        await page.waitForTimeout(2000);
        await saveScreenshot(page, `${channel.type}-05-after-input`);

        // 4.5 저장 버튼 상태 확인
        console.log('  → 저장 버튼 상태 확인...');
        const saveButton = page.locator('button:has-text("저장")').first();
        
        const isDisabled = await saveButton.getAttribute('disabled');
        const buttonText = await saveButton.textContent();
        console.log(`    → 버튼 텍스트: "${buttonText}"`);
        console.log(`    → Disabled 속성: ${isDisabled}`);

        if (isDisabled !== null) {
          console.log('    ⚠️  저장 버튼이 여전히 비활성화 상태입니다.');
          console.log('    → 필수 필드가 누락되었거나 유효성 검사 실패');
          await saveScreenshot(page, `${channel.type}-ERROR-disabled`);
          
          // 페이지 HTML 덤프
          const html = await page.content();
          fs.writeFileSync(`debug-${channel.type}-form.html`, html);
          console.log(`    → 페이지 HTML 저장: debug-${channel.type}-form.html`);
          
          console.log('\n    ⚠️  수동 개입 필요 - 브라우저를 60초간 열어둡니다.');
          console.log('    → 수동으로 필드를 확인하고 저장해주세요.');
          await page.waitForTimeout(60000);
          
        } else {
          console.log('    ✓ 저장 버튼 활성화됨!');
          await saveButton.click();
          await page.waitForTimeout(5000);
          await saveScreenshot(page, `${channel.type}-06-after-save`);
          console.log('    ✓ 저장 완료');

          // channelKey 추출
          try {
            await page.waitForTimeout(2000);
            const channelKeySelectors = [
              '[data-testid="channel-key"]',
              'code',
              '.channel-key',
              'text=channel-key-',
            ];

            let channelKey = null;
            for (const selector of channelKeySelectors) {
              try {
                const el = page.locator(selector).first();
                if (await el.isVisible({ timeout: 2000 })) {
                  channelKey = await el.textContent();
                  break;
                }
              } catch (e) {
                continue;
              }
            }

            if (channelKey) {
              channelKey = channelKey.trim();
              console.log(`    ✓ Channel Key: ${channelKey}`);
              createdChannels.push({
                name: channel.name,
                type: channel.type,
                channelKey,
              });
            } else {
              console.log('    ⚠️  Channel Key 자동 추출 실패 (수동 확인 필요)');
              createdChannels.push({
                name: channel.name,
                type: channel.type,
                channelKey: null,
              });
            }
          } catch (e) {
            console.log('    ⚠️  Channel Key 추출 중 오류');
          }
        }

        // 목록으로 돌아가기
        await page.goto('https://admin.portone.io/integration-v2/manage/channel', {
          waitUntil: 'networkidle',
        });
        await page.waitForTimeout(2000);

      } catch (error) {
        console.error(`\n  ❌ 채널 "${channel.name}" 생성 실패:`, error.message);
        await saveScreenshot(page, `${channel.type}-ERROR`);
      }
    }

    // 결과 출력
    console.log('\n\n' + '='.repeat(60));
    console.log('✅ 자동화 완료!\n');
    
    if (createdChannels.length > 0) {
      console.log('생성된 채널:\n');
      createdChannels.forEach((ch) => {
        console.log(`📌 ${ch.name} (${ch.type})`);
        if (ch.channelKey) {
          console.log(`   Channel Key: ${ch.channelKey}\n`);
        } else {
          console.log(`   Channel Key: ⚠️  수동 확인 필요\n`);
        }
      });

      console.log('='.repeat(60));
      console.log('\n🎯 다음 단계:\n');
      
      const onetimeChannel = createdChannels.find(ch => ch.type === 'onetime');
      const billingChannel = createdChannels.find(ch => ch.type === 'billing');
      
      if (onetimeChannel?.channelKey || billingChannel?.channelKey) {
        console.log('.env.local에 추가할 내용:\n');
        if (onetimeChannel?.channelKey) {
          console.log(`PORTONE_CHANNEL_KEY_ONETIME=${onetimeChannel.channelKey}`);
        }
        if (billingChannel?.channelKey) {
          console.log(`PORTONE_CHANNEL_KEY_BILLING=${billingChannel.channelKey}`);
        }
        console.log('');
      }
    }

    console.log('브라우저를 30초 후에 닫습니다...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ 치명적 오류:', error.message);
    await saveScreenshot(page, 'FATAL-ERROR');
  } finally {
    await browser.close();
  }
}

createPortOneChannels().catch(console.error);
