import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { auth } from '../../../../lib/auth';

// 強制動態路由，避免建置時嘗試靜態生成
export const dynamic = 'force-dynamic';

/**
 * 獲取任務列表
 * - 共享任務（isShared: true）：所有用戶都可見
 * - 主要任務（isMainTask: true）：只有 assignedUserId 為當前用戶的任務
 * - 臨時任務（isTemporary: true）：只有通過 UserTask 關聯的任務
 */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user && (session.user as any).id ? (session.user as any).id : null;

    // 計算7天前的日期
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 構建查詢條件
    const whereConditions: any = {
      Create_time: {
        gte: sevenDaysAgo, // 只獲取7天內的任務
      },
      OR: [],
    };

    // 1. 共享任務：所有用戶都可見
    whereConditions.OR.push({
      isShared: true,
    });

    // 2. 主要任務：只有當前用戶的任務
    if (userId) {
      whereConditions.OR.push({
        isMainTask: true,
        assignedUserId: userId,
        isShared: false, // 確保不是共享任務
      });
    }

    // 3. 臨時任務：通過 UserTask 關聯查詢
    if (userId) {
      // 先查詢用戶的 UserTask 關聯
      const userTasks = await prisma.userTask.findMany({
        where: {
          user_id: userId,
          task: {
            Create_time: {
              gte: sevenDaysAgo,
            },
            isTemporary: true,
            isShared: false, // 確保不是共享任務
          },
        },
        select: {
          task_id: true,
        },
      });

      const temporaryTaskIds = userTasks.map((ut) => ut.task_id);
      if (temporaryTaskIds.length > 0) {
        whereConditions.OR.push({
          id: { in: temporaryTaskIds },
        });
      }
    }

    // 如果沒有登入，只返回共享任務
    if (!userId) {
      whereConditions.OR = [{ isShared: true }];
    }

    const tasks = await prisma.task.findMany({
      where: whereConditions,
      orderBy: [
        {
          isShared: 'desc', // 共享任務優先
        },
        {
          isMainTask: 'desc', // 主要任務優先
        },
        {
          Create_time: 'desc',
        },
      ],
    });

    return NextResponse.json({ tasks });
  } catch (error: any) {
    console.error('獲取 Task 失敗:', error);
    // 如果是資料庫連接錯誤，返回空陣列而不是錯誤
    if (error?.message?.includes('Environment variable') || error?.message?.includes('DATABASE_URL')) {
      return NextResponse.json({ tasks: [] }, { status: 200 });
    }
    return NextResponse.json(
      { error: '獲取任務失敗' },
      { status: 500 }
    );
  }
}

