import React from 'react';
import CallRecordingPlayer from './CallRecordingPlayer';
import GlassCard from '../ui/GlassCard';

/**
 * Demo component to showcase the CallRecordingPlayer with sample Rural King data
 * This demonstrates how call recordings will appear in the unified inbox
 */
const CallRecordingDemo = () => {
  // Sample Rural King call recording data
  const sampleCallData = {
    recordingUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // Demo audio URL
    transcript: `Customer: Hi, I'm calling about my order JEAN2025. I'm here at the Rural King in Matune but I can't find anyone to help me get my order.

Agent: I apologize for the inconvenience. Let me check on your order right away. I see here that your order JEAN2025 is ready for pickup at customer service. 

Customer: Okay, I'm at spot 5 in the parking lot. Can someone bring it out?

Agent: Absolutely! I'll have someone bring your order out to spot 5 right now. It should be there within 5 minutes.

Customer: Great, thank you so much!

Agent: You're welcome! Is there anything else I can help you with today?

Customer: No, that's all. Thanks again!`,
    summary: 'Customer called about order JEAN2025 pickup. Resolved by arranging curbside delivery to parking spot 5. Customer satisfied with service.',
    duration: 185, // 3 minutes 5 seconds
    callId: 'vapi_rural_call_20250925_143022',
    orderContext: {
      order_number: 'JEAN2025',
      store_name: 'Rural King Matune',
      order_status: 'COMPLETED'
    },
    customerName: 'Jean'
  };

  const sampleCallDataNoRecording = {
    recordingUrl: null, // No recording available
    transcript: 'Customer called to inquire about store hours. Provided current hours and confirmed holiday schedule.',
    summary: 'Brief customer service call regarding store hours inquiry.',
    duration: 45,
    callId: 'vapi_rural_call_20250925_140156',
    orderContext: {
      order_number: 'DEREK2025',
      store_name: 'Rural King Matune',
      order_status: 'READY_FOR_PICKUP'
    },
    customerName: 'Derek'
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <GlassCard variant="medium" className="p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🎵 Call Recording Player Demo
        </h1>
        <p className="text-gray-600">
          Showcasing the glass-effect audio player for Rural King VAPI call recordings
        </p>
      </GlassCard>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Call with Recording */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📞 Call with Recording (Received Message)
          </h2>
          <div className="flex gap-4 justify-start items-start">
            <img 
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
              src="https://api.dicebear.com/7.x/identicon/svg?seed=Jean" 
              alt="Jean" 
            />
            <div className="max-w-[85%] sm:max-w-[90%] lg:max-w-[80%] min-w-0">
              <CallRecordingPlayer
                recordingUrl={sampleCallData.recordingUrl}
                transcript={sampleCallData.transcript}
                summary={sampleCallData.summary}
                duration={sampleCallData.duration}
                callId={sampleCallData.callId}
                orderContext={sampleCallData.orderContext}
                customerName={sampleCallData.customerName}
                isOwn={false}
              />
            </div>
          </div>
        </div>

        {/* Call without Recording */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📞 Call without Recording (Sent Message)
          </h2>
          <div className="flex gap-4 justify-end items-start">
            <div className="max-w-[85%] sm:max-w-[90%] lg:max-w-[80%] min-w-0">
              <CallRecordingPlayer
                recordingUrl={sampleCallDataNoRecording.recordingUrl}
                transcript={sampleCallDataNoRecording.transcript}
                summary={sampleCallDataNoRecording.summary}
                duration={sampleCallDataNoRecording.duration}
                callId={sampleCallDataNoRecording.callId}
                orderContext={sampleCallDataNoRecording.orderContext}
                customerName={sampleCallDataNoRecording.customerName}
                isOwn={true}
              />
            </div>
            <img 
              className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1" 
              src="https://api.dicebear.com/7.x/identicon/svg?seed=Agent" 
              alt="Agent" 
            />
          </div>
        </div>
      </div>

      {/* Features Showcase */}
      <GlassCard variant="light" className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">✨ Audio Player Features</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">🎵</span>
            </div>
            <h3 className="font-medium text-gray-900">Audio Playback</h3>
            <p className="text-sm text-gray-600">Full audio controls with progress scrubbing</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">💎</span>
            </div>
            <h3 className="font-medium text-gray-900">Glass Effects</h3>
            <p className="text-sm text-gray-600">Beautiful backdrop blur with Context7 styling</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-xl">📋</span>
            </div>
            <h3 className="font-medium text-gray-900">Rich Metadata</h3>
            <p className="text-sm text-gray-600">Order context, summaries, and transcripts</p>
          </div>
        </div>
      </GlassCard>

      {/* Technical Details */}
      <GlassCard variant="light" className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔧 Technical Implementation</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Glass Effect Variants</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <code>bg-white/10 backdrop-blur-xl</code> - Main player card</li>
              <li>• <code>bg-white/5 backdrop-blur-sm</code> - Metadata cards</li>
              <li>• <code>border border-white/20</code> - Subtle borders</li>
              <li>• <code>shadow-xl</code> - Depth and elevation</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800 mb-2">Rural King Integration</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Automatic call recording detection</li>
              <li>• Order context integration (JEAN2025)</li>
              <li>• Store information display</li>
              <li>• Customer sentiment analysis</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default CallRecordingDemo;

