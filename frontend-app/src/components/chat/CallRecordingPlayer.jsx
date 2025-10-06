import { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiDownload, FiVolume2, FiClock, FiPhone } from 'react-icons/fi';
import GlassCard from '../ui/GlassCard';
import { formatTime } from '../../utils/formatters';
import './CallRecordingPlayer.css';

/**
 * Glass-effect Call Recording Player Component
 * Beautiful audio player for VAPI call recordings with Context7 styling
 * 
 * @param {Object} props - Component props
 * @param {string} props.recordingUrl - URL to the call recording
 * @param {string} props.transcript - Call transcript text
 * @param {string} props.summary - AI-generated call summary
 * @param {number} props.duration - Call duration in seconds
 * @param {string} props.callId - VAPI call ID
 * @param {Object} props.orderContext - Order information context
 * @param {string} props.customerName - Customer name
 * @param {boolean} props.isOwn - Whether this is an agent message
 * @returns {JSX.Element} Call recording player component
 */
const CallRecordingPlayer = ({
  recordingUrl,
  transcript,
  summary,
  duration,
  callId,
  orderContext = {},
  customerName,
  isOwn = false,
  messageContent = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Enhanced content parsing - DEFINE FUNCTION FIRST
  const parseMessageContent = (content) => {
    const result = {
      isCallSummary: false,
      isCallStart: false,
      isRecordingMessage: false,
      extractedUrl: null,
      displayText: content || ''
    };
    
    if (!content) return result;
    
    // Detect call patterns
    if (content.includes('📋 Call Summary:') || content.includes('Call Summary:')) {
      result.isCallSummary = true;
      result.displayText = content.replace(/📋\s*Call Summary:\s*/i, '').trim();
    } else if (content.includes('📞 Phone call started') || content.includes('Phone call started')) {
      result.isCallStart = true;
      result.displayText = 'Call initiated';
    } else if (content.includes('🎵 Recording:') || content.includes('Recording:')) {
      result.isRecordingMessage = true;
      const urlMatch = content.match(/https?:\/\/[^\s]+/);
      if (urlMatch) {
        result.extractedUrl = urlMatch[0];
        result.displayText = 'Call recording available';
      }
    } else if (content.includes('VAPI Call - No transcript available')) {
      result.displayText = 'Call attempted - No recording available';
    }
    
    return result;
  };

  // Parse content and get recording URL
  const parsedContent = parseMessageContent(messageContent || transcript || '');
  const finalRecordingUrl = recordingUrl || parsedContent.extractedUrl;

  // Initialize audio element
  useEffect(() => {
    if (finalRecordingUrl && !audioRef.current) {
      audioRef.current = new Audio(finalRecordingUrl);
      
      // Audio event listeners
      audioRef.current.addEventListener('loadedmetadata', () => {
        setTotalDuration(audioRef.current.duration);
        setIsLoading(false);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current.currentTime);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      audioRef.current.addEventListener('error', (e) => {
        setError('Failed to load recording');
        setIsLoading(false);
      });
      
      audioRef.current.volume = volume;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [finalRecordingUrl, volume]);

  // Play/pause toggle
  const togglePlayPause = async () => {
    if (!audioRef.current || !finalRecordingUrl) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setIsLoading(true);
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      }
    } catch (error) {
      setError('Playback failed');
      setIsLoading(false);
    }
  };

  // Seek to specific time
  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const progressBar = progressRef.current;
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const progressWidth = progressBar.offsetWidth;
    const newTime = (clickX / progressWidth) * totalDuration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Download recording
  const handleDownload = () => {
    if (finalRecordingUrl) {
      const link = document.createElement('a');
      link.href = finalRecordingUrl;
      link.download = `call_${callId || 'recording'}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Format duration helper
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercentage = totalDuration ? (currentTime / totalDuration) * 100 : 0;

  // Enhanced content parsing for different message types
  const parseMessageContent = (content) => {
    const result = {
      isCallSummary: false,
      isCallStart: false,
      isRecordingMessage: false,
      displayText: content,
      extractedUrl: null,
      extractedSummary: null
    };
    
    if (content.includes('📞 Phone call started')) {
      result.isCallStart = true;
      result.displayText = 'Call initiated';
    } else if (content.includes('📋 Call Summary:')) {
      result.isCallSummary = true;
      result.extractedSummary = content.replace('📋 Call Summary: ', '');
      result.displayText = result.extractedSummary;
    } else if (content.includes('🎵 Recording:')) {
      result.isRecordingMessage = true;
      const urlMatch = content.match(/🎵 Recording:\s*(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        result.extractedUrl = urlMatch[1];
        result.displayText = 'Recording available';
      }
    } else if (content.includes('VAPI Call - No transcript available')) {
      result.displayText = 'Call attempted - No recording available';
    }
    
    return result;
  };

  return (
    <div className={`w-full max-w-lg ${isOwn ? 'ml-auto' : 'mr-auto'}`}>
      {/* Main Audio Player Glass Card */}
      <GlassCard variant="medium" className="p-4 mb-3">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
            <FiPhone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">
              Call with {customerName || 'Customer'}
            </h4>
            <p className="text-xs text-gray-500">
              {callId && `ID: ${callId.slice(-8)}`} • {formatDuration(totalDuration)}
            </p>
          </div>
          {finalRecordingUrl && (
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 text-gray-700 hover:text-gray-900"
              title="Download Recording"
            >
              <FiDownload className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Enhanced Status Info */}
        <div className="text-xs text-gray-600 mb-3 bg-blue-50 p-2 rounded">
          {parsedContent.isCallStart && '📞 Call initiated'}
          {parsedContent.isCallSummary && '📋 Call completed with summary'}
          {parsedContent.isRecordingMessage && '🎵 Recording available for playback'}
          {parsedContent.displayText === 'Call attempted - No recording available' && '⚠️ Call attempted but no recording available'}
          {!parsedContent.isCallStart && !parsedContent.isCallSummary && !parsedContent.isRecordingMessage && 
           !parsedContent.displayText.includes('Call attempted') && 
           transcript && transcript.length > 50 && '💬 Call transcript available'}
        </div>
        
        {/* Debug Info - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mb-2 bg-yellow-50 p-2 rounded">
            🔍 Debug: Recording URL: {recordingUrl || parsedContent.extractedUrl ? 'Available' : 'None'} | 
            Duration: {duration}s | 
            Call ID: {callId ? callId.slice(-8) : 'None'} |
            Content Type: {parsedContent.isCallStart ? 'Start' : parsedContent.isCallSummary ? 'Summary' : 
                          parsedContent.isRecordingMessage ? 'Recording' : 'Transcript'}
          </div>
        )}

        {/* Audio Controls */}
        {finalRecordingUrl ? (
          <div className="space-y-3">
            {/* Play/Pause & Progress */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                disabled={isLoading}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-white disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <FiPause className="w-5 h-5" />
                ) : (
                  <FiPlay className="w-5 h-5 ml-0.5" />
                )}
              </button>

              {/* Progress Bar */}
              <div className="flex-1">
                <div
                  ref={progressRef}
                  onClick={handleProgressClick}
                  className="relative h-2 bg-white/20 rounded-full cursor-pointer group"
                >
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-100"
                    style={{ width: `${progressPercentage}%` }}
                  />
                  {/* Progress Handle */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    style={{ left: `calc(${progressPercentage}% - 8px)` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{formatDuration(currentTime)}</span>
                  <span>{formatDuration(totalDuration)}</span>
                </div>
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <FiVolume2 className="w-4 h-4 text-gray-600" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setVolume(newVolume);
                    if (audioRef.current) {
                      audioRef.current.volume = newVolume;
                    }
                  }}
                  className="w-16 h-2 bg-white/20 rounded-full appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-2 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
                ⚠️ {error}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <FiPhone className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recording available</p>
          </div>
        )}
      </GlassCard>

      {/* Call Summary Card */}
      {(summary || parsedContent.extractedSummary) && (
        <GlassCard variant="light" className="p-3 mb-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-gray-900 mb-1 text-sm">Call Summary</h5>
              <p className="text-sm text-gray-700 leading-relaxed">{summary || parsedContent.extractedSummary}</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Order Context Card */}
      {(orderContext.order_number || orderContext.store_name) && (
        <GlassCard variant="light" className="p-3 mb-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-gray-900 mb-1 text-sm">Order Details</h5>
              <div className="space-y-1 text-xs text-gray-600">
                {orderContext.order_number && (
                  <div>Order: <span className="font-medium">{orderContext.order_number}</span></div>
                )}
                {orderContext.store_name && (
                  <div>Store: <span className="font-medium">{orderContext.store_name}</span></div>
                )}
                {orderContext.order_status && (
                  <div>Status: <span className={`font-medium ${
                    orderContext.order_status === 'COMPLETED' ? 'text-green-600' :
                    orderContext.order_status === 'READY' ? 'text-blue-600' : 'text-gray-600'
                  }`}>{orderContext.order_status}</span></div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Transcript Card (Collapsible) */}
      {transcript && transcript.length > 10 && (
        <details className="group">
          <summary className="cursor-pointer">
            <GlassCard variant="light" className="p-3 group-open:rounded-b-none">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                  <h5 className="font-medium text-gray-900 text-sm">Call Transcript</h5>
                </div>
                <div className="text-xs text-gray-500 group-open:rotate-180 transition-transform duration-200">
                  ▼
                </div>
              </div>
            </GlassCard>
          </summary>
          <GlassCard variant="light" className="p-3 rounded-t-none border-t-0">
            <div className="max-h-32 overflow-y-auto">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {transcript}
              </p>
            </div>
          </GlassCard>
        </details>
      )}
    </div>
  );
};

export default CallRecordingPlayer;
