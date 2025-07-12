import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAIクライアントの初期化（環境変数が設定されている場合のみ）
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.log('OpenAI APIの初期化に失敗しました。デモモードで動作します。');
}

// デモ用のレシピデータ
const DEMO_RECIPES = [
  {
    name: "豚肉と卵の甘辛炒め",
    ingredients: [
      "豚肉 200g",
      "卵 2個", 
      "にんじん 1本",
      "サラダ油 大さじ1",
      "醤油 大さじ2",
      "砂糖 小さじ1",
      "塩胡椒 少々"
    ],
    instructions: [
      "豚肉を一口大に切り、塩胡椒で下味をつける",
      "にんじんを千切りにする",
      "フライパンに油を熱し、豚肉を炒める",
      "にんじんを加えて炒める",
      "醤油、砂糖で味付けする",
      "溶き卵を加えて炒り卵にする"
    ],
    calories: 480
  },
  {
    name: "トマトとチーズのカプレーゼ風サラダ",
    ingredients: [
      "トマト 2個",
      "モッツァレラチーズ 100g",
      "バジル 適量",
      "オリーブオイル 大さじ2",
      "塩胡椒 少々",
      "レモン汁 小さじ1"
    ],
    instructions: [
      "トマトを輪切りにする",
      "モッツァレラチーズを一口大に切る",
      "バジルを手でちぎる",
      "お皿にトマトとチーズを交互に並べる",
      "バジルを散らす",
      "オリーブオイル、レモン汁、塩胡椒で味付けする"
    ],
    calories: 320
  },
  {
    name: "鶏肉とブロッコリーの蒸し焼き",
    ingredients: [
      "鶏胸肉 200g",
      "ブロッコリー 1/2株",
      "にんにく 2片",
      "オリーブオイル 大さじ1",
      "塩胡椒 少々",
      "レモン汁 小さじ1"
    ],
    instructions: [
      "鶏肉に塩胡椒をまぶす",
      "ブロッコリーを小房に分ける",
      "にんにくをみじん切りにする",
      "フライパンに油を熱し、鶏肉を焼く",
      "ブロッコリーとにんにくを加えて蒸し焼きにする",
      "レモン汁をかけて仕上げる"
    ],
    calories: 380
  },
  {
    name: "サーモンのレモンバター焼き",
    ingredients: [
      "サーモン 200g",
      "レモン 1/2個",
      "バター 20g",
      "ディル 適量",
      "塩胡椒 少々",
      "白ワイン 大さじ2"
    ],
    instructions: [
      "サーモンに塩胡椒をまぶす",
      "レモンを薄切りにする",
      "フライパンにバターを溶かす",
      "サーモンを皮目を下にして焼く",
      "レモンとディルを加える",
      "白ワインを加えて蒸し焼きにする"
    ],
    calories: 420
  },
  {
    name: "豆腐としいたけの味噌汁",
    ingredients: [
      "豆腐 1/2丁",
      "しいたけ 4個",
      "ねぎ 1本",
      "味噌 大さじ2",
      "だし汁 400ml",
      "塩 少々"
    ],
    instructions: [
      "豆腐を一口大に切る",
      "しいたけを薄切りにする",
      "ねぎを小口切りにする",
      "だし汁を沸かす",
      "しいたけを加えて煮る",
      "豆腐と味噌を加えて溶かす",
      "ねぎを散らして完成"
    ],
    calories: 180
  },
  {
    name: "野菜たっぷりカレー",
    ingredients: [
      "鶏肉 300g",
      "にんじん 2本",
      "じゃがいも 2個",
      "たまねぎ 1個",
      "カレールー 100g",
      "サラダ油 大さじ1",
      "水 600ml"
    ],
    instructions: [
      "鶏肉を一口大に切る",
      "野菜を食べやすい大きさに切る",
      "フライパンに油を熱し、鶏肉を炒める",
      "野菜を加えて炒める",
      "水を加えて煮込む",
      "カレールーを溶かして完成"
    ],
    calories: 520
  },
  {
    name: "簡単パスタ",
    ingredients: [
      "スパゲッティ 200g",
      "ベーコン 100g",
      "にんにく 2片",
      "オリーブオイル 大さじ2",
      "塩胡椒 少々",
      "パルメザンチーズ 適量"
    ],
    instructions: [
      "パスタを茹でる",
      "ベーコンを細切りにする",
      "にんにくをみじん切りにする",
      "フライパンに油を熱し、ベーコンを炒める",
      "にんにくを加えて香りを出す",
      "茹でたパスタを加えて和える"
    ],
    calories: 650
  },
  {
    name: "和風サラダ",
    ingredients: [
      "レタス 1/2個",
      "きゅうり 1本",
      "トマト 1個",
      "わかめ 適量",
      "醤油 大さじ1",
      "ごま油 小さじ1",
      "白ごま 適量"
    ],
    instructions: [
      "レタスを手でちぎる",
      "きゅうりを薄切りにする",
      "トマトを一口大に切る",
      "わかめを水で戻す",
      "野菜を混ぜ合わせる",
      "醤油、ごま油で和える",
      "白ごまを散らす"
    ],
    calories: 120
  }
];

