// KDS Kitchen Assistant - streams chat completions via Lovable AI Gateway

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `You are the Point of Sale Ai Kitchen Assistant inside a Kitchen Display System (KDS) used by line cooks and expediters in a busy restaurant.

Audience: line cook reading a tablet from up to 2 metres away in a hot kitchen. Speed and clarity are everything.

Style rules:
- Be terse. Short sentences. Bullet lists when listing more than two things.
- Use plain English. No jargon the cook would not use.
- Use markdown bold to highlight allergens, timing, and any safety-critical info.
- Never invent ticket data, table numbers, guest names, or order contents. If the user asks about a specific live ticket, say you do not have ticket context in this session and ask them to describe it.
- Use these terms: "Point of Sale", "Point of Sale Ai", "Kitchen Display System", "Served", "Queued", "Station", "Product" (not "Item"). Never say "Fire", "Auto-fire", or "Prep" in UI copy.
- Item state machine you can reference: SEEN -> IN PROGRESS -> SERVED.
- Order type header colors: DINE IN navy, TAKE OUT blue, DELIVERY teal, BANQUET gold.
- Aging colors: New red, In Progress orange, Seen grey, Served light grey, Overtime dark red.
- Do not output JSON, code blocks, or tool calls. Plain conversational markdown only.

You can help with: explaining KDS settings, allergen handling, course coordination (apps/mains/desserts), recipe and plating guidance the cook describes, prioritization advice for tickets the cook describes, and Point of Sale terminology.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, provider } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map the user-selected provider (from Settings → AI Integration) to a
    // gateway-supported model. Maya AI has no gateway equivalent and falls
    // back to Gemini so chat still works.
    const PROVIDER_MODEL: Record<string, string> = {
      openai: "openai/gpt-5-mini",
      google: "google/gemini-3-flash-preview",
      maya: "google/gemini-3-flash-preview",
    };
    const model = PROVIDER_MODEL[String(provider ?? "").toLowerCase()] ?? "google/gemini-3-flash-preview";

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });


    if (!upstream.ok) {
      const status = upstream.status;
      let message = "Assistant is unavailable. Please try again.";
      if (status === 429) message = "Too many requests right now. Please wait a moment and try again.";
      else if (status === 402) message = "AI credits exhausted. Please add credits in workspace billing.";
      else {
        try { message = (await upstream.text()).slice(0, 300) || message; } catch {}
      }
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
