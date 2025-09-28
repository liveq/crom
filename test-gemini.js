// Gemini API 테스트
const API_KEY = 'AIzaSyD99XzPgNCtjKTm2845dvEGD5WJE5qR3No';

async function testGemini() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const body = {
    contents: [{
      parts: [{
        text: "다음 텍스트에 욕설이나 부적절한 내용이 있는지 확인해주세요: '안녕하세요, 테스트입니다.' 답변은 JSON 형식으로 {\"hasInappropriate\": boolean, \"reason\": string} 형태로 해주세요."
      }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Gemini API 연결 성공!');
      console.log('응답:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Gemini API 오류:', data);
    }
  } catch (error) {
    console.error('❌ 네트워크 오류:', error);
  }
}

testGemini();