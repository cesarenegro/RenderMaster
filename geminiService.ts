import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Helper to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const getMimeType = (file: File): string => {
  return file.type;
};

export const generateImage = async (
  originalImage: File,
  prompt: string,
  geometryValue: number,
  contrastValue: number,
  styleReferenceImage: File | null = null
): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  
  const imageBase64 = await fileToBase64(originalImage);
  const mimeType = getMimeType(originalImage);

  const parts: any[] = [
    {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    },
  ];
  
  const geometryPrompt = `Image geometry preservation level is ${geometryValue} out of 100 (0 is most creative, 100 is most precise).`;
  const contrastPrompt = `Adjust image contrast by ${contrastValue} (-50 is lowest, 50 is highest).`;
  
  // Base prompt construction
  let fullPrompt = `${prompt}\n\n${geometryPrompt}\n${contrastPrompt}`;

  if (styleReferenceImage) {
      const styleBase64 = await fileToBase64(styleReferenceImage);
      const styleMimeType = getMimeType(styleReferenceImage);
      parts.push({
          inlineData: {
              data: styleBase64,
              mimeType: styleMimeType,
          }
      });
      
      // If prompt is short/simple, add helper text. If it's a long explicit prompt (like Moodboard), trust the prompt.
      if (prompt.length < 100) {
        fullPrompt = `Using the second image as a style reference (copy colors, materials, and lighting), ${fullPrompt}`;
      }
  }

  const textPart = { text: fullPrompt };
  parts.push(textPart);

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }

  throw new Error('No image was generated.');
};

export const generateMoodboard = async (images: File[]): Promise<string> => {
    const model = 'gemini-2.5-flash-image';

    const imageParts = await Promise.all(
        images.map(async (file) => ({
            inlineData: {
                data: await fileToBase64(file),
                mimeType: getMimeType(file),
            },
        }))
    );

    const textPart = { text: `Create a realistic, professional interior design material moodboard composed mainly of square or rectangular swatches of materials and textures.
Arrange all swatches by color palette or tonal harmony — grouped from light to dark, or warm to cool tones — ensuring a cohesive and elegant layout.
Include only authentic material samples such as wood, stone, marble, metal, tile, fabric, and paint.
You may include a maximum of three furniture items (chairs, tables, lamps, or decor pieces) only if they complement the palette — they must be isolated, with no background, cleanly cut out, and perfectly integrated into the layout.
The composition should remain material-focused, with furniture serving only as visual accents.
Use a white or light neutral background, soft natural shadows, and true-to-life lighting to simulate a photographed physical board.
Avoid clutter — no text, logos, hands, props, or environmental backgrounds.
The final result should appear as a professional architect or interior designer’s presentation moodboard — minimalist, curated, tactile, and ready for client presentation.` };

    const parts = [...imageParts, textPart];

    const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }

    throw new Error('No moodboard image was generated.');
};

export const generateFloorplan = async (
  originalImage: File,
  style: '2d' | '3d'
): Promise<string> => {
  const model = 'gemini-2.5-flash-image';
  const imageBase64 = await fileToBase64(originalImage);
  const mimeType = getMimeType(originalImage);
  
  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType,
    },
  };
  
  const prompt2d = "Clean and vectorize this hand-drawn floor plan into a clear architectural line drawing. Keep proportions identical, convert all hand lines into precise black CAD-style lines on white background. Lines shall be perfectly straight , correct small line's imperfection to have clean, straight line.No textures, no shadows, only geometry lines.";

  if (style === '2d') {
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [imagePart, { text: prompt2d }] },
        config: { responseModalities: [Modality.IMAGE] },
    });
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return part.inlineData.data;
    }
    throw new Error('2D floorplan generation failed.');
  }

  // 3D Style - Step 1: Clean 2D plan
  const clean2dResponse = await ai.models.generateContent({
    model,
    contents: { parts: [imagePart, { text: prompt2d }] },
    config: { responseModalities: [Modality.IMAGE] },
  });

  let clean2dImagePart;
  for (const part of clean2dResponse.candidates[0].content.parts) {
    if (part.inlineData) {
      clean2dImagePart = { inlineData: { data: part.inlineData.data, mimeType: 'image/png' } };
      break;
    }
  }
  
  if (!clean2dImagePart) {
    throw new Error('Failed to create a clean 2D plan for 3D conversion.');
  }

  // Step 2: Convert clean 2D to 3D
  const prompt3d_step2 = `Convert this clean black-line floor plan into a 3D isometric architectural view while preserving 100% of the original geometry and proportions (no redesign). Pre-clean & vectorize: – Use only architectural geometry; remove text, dimensions, arrows, hatches, furniture, centerlines, symbols, annotations. – Bridge small gaps in wall lines: auto-close discontinuities up to 0.3% of the image width (or 10 px minimum). If a gap is larger, keep it as drawn. Walls (never miss): – Walls are pairs of parallel lines; infer wall thickness from their spacing. – Single thick line = center it and assign 200 mm thickness. – Exterior outline = thickest continuous loop; interior partitions = thinner pairs. – Snap endpoints to meet cleanly; enforce perpendicular/colinear continuity unless the drawing clearly shows an angle. – Ensure closed wall loops around rooms; do not leave unintended breaks. Openings (don’t invent, don’t miss): – Doors: gap in wall with swing arc or thin leaf rectangle; cut full wall thickness; head height 2.1 m. – Windows: thin rectangle or break along a wall; sill 0.9 m, head 2.1 m. – If a symbol is ambiguous or missing, keep the wall solid (never guess an opening). Stairs (critical rule — do NOT treat broken lines as walls): – Dashed/broken lines, break marks, or direction arrows within a stair zone are NOT walls or partitions. – Recognize stair zones by a series of parallel treads (short repeated lines) and/or an arrow indicating up/down. – Keep only the stair outline/stringers as solid geometry; ignore internal dashed centerlines, break-lines, or cut-plane markers for wall detection. – Extrude stairs as steps following the arrow direction (if present); otherwise infer rise from tread sequence. Other elements: – Columns/cores: closed small rectangles/circles = structural; extrude to ceiling. – Voids/courtyards/shafts: closed empty regions designated as voids remain open to sky. Extrusion & levels: – Floor slab 200 mm; default wall height 3.0 m. – Doors/windows cut walls precisely; no floating fragments. Camera & style: – Isometric/axonometric camera showing depth and volume. – Surfaces: neutral white/light-gray; no textures or furniture unless explicitly drawn. – Lighting: soft realistic shadows, even ambient; plain white background (no scene clutter). – Output: clean CAD-like 3D iso, crisp edges, high contrast, presentation-ready. Strict constraints: – Do not change room sizes, wall positions, or add/remove openings. – If any element is unclear, preserve solids and avoid assumptions. – Maintain exact alignment with the original plan layout.`;

  const final3dResponse = await ai.models.generateContent({
    model,
    contents: { parts: [clean2dImagePart, { text: prompt3d_step2 }] },
    config: { responseModalities: [Modality.IMAGE] },
  });

  for (const part of final3dResponse.candidates[0].content.parts) {
    if (part.inlineData) return part.inlineData.data;
  }
  throw new Error('3D floorplan generation failed.');
};

export const generateAdvertisement = async (details: string, language: string): Promise<string> => {
  const model = 'gemini-3-flash-preview';
  const prompt = `Write a compelling and professional real estate advertisement in ${language} based on the following property details. The tone should be inviting and highlight the key features. Do not use asterisks (*) for formatting; use hyphens (-) for bullet points if needed.

Property Details:
${details}`;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text;
};