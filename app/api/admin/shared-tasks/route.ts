import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * 軟體擁有者 API：管理共享任務
 * 
 * 使用環境變數 ADMIN_API_KEY 進行驗證
 * 
 * POST /api/admin/shared-tasks - 新增共享任務
 * body: {
 *   name: string,
 *   description: string,
 *   coordinate: string (格式: "lat,lon"),
 *   Coin: number
 * }
 * 
 * GET /api/admin/shared-tasks - 獲取所有共享任務
 * 
 * DELETE /api/admin/shared-tasks - 刪除共享任務
 * body: { taskId: string }
 */

// 驗證管理員 API Key
function verifyAdminKey(request: NextRequest): boolean {
  const adminApiKey = process.env.ADMIN_API_KEY;
  if (!adminApiKey) {
    console.warn('[Admin API] ADMIN_API_KEY 未配置');
    return false;
  }

  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return false;
  }

  // 支援 Bearer token 或直接 API Key
  const providedKey = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : authHeader;

  return providedKey === adminApiKey;
}

/**
 * 新增共享任務
 */
export async function POST(request: NextRequest) {
  try {
    // 驗證管理員 API Key
    if (!verifyAdminKey(request)) {
      return NextResponse.json(
        { error: '未授權：需要有效的管理員 API Key' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { name, description, coordinate, Coin } = body;

    // 驗證必填欄位
    if (!name || !description || !coordinate || Coin === undefined) {
      return NextResponse.json(
        { error: '缺少必填欄位：name, description, coordinate, Coin' },
        { status: 400 }
      );
    }

    // 驗證座標格式
    const coordParts = coordinate.split(',');
    if (coordParts.length !== 2) {
      return NextResponse.json(
        { error: '座標格式錯誤，應為 "lat,lon"' },
        { status: 400 }
      );
    }

    const lat = parseFloat(coordParts[0]);
    const lon = parseFloat(coordParts[1]);
    if (isNaN(lat) || isNaN(lon)) {
      return NextResponse.json(
        { error: '座標格式錯誤，lat 和 lon 必須為數字' },
        { status: 400 }
      );
    }

    // 創建共享任務
    const task = await prisma.task.create({
      data: {
        name,
        description,
        coordinate,
        Coin: parseInt(Coin.toString(), 10),
        isShared: true, // 標記為共享任務
        isMainTask: false,
        isTemporary: false,
      },
    });

    return NextResponse.json({
      success: true,
      task,
      message: '共享任務已創建',
    });
  } catch (error: any) {
    console.error('[Admin API] 創建共享任務失敗:', error);
    return NextResponse.json(
      { error: '創建共享任務失敗', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * 獲取所有共享任務
 */
export async function GET(request: NextRequest) {
  try {
    // 驗證管理員 API Key
    if (!verifyAdminKey(request)) {
      return NextResponse.json(
        { error: '未授權：需要有效的管理員 API Key' },
        { status: 401 }
      );
    }

    const tasks = await prisma.task.findMany({
      where: {
        isShared: true,
      },
      orderBy: {
        Create_time: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      tasks,
      count: tasks.length,
    });
  } catch (error: any) {
    console.error('[Admin API] 獲取共享任務失敗:', error);
    return NextResponse.json(
      { error: '獲取共享任務失敗', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * 刪除共享任務
 */
export async function DELETE(request: NextRequest) {
  try {
    // 驗證管理員 API Key
    if (!verifyAdminKey(request)) {
      return NextResponse.json(
        { error: '未授權：需要有效的管理員 API Key' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: '缺少必填欄位：taskId' },
        { status: 400 }
      );
    }

    // 檢查任務是否存在且為共享任務
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { error: '任務不存在' },
        { status: 404 }
      );
    }

    if (!task.isShared) {
      return NextResponse.json(
        { error: '只能刪除共享任務' },
        { status: 403 }
      );
    }

    // 刪除任務（會自動刪除相關的 UserTask 記錄，因為有 onDelete: Cascade）
    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({
      success: true,
      message: '共享任務已刪除',
    });
  } catch (error: any) {
    console.error('[Admin API] 刪除共享任務失敗:', error);
    return NextResponse.json(
      { error: '刪除共享任務失敗', details: error.message },
      { status: 500 }
    );
  }
}

