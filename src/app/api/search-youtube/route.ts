import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// YouTube Data APIクライアントの初期化
let youtube: any = null;

try {
  if (process.env.YOUTUBE_API_KEY) {
    youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });
  }
} catch {
  console.log('YouTube APIの初期化に失敗しました。デモモードで動作します。');
}

// デモ用の動画データ
const DEMO_VIDEOS = [
  {
    id: 'demo1',
    title: '豚肉と卵の甘辛炒めの作り方',
    thumbnail: 'https://img.youtube.com/vi/demo1/mqdefault.jpg',
    channelTitle: '料理チャンネル',
    publishedAt: '2024-01-01',
    viewCount: '10万回',
    duration: '5:30'
  },
  {
    id: 'demo2', 
    title: '簡単！豚肉の甘辛炒めレシピ',
    thumbnail: 'https://img.youtube.com/vi/demo2/mqdefault.jpg',
    channelTitle: '簡単料理',
    publishedAt: '2024-01-15',
    viewCount: '8万回',
    duration: '4:15'
  },
  {
    id: 'demo3',
    title: '卵と豚肉の炒め物 - 家庭料理',
    thumbnail: 'https://img.youtube.com/vi/demo3/mqdefault.jpg', 
    channelTitle: '家庭料理レシピ',
    publishedAt: '2024-02-01',
    viewCount: '12万回',
    duration: '6:20'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { recipeName } = await request.json();

    if (!recipeName) {
      return NextResponse.json(
        { error: 'レシピ名が必要です' },
        { status: 400 }
      );
    }

    // YouTube APIが利用可能な場合
    if (youtube) {
      try {
        // レシピ名と食材を使って検索クエリを作成
        const searchQuery = `${recipeName} レシピ 作り方`;
        
        const response = await youtube.search.list({
          part: ['snippet'],
          q: searchQuery,
          type: ['video'],
          maxResults: 3,
          order: 'relevance',
          videoDuration: 'medium',
          relevanceLanguage: 'ja'
        });

        const videos = response.data.items?.map((item: { id: { videoId: string }; snippet: { title: string; thumbnails: { medium: { url: string } }; channelTitle: string; publishedAt: string; description: string } }) => ({
          id: item.id.videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.medium.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt,
          description: item.snippet.description
        })) || [];

        return NextResponse.json({
          videos: videos
        });
      } catch {
        console.error('YouTube API エラー:', error);
        // エラー時はデモデータを返す
        return NextResponse.json({
          videos: DEMO_VIDEOS,
          message: 'YouTube APIでエラーが発生しましたが、デモ動画を表示します'
        });
      }
    } else {
      // デモモード：レシピ名に応じてデモ動画を返す
      let demoVideos = [...DEMO_VIDEOS];
      
      // レシピ名に応じて動画タイトルを調整
      if (recipeName.includes('豚肉')) {
        demoVideos = demoVideos.map(video => ({
          ...video,
          title: video.title.replace(/豚肉/, '豚肉')
        }));
      } else if (recipeName.includes('鶏肉')) {
        demoVideos = demoVideos.map(video => ({
          ...video,
          title: video.title.replace(/豚肉/, '鶏肉')
        }));
      } else if (recipeName.includes('サーモン')) {
        demoVideos = demoVideos.map(video => ({
          ...video,
          title: video.title.replace(/豚肉/, 'サーモン')
        }));
      }

      return NextResponse.json({
        videos: demoVideos,
        message: 'デモモード：実際のYouTube動画検索にはYouTube Data APIキーの設定が必要です'
      });
    }

  } catch {
    console.error('YouTube動画検索エラー:', error);
    
    return NextResponse.json({
      videos: DEMO_VIDEOS,
      message: 'エラーが発生しましたが、デモ動画を表示します'
    });
  }
} 