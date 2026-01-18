import { NextRequest, NextResponse } from 'next/server';
import {
  createE2BSandbox,
  writeFilesToE2BSandbox,
  getSandbox,
  storeSandbox,
  killSandbox,
  type GeneratedFile
} from '@/lib/e2b';

// POST - Create a new sandbox
export async function POST() {
  try {
    const { sandbox, previewUrl } = await createE2BSandbox();
    const sandboxId = crypto.randomUUID();

    storeSandbox(sandboxId, sandbox);

    return NextResponse.json({
      sandboxId,
      previewUrl,
      status: 'ready'
    });
  } catch (error) {
    console.error('Failed to create sandbox:', error);
    return NextResponse.json(
      { error: 'Failed to create sandbox', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Write files to sandbox
export async function PUT(request: NextRequest) {
  try {
    const { sandboxId, files } = await request.json() as {
      sandboxId: string;
      files: GeneratedFile[]
    };

    if (!sandboxId || !files) {
      return NextResponse.json(
        { error: 'Missing sandboxId or files' },
        { status: 400 }
      );
    }

    const sandbox = getSandbox(sandboxId);
    if (!sandbox) {
      return NextResponse.json(
        { error: 'Sandbox not found' },
        { status: 404 }
      );
    }

    await writeFilesToE2BSandbox(sandbox, files);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to write files:', error);
    return NextResponse.json(
      { error: 'Failed to write files', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Kill sandbox
export async function DELETE(request: NextRequest) {
  try {
    const { sandboxId } = await request.json();

    if (!sandboxId) {
      return NextResponse.json(
        { error: 'Missing sandboxId' },
        { status: 400 }
      );
    }

    await killSandbox(sandboxId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to kill sandbox:', error);
    return NextResponse.json(
      { error: 'Failed to kill sandbox', details: String(error) },
      { status: 500 }
    );
  }
}
