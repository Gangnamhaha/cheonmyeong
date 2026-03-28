/**
 * Gmail 최종 시도 - 긴 대기 시간 + 지속적 모니터링
 */

const { chromium } = require('playwright');

async function finalGmailAttempt() {
  console.log('📧 Gmail 최종 시도\n');
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
    console.log('📌 Step 1: Gmail 접속');
    await page.goto('https://mail.google.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log('\n' + '='.repeat(60));
    console.log('👤 사용자 작업 필요 (10분 대기)');
    console.log('='.repeat(60));
    console.log('\n이 브라우저에서 Gmail 로그인을 완료해주세요.');
    console.log('로그인 완료되면 자동으로 NHN KCP 이메일을 찾습니다.\n');
    console.log('⏰ 10분간 대기합니다...\n');

    let loginDetected = false;
    let checkCount = 0;
    const maxChecks = 120; // 10분 (5초 간격)

    // 로그인 감지 루프
    while (checkCount < maxChecks && !loginDetected) {
      await page.waitForTimeout(5000);
      checkCount++;

      try {
        const currentUrl = page.url();
        const pageTitle = await page.title().catch(() => '');

        // 로그인 완료 확인 (여러 조건)
        if (
          currentUrl.includes('mail.google.com/mail/u/') ||
          pageTitle.includes('받은편지함') ||
          pageTitle.includes('Inbox') ||
          (await page.locator('[role="navigation"]').count() > 0)
        ) {
          loginDetected = true;
          console.log('\n✅ 로그인 완료 감지!');
          break;
        }

        // 진행 상황 표시 (30초마다)
        if (checkCount % 6 === 0) {
          const elapsed = Math.floor(checkCount * 5 / 60);
          console.log(`  ⏰ ${elapsed}분 경과... (로그인 대기 중)`);
        }
      } catch (e) {
        // 계속 시도
      }
    }

    if (!loginDetected) {
      console.log('\n⚠️  10분 내에 로그인이 완료되지 않았습니다.');
      console.log('브라우저를 닫습니다...');
      await browser.close();
      return;
    }

    // 추가 안정화 대기
    await page.waitForTimeout(5000);

    console.log('\n📌 Step 2: NHN KCP 이메일 검색');
    
    // 검색창 찾기 (여러 시도)
    let searchSuccess = false;
    
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        console.log(`  시도 ${attempt + 1}/3...`);
        
        // 다양한 검색창 셀렉터
        const searchSelectors = [
          'input[aria-label="메일 검색"]',
          'input[aria-label="Search mail"]',
          'input[placeholder*="검색"]',
          'input[name="q"]',
          'input[type="text"]',
        ];

        for (const selector of searchSelectors) {
          try {
            const searchBox = page.locator(selector).first();
            if (await searchBox.isVisible({ timeout: 3000 })) {
              await searchBox.click({ timeout: 3000 });
              await page.waitForTimeout(1000);
              
              // 검색어 입력 (여러 검색어 시도)
              const searchTerms = ['NHN KCP', 'KCP', '바로오픈'];
              
              for (const term of searchTerms) {
                await searchBox.clear();
                await searchBox.fill(term);
                await page.waitForTimeout(500);
                await searchBox.press('Enter');
                await page.waitForTimeout(4000);
                
                console.log(`  ✓ 검색 완료: "${term}"`);
                searchSuccess = true;
                break;
              }
              
              if (searchSuccess) break;
            }
          } catch (e) {
            continue;
          }
        }
        
        if (searchSuccess) break;
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log(`  ⚠️  시도 ${attempt + 1} 실패`);
      }
    }

    if (!searchSuccess) {
      console.log('\n⚠️  검색창을 찾을 수 없습니다.');
      console.log('수동으로 "NHN KCP" 또는 "바로오픈"을 검색해주세요.');
      console.log('\n브라우저를 10분간 열어둡니다...');
      await page.waitForTimeout(600000);
      await browser.close();
      return;
    }

    await page.screenshot({ path: 'gmail-final-search.png', fullPage: true });

    console.log('\n📌 Step 3: 이메일 열기');

    // 검색 결과에서 이메일 찾기
    await page.waitForTimeout(3000);

    const emailSelectors = [
      'tr.zA',
      'div[role="row"]',
      'tr[role="row"]',
      'div[data-message-id]',
    ];

    let emailOpened = false;
    
    for (const selector of emailSelectors) {
      try {
        const emails = await page.locator(selector).all();
        console.log(`  → ${emails.length}개 이메일 발견 (${selector})`);
        
        if (emails.length > 0) {
          await emails[0].click({ timeout: 5000 });
          await page.waitForTimeout(5000);
          console.log('  ✓ 첫 번째 이메일 열기 완료');
          emailOpened = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!emailOpened) {
      console.log('\n⚠️  검색 결과가 없거나 이메일을 열 수 없습니다.');
      console.log('수동으로 이메일을 클릭해주세요.');
      console.log('\n브라우저를 10분간 열어둡니다...');
      await page.waitForTimeout(600000);
      await browser.close();
      return;
    }

    await page.screenshot({ path: 'gmail-final-opened.png', fullPage: true });

    console.log('\n📌 Step 4: 이메일 내용 읽기');
    await page.waitForTimeout(3000);

    // 이메일 본문 추출
    const bodySelectors = [
      'div.a3s',
      'div[role="main"]',
      'div.ii.gt',
      'div[data-message-id] div',
      'table[role="presentation"]',
    ];

    let emailContent = null;

    for (const selector of bodySelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 3000 })) {
          const text = await element.textContent({ timeout: 5000 });
          if (text && text.trim().length > 100) {
            emailContent = text;
            console.log(`  ✓ 내용 추출 완료 (${selector})`);
            break;
          }
        }
      } catch (e) {
        continue;
      }
    }

    if (emailContent) {
      const cleaned = emailContent.trim();
      
      console.log('\n' + '='.repeat(60));
      console.log('📧 NHN KCP 이메일 내용');
      console.log('='.repeat(60) + '\n');
      console.log(cleaned);
      console.log('\n' + '='.repeat(60));

      // 파일 저장
      const fs = require('fs');
      fs.writeFileSync('nhn-kcp-email-content.txt', cleaned, 'utf-8');
      console.log('\n✅ 파일로 저장: nhn-kcp-email-content.txt');

      // 주요 정보 추출
      console.log('\n🔍 주요 정보 추출:\n');
      
      const keywords = [
        '사이트 코드', 'Site Code', 'site_code',
        'MID', '상점아이디', '가맹점',
        'Key', '키', 'SignKey', 'key',
        'URL', '주소', 'admin',
        '비밀번호', 'password',
      ];

      const lines = cleaned.split('\n');
      const important = [];
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.length > 5 && trimmed.length < 200) {
          if (keywords.some(kw => trimmed.toLowerCase().includes(kw.toLowerCase()))) {
            important.push(trimmed);
          }
        }
      });

      if (important.length > 0) {
        important.forEach(line => {
          console.log(`  • ${line}`);
        });
      } else {
        console.log('  (자동 추출 실패 - 전체 내용 확인 필요)');
      }

    } else {
      console.log('\n⚠️  이메일 내용을 읽을 수 없습니다.');
      console.log('스크린샷을 확인하거나 수동으로 복사해주세요.');
    }

    console.log('\n\n브라우저를 3분간 열어둡니다. 내용을 확인하세요...');
    await page.waitForTimeout(180000);

  } catch (error) {
    console.error('\n❌ 오류:', error.message);
    await page.screenshot({ path: 'gmail-final-error.png', fullPage: true });
    console.log('\n브라우저를 3분간 열어둡니다...');
    await page.waitForTimeout(180000);
  } finally {
    await browser.close();
    console.log('\n브라우저를 닫았습니다.');
  }
}

finalGmailAttempt().catch(console.error);
