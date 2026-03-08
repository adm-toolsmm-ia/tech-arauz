import { NextRequest, NextResponse } from 'next/server';
import { bulkUpdateLmModelsActiveAction } from '@/app/actions/lm-models';

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { modelIds, isActive } = body;

    if (!Array.isArray(modelIds) || typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request: modelIds must be an array and isActive must be a boolean' },
        { status: 400 },
      );
    }

    const result = await bulkUpdateLmModelsActiveAction(modelIds, isActive);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      ids: result.ids,
    });
  } catch (error) {
    console.error('Error in bulk update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
