export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');

    if (!location) {
      return new Response(JSON.stringify({ error: 'Location is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For testing purposes, return mock data
    const mockSafetyData = {
      womenSafety: {
        score: 8,
        safeAreas: ["Downtown", "Tourist District", "Shopping Area"],
        recommendations: [
          "Stay in well-lit areas",
          "Use official taxi services",
          "Keep valuables secure"
        ],
        emergencyContacts: {
          "Police": "911",
          "Women's Helpline": "1-800-XXX-XXXX"
        }
      },
      transportSafety: {
        recommendedServices: [
          "Official City Taxis",
          "Metro System",
          "Registered Ride-sharing"
        ],
        safetyTips: [
          "Use official transport",
          "Share ride details",
          "Travel in groups at night"
        ]
      }
    };

    return new Response(JSON.stringify(mockSafetyData), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Safety API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 