export async function POST(request: NextRequest) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: '食材リストが必要です' },
        { status: 400 }
      );
    }

    // OpenAI APIが利用可能な場合
    if (openai) {
      const ingredientsList = ingredients.join('、');

      const prompt = `
以下の食材を使って、30分以内で作れる家庭料理を4品提案してください。
それぞれ異なる料理ジャンル（和食、洋食、中華、エスニックなど）で、簡単で美味しく、栄養バランスの良い料理を選んでください。
また、各料理のだいたいの総カロリーも計算してください。

【食材】
${ingredientsList}

以下のJSON形式で回答してください：
{
  "recipes": [
    {
      "name": "料理名1",
      "ingredients": ["材料1", "材料2", "材料3"],
      "instructions": ["手順1", "手順2", "手順3"],
      "calories": カロリー数
    },
    {
      "name": "料理名2",
      "ingredients": ["材料1", "材料2", "材料3"],
      "instructions": ["手順1", "手順2", "手順3"],
      "calories": カロリー数
    },
    {
      "name": "料理名3",
      "ingredients": ["材料1", "材料2", "材料3"],
      "instructions": ["手順1", "手順2", "手順3"],
      "calories": カロリー数
    },
    {
      "name": "料理名4",
      "ingredients": ["材料1", "材料2", "材料3"],
      "instructions": ["手順1", "手順2", "手順3"],
      "calories": カロリー数
    }
  ]
}

注意：
- 材料は食材リストに含まれていない調味料なども含めてください
- 手順は具体的で分かりやすく書いてください
- カロリーは1人前の目安で答えてください
- 4つの料理は異なるジャンル・調理法で提案してください
- 日本語で回答してください
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "あなたは料理の専門家です。与えられた食材を使って4つの異なるレシピを提案し、各レシピのカロリーも計算してください。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const responseText = completion.choices[0]?.message?.content || '';
      
      // JSONレスポンスを解析
      let recipes;
      try {
        // JSON部分を抽出
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          recipes = parsed.recipes || [parsed]; // フォールバック
        } else {
          throw new Error('JSONが見つかりません');
        }
      } catch (error) {
        console.error('JSON解析エラー:', error);
        
        // フォールバック：デモ用のレシピを4つ返す
        const shuffled = [...DEMO_RECIPES].sort(() => 0.5 - Math.random());
        recipes = shuffled.slice(0, 4);
      }

      return NextResponse.json({
        recipes: recipes
      });
    } else {
      // デモモード：ランダムなレシピを4つ返す
      const shuffled = [...DEMO_RECIPES].sort(() => 0.5 - Math.random());
      const demoRecipes = shuffled.slice(0, 4);
      
      return NextResponse.json({
        recipes: demoRecipes,
        message: 'デモモード：実際のレシピ生成にはOpenAI APIキーの設定が必要です'
      });
    }

  } catch (error) {
    console.error('レシピ生成エラー:', error);
    
    // エラー時もデモレシピを4つ返す
    const shuffled = [...DEMO_RECIPES].sort(() => 0.5 - Math.random());
    const demoRecipes = shuffled.slice(0, 4);
    
    return NextResponse.json({
      recipes: demoRecipes,
      message: 'エラーが発生しましたが、デモ用のレシピを返します'
    });
  }
} 

// --- 詳細手順生成API ---
export async function POST_detail(request: NextRequest) {
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