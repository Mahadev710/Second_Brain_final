import React, { useState, useEffect } from 'react';
import { X, Play, Clock, Eye, ThumbsUp, Calendar, ExternalLink, ArrowLeft } from 'lucide-react';

interface PlaylistContent {
  id: string;
  url: string;
  videoCount: number;
  about: string;
  createdAt: Date;
}

interface PlaylistPreviewProps {
  playlist: PlaylistContent;
  onClose: () => void;
}

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
  channelTitle: string;
}

interface PlaylistData {
  title: string;
  description: string;
  channelTitle: string;
  thumbnail: string;
  videoCount: number;
  videos: YouTubeVideo[];
}

const PlaylistPreview: React.FC<PlaylistPreviewProps> = ({ playlist, onClose }) => {
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract playlist ID from URL
  const getPlaylistId = (url: string): string | null => {
    const match = url.match(/[&?]list=([^&]+)/);
    return match ? match[1] : null;
  };

  // Mock YouTube API data (replace with actual API call)
  const fetchPlaylistData = async (playlistId: string): Promise<PlaylistData> => {
    // This is mock data - in real implementation, you would call YouTube API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          title: "Sample Playlist Title",
          description: "This is a sample playlist description that would come from YouTube API.",
          channelTitle: "Sample Channel",
          thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
          videoCount: 25,
          videos: [
            {
              id: "dQw4w9WgXcQ",
              title: "Sample Video 1 - Main Video",
              description: "This is the first video in the playlist that serves as the main video.",
              thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
              duration: "3:32",
              publishedAt: "2023-01-15",
              viewCount: "1,234,567",
              likeCount: "45,678",
              channelTitle: "Sample Channel"
            },
            {
              id: "abc123def",
              title: "Sample Video 2",
              description: "Second video in the playlist.",
              thumbnail: "https://img.youtube.com/vi/abc123def/maxresdefault.jpg",
              duration: "5:24",
              publishedAt: "2023-01-20",
              viewCount: "987,654",
              likeCount: "23,456",
              channelTitle: "Sample Channel"
            },
            {
              id: "xyz789uvw",
              title: "Sample Video 3",
              description: "Third video in the playlist.",
              thumbnail: "https://img.youtube.com/vi/xyz789uvw/maxresdefault.jpg",
              duration: "4:18",
              publishedAt: "2023-01-25",
              viewCount: "654,321",
              likeCount: "12,345",
              channelTitle: "Sample Channel"
            }
          ]
        });
      }, 1000);
    });
  };

  useEffect(() => {
    const playlistId = getPlaylistId(playlist.url);
    if (playlistId) {
      fetchPlaylistData(playlistId)
        .then((data) => {
          setPlaylistData(data);
          setCurrentVideo(data.videos[0]); // Set first video as current
          setLoading(false);
        })
        .catch((err) => {
          setError('Failed to load playlist data');
          setLoading(false);
        });
    } else {
      setError('Invalid playlist URL');
      setLoading(false);
    }
  }, [playlist.url]);

  const formatNumber = (num: string) => {
    return new Intl.NumberFormat().format(parseInt(num));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleVideoSelect = (video: YouTubeVideo) => {
    setCurrentVideo(video);
  };

  const handleWatchOnYouTube = () => {
    if (currentVideo) {
      window.open(`https://www.youtube.com/watch?v=${currentVideo.id}&list=${getPlaylistId(playlist.url)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Loading playlist data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-4 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h3 className="text-lg font-semibold text-white truncate max-w-96">
            {playlistData?.title}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Video Section */}
        <div className="flex-1 flex flex-col bg-black">
          {/* Video Player */}
          <div className="relative bg-black flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
            {currentVideo && (
              <div className="relative w-full h-full">
                <img
                  src={currentVideo.thumbnail}
                  alt={currentVideo.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <button
                    onClick={handleWatchOnYouTube}
                    className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Play className="w-6 h-6" />
                    Watch on YouTube
                  </button>
                </div>
                <div className="absolute top-4 right-4">
                  <button
                    onClick={handleWatchOnYouTube}
                    className="p-2 bg-black bg-opacity-75 text-white rounded hover:bg-opacity-90"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Video Info */}
          {currentVideo && (
            <div className="p-4 bg-gray-900 border-t border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-2">{currentVideo.title}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {formatNumber(currentVideo.viewCount)} views
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  {formatNumber(currentVideo.likeCount)} likes
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(currentVideo.publishedAt)}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentVideo.duration}
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                {currentVideo.description}
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Channel: {currentVideo.channelTitle}
              </p>
            </div>
          )}
        </div>

        {/* Playlist Sidebar */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Playlist Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-start gap-3">
              <img
                src={playlistData?.thumbnail}
                alt="Playlist thumbnail"
                className="w-16 h-12 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm truncate">
                  {playlistData?.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {playlistData?.channelTitle}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {playlistData?.videoCount} videos
                </p>
              </div>
            </div>
            {playlistData?.description && (
              <p className="text-xs text-gray-400 mt-3 line-clamp-3">
                {playlistData.description}
              </p>
            )}
          </div>

          {/* Video List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {playlistData?.videos.map((video, index) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoSelect(video)}
                  className={`flex gap-3 p-2 rounded cursor-pointer transition-colors ${
                    currentVideo?.id === video.id
                      ? 'bg-red-600 bg-opacity-20 border border-red-600'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                      {video.duration}
                    </div>
                    <div className="absolute top-1 left-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white line-clamp-2 leading-tight">
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">
                      {video.channelTitle}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span>{formatNumber(video.viewCount)} views</span>
                      <span>•</span>
                      <span>{formatDate(video.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPreview;