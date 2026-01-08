
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const LOCAL_LORE: Record<string, { prefixes: string[], suffixes: string[], descriptions: string[] }> = {
  Forest: {
    prefixes: ["Whispering", "Emerald", "Shadow", "Forgotten", "Ancient"],
    suffixes: ["Grove", "Thicket", "Wilds", "Woods", "Canopy"],
    descriptions: ["A place where the trees seem to lean in to hear your thoughts.", "Vines as thick as serpents coil around stone ruins."]
  },
  Desert: {
    prefixes: ["Burning", "Golden", "Silent", "Crimson", "Shifting"],
    suffixes: ["Dunes", "Expanse", "Wastes", "Sands", "Plateau"],
    descriptions: ["The heat distortion makes the horizon dance like a dying flame.", "Ancient glass shards glitter beneath the unforgiving sun."]
  },
  Volcanic: {
    prefixes: ["Ashen", "Obsidian", "Searing", "Molten", "Sulfur"],
    suffixes: ["Crags", "Peak", "Basin", "Fissure", "Flow"],
    descriptions: ["The ground pulses with the rhythmic heat of a subterranean heart.", "Rivers of liquid fire carve paths through the black rock."]
  },
  Mystic: {
    prefixes: ["Ethereal", "Void", "Celestial", "Arcane", "Luminous"],
    suffixes: ["Rift", "Sanctum", "Nexus", "Dream", "Void"],
    descriptions: ["Gravity feels optional here, as stones drift upward like bubbles.", "The air hums with a frequency that vibrates in your marrow."]
  },
  Ruins: {
    prefixes: ["Shattered", "Sunken", "Iron", "Grave", "Hollow"],
    suffixes: ["Bastion", "Citadel", "Keep", "Tomb", "Remnant"],
    descriptions: ["Stones piled by hands long dead now serve as home for ghosts.", "Echoes of a fallen empire still resonate within these broken halls."]
  }
};

function generateLocalDetails(type: string) {
  const data = LOCAL_LORE[type] || LOCAL_LORE.Forest;
  const prefix = data.prefixes[Math.floor(Math.random() * data.prefixes.length)];
  const suffix = data.suffixes[Math.floor(Math.random() * data.suffixes.length)];
  const desc = data.descriptions[Math.floor(Math.random() * data.descriptions.length)];
  return {
    name: `${prefix} ${suffix}`,
    description: desc
  };
}

export async function generateRealmDetails(level: number, type: string, retryCount = 0): Promise<{ name: string, description: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a unique name and a short eerie description for a level ${level} ${type} realm in a dark fantasy lost world. Respond with JSON only.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["name", "description"]
        }
      }
    });
    
    return JSON.parse(response.text);
  } catch (error: any) {
    // Handle 429 Resource Exhausted or other transient errors
    if ((error?.status === 429 || error?.message?.includes("429")) && retryCount < 2) {
      console.warn(`Rate limit hit. Retrying in ${1000 * (retryCount + 1)}ms...`);
      await sleep(1000 * (retryCount + 1));
      return generateRealmDetails(level, type, retryCount + 1);
    }

    console.error("Gemini failed, using procedural fallback:", error);
    return generateLocalDetails(type);
  }
}
