import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/** Bust public ISR after admin updates to contact, news, and similar content. */
export async function POST(request: Request) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let tag = 'contact-info';
  try {
    const body = (await request.json()) as { tag?: string };
    if (body.tag) tag = body.tag;
  } catch {
    /* default tag */
  }

  revalidateTag(tag, 'max');
  revalidatePath('/', 'layout');
  if (tag === 'contact-info') {
    revalidatePath('/contact');
  }
  if (tag === 'news') {
    revalidatePath('/news', 'layout');
  }
  if (tag === 'certificates') {
    revalidatePath('/company');
  }
  return NextResponse.json({ ok: true });
}
