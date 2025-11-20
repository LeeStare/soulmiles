import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

/**
 * 獲取使用者的所有 Footprint 數據
 */
export async function GET() {
  try {
    // TODO: 從 session 或 token 獲取 user_id
    // 目前使用臨時的 user_id，實際應該從認證系統獲取
    const userId = 'temp-user-id'; // 需要替換為實際的 user_id

    const footprints = await prisma.footprint.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        Create_time: 'desc',
      },
    });

    return NextResponse.json({ footprints });
  } catch (error) {
    console.error('獲取 Footprint 失敗:', error);
    return NextResponse.json(
      { error: '獲取足跡失敗' },
      { status: 500 }
    );
  }
}

