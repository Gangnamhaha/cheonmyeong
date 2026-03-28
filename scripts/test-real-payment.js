/**
 * 실제 결제 플로우 테스트
 * 회원가입 → 로그인 → 결제 페이지 → 결제 진행
 */

const { chromium } = require('playwright');

async function testPayment() {
  console.log('💳 실제 결제 플로우 테스트 시작\n');
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 800,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();

  try {
    // 테스트용 계정 정보
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testPassword = 'test123456';
    const testName = '결제테스트';

    console.log(`\n📝 Step 1: 회원가입`);
    console.log(`  이메일: ${testEmail}`);
    console.log(`  비밀번호: ${testPassword}`);
    console.log(`  이름: ${testName}`);

    await page.goto('https://sajuhae.vercel.app/signup', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 회원가입 폼 입력
    await page.locator('input[type="text"]').first().fill(testName);
    await page.locator('input[type="email"]').first().fill(testEmail);
    
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill(testPassword);
    await passwordInputs[1].fill(testPassword);

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'test-payment-01-signup.png', fullPage: true });

    // 회원가입 버튼 클릭
    await page.locator('button[type="submit"]').first().click();
    console.log('  → 회원가입 요청 전송...');
    
    await page.waitForTimeout(5000);
    console.log('  ✓ 회원가입 완료 (자동 로그인 중...)');

    // 로그인 완료 대기
    await page.waitForURL('https://sajuhae.vercel.app/', { timeout: 10000 });
    await page.waitForTimeout(3000);
    console.log('  ✓ 자동 로그인 완료');

    await page.screenshot({ path: 'test-payment-02-logged-in.png', fullPage: true });

    // Step 2: 결제 페이지 이동
    console.log(`\n📝 Step 2: 결제 페이지 이동`);
    await page.goto('https://sajuhae.vercel.app/pricing', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    console.log('  ✓ 결제 페이지 로드 완료');

    await page.screenshot({ path: 'test-payment-03-pricing.png', fullPage: true });

    // Step 3: 소액 결제 선택 (5 이용권 - 10,000원)
    console.log(`\n📝 Step 3: 결제 상품 선택`);
    console.log('  → 5 이용권 (10,000원) 선택...');

    // "구매하기" 또는 "결제하기" 버튼 찾기
    const purchaseButtonSelectors = [
      'button:has-text("구매")',
      'button:has-text("결제")',
      'button:has-text("선택")',
    ];

    let clicked = false;
    for (const selector of purchaseButtonSelectors) {
      try {
        const buttons = await page.locator(selector).all();
        if (buttons.length > 0) {
          // 첫 번째 버튼 클릭 (보통 가장 저렴한 상품)
          await buttons[0].click();
          console.log(`  ✓ 결제 버튼 클릭 완료`);
          clicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!clicked) {
      console.log('  ⚠️  결제 버튼을 찾지 못했습니다. 수동으로 선택해주세요.');
    }

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-payment-04-payment-modal.png', fullPage: true });

    // Step 4: PortOne 결제창 대기
    console.log(`\n📝 Step 4: PortOne 결제창 확인`);
    await page.waitForTimeout(2000);

    // 새 창이나 iframe으로 결제창이 열릴 수 있음
    console.log('  → PortOne 결제창이 열렸는지 확인 중...');
    
    const frames = page.frames();
    console.log(`  → 총 ${frames.length}개의 프레임 감지됨`);

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'test-payment-05-portone-widget.png', fullPage: true });

    // Step 5: 사용자 확인 대기
    console.log(`\n📝 Step 5: 결제 정보 입력 대기`);
    console.log('\n' + '='.repeat(60));
    console.log('⚠️  중요: 이제 수동으로 진행해주세요!\n');
    console.log('다음 단계:');
    console.log('1. 브라우저에서 결제 정보를 입력하세요');
    console.log('2. KG이니시스 결제를 완료하세요');
    console.log('3. 결제 완료 후 화면을 확인하세요');
    console.log('\n⏰ 5분 후 자동으로 결과를 확인합니다...');
    console.log('(결제를 진행하지 않으면 Ctrl+C로 종료하세요)');
    console.log('='.repeat(60) + '\n');

    // 5분 대기 (사용자가 결제 완료할 시간)
    await page.waitForTimeout(300000); // 5분

    // Step 6: 결제 완료 후 확인
    console.log(`\n📝 Step 6: 결제 결과 확인`);

    try {
      await page.goto('https://sajuhae.vercel.app/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);

      await page.screenshot({ path: 'test-payment-06-after-payment.png', fullPage: true });

      // 크레딧 표시 확인
      const creditText = await page.locator('text=/이용권|크레딧|credit/i').first().textContent({ timeout: 5000 }).catch(() => null);
      
      if (creditText) {
        console.log(`  ✓ 이용권 표시 확인: ${creditText}`);
        console.log('\n✅ 결제 테스트 완료!');
      } else {
        console.log('  ⚠️  이용권 표시를 찾지 못했습니다.');
        console.log('  → 수동으로 확인해주세요.');
      }

    } catch (error) {
      console.log(`  ⚠️  결과 확인 중 오류: ${error.message}`);
    }

    console.log('\n\n' + '='.repeat(60));
    console.log('📊 테스트 결과\n');
    console.log('스크린샷 저장 위치:');
    console.log('  - test-payment-01-signup.png (회원가입)');
    console.log('  - test-payment-02-logged-in.png (로그인 완료)');
    console.log('  - test-payment-03-pricing.png (결제 페이지)');
    console.log('  - test-payment-04-payment-modal.png (결제 모달)');
    console.log('  - test-payment-05-portone-widget.png (PortOne 위젯)');
    console.log('  - test-payment-06-after-payment.png (결제 후)');
    console.log('\n다음을 확인하세요:');
    console.log('1. 결제가 성공적으로 완료되었는지');
    console.log('2. 이용권이 정상적으로 증가했는지');
    console.log('3. 영수증 이메일이 발송되었는지');
    console.log('='.repeat(60));

    console.log('\n브라우저를 30초 후에 닫습니다...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ 테스트 중 오류 발생:', error.message);
    await page.screenshot({ path: 'test-payment-ERROR.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

testPayment().catch(console.error);
