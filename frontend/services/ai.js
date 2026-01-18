import { curriculums } from '../app/data/curriculums';

const GEMINI_API_KEY = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_GOOGLE_API_KEY
  : null;
const ELEVENLABS_API_KEY = typeof window !== 'undefined'
  ? process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
  : null;

// Validate API keys on module load
if (typeof window !== 'undefined' && !GEMINI_API_KEY) {
  console.warn('NEXT_PUBLIC_GOOGLE_API_KEY is not set in environment variables. Gemini API will not work.');
}

if (typeof window !== 'undefined' && !ELEVENLABS_API_KEY) {
  console.warn('NEXT_PUBLIC_ELEVENLABS_API_KEY is not set in environment variables. ElevenLabs TTS will not work.');
}

// Conversation history for context
let conversationHistory = [];
const MAX_HISTORY = 10;

// Currently playing audio for interruption
let currentAudio = null;

// Region center coordinates for flying to regions
const regionCenters = {
  'north america': { center: [-100, 40], zoom: 3 },
  'europe': { center: [10, 50], zoom: 3.5 },
  'asia': { center: [105, 35], zoom: 3 },
  'middle east': { center: [45, 28], zoom: 4 },
  'oceania': { center: [140, -25], zoom: 3.5 },
  'usa': { center: [-98, 38], zoom: 4 },
  'uk': { center: [-2, 54], zoom: 5 },
  'germany': { center: [10, 51], zoom: 5.5 },
  'japan': { center: [138, 36], zoom: 5 },
  'china': { center: [105, 35], zoom: 4 },
  'india': { center: [78, 22], zoom: 4.5 },
  'canada': { center: [-106, 56], zoom: 3 },
  'australia': { center: [134, -25], zoom: 4 }
};

// Process user query with Gemini
export async function processQuery(userQuery) {
  const curriculumList = curriculums.map(c => ({
    id: c.id,
    title: c.title,
    school: c.school,
    topics: c.topics,
    city: c.location.city,
    country: c.location.country,
    region: c.location.region,
    description: c.description
  }));

  // Build conversation context
  const historyContext = conversationHistory.length > 0
    ? `\n\nPrevious conversation:\n${conversationHistory.map(h => `User: "${h.user}"\nAssistant: ${h.assistant}`).join('\n\n')}\n\n`
    : '';

  const prompt = `You are an AI assistant for OpenLearn, a global curriculum marketplace.
The user is looking at a 3D globe with curriculum pins from schools worldwide.

Available curriculums:
${JSON.stringify(curriculumList, null, 2)}
${historyContext}
Current user query: "${userQuery}"

IMPORTANT: Use the conversation history to understand context. If the user says things like:
- "go ahead" / "yes" / "sure" -> they want you to proceed with what you suggested
- "tell me more" / "more details" -> expand on the last topic
- "what about [region]?" -> filter previous results by that region
- "show me those" / "zoom in" -> reference the last mentioned curriculums

Analyze the query and respond with a JSON object containing:
1. "matchingIds": array of curriculum IDs that match the query (can be empty if no match)
2. "region": if the user mentions a region/country/continent, include it here (lowercase), otherwise null
3. "response": a friendly, conversational response (2-3 sentences max) that:
   - Acknowledges what they're looking for
   - Mentions how many matching curriculums you found
   - If location-specific, mention you're showing that area
   - Be concise and helpful

Examples:
- "I want to learn machine learning" -> find ML/AI courses, no specific region
- "Show me CS courses in Europe" -> find CS courses, region: "europe"
- "What about Germany?" -> filter by Germany, region: "germany"
- "Any robotics?" -> find robotics courses
- "go ahead" (after AI suggested something) -> proceed with the suggestion

Respond ONLY with valid JSON, no markdown or explanation.`;

  if (!GEMINI_API_KEY) {
    console.error('Gemini API key is not configured. Please set VITE_GOOGLE_API_KEY in your .env file.');
    return {
      matchingIds: [],
      response: "Voice control is not configured. Please check your API keys.",
      flyTo: null
    };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500
          }
        })
      }
    );

    const data = await response.json();
    console.log('Gemini response:', data);

    if (data.error) {
      console.error('Gemini API error:', data.error);
      throw new Error(data.error.message);
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Gemini text:', text);

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);

      // Always fly to the matching curriculum pins
      let flyTo = null;
      const matches = curriculums.filter(c => result.matchingIds?.includes(c.id));

      if (matches.length === 1) {
        // Single match - zoom in very close to that pin
        flyTo = {
          center: matches[0].location.coordinates,
          zoom: 12
        };
      } else if (matches.length > 1) {
        // Multiple matches - calculate bounds to fit all pins
        const lngs = matches.map(c => c.location.coordinates[0]);
        const lats = matches.map(c => c.location.coordinates[1]);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        // Calculate center
        const centerLng = (minLng + maxLng) / 2;
        const centerLat = (minLat + maxLat) / 2;

        // Calculate zoom based on spread
        const lngSpread = maxLng - minLng;
        const latSpread = maxLat - minLat;
        const maxSpread = Math.max(lngSpread, latSpread);

        // Zoom level based on spread (closer zoom for smaller areas)
        let zoom = 3;
        if (maxSpread < 5) zoom = 10;
        else if (maxSpread < 15) zoom = 7;
        else if (maxSpread < 40) zoom = 5;
        else if (maxSpread < 80) zoom = 4;

        flyTo = {
          center: [centerLng, centerLat],
          zoom,
          bounds: [[minLng, minLat], [maxLng, maxLat]]
        };
      } else if (result.region) {
        // No matches but region specified - fly to region
        const regionKey = result.region.toLowerCase();
        flyTo = regionCenters[regionKey] || null;
      }

      // Save to conversation history
      conversationHistory.push({
        user: userQuery,
        assistant: result.response,
        matchingIds: result.matchingIds || []
      });

      // Keep history limited
      if (conversationHistory.length > MAX_HISTORY) {
        conversationHistory = conversationHistory.slice(-MAX_HISTORY);
      }

      return {
        matchingIds: result.matchingIds || [],
        response: result.response || "I found some curriculums for you!",
        flyTo
      };
    }
  } catch (error) {
    console.error('Gemini API error:', error);
  }

  // Fallback response
  return {
    matchingIds: [],
    response: "I'm having trouble processing that request. Try asking about a specific subject or region!",
    flyTo: null
  };
}

// Clear conversation history
export function clearConversation() {
  conversationHistory = [];
}

// Stop any currently playing speech
export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    if (currentAudio.src) {
      URL.revokeObjectURL(currentAudio.src);
    }
    currentAudio = null;
  }
  // Also stop browser TTS if active
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

// Text-to-speech with ElevenLabs
export async function speak(text) {
  // Stop any currently playing audio first
  stopSpeaking();

  if (!ELEVENLABS_API_KEY) {
    console.warn('ElevenLabs API key is not configured. Falling back to browser TTS.');
    // Fallback to browser TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
    return;
  }

  try {
    const response = await fetch(
      'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Rachel voice
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error('ElevenLabs API error');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        resolve();
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        resolve();
      };
      audio.play().catch(() => {
        currentAudio = null;
        resolve();
      });
    });
  } catch (error) {
    console.error('ElevenLabs error:', error);
    // Fallback to browser TTS
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  }
}

// Speech recognition hook
export function createSpeechRecognition(onResult, onStart, onEnd) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition not supported');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    onStart?.();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    onResult?.(transcript);
  };

  recognition.onend = () => {
    onEnd?.();
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    onEnd?.();
  };

  return recognition;
}
