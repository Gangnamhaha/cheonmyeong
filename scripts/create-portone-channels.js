/**
 * PortOne KG이니시스 채널 자동 생성 스크립트
 * 
 * 실행 방법:
 * node scripts/create-portone-channels.js
 */

const { chromium } = require('playwright');

// 설정
const PORTONE_EMAIL = 'any001004@gmail.com';
const PORTONE_PASSWORD = 'Aa5119446@';

const CHANNELS = [
  {
    name: 'KG이니시스 일반결제',
    type: 'onetime',
    paymentModule: '일회성 결제',
    mid: 'MOI1061663',
    signKey: 'NkY1Q3oyRXJnOGZtZFdrMktTRzY2QT09',
  },
  {
    name: 'KG이니시스 정기결제',
    type: 'billing',
    paymentModule: '빌링키 결제',
    mid: 'MOIverce20',
    signKey: 'bW1aQ0tBdk54VzVyK0ZqOW1aejZQZz09',
  },
];

async function createPortOneChannels() {
  console.log('🚀 PortOne 채널 자동 생성 시작...\n');

  const browser = await chromium.launch({
    headless: false, // 브라우저 UI 표시 (디버깅용)
    slowMo: 500, // 각 동작 사이 500ms 딜레이
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. PortOne 로그인
    console.log('📝 Step 1: PortOne 로그인 중...');
    await page.goto('https://admin.portone.io', { waitUntil: 'networkidle' });

    // 로그인 폼 찾기 (여러 가능한 셀렉터 시도)
    await page.waitForTimeout(2000);
    
    // 이메일 입력
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="이메일"]',
      'input[placeholder*="email"]',
    ];
    
    let emailInput = null;
    for (const selector of emailSelectors) {
      try {
        emailInput = await page.locator(selector).first();
        if (await emailInput.isVisible({ timeout: 1000 })) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!emailInput) {
      throw new Error('이메일 입력 필드를 찾을 수 없습니다.');
    }

    await emailInput.fill(PORTONE_EMAIL);
    console.log('  ✓ 이메일 입력 완료');

    // 비밀번호 입력
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="비밀번호"]',
      'input[placeholder*="password"]',
    ];

    let passwordInput = null;
    for (const selector of passwordSelectors) {
      try {
        passwordInput = await page.locator(selector).first();
        if (await passwordInput.isVisible({ timeout: 1000 })) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!passwordInput) {
      throw new Error('비밀번호 입력 필드를 찾을 수 없습니다.');
    }

    await passwordInput.fill(PORTONE_PASSWORD);
    console.log('  ✓ 비밀번호 입력 완료');

    // 로그인 버튼 클릭
    const loginButtonSelectors = [
      'button[type="submit"]',
      'button:has-text("로그인")',
      'button:has-text("Login")',
      'button:has-text("Sign in")',
    ];

    let loginButton = null;
    for (const selector of loginButtonSelectors) {
      try {
        loginButton = page.locator(selector).first();
        if (await loginButton.isVisible({ timeout: 1000 })) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!loginButton) {
      throw new Error('로그인 버튼을 찾을 수 없습니다.');
    }

    await loginButton.click();
    console.log('  ✓ 로그인 버튼 클릭');

    // 로그인 완료 대기 (URL 변경 또는 대시보드 페이지)
    await page.waitForTimeout(5000);
    console.log('  ✓ 로그인 완료\n');

    // 2. 채널 관리 페이지로 이동
    console.log('📝 Step 2: 채널 관리 페이지 이동...');
    
    // URL로 직접 이동 (더 안정적)
    await page.goto('https://admin.portone.io/integration-v2/manage/channel', {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3000);
    console.log('  ✓ 채널 관리 페이지 로드 완료\n');

    // 3. 실연동 모드로 변경
    console.log('📝 Step 3: 실연동 모드로 변경...');
    
    // 모드 토글 찾기 (여러 가능성 시도)
    const modeSelectors = [
      'text=실연동',
      'button:has-text("실연동")',
      '[data-mode="LIVE"]',
      '[data-mode="PRODUCTION"]',
    ];

    for (const selector of modeSelectors) {
      try {
        const modeButton = page.locator(selector).first();
        if (await modeButton.isVisible({ timeout: 2000 })) {
          await modeButton.click();
          await page.waitForTimeout(2000);
          console.log('  ✓ 실연동 모드 활성화\n');
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 4. 각 채널 생성
    const createdChannels = [];

    for (let i = 0; i < CHANNELS.length; i++) {
      const channel = CHANNELS[i];
      console.log(`📝 Step ${4 + i}: "${channel.name}" 채널 생성 중...`);

      try {
        // 채널 추가 버튼 클릭
        const addButtonSelectors = [
          'button:has-text("채널 추가")',
          'button:has-text("추가")',
          'button:has-text("Create")',
          'button:has-text("Add")',
        ];

        let addButton = null;
        for (const selector of addButtonSelectors) {
          try {
            addButton = page.locator(selector).first();
            if (await addButton.isVisible({ timeout: 2000 })) {
              break;
            }
          } catch (e) {
            continue;
          }
        }

        if (!addButton) {
          console.log('  ⚠️  채널 추가 버튼을 찾을 수 없습니다. 수동으로 진행해주세요.');
          continue;
        }

        await addButton.click();
        await page.waitForTimeout(2000);
        console.log('  ✓ 채널 추가 버튼 클릭');

        // 결제대행사 선택: KG이니시스
        console.log('  → KG이니시스 선택 중...');
        const pgSelectors = [
          'text=KG이니시스',
          'button:has-text("KG이니시스")',
          '[data-pg="inicis"]',
        ];

        for (const selector of pgSelectors) {
          try {
            const pgOption = page.locator(selector).first();
            if (await pgOption.isVisible({ timeout: 2000 })) {
              await pgOption.click();
              await page.waitForTimeout(2000);
              console.log('  ✓ KG이니시스 선택 완료');
              break;
            }
          } catch (e) {
            continue;
          }
        }

        // 결제 모듈 선택
        console.log(`  → ${channel.paymentModule} 선택 중...`);
        const moduleSelectors = [
          `text=${channel.paymentModule}`,
          `button:has-text("${channel.paymentModule}")`,
        ];

        for (const selector of moduleSelectors) {
          try {
            const moduleOption = page.locator(selector).first();
            if (await moduleOption.isVisible({ timeout: 2000 })) {
              await moduleOption.click();
              await page.waitForTimeout(2000);
              console.log(`  ✓ ${channel.paymentModule} 선택 완료`);
              break;
            }
          } catch (e) {
            continue;
          }
        }

        // 다음 버튼 클릭 (있다면)
        try {
          const nextButton = page.locator('button:has-text("다음")').first();
          if (await nextButton.isVisible({ timeout: 2000 })) {
            await nextButton.click();
            await page.waitForTimeout(2000);
          }
        } catch (e) {
          // 다음 버튼이 없으면 무시
        }

        // 채널 정보 입력
        console.log('  → 채널 정보 입력 중...');

        // 채널 이름
        const nameInput = page.locator('input[name="channelName"], input[placeholder*="채널"]').first();
        if (await nameInput.isVisible({ timeout: 2000 })) {
          await nameInput.fill(channel.name);
          console.log(`  ✓ 채널 이름: ${channel.name}`);
        }

        // MID
        const midInput = page.locator('input[name="mid"], input[name="merchantId"], input[placeholder*="MID"]').first();
        if (await midInput.isVisible({ timeout: 2000 })) {
          await midInput.fill(channel.mid);
          console.log(`  ✓ MID: ${channel.mid}`);
        }

        // SignKey
        const signKeyInput = page.locator('input[name="signKey"], input[placeholder*="SignKey"], input[placeholder*="사인키"]').first();
        if (await signKeyInput.isVisible({ timeout: 2000 })) {
          await signKeyInput.fill(channel.signKey);
          console.log(`  ✓ SignKey: ${channel.signKey.substring(0, 10)}...`);
        }

        // 과세구분 (있다면)
        try {
          const taxSelect = page.locator('select[name="tax"], select[name="taxType"]').first();
          if (await taxSelect.isVisible({ timeout: 1000 })) {
            await taxSelect.selectOption({ label: '과세' });
            console.log('  ✓ 과세구분: 과세');
          }
        } catch (e) {
          // 과세구분 필드가 없으면 무시
        }

        // 저장 버튼 클릭
        console.log('  → 저장 중...');
        const saveButton = page.locator('button:has-text("저장"), button:has-text("Save"), button[type="submit"]').first();
        if (await saveButton.isVisible({ timeout: 2000 })) {
          await saveButton.click();
          await page.waitForTimeout(5000);
          console.log('  ✓ 저장 완료');
        }

        // channelKey 추출 시도
        try {
          const channelKeyElement = page.locator('[data-testid="channel-key"], .channel-key, code').first();
          if (await channelKeyElement.isVisible({ timeout: 3000 })) {
            const channelKey = await channelKeyElement.textContent();
            createdChannels.push({
              name: channel.name,
              type: channel.type,
              channelKey: channelKey.trim(),
            });
            console.log(`  ✓ Channel Key: ${channelKey.trim()}\n`);
          }
        } catch (e) {
          console.log('  ⚠️  Channel Key 자동 추출 실패 (수동 확인 필요)\n');
          createdChannels.push({
            name: channel.name,
            type: channel.type,
            channelKey: null,
          });
        }

        // 목록으로 돌아가기
        await page.goto('https://admin.portone.io/integration-v2/manage/channel', {
          waitUntil: 'networkidle',
        });
        await page.waitForTimeout(2000);

      } catch (error) {
        console.error(`  ❌ 채널 "${channel.name}" 생성 실패:`, error.message);
        console.log('  → 수동으로 생성해주세요.\n');
      }
    }

    // 결과 출력
    console.log('\n✅ 채널 생성 완료!\n');
    console.log('='.repeat(60));
    
    if (createdChannels.length > 0) {
      console.log('\n생성된 채널:\n');
      createdChannels.forEach((ch) => {
        console.log(`📌 ${ch.name} (${ch.type})`);
        if (ch.channelKey) {
          console.log(`   Channel Key: ${ch.channelKey}`);
        } else {
          console.log(`   Channel Key: ⚠️  수동 확인 필요`);
        }
        console.log('');
      });

      console.log('='.repeat(60));
      console.log('\n다음 단계:');
      console.log('1. 위 Channel Key를 .env.local에 추가하세요:');
      console.log('');
      
      const onetimeChannel = createdChannels.find(ch => ch.type === 'onetime');
      const billingChannel = createdChannels.find(ch => ch.type === 'billing');
      
      if (onetimeChannel && onetimeChannel.channelKey) {
        console.log(`PORTONE_CHANNEL_KEY_ONETIME=${onetimeChannel.channelKey}`);
      }
      if (billingChannel && billingChannel.channelKey) {
        console.log(`PORTONE_CHANNEL_KEY_BILLING=${billingChannel.channelKey}`);
      }
      console.log('');
    } else {
      console.log('\n⚠️  자동 생성 실패 - 수동으로 생성해주세요.\n');
    }

    console.log('브라우저를 30초 후에 자동으로 닫습니다...');
    console.log('(중단하려면 Ctrl+C)');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ 자동화 실패:', error.message);
    console.error(error.stack);
    console.log('\n스크린샷 저장 중...');
    await page.screenshot({ path: 'error-portone.png' });
    console.log('  → error-portone.png 저장 완료');
    
    console.log('\n수동으로 진행해주세요:');
    console.log('1. https://admin.portone.io 접속');
    console.log('2. [결제 연동] → [연동 관리] → [채널 관리]');
    console.log('3. 실연동 모드 선택');
    console.log('4. 채널 추가:');
    console.log('   - MOI1061663 (일반결제)');
    console.log('   - MOIverce20 (정기결제)');
  } finally {
    await browser.close();
  }
}

// 실행
createPortOneChannels().catch(console.error);
