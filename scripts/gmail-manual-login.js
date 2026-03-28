/**
 * Gmail 수동 로그인 후 이메일 읽기
 * 사용자가 직접 로그인하면 자동으로 이메일을 읽습니다
 */

const { chromium } = require('playwright');

async function readGmailWithManualLogin() {
  console.log('📧 Gmail 이메일 읽기 (수동 로그인)\n');
  console.log('='.repeat(60));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  
  const page = await context.newPage();

  try {
    console.log('Step 1: Gmail 접속...');
    await page.goto('https://mail.google.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('\n' + '='.repeat(60));
    console.log('👤 사용자 작업 필요\n');
    console.log('열린 브라우저에서:');
    console.log('1. Gmail 로그인을 완료해주세요');
    console.log('2. 로그인이 완료되면 자동으로 이메일을 검색합니다');
    console.log('\n⏰ 5분간 대기합니다...');
    console.log('='.repeat(60) + '\n');

    // 5분 대기 (사용자가 로그인할 시간)
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(5000);
      
      const currentUrl = page.url();
      
      // 로그인 완료 확인
      if (currentUrl.includes('mail.google.com/mail')) {
        console.log('✅ 로그인 완료 감지!\n');
        break;
      }
      
      if (i % 6 === 0) {
        console.log(`  ⏰ 대기 중... (${Math.floor(i / 12 * 5)}분 경과)`);
      }
    }

    const currentUrl = page.url();
    
    if (!currentUrl.includes('mail.google.com/mail')) {
      console.log('\n⚠️  로그인이 완료되지 않았습니다.');
      console.log('브라우저를 1분간 더 열어둡니다...');
      await page.waitForTimeout(60000);
      await browser.close();
      return;
    }

    // 로그인 성공 - 이메일 검색
    console.log('Step 2: NHN KCP 이메일 검색...');
    await page.waitForTimeout(3000);

    // 검색창 찾기 및 검색
    const searchSelectors = [
      'input[aria-label*="검색"]',
      'input[placeholder*="검색"]',
      'input[name="q"]',
      'input[type="text"][aria-label]',
    ];

    let searched = false;
    for (const selector of searchSelectors) {
      try {
        const searchBox = page.locator(selector).first();
        if (await searchBox.isVisible({ timeout: 2000 })) {
          await searchBox.click();
          await page.waitForTimeout(500);
          await searchBox.fill('NHN KCP 바로오픈');
          await searchBox.press('Enter');
          await page.waitForTimeout(4000);
          
          console.log('  ✓ 검색 완료: "NHN KCP 바로오픈"');
          searched = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!searched) {
      console.log('  ⚠️  검색창을 찾을 수 없습니다.');
      console.log('  → 수동으로 "NHN KCP" 또는 "바로오픈"을 검색해주세요.');
      console.log('\n브라우저를 5분간 열어둡니다...');
      await page.waitForTimeout(300000);
      await browser.close();
      return;
    }

    await page.screenshot({ path: 'gmail-search-results.png', fullPage: true });

    // 검색 결과 확인
    console.log('Step 3: 검색 결과 확인...');
    
    const emailSelectors = [
      'tr.zA',
      'tr[role="row"]',
      'div[role="row"]',
      'div[role="listitem"]',
    ];

    let emailClicked = false;
    for (const selector of emailSelectors) {
      try {
        const emails = await page.locator(selector).all();
        if (emails.length > 0) {
          console.log(`  → ${emails.length}개의 이메일 발견`);
          
          // 첫 번째 이메일 클릭
          await emails[0].click();
          await page.waitForTimeout(4000);
          
          console.log('  ✓ 이메일 열기 완료');
          emailClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!emailClicked) {
      console.log('  ⚠️  검색 결과가 없거나 클릭할 수 없습니다.');
      console.log('\n브라우저를 5분간 열어둡니다. 수동으로 확인해주세요...');
      await page.waitForTimeout(300000);
      await browser.close();
      return;
    }

    await page.screenshot({ path: 'gmail-email-opened.png', fullPage: true });

    // 이메일 내용 추출
    console.log('Step 4: 이메일 내용 추출...');
    await page.waitForTimeout(2000);

    const contentSelectors = [
      'div[role="main"]',
      'div.a3s',
      'div.ii',
      'div[data-message-id]',
    ];

    let content = null;
    for (const selector of contentSelectors) {
      try {
        const contentElement = page.locator(selector).first();
        if (await contentElement.isVisible({ timeout: 3000 })) {
          content = await contentElement.textContent({ timeout: 5000 });
          if (content && content.trim().length > 50) {
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (content) {
      console.log('\n' + '='.repeat(60));
      console.log('📧 NHN KCP 이메일 내용\n');
      console.log(content.trim());
      console.log('\n' + '='.repeat(60));
      
      // 파일로 저장
      const fs = require('fs');
      fs.writeFileSync('nhn-kcp-email.txt', content.trim(), 'utf-8');
      console.log('\n✅ 이메일 내용이 "nhn-kcp-email.txt" 파일로 저장되었습니다.');
      
      // 주요 정보 추출 시도
      console.log('\n🔍 주요 정보 추출 중...\n');
      
      const lines = content.split('\n');
      const keywords = ['사이트 코드', 'MID', '상점', 'Site Code', 'Key', '키', 'URL', '관리자'];
      
      console.log('중요 정보:');
      lines.forEach(line => {
        const trimmed = line.trim();
        if (keywords.some(kw => trimmed.includes(kw)) && trimmed.length < 200) {
          console.log(`  • ${trimmed}`);
        }
      });
      
    } else {
      console.log('  ⚠️  이메일 내용을 읽을 수 없습니다.');
    }

    console.log('\n\n브라우저를 2분간 열어둡니다. 내용을 확인해주세요...');
    await page.waitForTimeout(120000);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    await page.screenshot({ path: 'gmail-manual-ERROR.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

readGmailWithManualLogin().catch(console.error);
