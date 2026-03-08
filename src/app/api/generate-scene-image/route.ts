import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const maxDuration = 60

/* ------------------------------------------------------------------ */
/*  Character & prompt builder                                         */
/* ------------------------------------------------------------------ */

function buildCharacterDesc(
  gender: 'male' | 'female',
  birthYear: number,
  genre: string,
): string {
  const age = new Date().getFullYear() - birthYear
  const g = gender === 'male' ? 'man' : 'woman'

  let ageDesc: string
  if (age < 13) ageDesc = 'young child'
  else if (age < 20) ageDesc = 'teenager'
  else if (age < 30) ageDesc = `young ${g} in their 20s`
  else if (age < 40) ageDesc = `${g} in their 30s`
  else if (age < 50) ageDesc = `${g} in their 40s`
  else if (age < 60) ageDesc = `${g} in their 50s`
  else ageDesc = `elderly ${g}`

  const clothing: Record<string, string> = {
    classic: 'wearing refined modern Korean attire',
    romance: 'wearing elegant romantic clothing in soft colors',
    growth: 'wearing casual everyday clothing',
    adventure: 'wearing adventurous travel gear with a cloak',
    fantasy: 'wearing flowing mystical robes with luminous patterns',
    period: 'wearing a beautiful traditional Korean hanbok with intricate embroidery',
  }

  return `A Korean ${g}, ${ageDesc}, ${clothing[genre] || clothing.classic}, with an expressive contemplative face`
}

function buildPrompt(
  gender: 'male' | 'female',
  birthYear: number,
  sceneType: string,
  narration: string,
  mood: string,
  genre: string,
): string {
  const character = buildCharacterDesc(gender, birthYear, genre)

  const moodStyles: Record<string, string> = {
    mystical: 'ethereal purple and blue tones, soft starlight glow, misty cosmic atmosphere',
    dramatic: 'dramatic golden and amber lighting, deep shadows, theatrical grandeur',
    warm: 'warm orange and golden tones, soft diffused candlelight, intimate cozy atmosphere',
    intense: 'deep crimson and red energy, high contrast, crackling powerful aura',
    serene: 'peaceful teal and jade green tones, gentle moonlight on water, zen tranquility',
    hopeful: 'bright golden sunrise rays, warm optimistic glow, expansive open sky',
  }

  const sceneActions: Record<string, string> = {
    prologue:
      'in a cinematic character introduction moment, standing in their everyday world — a busy street, café, or workplace — looking thoughtful and charismatic, caught in a moment of quiet contemplation',
    birth:
      'as a child in their hometown, surrounded by elements of a warm childhood — a family home with warm light, a neighborhood street, gentle everyday scenery with nostalgic atmosphere',
    pillars:
      'at a dramatic crossroads moment in life, standing at a literal or metaphorical fork in the road, inner conflict visible in their expression, surrounded by contrasting paths and atmospheric tension',
    elements:
      'facing a dramatic life challenge with emotional intensity — caught in a storm, confronting a difficult situation, or in a moment of crisis with dramatic weather and lighting reflecting inner turmoil',
    guardian:
      'in a fateful encounter moment, meeting someone important for the first time or experiencing a life-changing event — warm emotional atmosphere, two figures in a meaningful connection',
    fortune:
      'navigating their current life situation with determination — in a contemporary setting, facing modern challenges, showing resilience and focus amid uncertainty',
    message:
      'having a powerful moment of realization and growth, emerging from difficulty into understanding — light breaking through darkness, a transformative emotional climax',
    epilogue:
      'looking toward a bright future with peaceful determination, standing at a new beginning — dawn light, open landscape, a sense of hope and possibility stretching ahead',
  }

  const genreStyle: Record<string, string> = {
    classic:
      'elegant East Asian artistic style, traditional ink wash painting influence with modern cinematic composition',
    romance:
      'soft romantic dreamlike style, cherry blossoms, flowing silk, pastel undertones',
    growth:
      'dynamic composition showing transformation, from shadow to light, powerful momentum',
    adventure:
      'epic heroic composition, vast mythical landscapes, sweeping dramatic skies',
    fantasy:
      'high fantasy art style, magical glowing effects, floating crystalline elements, enchanted realm',
    period:
      'historical Joseon dynasty Korea setting, traditional Korean architecture, elegant period aesthetics',
  }

  return `Cinematic illustration for a life drama scene. ${character}. The protagonist is ${sceneActions[sceneType] || narration}. Atmosphere: ${moodStyles[mood] || 'cinematic atmospheric lighting'}. Art style: ${genreStyle[genre] || genreStyle.classic}. Painterly digital art, concept art quality, rich atmospheric depth, cinematic framing. Absolutely no text, no letters, no words, no watermarks, no UI elements.`
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                       */
/* ------------------------------------------------------------------ */

interface RequestBody {
  gender: 'male' | 'female'
  birthYear: number
  sceneType: string
  narration: string
  mood: string
  genre: string
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  let body: RequestBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.sceneType || !body.mood || !body.genre) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    const openai = new OpenAI({ apiKey })
    const prompt = buildPrompt(
      body.gender,
      body.birthYear,
      body.sceneType,
      body.narration,
      body.mood,
      body.genre,
    )

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json',
    })

    const b64 = response.data?.[0]?.b64_json
    if (!b64) {
      return NextResponse.json({ error: 'No image data returned' }, { status: 500 })
    }

    return NextResponse.json({ image: b64 })
  } catch (err: unknown) {
    console.error('Scene image generation error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json(
      { error: `Image generation failed: ${message}` },
      { status: 500 },
    )
  }
}
