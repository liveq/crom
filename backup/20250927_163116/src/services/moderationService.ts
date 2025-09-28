/**
 * 콘텐츠 검토 서비스
 * Gemini API를 활용한 욕설 및 부적절한 내용 필터링
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export interface ModerationResult {
  isAppropriate: boolean;
  reason?: string;
  confidence: number;
}

/**
 * 텍스트 내용 검토
 */
export const moderateContent = async (text: string): Promise<ModerationResult> => {
  // API 키가 없으면 검토 건너뛰기
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API 키가 설정되지 않았습니다. 콘텐츠 검토를 건너뜁니다.');
    return {
      isAppropriate: true,
      confidence: 0
    };
  }

  try {
    const prompt = `
      다음 텍스트를 검토하여 추모 사이트에 적합한지 판단해주세요.
      욕설, 비속어, 혐오 표현, 광고, 스팸, 정치적 선동, 고인 모독 등이 포함되어 있는지 확인해주세요.

      텍스트: "${text}"

      응답은 반드시 다음 JSON 형식으로만 해주세요:
      {
        "isAppropriate": boolean,
        "reason": "부적절한 경우 그 이유",
        "confidence": 0.0-1.0 사이의 확신도
      }
    `;

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
          temperature: 0.2,
          maxOutputTokens: 200,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API 오류: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // JSON 파싱
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        isAppropriate: result.isAppropriate ?? true,
        reason: result.reason,
        confidence: result.confidence ?? 0.5
      };
    }

    // 파싱 실패시 기본값
    return {
      isAppropriate: true,
      confidence: 0
    };

  } catch (error) {
    console.error('콘텐츠 검토 실패:', error);
    // 에러 발생시 일단 통과 (나중에 관리자가 검토)
    return {
      isAppropriate: true,
      confidence: 0,
      reason: '자동 검토 실패 - 관리자 검토 필요'
    };
  }
};

/**
 * 간단한 클라이언트 사이드 필터 (빠른 검증용)
 */
export const quickFilter = (text: string): boolean => {
  // 금지어 목록 (기본적인 것들만)
  const bannedWords = [
    '시발', '씨발', '개새끼', '좆', '병신', '지랄', '미친',
    '광고', '홍보', '카지노', '도박', '대출', '투자',
    'http://', 'https://', 'www.', '.com', '.net', // URL 차단
    '010-', '011-', '016-', '017-', '018-', '019-' // 전화번호 차단
  ];

  const lowerText = text.toLowerCase();
  return !bannedWords.some(word => lowerText.includes(word));
};

/**
 * 이름 검증 (너무 긴 이름이나 특수문자 차단)
 */
export const validateAuthorName = (name: string): boolean => {
  // 2-20자, 한글/영문/숫자/공백만 허용
  const nameRegex = /^[가-힣a-zA-Z0-9\s]{2,20}$/;
  return nameRegex.test(name);
};

/**
 * 메시지 길이 검증
 */
export const validateMessageLength = (message: string): boolean => {
  const trimmed = message.trim();
  return trimmed.length >= 10 && trimmed.length <= 1000;
};