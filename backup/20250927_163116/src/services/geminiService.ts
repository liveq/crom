/**
 * Gemini API를 사용한 컨텐츠 모더레이션 서비스
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface ModerationResult {
  isAppropriate: boolean;
  reason?: string;
  moderatedContent?: string;
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key not configured');
    return { isAppropriate: true };
  }

  const prompt = `
    다음 추모 메시지를 검토해주세요.

    1. 욕설, 비속어, 부적절한 표현이 있는지 확인
    2. 광고, 스팸, 정치적 선동 내용이 있는지 확인
    3. 고인을 모독하거나 유족을 비방하는 내용이 있는지 확인

    메시지: "${content}"

    JSON 형식으로 응답해주세요:
    {
      "isAppropriate": true/false,
      "reason": "부적절한 경우 이유",
      "moderatedContent": "순화된 내용 (부적절한 부분만 ***로 처리)"
    }
  `;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 200,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const resultText = data.candidates[0]?.content?.parts[0]?.text || '{}';

    // JSON 부분만 추출
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Failed to parse Gemini response');
      return { isAppropriate: true };
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      isAppropriate: result.isAppropriate ?? true,
      reason: result.reason,
      moderatedContent: result.moderatedContent || content
    };

  } catch (error) {
    console.error('Content moderation error:', error);
    // 에러 발생 시 일단 통과시킴 (나중에 관리자가 검토)
    return { isAppropriate: true };
  }
}

// 간단한 필터링 (Gemini API 호출 전 사전 검사)
const bannedWords = [
  '시발', '씨발', '개새끼', '좆', '병신', '지랄', '미친놈', '미친년',
  '광고', '카지노', '도박', '대출', '성인', '야동', 'http://', 'https://',
  '정치', '선거', '후보'
];

export function quickFilter(content: string): boolean {
  const lowerContent = content.toLowerCase();
  for (const word of bannedWords) {
    if (lowerContent.includes(word)) {
      return false;
    }
  }
  return true;
}

export default {
  moderateContent,
  quickFilter
};