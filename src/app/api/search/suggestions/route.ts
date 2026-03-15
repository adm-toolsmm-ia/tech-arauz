import { NextRequest, NextResponse } from 'next/server';

interface SuggestionItem {
  id: string;
  text: string;
  type: 'recent' | 'frequent' | 'system';
  frequency: number;
  timestamp: string;
}

// In-memory cache for suggestions (TTL: 1 hour)
const suggestionCache = new Map<string, { data: SuggestionItem[]; timestamp: number }>();
const CACHE_TTL = 3600000; // 1 hour in ms

// System suggestions (default catalog)
const systemSuggestions: SuggestionItem[] = [
  {
    id: 'sys-1',
    text: 'Projetos Ativos',
    type: 'system',
    frequency: 100,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'sys-2',
    text: 'Meus Projetos',
    type: 'system',
    frequency: 95,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'sys-3',
    text: 'Projetos Finalizados',
    type: 'system',
    frequency: 80,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'sys-4',
    text: 'Equipes',
    type: 'system',
    frequency: 75,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'sys-5',
    text: 'Relatórios',
    type: 'system',
    frequency: 70,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'sys-6',
    text: 'Configurações',
    type: 'system',
    frequency: 60,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'sys-7',
    text: 'Notificações',
    type: 'system',
    frequency: 50,
    timestamp: new Date().toISOString(),
  },
  {
    id: 'sys-8',
    text: 'Agentes',
    type: 'system',
    frequency: 45,
    timestamp: new Date().toISOString(),
  },
];

/**
 * GET /api/search/suggestions
 *
 * Fetch search suggestions based on query string
 * Returns top 10 suggestions based on frequency + relevance
 *
 * Query Parameters:
 * - q: search query string
 *
 * Response:
 * {
 *   "suggestions": [SuggestionItem[]],
 *   "cached": boolean,
 *   "timestamp": ISO timestamp
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase().trim() || '';

    // Return empty suggestions for very short queries
    if (query.length < 2) {
      return NextResponse.json(
        {
          suggestions: systemSuggestions.slice(0, 5),
          cached: false,
          timestamp: new Date().toISOString(),
        },
        { status: 200 },
      );
    }

    // Check cache
    const cached = suggestionCache.get(query);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(
        {
          suggestions: cached.data,
          cached: true,
          timestamp: new Date().toISOString(),
        },
        { status: 200 },
      );
    }

    // Filter and rank suggestions
    const filtered = systemSuggestions
      .filter(
        (s) =>
          s.text.toLowerCase().includes(query) ||
          query.split(' ').some((part) => s.text.toLowerCase().includes(part)),
      )
      .sort((a, b) => {
        // Score: exact match > contains > frequency
        const aExact = a.text.toLowerCase() === query ? 1000 : 0;
        const bExact = b.text.toLowerCase() === query ? 1000 : 0;

        const aContains = a.text.toLowerCase().startsWith(query) ? 100 : 0;
        const bContains = b.text.toLowerCase().startsWith(query) ? 100 : 0;

        return bExact + bContains + b.frequency - (aExact + aContains + a.frequency);
      })
      .slice(0, 10);

    // Cache the result
    suggestionCache.set(query, {
      data: filtered,
      timestamp: Date.now(),
    });

    return NextResponse.json(
      {
        suggestions: filtered,
        cached: false,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('[search/suggestions] Error:', error);
    return NextResponse.json({ error: 'Internal server error', suggestions: [] }, { status: 500 });
  }
}
