/**
 * Gmail 접근 시도 (실패 가능성 높음)
 */

const { chromium } = require('playwright');

async function accessGmail() {
  console.log('📧 Gmail 접근 시도...\n');
  console.log('⚠️  경고: Gmail의 보안 때문에 실패할 가능성이 매우 높습니다.\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();

  try {
    console.log('Step 1: Gmail 로그인 페이지 접속...');
    await page.goto('https://mail.google.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'gmail-01-login-page.png', fullPage: true });

    // 이메일 입력
    console.log('Step 2: 이메일 입력...');
    const emailInput = page.locator('input[type="email"]').first();
    
    if (await emailInput.isVisible({ timeout: 5000 })) {
      await emailInput.fill('any001004@gmail.com');
      await page.waitForTimeout(1000);
      
      // 다음 버튼
      const nextButton = page.locator('button:has-text("다음"), button:has-text("Next")').first();
      await nextButton.click();
      await page.waitForTimeout(3000);
      
      console.log('  ✓ 이메일 입력 완료');
    } else {
      console.log('  ⚠️  이메일 입력 필드를 찾을 수 없습니다.');
    }

    await page.screenshot({ path: 'gmail-02-after-email.png', fullPage: true });

    // 비밀번호 입력
    console.log('Step 3: 비밀번호 입력...');
    const passwordInput = page.locator('input[type="password"]').first();
    
    if (await passwordInput.isVisible({ timeout: 5000 })) {
      await passwordInput.fill('chkim1004');
      await page.waitForTimeout(1000);
      
      // 다음 버튼
      const nextButton = page.locator('button:has-text("다음"), button:has-text("Next")').first();
      await nextButton.click();
      await page.waitForTimeout(5000);
      
      console.log('  ✓ 비밀번호 입력 완료');
    } else {
      console.log('  ⚠️  비밀번호 입력 필드를 찾을 수 없습니다.');
    }

    await page.screenshot({ path: 'gmail-03-after-password.png', fullPage: true });

    // 로그인 결과 확인
    console.log('Step 4: 로그인 결과 확인...');
    await page.waitForTimeout(5000);

    const currentUrl = page.url();
    
    if (currentUrl.includes('mail.google.com/mail')) {
      console.log('  ✅ 로그인 성공!');
      
      // NHN KCP 이메일 검색
      console.log('\nStep 5: NHN KCP 이메일 검색...');
      
      // 검색창 찾기
      const searchBox = page.locator('input[aria-label*="검색"], input[placeholder*="검색"]').first();
      
      if (await searchBox.isVisible({ timeout: 5000 })) {
        await searchBox.fill('NHN KCP 바로오픈');
        await searchBox.press('Enter');
        await page.waitForTimeout(3000);
        
        console.log('  ✓ 검색 완료');
        await page.screenshot({ path: 'gmail-04-search-results.png', fullPage: true });
        
        // 첫 번째 이메일 클릭
        const firstEmail = page.locator('tr.zA, div[role="listitem"]').first();
        if (await firstEmail.isVisible({ timeout: 3000 })) {
          await firstEmail.click();
          await page.waitForTimeout(3000);
          
          console.log('  ✓ 이메일 열기 완료');
          await page.screenshot({ path: 'gmail-05-email-content.png', fullPage: true });
          
          // 이메일 내용 추출
          const emailBody = page.locator('div[role="main"], div.a3s').first();
          const content = await emailBody.textContent({ timeout: 5000 }).catch(() => null);
          
          if (content) {
            console.log('\n' + '='.repeat(60));
            console.log('📧 이메일 내용:\n');
            console.log(content);
            console.log('='.repeat(60));
          } else {
            console.log('  ⚠️  이메일 내용을 읽을 수 없습니다.');
          }
        } else {
          console.log('  ⚠️  검색 결과가 없습니다.');
        }
      } else {
        console.log('  ⚠️  검색창을 찾을 수 없습니다.');
      }
      
    } else {
      console.log('  ❌ 로그인 실패');
      console.log(`  현재 URL: ${currentUrl}`);
      
      // CAPTCHA 또는 2단계 인증 확인
      const pageContent = await page.content();
      
      if (pageContent.includes('captcha') || pageContent.includes('reCAPTCHA')) {
        console.log('  → CAPTCHA가 요구되었습니다. 자동화 불가능합니다.');
      } else if (pageContent.includes('2단계') || pageContent.includes('확인 코드')) {
        console.log('  → 2단계 인증이 요구되었습니다. 자동화 불가능합니다.');
      } else {
        console.log('  → 알 수 없는 이유로 로그인 실패했습니다.');
      }
    }

    console.log('\n브라우저를 2분간 열어둡니다. 수동으로 확인해주세요...');
    await page.waitForTimeout(120000);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    await page.screenshot({ path: 'gmail-ERROR.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

accessGmail().catch(console.error);
