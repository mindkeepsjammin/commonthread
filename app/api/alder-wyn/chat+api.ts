import { GoogleGenAI } from '@google/genai';
import { getSql } from '@/lib/neon/client';
import {
  verifyContextPermission,
  type PermissionContext,
} from '@/lib/alder-wyn/permission-filter';
import { assembleContext } from '@/lib/alder-wyn/context-assembler';
import { getSystemPrompt, formatContextData } from '@/lib/alder-wyn/prompts';

interface ChatRequest {
  conversationId?: string;
  message: string;
  contextType?: 'personal' | 'relational' | 'collective';
  contextId?: string;
  userId: string;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: ChatRequest = await request.json();

    if (!body.message?.trim()) {
      return Response.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!body.userId) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const sql = getSql();
    const contextType = body.contextType || 'personal';
    const now = new Date().toISOString();

    // Verify permission before proceeding
    const permissionContext: PermissionContext = {
      userId: body.userId,
      contextType,
      contextId: body.contextId,
    };

    const hasPermission = await verifyContextPermission(permissionContext);
    if (!hasPermission) {
      return Response.json(
        { error: 'You do not have permission to access this context' },
        { status: 403 }
      );
    }

    // Assemble privacy-filtered context and build system prompt
    const contextData = await assembleContext(permissionContext);
    const formattedContext = formatContextData(contextData);
    const systemPrompt = getSystemPrompt(contextType, formattedContext);

    // Load existing conversation or start fresh
    let conversationId = body.conversationId;
    let existingMessages: { role: string; content: string; timestamp: string }[] = [];

    if (conversationId) {
      const rows = await sql`
        SELECT messages FROM alder_wyn_conversations
        WHERE id = ${conversationId} AND user_id = ${body.userId}
      `;
      if (rows.length > 0) {
        existingMessages = rows[0].messages as typeof existingMessages;
      }
    }

    // Append user message
    const userMessage = { role: 'user' as const, content: body.message, timestamp: now };
    const allMessages = [...existingMessages, userMessage];

    // Build Gemini request
    const ai = new GoogleGenAI({ apiKey });
    const contents = allMessages.map((m) => ({
      role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      config: { systemInstruction: systemPrompt },
      contents,
    });

    const replyText = response.text ?? "I'm here whenever you're ready to talk.";
    const assistantMessage = {
      role: 'assistant' as const,
      content: replyText,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...allMessages, assistantMessage];

    // Persist to database
    if (conversationId) {
      await sql`
        UPDATE alder_wyn_conversations
        SET messages = ${JSON.stringify(updatedMessages)},
            updated_at = NOW()
        WHERE id = ${conversationId} AND user_id = ${body.userId}
      `;
    } else {
      const rows = await sql`
        INSERT INTO alder_wyn_conversations (user_id, context_type, context_id, messages)
        VALUES (${body.userId}, ${contextType}, ${body.contextId || null}, ${JSON.stringify(updatedMessages)})
        RETURNING id
      `;
      conversationId = rows[0].id as string;
    }

    return Response.json({
      conversationId,
      reply: assistantMessage,
    });
  } catch (error) {
    console.error('Alder Wyn chat error:', error);
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
