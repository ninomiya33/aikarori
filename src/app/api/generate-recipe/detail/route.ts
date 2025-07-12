import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch {}

export async function POST(request: NextRequest) {
  let recipeName = '';
  try {
    const { recipeName: rn, ingredients } = await request.json();
    recipeName = rn;
    if (!recipeName || !ingredients || ingredients.length === 0) {
      return NextResponse.json({ error: '献立名と食材リストが必要です' }, { status: 400 });
    }
    if (openai) {
      const prompt = `
以下の献立「${recipeName}」について、下ごしらえ・調理のコツ・盛り付け・注意点なども含めて、より丁寧で具体的に料理が完成するまでの手順を詳しく日本語で説明してください。
【食材】
${ingredients.join('、')}

以下のJSON形式で回答してください：
{
  "name": "料理名",
  "detailedInstructions": ["手順1", "手順2", ...],
  "tips": ["コツや注意点1", "コツや注意点2", ...]
}
`;
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "あなたは料理の専門家です。与えられた献立について、より丁寧で具体的な手順やコツを日本語で説明してください。" },
          { role: "user", content: prompt }
        ],
        temperature: 0.6,
        max_tokens: 1200,
      });
      const responseText = completion.choices[0]?.message?.content || '';
      let detail;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          detail = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('JSONが見つかりません');
        }
      } catch (error) {
        detail = {
          name: recipeName,
          detailedInstructions: [
            '1. 食材を丁寧に下ごしらえします。',
            '2. 各工程ごとに火加減やタイミングに注意して調理します。',
            '3. 盛り付けや仕上げも丁寧に行いましょう。'
          ],
          tips: ['手順ごとに丁寧に進めると失敗しません。']
        };
      }
      return NextResponse.json(detail);
    } else {
      // デモモード
      return NextResponse.json({
        name: recipeName,
        detailedInstructions: [
          '1. 食材を丁寧に下ごしらえします。',
          '2. 各工程ごとに火加減やタイミングに注意して調理します。',
          '3. 盛り付けや仕上げも丁寧に行いましょう。'
        ],
        tips: ['手順ごとに丁寧に進めると失敗しません。']
      });
    }
  } catch (error) {
    return NextResponse.json({
      name: recipeName,
      detailedInstructions: [
        '1. 食材を丁寧に下ごしらえします。',
        '2. 各工程ごとに火加減やタイミングに注意して調理します。',
        '3. 盛り付けや仕上げも丁寧に行いましょう。'
      ],
      tips: ['手順ごとに丁寧に進めると失敗しません。']
    });
  }
} 