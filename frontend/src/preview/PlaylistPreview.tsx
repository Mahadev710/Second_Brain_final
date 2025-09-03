
import React, { useState, useEffect } from 'react';
import { X, Play, Clock, Eye, Calendar, ExternalLink, ArrowLeft, SkipForward, SkipBack } from 'lucide-react';

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
  duration?: string;
  publishedAt?: string;
  viewCount?: string;
  likeCount?: string;
  channelTitle?: string;
}

interface PlaylistData {
  title: string;
  description: string;
  channelTitle: string;
  thumbnail: string;
  videoCount: number;
  videos: YouTubeVideo[];
  playlistId: string;
}

const PlaylistPreview: React.FC<PlaylistPreviewProps> = ({ playlist, onClose }) => {
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // YouTube Data API key
  const YOUTUBE_API_KEY = 'AIzaSyBduwjCiYP0vWiNvlDQpf4ksszbevS4ErQ';

  // Extract playlist ID from URL
  const getPlaylistId = (url: string): string | null => {
    const match = url.match(/[&?]list=([^&]+)/);
    return match ? match[1] : null;
  };

  // Extract video ID from URL if it's a single video
  const getVideoId = (url: string): string | null => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  // Convert ISO 8601 duration to readable format
  const convertDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 'N/A';

    const hours = match[1] ? parseInt(match[1].slice(0, -1)) : 0;
    const minutes = match[2] ? parseInt(match[2].slice(0, -1)) : 0;
    const seconds = match[3] ? parseInt(match[3].slice(0, -1)) : 0;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format view count
  const formatViewCount = (viewCount: string): string => {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M views`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K views`;
    }
    return `${count} views`;
  };

  // Fetch playlist details from YouTube API
  const fetchPlaylistDetails = async (playlistId: string): Promise<any> => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlist details');
    }
    
    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      throw new Error('Playlist not found');
    }
    
    return data.items[0];
  };

  // Fetch playlist videos from YouTube API
  const fetchPlaylistVideos = async (playlistId: string, maxResults: number = 150): Promise<any[]> => {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlist videos');
    }
    
    const data = await response.json();
    return data.items || [];
  };

  // Fetch video details (duration, views, likes)
  const fetchVideoDetails = async (videoIds: string[]): Promise<any[]> => {
    if (videoIds.length === 0) return [];
    
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics,snippet&id=${videoIds.join(',')}&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch video details');
    }
    
    const data = await response.json();
    return data.items || [];
  };

  // Main function to fetch all playlist data
  const fetchPlaylistData = async (playlistId: string): Promise<PlaylistData> => {
    try {
      // Fetch playlist details
      const playlistDetails = await fetchPlaylistDetails(playlistId);
      
      // Fetch playlist videos
      const playlistVideos = await fetchPlaylistVideos(playlistId);
      
      // Extract video IDs for detailed fetch
      const videoIds = playlistVideos
        .map(item => item.snippet?.resourceId?.videoId)
        .filter(Boolean);
      
      // Fetch detailed video information
      const videoDetails = await fetchVideoDetails(videoIds);
      
      // Create video objects with all the data
      const videos: YouTubeVideo[] = playlistVideos.map((item, index) => {
        const videoId = item.snippet?.resourceId?.videoId;
        const details = videoDetails.find(detail => detail.id === videoId);
        
        return {
          id: videoId || `placeholder-${index}`,
          title: item.snippet?.title || 'Untitled Video',
          description: item.snippet?.description || 'No description available',
          thumbnail: item.snippet?.thumbnails?.maxresdefault?.url || 
                    item.snippet?.thumbnails?.high?.url || 
                    item.snippet?.thumbnails?.medium?.url || 
                    item.snippet?.thumbnails?.default?.url || '',
          duration: details?.contentDetails?.duration ? 
                   convertDuration(details.contentDetails.duration) : 'N/A',
          publishedAt: item.snippet?.publishedAt || '',
          viewCount: details?.statistics?.viewCount ? 
                    formatViewCount(details.statistics.viewCount) : 'N/A',
          likeCount: details?.statistics?.likeCount || 'N/A',
          channelTitle: item.snippet?.videoOwnerChannelTitle || 
                       item.snippet?.channelTitle || 
                       playlistDetails.snippet?.channelTitle || 'Unknown Channel'
        };
      });

      return {
        title: playlistDetails.snippet?.title || 'Untitled Playlist',
        description: playlistDetails.snippet?.description || 'No description available',
        channelTitle: playlistDetails.snippet?.channelTitle || 'Unknown Channel',
        thumbnail: playlistDetails.snippet?.thumbnails?.maxresdefault?.url || 
                  playlistDetails.snippet?.thumbnails?.high?.url || 
                  playlistDetails.snippet?.thumbnails?.medium?.url || 
                  playlistDetails.snippet?.thumbnails?.default?.url || '',
        videoCount: playlistDetails.contentDetails?.itemCount || videos.length,
        videos: videos,
        playlistId: playlistId
      };
    } catch (error) {
      console.error('Error fetching playlist data:', error);
      throw new Error('Could not load playlist data from YouTube API');
    }
  };

  useEffect(() => {
    const playlistId = getPlaylistId(playlist.url);
    if (!playlistId) {
      setError('Invalid playlist URL');
      setLoading(false);
      return;
    }

    if (!YOUTUBE_API_KEY) {
      setError('YouTube API key is required.');
      setLoading(false);
      return;
    }

    fetchPlaylistData(playlistId)
      .then((data) => {
        setPlaylistData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load playlist data');
        setLoading(false);
      });
  }, [playlist.url, YOUTUBE_API_KEY]);

  const currentVideo = playlistData?.videos[currentVideoIndex];

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const handleNextVideo = () => {
    if (playlistData && currentVideoIndex < playlistData.videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
  };

  const handleOpenOnYouTube = () => {
    if (currentVideo && playlistData) {
      const url = `https://www.youtube.com/watch?v=${currentVideo.id}&list=${playlistData.playlistId}`;
      window.open(url, '_blank');
    }
  };

  const getEmbedUrl = (videoId: string, playlistId: string) => {
    return `https://www.youtube.com/embed/${videoId}?list=${playlistId}&autoplay=0&rel=0`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white">Loading playlist from YouTube...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="bg-gray-800 rounded-lg p-8 text-center max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.open(playlist.url, '_blank')}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Open on YouTube
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
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
        <div className="flex-1 flex flex-col bg-black ">
          {/* YouTube Embed Player */}
          <div className="relative bg-black" style={{ aspectRatio: '16/9' }}>
            {currentVideo && playlistData && (
              <iframe
                key={currentVideo.id}
                src={getEmbedUrl(currentVideo.id, playlistData.playlistId)}
                title={currentVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>

          {/* Video Info Section - Updates with real API data */}
          <div className="p-4 bg-gray-900 border-t border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex-1 truncate">
                {currentVideo?.title}
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousVideo}
                  disabled={currentVideoIndex === 0}
                  className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous Video"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-400 px-2">
                  {currentVideoIndex + 1} / {playlistData?.videos.length}
                </span>
                <button
                  onClick={handleNextVideo}
                  disabled={!playlistData || currentVideoIndex === playlistData.videos.length - 1}
                  className="p-2 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next Video"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  onClick={handleOpenOnYouTube}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  title="Open on YouTube"
                >
                  <ExternalLink className="w-4 h-4" />
                  YouTube
                </button>
              </div>
            </div>
            
            {/* Video Statistics */}
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Play className="w-4 h-4" />
                {playlistData?.videoCount} videos
              </div>
              {currentVideo?.duration && currentVideo.duration !== 'N/A' && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentVideo.duration}
                </div>
              )}
              {currentVideo?.viewCount && currentVideo.viewCount !== 'N/A' && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {currentVideo.viewCount}
                </div>
              )}
              {currentVideo?.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(currentVideo.publishedAt).toLocaleDateString()}
                </div>
              )}
            </div>
            
            {/* Real Video Description */}
            {currentVideo?.description && (
              <div className="bg-gray-800 rounded-lg p-3 mb-3">
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                  {currentVideo.description.length > 300 
                    ? `${currentVideo.description.substring(0, 300)}...` 
                    : currentVideo.description}
                </p>
              </div>
            )}
            
            <p className="text-gray-500 text-xs">
              Channel: {currentVideo?.channelTitle}
            </p>
          </div>
        </div>

        {/* Playlist Sidebar */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
        {/* <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col"> */}
          {/* Playlist Header */}
          <div className="p-3 border-b border-gray-700">
            <div className="flex items-start gap-3">
              <img
                src={playlistData?.thumbnail}
                alt="Playlist thumbnail"
                className="w-12 h-9 object-cover rounded flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = 'https://www.youtube.com/img/desktop/yt_1200.png';
                }}
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
              <div className="mt-3 p-2 bg-gray-700 rounded">
                <p className="text-xs text-gray-300 line-clamp-3">
                  {playlistData.description}
                </p>
              </div>
            )}
          </div>

          {/* Video List */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {playlistData?.videos.map((video, index) => (
                <div
                  key={video.id}
                  onClick={() => handleVideoSelect(index)}
                  className={`flex gap-2 p-2 rounded cursor-pointer transition-all duration-200 ${
                    currentVideoIndex === index
                      ? 'bg-red-600 bg-opacity-30 border border-red-500 shadow-lg'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-16 h-9 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
                      }}
                    />
                    {video.duration && video.duration !== 'N/A' && (
                      <div className="absolute bottom-0 right-0 bg-black bg-opacity-80 text-white text-xs px-1 rounded-tl">
                        {video.duration}
                      </div>
                    )}
                    <div className="absolute top-0 left-0 bg-black bg-opacity-80 text-white text-xs px-1 rounded-br">
                      {index + 1}
                    </div>
                    {currentVideoIndex === index && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-600 bg-opacity-40 rounded">
                        <Play className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-white line-clamp-2 leading-tight mb-1">
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-400 mb-1">
                      {video.channelTitle}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {video.viewCount && video.viewCount !== 'N/A' && (
                        <span>{video.viewCount}</span>
                      )}
                      {video.publishedAt && (
                        <>
                          {video.viewCount && video.viewCount !== 'N/A' && <span>•</span>}
                          <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Playlist Actions */}
          <div className="p-3 border-t border-gray-700">
            <button
              onClick={() => window.open(playlist.url, '_blank')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Open Full Playlist
            </button>
            <p className="text-xs text-gray-500 text-center mt-2">
              Saved on {new Date(playlist.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistPreview;
