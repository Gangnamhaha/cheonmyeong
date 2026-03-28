/**
 * PortOne 웹훅 자동 설정 스크립트
 */

const { chromium } = require('playwright');

const PORTONE_EMAIL = 'any001004@gmail.com';
const PORTONE_PASSWORD = 'Aa5119446@';
const WEBHOOK_URL = 'https://sajuhae.vercel.app/api/portone/webhook';

async function setupWebhook() {
  console.log('🔔 PortOne 웹훅 설정 시작...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 로그인
    console.log('📝 Step 1: 로그인 중...');
    await page.goto('https://admin.portone.io', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    await page.locator('input[type="email"]').first().fill(PORTONE_EMAIL);
    await page.locator('input[type="password"]').first().fill(PORTONE_PASSWORD);
    await page.locator('button[type="submit"]').first().click();
    await page.waitForTimeout(5000);
    console.log('  ✓ 로그인 완료\n');

    // 2. 웹훅 관리 페이지로 이동
    console.log('📝 Step 2: 웹훅 관리 페이지 이동...');
    await page.goto('https://admin.portone.io/integration-v2/info/webhook', {
      waitUntil: 'networkidle',
    });
    await page.waitForTimeout(3000);
    console.log('  ✓ 웹훅 페이지 로드 완료\n');

    // 3. 실연동 모드로 변경
    console.log('📝 Step 3: 실연동 모드 변경...');
    try {
      const liveButton = page.locator('text=실연동').first();
      await liveButton.click();
      await page.waitForTimeout(2000);
      console.log('  ✓ 실연동 모드 활성화\n');
    } catch (e) {
      console.log('  ⚠️  실연동 모드 버튼 찾기 실패 (이미 실연동일 수 있음)\n');
    }

    await page.screenshot({ path: 'webhook-01-page.png', fullPage: true });

    // 4. 웹훅 URL 입력
    console.log('📝 Step 4: 웹훅 URL 설정...');

    // URL 입력 필드 찾기
    const urlInputSelectors = [
      'input[type="url"]',
      'input[name="url"]',
      'input[placeholder*="URL"]',
      'input[placeholder*="url"]',
      'input[placeholder*="웹훅"]',
      'input[placeholder*="endpoint"]',
    ];

    let urlInput = null;
    for (const selector of urlInputSelectors) {
      try {
        urlInput = page.locator(selector).first();
        if (await urlInput.isVisible({ timeout: 2000 })) {
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (urlInput) {
      await urlInput.fill(WEBHOOK_URL);
      console.log(`  ✓ 웹훅 URL 입력: ${WEBHOOK_URL}`);
    } else {
      console.log('  ⚠️  웹훅 URL 입력 필드를 찾을 수 없습니다.');
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'webhook-02-url-entered.png', fullPage: true });

    // 5. 이벤트 선택 (모두 체크)
    console.log('  → 이벤트 선택 중...');
    
    const eventCheckboxes = await page.locator('input[type="checkbox"]').all();
    console.log(`  → ${eventCheckboxes.length}개의 체크박스 발견`);

    for (const checkbox of eventCheckboxes) {
      try {
        if (!(await checkbox.isChecked())) {
          await checkbox.check();
        }
      } catch (e) {
        // 체크 실패 시 무시
      }
    }
    console.log('  ✓ 모든 이벤트 선택 완료');

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'webhook-03-events-checked.png', fullPage: true });

    // 6. 저장
    console.log('  → 저장 중...');
    const saveButtonSelectors = [
      'button:has-text("저장")',
      'button:has-text("Save")',
      'button[type="submit"]',
    ];

    let saved = false;
    for (const selector of saveButtonSelectors) {
      try {
        const saveButton = page.locator(selector).first();
        if (await saveButton.isVisible({ timeout: 2000 })) {
          await saveButton.click();
          await page.waitForTimeout(3000);
          console.log('  ✓ 저장 버튼 클릭 완료');
          saved = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!saved) {
      console.log('  ⚠️  저장 버튼을 찾을 수 없습니다. 수동으로 저장해주세요.');
    }

    await page.screenshot({ path: 'webhook-04-saved.png', fullPage: true });

    console.log('\n✅ 웹훅 설정 완료!\n');
    console.log('='.repeat(60));
    console.log('\n설정된 웹훅:');
    console.log(`  URL: ${WEBHOOK_URL}`);
    console.log('  이벤트: 모두 선택됨');
    console.log('\n스크린샷:');
    console.log('  - webhook-01-page.png (초기 페이지)');
    console.log('  - webhook-02-url-entered.png (URL 입력 후)');
    console.log('  - webhook-03-events-checked.png (이벤트 선택 후)');
    console.log('  - webhook-04-saved.png (저장 후)');
    console.log('\n브라우저를 30초 후에 닫습니다...');

    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ 웹훅 설정 실패:', error.message);
    await page.screenshot({ path: 'webhook-ERROR.png', fullPage: true });
    console.log('\n수동으로 설정해주세요:');
    console.log('1. https://admin.portone.io/integration-v2/info/webhook');
    console.log('2. 실연동 모드 선택');
    console.log(`3. 웹훅 URL: ${WEBHOOK_URL}`);
    console.log('4. 모든 이벤트 체크');
    console.log('5. 저장');
  } finally {
    await browser.close();
  }
}

setupWebhook().catch(console.error);
