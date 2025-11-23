'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import type { Video } from '../lib/types';

type VideoCarouselProps = {
  videos: Video[];
};

export function VideoCarousel({ videos }: VideoCarouselProps) {
  const slides = videos.slice(0, 5);

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">最新の動画</h2>
        <span className="text-sm text-gray-500">
          最新の投稿から最大5件を表示しています
        </span>
      </div>

      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        navigation
        pagination={{ clickable: true }}
        loop
        autoplay={{ delay: 5000 }}
        spaceBetween={16}
        slidesPerView={1.1}
        breakpoints={{
          640: { slidesPerView: 1.3 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {slides.map((video) => (
          <SwiperSlide key={video.id}>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-video bg-gray-200">
                <Image
                  src={video.thumbnail_url}
                  alt={video.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 90vw, (max-width: 1200px) 45vw, 30vw"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                  {video.description}
                </p>
                <Link
                  href={`/videos/${video.id}`}
                  className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

