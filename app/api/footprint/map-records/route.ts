import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

/**
 * 獲取使用者的所有 MapRecord 數據（包含 MapRecordPicture）
 */
export async function GET() {
  try {
    // TODO: 從 session 或 token 獲取 user_id
    // 目前使用臨時的 user_id，實際應該從認證系統獲取
    const userId = 'temp-user-id'; // 需要替換為實際的 user_id

    const records = await prisma.mapRecord.findMany({
      where: {
        user_id: userId,
      },
      include: {
        pictures: true,
      },
      orderBy: {
        Create_time: 'desc',
      },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error('獲取 MapRecord 失敗:', error);
    return NextResponse.json(
      { error: '獲取記錄失敗' },
      { status: 500 }
    );
  }
}

/**
 * 創建新的 MapRecord（包含 MapRecordPicture）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, coordinate, pictures } = body;

    // TODO: 從 session 或 token 獲取 user_id
    // 目前使用臨時的 user_id，實際應該從認證系統獲取
    const userId = 'temp-user-id'; // 需要替換為實際的 user_id

    if (!name) {
      return NextResponse.json(
        { error: '地點名稱為必填項' },
        { status: 400 }
      );
    }

    // 創建 MapRecord 和相關的 MapRecordPicture
    const mapRecord = await prisma.mapRecord.create({
      data: {
        user_id: userId,
        name,
        description: description || null,
        coordinate: coordinate || null,
        pictures: {
          create: (pictures || []).map((picture: string) => ({
            picture,
          })),
        },
      },
      include: {
        pictures: true,
      },
    });

    return NextResponse.json({ record: mapRecord });
  } catch (error) {
    console.error('創建 MapRecord 失敗:', error);
    return NextResponse.json(
      { error: '創建記錄失敗' },
      { status: 500 }
    );
  }
}

