/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef } from 'react';

export default function Home() {
  const [input, setInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<{ name: string; ingredients: string[]; calories: number }[]>([]);
  const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null);
  const [videos, setVideos] = useState<{ id: string; title: string; thumbnail: string; channelTitle: string }[]>([]);
  const [error, setError] = useState<string>('');
  const [detailedRecipe, setDetailedRecipe] = useState<{ name: string; detailedInstructions: string[]; tips: string[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 食材追加
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim().replace(/[、,]/g, ' ');
    if (value) {
      value.split(/\s+/).forEach(word => {
        if (word && !ingredients.includes(word)) {
          setIngredients(prev => [...prev, word]);
        }
      });
      setInput('');
    }
  };
  // 食材削除
  const handleRemoveIngredient = (idx: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  };

  // メインAPI呼び出し
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ingredients.length === 0) return;
    setLoading(true);
    setError('');
    setRecipes([]);
    setVideos([]);
    setExpandedRecipe(null);
    try {
      // 1. レシピ生成
      const res = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients })
      });
      const data = await res.json() as { recipes: { name: string; ingredients: string[]; calories: number }[] };
      if (!data.recipes || data.recipes.length === 0) throw new Error('献立生成に失敗しました');
      setRecipes(data.recipes);
      // 2. YouTube検索（最初のレシピ名で検索）
      const ytRes = await fetch('/api/search-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeName: data.recipes[0].name })
      });
      const ytData = await ytRes.json();
      setVideos(ytData.videos || []);
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 献立詳細取得
  const handleSelectRecipe = async (index: number) => {
    setExpandedRecipe(index);
    setDetailedRecipe(null);
    setDetailLoading(true);
    try {
      const res = await fetch('/api/generate-recipe/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeName: recipes[index].name, ingredients })
      });
      const data = await res.json();
      setDetailedRecipe(data);
    } catch {
      setDetailedRecipe({
        name: recipes[index].name,
        detailedInstructions: ['手順の取得に失敗しました。'],
        tips: []
      });
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <main style={{
      maxWidth: 420, margin: '0 auto', padding: 24,
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      background: '#f6f7fa', minHeight: '100vh'
    }}>
      <h1 style={{
        fontWeight: 800,
        fontSize: 28,
        marginBottom: 24,
        textAlign: 'center',
        color: '#222',
        letterSpacing: '0.02em',
        textShadow: '0 2px 8px #fff, 0 1px 0 #eee'
      }}>
        AI献立アシスタント <span style={{fontSize: 24}}>🍳</span>
      </h1>
      <form onSubmit={handleSubmit} style={{
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 4px 24px #0001',
        padding: 28,
        marginBottom: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        alignItems: 'center'
      }}>
        <label style={{
          fontWeight: 600,
          fontSize: 16,
          color: '#444',
          marginBottom: 4,
          alignSelf: 'flex-start'
        }}>
          冷蔵庫の食材を入力
        </label>
        {/* チップ型食材入力欄 */}
        <div style={{
          width: '100%',
          minHeight: 56,
          background: '#f7f8fa',
          border: '1.5px solid #e0e0e0',
          borderRadius: 14,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          padding: '8px 10px',
          marginBottom: 8,
          gap: 6
        }}
          onClick={() => inputRef.current?.focus()}
        >
          {ingredients.map((item, idx) => (
            <span key={item+idx} style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#eaf3ff', color: '#007aff',
              borderRadius: 16, padding: '4px 12px', fontWeight: 600,
              fontSize: 15, marginRight: 2, marginBottom: 2
            }}>
              {item}
              <button type="button" onClick={() => handleRemoveIngredient(idx)}
                style={{
                  marginLeft: 6, background: 'none', border: 'none', color: '#007aff',
                  fontWeight: 900, fontSize: 16, cursor: 'pointer', lineHeight: 1
                }}
                aria-label="削除"
              >×</button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',' || e.key === '、' || e.key === ' ') {
                handleAddIngredient(e);
              }
            }}
            placeholder={ingredients.length === 0 ? '例: 鶏肉、じゃがいも、にんじん' : '食材を追加'}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 16, flex: 1, minWidth: 80, color: '#222', fontWeight: 500
            }}
            aria-label="食材を追加"
          />
        </div>
        <button
          type="submit"
          disabled={loading || ingredients.length === 0}
          style={{
            background: loading ? '#8ecaff' : '#007aff',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            border: 'none',
            borderRadius: 14,
            padding: '14px 0',
            width: '100%',
            boxShadow: '0 2px 8px #007aff22',
            transition: 'background 0.2s'
          }}
        >
          {loading ? '提案中...' : '献立を提案'}
        </button>
      </form>
      {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
      {/* --- 案内文追加 --- */}
      {recipes.length > 0 && (
        <div style={{
          background: '#eaf3ff',
          color: '#007aff',
          fontWeight: 600,
          fontSize: 15,
          borderRadius: 12,
          padding: '10px 16px',
          marginBottom: 18,
          textAlign: 'center',
          boxShadow: '0 1px 4px #007aff11'
        }}>
          AIが提案した献立から選んでも、YouTubeのおすすめ動画から選んでもOK！<br />
          気になる方をタップして料理を始めましょう。
        </div>
      )}
      {/* --- 献立リスト --- */}
      {recipes.length > 0 && expandedRecipe === null && (
        <section style={{
          background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001',
          padding: 20, marginBottom: 24
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: '#222', textAlign: 'center' }}>
            提案された献立 ({recipes.length}品)
          </h2>
          {recipes.map((recipe, index) => (
            <div key={index} style={{
              border: '1px solid #e0e0e0',
              borderRadius: 12,
              marginBottom: 12,
              overflow: 'hidden',
              background: '#fff',
              position: 'relative'
            }}>
              <div style={{
                width: '100%',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 600,
                fontSize: 16,
                color: '#222'
              }}>
                <span>{recipe.name}</span>
                <span style={{
                  fontSize: 14,
                  color: '#007aff',
                  fontWeight: 700
                }}>
                  {recipe.calories} kcal
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectRecipe(index)}
                style={{
                  width: 'calc(100% - 40px)',
                  margin: '0 20px 16px',
                  background: '#007aff',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 16,
                  border: 'none',
                  borderRadius: 12,
                  padding: '10px 0',
                  boxShadow: '0 1px 4px #007aff22',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
              >
                この献立を選ぶ
              </button>
            </div>
          ))}
        </section>
      )}
      {/* --- 選択した献立の詳細 --- */}
      {expandedRecipe !== null && (
        <section style={{
          background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #007aff22',
          padding: 28, marginBottom: 28, marginTop: 8
        }}>
          {detailLoading && (
            <div style={{ textAlign: 'center', color: '#007aff', fontWeight: 700, fontSize: 18, margin: '32px 0' }}>
              詳しい手順を生成中...
            </div>
          )}
          {detailedRecipe && (
            <>
              <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 14, color: '#007aff', textAlign: 'center', letterSpacing: '0.01em', lineHeight: 1.3 }}>{detailedRecipe.name}</h2>
              <div style={{ color: '#222', marginBottom: 18, fontWeight: 700, textAlign: 'center', fontSize: 19 }}>
                カロリー：<span style={{ fontWeight: 900, fontSize: 20 }}>{recipes[expandedRecipe]?.calories} kcal</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: '22px 0 10px', color: '#444', letterSpacing: '0.01em' }}>材料</h3>
              <ul style={{ margin: 0, paddingLeft: 28, color: '#333', fontWeight: 500, fontSize: 17, marginBottom: 18 }}>
                {recipes[expandedRecipe]?.ingredients.map((item: string, i: number) => <li key={i}>{item}</li>)}
              </ul>
              <h2>作り方（より丁寧な手順）</h2>
              <ul style={{ color: '#222' }}>
                <li>下ごしらえをする
                  <ul>
                    <li>鶏肉は一口大に切る</li>
                    <li>鶏むね肉の場合は、酒と塩で下味をつけておく（パサつき防止）</li>
                    <li>たまねぎは薄切りにする</li>
                    <li>ピーマンはヘタと種を取り、縦半分に切ってから1cm幅の斜め切りにする</li>
                  </ul>
                </li>
                <li>鶏肉を炒める
                  <ul>
                    <li>フライパンに油を熱する</li>
                    <li>鶏肉を加えて炒め、全体が白くなったら一旦取り出す</li>
                  </ul>
                </li>
                <li>野菜を炒める
                  <ul>
                    <li>同じフライパンにたまねぎを入れて炒める</li>
                    <li>たまねぎに透明感が出てきたらピーマンを加えてさらに炒める</li>
                  </ul>
                </li>
                <li>鶏肉を戻す
                  <ul>
                    <li>野菜がしんなりしてきたら、取り出しておいた鶏肉をフライパンに戻す</li>
                  </ul>
                </li>
                <li>にんにくを加える
                  <ul>
                    <li>全体をよく混ぜる</li>
                    <li>みじん切りにしたにんにくを加え、香りが出るまで炒める</li>
                  </ul>
                </li>
                <li>味付け・仕上げ
                  <ul>
                    <li>塩と胡椒で味を調える</li>
                    <li>全体がよく混ざったら火を止める</li>
                    <li>仕上げにパセリのみじん切りを散らす</li>
                  </ul>
                </li>
              </ul>

              <h3 style={{ color: '#007aff', marginTop: 40 }}>コツ・注意点</h3>
              <ul style={{ color: '#222' }}>
                <li>鶏肉は一口大に切ることで火の通りが均一になり、やわらかく仕上がる</li>
                <li>鶏むね肉は下味をつけることでパサつきを防げる</li>
                <li>たまねぎは薄切りにすると短時間で火が通りやすい</li>
                <li>にんにくは強火で炒めすぎると焦げやすいので火加減に注意</li>
                <li>味付けは塩・胡椒のみでも美味しいが、お好みでソースや醤油を加えても良い</li>
                <li>盛り付け時はピーマンが上にくるようにすると色鮮やかで見た目も美しい</li>
              </ul>
            </>
          )}
          <button
            type="button"
            onClick={() => { setExpandedRecipe(null); setDetailedRecipe(null); }}
            style={{
              margin: '28px auto 0', display: 'block', width: '100%',
              background: '#fff', color: '#007aff', fontWeight: 700, fontSize: 18,
              border: '1.5px solid #cce3ff', borderRadius: 16, padding: '14px 0',
              boxShadow: '0 2px 8px #007aff11', transition: 'background 0.2s',
              letterSpacing: '0.02em',
              textShadow: '0 1px 0 #f0f8ff',
              cursor: 'pointer',
            }}
          >
            献立一覧に戻る
          </button>
        </section>
      )}
      {videos.length > 0 && (
        <section style={{
          background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px #0001',
          padding: 20
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12, color: '#222' }}>YouTubeで作り方を見る</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            justifyContent: 'center',
            alignItems: 'stretch'
          }}>
            {Array.from({ length: 4 }).map((_, i) => (
              videos[i] ? (
                <a
                  key={videos[i].id || i}
                  href={`https://www.youtube.com/watch?v=${videos[i].id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#f4f4f8', borderRadius: 12, textDecoration: 'none',
                    color: '#222', boxShadow: '0 1px 4px #0001', padding: 8, display: 'block',
                    minWidth: 0, minHeight: 0, height: '100%'
                  }}
                >
                  <img src={videos[i].thumbnail} alt={videos[i].title} style={{ width: '100%', borderRadius: 8, marginBottom: 6 }} />
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{videos[i].title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{videos[i].channelTitle}</div>
                </a>
              ) : (
                <div key={i} style={{
                  background: '#f4f4f8', borderRadius: 12, minHeight: 120, minWidth: 0, height: '100%'
                }} />
              )
            ))}
          </div>
        </section>
      )}
      {/* --- ここから追加 --- */}
      {(recipes.length > 0 || videos.length > 0) && (
        <button
          type="button"
          onClick={() => {
            setIngredients([]);
            setRecipes([]);
            setVideos([]);
            setError('');
            setInput('');
            setExpandedRecipe(null);
            inputRef.current?.focus();
          }}
          style={{
            margin: '32px auto 0', display: 'block', width: '100%',
            background: '#fff', color: '#007aff', fontWeight: 700, fontSize: 18,
            border: '1.5px solid #cce3ff', borderRadius: 16, padding: '14px 0',
            boxShadow: '0 2px 8px #007aff11', transition: 'background 0.2s',
            letterSpacing: '0.02em',
            textShadow: '0 1px 0 #f0f8ff',
            cursor: 'pointer',
          }}
        >
          最初に戻る
        </button>
      )}
    </main>
  );
}
