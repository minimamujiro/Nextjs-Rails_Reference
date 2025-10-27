'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../lib/api';
import type { Video } from '../../lib/types';
import Link from 'next/link';

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchVideo(Number(params.id));
    }
  }, [params.id]);

  const fetchVideo = async (id: number) => {
    try {
      const data = await apiClient.getVideo(id);
      setVideo(data);
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">動画が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">Video App</h1>
            <Link
              href="/"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="aspect-video bg-black">
            <video controls className="w-full h-full">
              <source src={video.video_url} type="video/mp4" />
              お使いのブラウザは動画タグをサポートしていません。
            </video>
          </div>

          <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">{video.title}</h1>
            <div className="mb-6">
              <p className="text-gray-700 whitespace-pre-wrap">
                {video.description}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              投稿日: {new Date(video.created_at).toLocaleDateString('ja-JP')}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

