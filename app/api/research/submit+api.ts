import { getSql, type FormType } from '@/lib/neon/client';

interface SubmitRequest {
  formType: FormType;
  consentConfirmed: boolean;
  preferredName: string | null;
  responses: Record<string, unknown>;
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: SubmitRequest = await request.json();

    // Validate required fields
    if (!body.formType) {
      return Response.json(
        { error: 'Form type is required' },
        { status: 400 }
      );
    }

    if (!body.consentConfirmed) {
      return Response.json(
        { error: 'Consent is required' },
        { status: 400 }
      );
    }

    const validFormTypes: FormType[] = ['parent', 'teen', 'grandparent', 'adult_no_children'];
    if (!validFormTypes.includes(body.formType)) {
      return Response.json(
        { error: 'Invalid form type' },
        { status: 400 }
      );
    }

    // Get user agent for analytics
    const userAgent = request.headers.get('user-agent') || null;

    // Insert into database
    const result = await getSql()`
      INSERT INTO research_responses (
        form_type,
        consent_confirmed,
        preferred_name,
        responses,
        user_agent
      )
      VALUES (
        ${body.formType},
        ${body.consentConfirmed},
        ${body.preferredName},
        ${JSON.stringify(body.responses)},
        ${userAgent}
      )
      RETURNING id, submitted_at
    `;

    return Response.json({
      success: true,
      id: result[0].id,
      submittedAt: result[0].submitted_at,
    });
  } catch (error) {
    console.error('Error submitting research form:', error);

    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('NEON_DATABASE_URL')) {
      return Response.json(
        { error: 'Database not configured. Please set NEON_DATABASE_URL.' },
        { status: 500 }
      );
    }

    return Response.json(
      { error: 'Failed to submit form. Please try again.' },
      { status: 500 }
    );
  }
}
