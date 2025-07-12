import { NextRequest, NextResponse } from 'next/server';

// デモ用の食材リスト
const DEMO_INGREDIENTS = [
  ['にんじん', '豚肉', 'たまご'],
  ['トマト', 'チーズ', 'バジル'],
  ['鶏肉', 'ブロッコリー', 'にんにく'],
  ['サーモン', 'レモン', 'ディル'],
  ['豆腐', 'しいたけ', 'ねぎ']
];

export async function POST(request: NextRequest) {
  try {
    const { menu } = await request.json();

    if (!menu) {
      return NextResponse.json(
        { error: 'メニュー名が必要です' },
        { status: 400 }
      );
    }

    // menuを配列化して返す（カンマ区切りやスペース区切り対応）
    let ingredients: string[] = [];
    if (typeof menu === 'string') {
      ingredients = menu.split(/[,、\s]+/).map(s => s.trim()).filter(Boolean);
    } else if (Array.isArray(menu)) {
      ingredients = menu;
    }
    if (ingredients.length === 0) {
      // デモデータ
      const randomIndex = Math.floor(Math.random() * DEMO_INGREDIENTS.length);
      ingredients = DEMO_INGREDIENTS[randomIndex];
    }
    return NextResponse.json({
      ingredients
    });
  } catch (error: any) {
    console.error('メニュー受信エラー:', error);
    const randomIndex = Math.floor(Math.random() * DEMO_INGREDIENTS.length);
    const demoIngredients = DEMO_INGREDIENTS[randomIndex];
    return NextResponse.json({
      ingredients: demoIngredients,
      message: 'エラーが発生しましたが、デモ用の食材リストを返します'
    });
  }
} 