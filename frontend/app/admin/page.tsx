'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/api';
import type { Video } from '../lib/types';

export default function AdminPage() {
  const { user, logout, isAdmin, initializing } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    try {
      const data = await apiClient.getVideos();
      setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initializing) return;

    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    fetchVideos();
  }, [user, initializing, fetchVideos, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const openModal = (video?: Video) => {
    if (video) {
      setEditingVideo(video);
      setFormData({
        title: video.title,
        description: video.description || '',
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
      });
    } else {
      setEditingVideo(null);
      setFormData({
        title: '',
        description: '',
        video_url: '',
        thumbnail_url: '',
      });
    }

    setVideoFile(null);
    setThumbnailFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVideo(null);
    setVideoFile(null);
    setThumbnailFile(null);
    setIsSubmitting(false);
  };

  const uploadToS3 = async (file: File, fileType: 'video' | 'thumbnail') => {
    const presign = await apiClient.getPresignedUrl({
      filename: file.name,
      contentType: file.type,
      fileType,
    });

    const response = await fetch(presign.upload_url, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('ファイルのアップロードに失敗しました');
    }

    return presign.file_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const payload = { ...formData };

      if (editingVideo) {
        if (videoFile) {
          payload.video_url = await uploadToS3(videoFile, 'video');
        }
        if (thumbnailFile) {
          payload.thumbnail_url = await uploadToS3(thumbnailFile, 'thumbnail');
        }
      } else {
        if (!videoFile || !thumbnailFile) {
          alert('動画ファイルとサムネイル画像を選択してください');
          setIsSubmitting(false);
          return;
        }
        payload.video_url = await uploadToS3(videoFile, 'video');
        payload.thumbnail_url = await uploadToS3(thumbnailFile, 'thumbnail');
      }

      if (editingVideo) {
        await apiClient.updateVideo(editingVideo.id, payload);
      } else {
        await apiClient.createVideo(payload);
      }
      fetchVideos();
      closeModal();
    } catch (error) {
      console.error('Error saving video:', error);
      alert('動画の保存に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この動画を削除してもよろしいですか？')) return;

    try {
      await apiClient.deleteVideo(id);
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('動画の削除に失敗しました');
    }
  };

  if (!user || !isAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-800">管理画面</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user.email}</span>
              <button
                onClick={() => router.push('/')}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                ホームに戻る
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-3xl font-bold">動画管理</h2>
          <button
            onClick={() => openModal()}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            新規動画を追加
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {video.description}
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => openModal(video)}
                      className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">
              {editingVideo ? '動画を編集' : '新規動画を追加'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">タイトル</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">説明</label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  動画ファイル（mp4など）
                </label>
                {editingVideo && formData.video_url && !videoFile && (
                  <p className="text-sm text-gray-500 mb-2 break-words">
                    現在の動画URL:{' '}
                    <a
                      href={formData.video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 underline"
                    >
                      {formData.video_url}
                    </a>
                  </p>
                )}
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                  required={!editingVideo}
                  className="w-full"
                />
                {videoFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    選択中: {videoFile.name}
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">
                  サムネイル画像
                </label>
                {editingVideo && formData.thumbnail_url && !thumbnailFile && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-500">現在のサムネイル:</p>
                    <img
                      src={formData.thumbnail_url}
                      alt="Current thumbnail"
                      className="mt-2 h-32 object-cover rounded"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setThumbnailFile(e.target.files?.[0] ?? null)
                  }
                  required={!editingVideo}
                  className="w-full"
                />
                {thumbnailFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    選択中: {thumbnailFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isSubmitting
                    ? 'アップロード中...'
                    : editingVideo
                      ? '更新'
                      : '作成'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

