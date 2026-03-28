/**
 * Gmail 단순 오픈 - 브라우저만 열고 충분히 대기
 */

const { chromium } = require('playwright');

async function simpleGmailOpen() {
  console.log('📧 Gmail 브라우저 열기\n');
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300,
    args: ['--start-maximized'],
  });

  const context = await browser.newContext({
    viewport: null,
  });
  
  const page = await context.newPage();

  try {
    console.log('✅ 브라우저가 열렸습니다!');
    console.log('\nGmail로 이동 중...');
    
    await page.goto('https://mail.google.com', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    console.log('\n' + '='.repeat(60));
    console.log('👤 사용자 작업');
    console.log('='.repeat(60));
    console.log('\n1. 이 브라우저에서 Gmail 로그인하세요');
    console.log('2. "NHN KCP" 또는 "바로오픈" 검색하세요');
    console.log('3. 해당 이메일을 열어주세요');
    console.log('\n⏰ 브라우저를 15분간 열어둡니다.');
    console.log('(완료되면 아래로 스크롤하여 내용을 확인하세요)');
    console.log('\n' + '='.repeat(60) + '\n');

    // 15분 대기 - 1분마다 체크
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(60000); // 1분
      console.log(`  ⏰ ${i + 1}분 경과...`);
      
      // 로그인 확인 (차단되지 않도록)
      try {
        const url = page.url();
        if (url.includes('mail.google.com/mail/u/')) {
          console.log('  ✓ 로그인된 것 같습니다!');
        }
      } catch (e) {
        // 무시
      }
    }

    console.log('\n⏰ 15분이 경과했습니다.');
    console.log('\n이제 이메일 내용을 자동으로 추출 시도합니다...\n');

    // 이메일 내용 추출 시도
    const bodySelectors = [
      'div.a3s',
      'div[role="main"]',
      'div.ii.gt',
      'table[role="presentation"]',
    ];

    let content = null;
    for (const selector of bodySelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          const text = await element.textContent({ timeout: 3000 });
          if (text && text.trim().length > 50) {
            content = text;
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (content) {
      const cleaned = content.trim();
      console.log('='.repeat(60));
      console.log('✅ 이메일 내용 추출 성공!');
      console.log('='.repeat(60) + '\n');
      console.log(cleaned.substring(0, 500) + '...\n');
      
      const fs = require('fs');
      fs.writeFileSync('nhn-kcp-email.txt', cleaned, 'utf-8');
      console.log('✅ 저장 완료: nhn-kcp-email.txt');
    } else {
      console.log('⚠️  자동 추출 실패');
      console.log('\n수동으로 복사해주세요:');
      console.log('1. 이메일 내용 전체 선택 (Ctrl+A)');
      console.log('2. 복사 (Ctrl+C)');
      console.log('3. 채팅에 붙여넣기 (Ctrl+V)');
    }

    await page.screenshot({ path: 'gmail-current-screen.png', fullPage: true });
    console.log('\n스크린샷 저장: gmail-current-screen.png');

    console.log('\n브라우저를 2분 후 닫습니다...');
    await page.waitForTimeout(120000);

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
    console.log('\n브라우저를 2분간 더 열어둡니다...');
    await page.waitForTimeout(120000);
  } finally {
    await browser.close();
    console.log('\n✅ 브라우저를 닫았습니다.');
  }
}

simpleGmailOpen().catch(console.error);
