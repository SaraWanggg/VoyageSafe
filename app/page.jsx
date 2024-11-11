"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Send, Sparkles, MapPin, Check, X, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { createGoogleMapsUrl } from '@/app/api/maps/config';
import { getPlaceSafety, getDirections } from '@/app/api/maps';

const TravelAssistant = () => {
  const [messages, setMessages] = useState([{
    role: 'user',
    content: "Hi! Welcome to VoyageSafe. Please enter the place you want to travel to and your travel preferences."
  }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState({
    placesApi: { tested: false, working: false },
    directionsApi: { tested: false, working: false },
    geolocation: { tested: false, working: false }
  });
  const [destination, setDestination] = useState('');
  const [safetyInfo, setSafetyInfo] = useState(null);
  const [routes, setRoutes] = useState(null);

  const travelStyles = [
    { emoji: '🍽️', label: 'Foodie' },
    { emoji: '🌿', label: 'Nature-lover' },
    { emoji: '🧘‍♀️', label: 'Relaxing' },
    { emoji: '🌙', label: 'Night life' },
    { emoji: '🗺️', label: 'Explorer' },
    { emoji: '🧭', label: 'Other' }
  ];

  const handleStyleSelection = async (style) => {
    setInputMessage(`I'm a ${style.toLowerCase()}`);
  };

  const formatMessage = (content) => {
    return content.split('*').map((part, index) => {
      if (!part.trim()) return null;
      
      if (part.startsWith('*')) {
        return (
          <div key={index} className="font-bold text-lg mt-4 mb-2">
            {part.replace(/\*/g, '')}
          </div>
        );
      }
      
      return (
        <p key={index} className="mb-3">
          {part}
        </p>
      );
    }).filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    try {
      setIsLoading(true);
      setError('');
      
      const locationMatch = inputMessage.match(/(?:going to|visit|traveling to)\s+([^.,!?]+)/i);
      if (locationMatch) {
        const location = locationMatch[1].trim();
        setDestination(location);
        
        try {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const origin = `${position.coords.latitude},${position.coords.longitude}`;
            const directionsResponse = await getDirections(origin, location);
            setRoutes(directionsResponse.routes);

            if (directionsResponse.routes?.[0]?.legs?.[0]?.end_location) {
              const { lat, lng } = directionsResponse.routes[0].legs[0].end_location;
              const safetyResponse = await getPlaceSafety(lat, lng);
              setSafetyInfo(safetyResponse);
            }
          });
        } catch (mapError) {
          console.error('Map API Error:', mapError);
        }
      }

      const userMessage = { role: 'user', content: inputMessage };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInputMessage('');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) {
        throw new Error(await response.json().error || 'Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response
      }]);

    } catch (err) {
      setError(err.message || 'Failed to get response. Please try again.');
      console.error('Chat Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const testApis = async () => {
    // Test Geolocation
    try {
      await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      setApiStatus(prev => ({
        ...prev,
        geolocation: { tested: true, working: true }
      }));
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        geolocation: { tested: true, working: false }
      }));
    }

    // Test Places API
    try {
      const safetyResponse = await getPlaceSafety(40.7128, -74.0060); // Example coordinates (NYC)
      setApiStatus(prev => ({
        ...prev,
        placesApi: { tested: true, working: !!safetyResponse }
      }));
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        placesApi: { tested: true, working: false }
      }));
    }

    // Test Directions API
    try {
      const directionsResponse = await getDirections(
        "40.7128,-74.0060", // NYC
        "34.0522,-118.2437"  // LA
      );
      setApiStatus(prev => ({
        ...prev,
        directionsApi: { tested: true, working: !!directionsResponse }
      }));
    } catch (error) {
      setApiStatus(prev => ({
        ...prev,
        directionsApi: { tested: true, working: false }
      }));
    }
  };

  useEffect(() => {
    testApis();
  }, []);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-600 to-blue-800 animate-gradient"></div>
      
      <Card className="max-w-2xl mx-auto bg-white/90 backdrop-blur-lg shadow-2xl border-0 relative z-10">
        <CardHeader className="flex flex-col items-center space-y-4 pb-6">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold text-gray-800 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-blue-500" />
            VoyageSafe Assistant
          </h1>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Messages Display */}
          <div className="h-[450px] overflow-y-auto space-y-4 p-4 bg-gray-50/50 rounded-xl backdrop-blur-sm">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl break-words shadow-sm ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-4'
                      : 'bg-white text-gray-800 mr-4'
                  }`}
                >
                  <div className="whitespace-pre-line font-sans text-base leading-relaxed space-y-2">
                    {message.role === 'assistant' 
                      ? formatMessage(message.content)
                      : message.content
                    }
                  </div>
                </div>
              </div>
            ))}

            {safetyInfo && (
              <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="text-blue-500" />
                  <h3 className="font-semibold">Safety Information for {destination}</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">
                      Safety Score: {safetyInfo.safetyScore}/100
                    </div>
                    <div className={`h-2 w-24 rounded-full ${
                      safetyInfo.safetyScore > 70 ? 'bg-green-500' :
                      safetyInfo.safetyScore > 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  </div>
                  {safetyInfo.nearbyServices?.length > 0 && (
                    <div>
                      <p className="font-medium">Nearby Services:</p>
                      <ul className="list-disc pl-5">
                        {safetyInfo.nearbyServices.slice(0, 3).map((service, idx) => (
                          <li key={idx} className="text-sm">
                            {service.name} ({service.types[0].replace(/_/g, ' ')})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Travel Style Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {travelStyles.map((style) => (
              <Button
                key={style.label}
                variant="outline"
                onClick={() => handleStyleSelection(style.label)}
                className="text-left text-base py-6 px-4 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
              >
                <span className="mr-2 text-xl">{style.emoji}</span>
                <span className="font-medium">{style.label}</span>
              </Button>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="animate-shake">
              <AlertDescription className="text-base">{error}</AlertDescription>
            </Alert>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex gap-3 pt-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 text-base py-6 px-4 bg-white/80 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              size="icon"
              className="w-14 h-14 bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TravelAssistant;