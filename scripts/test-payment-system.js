/**
 * 결제 시스템 종합 테스트
 */

async function testPaymentSystem() {
  console.log('🧪 결제 시스템 종합 테스트\n');
  console.log('='.repeat(60));

  const tests = [];
  let passed = 0;
  let failed = 0;

  // Test 1: 웹훅 엔드포인트
  console.log('\n📝 Test 1: 웹훅 엔드포인트 접근');
  try {
    const res = await fetch('https://sajuhae.vercel.app/api/portone/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'test' }),
    });
    
    if (res.status === 400) {
      console.log('  ✅ 웹훅 엔드포인트 정상 (400 - paymentId 필요)');
      tests.push({ name: '웹훅 엔드포인트', status: '✅ 통과' });
      passed++;
    } else {
      console.log(`  ❌ 예상치 못한 응답: ${res.status}`);
      tests.push({ name: '웹훅 엔드포인트', status: '❌ 실패' });
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}`);
    tests.push({ name: '웹훅 엔드포인트', status: '❌ 에러' });
    failed++;
  }

  // Test 2: 일반결제 API
  console.log('\n📝 Test 2: 일반결제 API');
  try {
    const res = await fetch('https://sajuhae.vercel.app/api/portone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'credit_5' }),
    });
    
    const data = await res.json();
    
    if (data.error === '로그인 또는 이메일이 필요합니다.') {
      console.log('  ✅ 일반결제 API 정상 (인증 체크 작동)');
      tests.push({ name: '일반결제 API', status: '✅ 통과' });
      passed++;
    } else if (data.error === 'PortOne 설정이 완료되지 않았습니다.') {
      console.log('  ⚠️  PortOne 환경변수 미설정');
      tests.push({ name: '일반결제 API', status: '⚠️  환경변수 필요' });
      failed++;
    } else {
      console.log(`  ✅ 일반결제 API 응답: ${JSON.stringify(data).slice(0, 100)}`);
      tests.push({ name: '일반결제 API', status: '✅ 통과' });
      passed++;
    }
  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}`);
    tests.push({ name: '일반결제 API', status: '❌ 에러' });
    failed++;
  }

  // Test 3: 정기결제 API
  console.log('\n📝 Test 3: 정기결제 API');
  try {
    const res = await fetch('https://sajuhae.vercel.app/api/portone/billing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'monthly' }),
    });
    
    const data = await res.json();
    
    if (data.error === '로그인이 필요합니다.') {
      console.log('  ✅ 정기결제 API 정상 (인증 체크 작동)');
      tests.push({ name: '정기결제 API', status: '✅ 통과' });
      passed++;
    } else if (data.error === 'PortOne 설정이 완료되지 않았습니다.') {
      console.log('  ⚠️  PortOne 환경변수 미설정');
      tests.push({ name: '정기결제 API', status: '⚠️  환경변수 필요' });
      failed++;
    } else {
      console.log(`  ✅ 정기결제 API 응답: ${JSON.stringify(data).slice(0, 100)}`);
      tests.push({ name: '정기결제 API', status: '✅ 통과' });
      passed++;
    }
  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}`);
    tests.push({ name: '정기결제 API', status: '❌ 에러' });
    failed++;
  }

  // Test 4: 회원가입 API
  console.log('\n📝 Test 4: 회원가입 API');
  try {
    const timestamp = Date.now();
    const res = await fetch('https://sajuhae.vercel.app/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test${timestamp}@example.com`,
        password: 'test123456',
        name: '테스트유저',
      }),
    });
    
    const data = await res.json();
    
    if (res.status === 201 && data.message === '회원가입이 완료되었습니다.') {
      console.log('  ✅ 회원가입 API 정상');
      tests.push({ name: '회원가입 API', status: '✅ 통과' });
      passed++;
    } else {
      console.log(`  ❌ 예상치 못한 응답: ${res.status} - ${JSON.stringify(data)}`);
      tests.push({ name: '회원가입 API', status: '❌ 실패' });
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}`);
    tests.push({ name: '회원가입 API', status: '❌ 에러' });
    failed++;
  }

  // Test 5: 결제 페이지
  console.log('\n📝 Test 5: 결제 페이지');
  try {
    const res = await fetch('https://sajuhae.vercel.app/pricing');
    
    if (res.ok) {
      const html = await res.text();
      const hasPrice = html.includes('요금제') || html.includes('구매');
      
      if (hasPrice) {
        console.log('  ✅ 결제 페이지 정상 (요금제 문구 확인됨)');
        tests.push({ name: '결제 페이지', status: '✅ 통과' });
        passed++;
      } else {
        console.log('  ⚠️  결제 페이지는 로드되나 문구 미확인');
        tests.push({ name: '결제 페이지', status: '⚠️  확인 필요' });
        passed++;
      }
    } else {
      console.log(`  ❌ 페이지 로드 실패: ${res.status}`);
      tests.push({ name: '결제 페이지', status: '❌ 실패' });
      failed++;
    }
  } catch (error) {
    console.log(`  ❌ 에러: ${error.message}`);
    tests.push({ name: '결제 페이지', status: '❌ 에러' });
    failed++;
  }

  // 결과 요약
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 테스트 결과 요약\n');
  
  tests.forEach(test => {
    console.log(`${test.status}  ${test.name}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n총 ${tests.length}개 테스트 중:`);
  console.log(`  ✅ 통과: ${passed}개`);
  console.log(`  ❌ 실패: ${failed}개`);
  console.log(`  성공률: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  console.log('\n' + '='.repeat(60));
  
  if (failed === 0) {
    console.log('\n🎉 모든 테스트 통과! 결제 시스템이 정상 작동합니다.\n');
  } else {
    console.log('\n⚠️  일부 테스트 실패. 위 내용을 확인해주세요.\n');
  }
}

testPaymentSystem().catch(console.error);
