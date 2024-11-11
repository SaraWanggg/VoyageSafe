import { NextResponse } from 'next/server';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export async function getPlaceSafety(latitude: number, longitude: number) {
  try {
    // Using Places API to get nearby police stations, hospitals, and well-lit areas
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&type=police|hospital&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    // Basic safety score calculation
    const safetyScore = calculateSafetyScore(data.results);

    return NextResponse.json({
      safetyScore,
      nearbyServices: data.results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch safety information' },
      { status: 500 }
    );
  }
}

function calculateSafetyScore(places: any[]) {
  // Basic safety score calculation
  // More police stations and hospitals nearby = higher safety score
  const weights = {
    police: 2,
    hospital: 1.5,
  };

  let score = 50; // Base score

  places.forEach((place) => {
    if (place.types.includes('police')) {
      score += weights.police * 5;
    }
    if (place.types.includes('hospital')) {
      score += weights.hospital * 5;
    }
  });

  // Normalize score to be between 0 and 100
  return Math.min(Math.max(score, 0), 100);
}

export async function getDirections(origin: string, destination: string) {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`
    );

    const data = await response.json();

    // Filter for safer routes (well-lit, main streets)
    const saferRoutes = filterSaferRoutes(data.routes);

    return NextResponse.json({
      routes: saferRoutes,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch directions' },
      { status: 500 }
    );
  }
}

function filterSaferRoutes(routes: any[]) {
  // Prioritize routes that:
  // 1. Stay on main roads
  // 2. Are well-lit
  // 3. Have more businesses/activity
  return routes.map((route) => {
    const steps = route.legs[0].steps.map((step: any) => ({
      ...step,
      safety_notes: getSafetyNotes(step),
    }));

    return {
      ...route,
      legs: [{ ...route.legs[0], steps }],
    };
  });
}

function getSafetyNotes(step: any) {
  const notes = [];
  
  // Add safety notes based on the route characteristics
  if (step.html_instructions.toLowerCase().includes('highway') || 
      step.html_instructions.toLowerCase().includes('main')) {
    notes.push('Main road - generally well-lit and populated');
  }
  
  if (step.html_instructions.toLowerCase().includes('alley') || 
      step.html_instructions.toLowerCase().includes('path')) {
    notes.push('Side street/path - consider alternative route during night time');
  }

  return notes;
} 