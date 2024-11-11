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
    const mockHotelsData = {
      hotels: [
        {
          name: "Test Hotel 1",
          rating: 4.5,
          address: "123 Test Street",
          price: "$150/night",
          amenities: ["WiFi", "Pool", "Gym"]
        },
        {
          name: "Test Hotel 2",
          rating: 4.2,
          address: "456 Sample Road",
          price: "$120/night",
          amenities: ["WiFi", "Restaurant"]
        }
      ]
    };

    return new Response(JSON.stringify(mockHotelsData), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Hotels API Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 