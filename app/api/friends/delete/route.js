import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

// 刪除好友關係
export async function DELETE(request) {
  try {
    const session = await auth();

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const body = await request.json();
    const { friendId } = body;

    if (!friendId) {
      return NextResponse.json({ error: '缺少好友 ID' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: '使用者不存在' }, { status: 404 });
    }

    // 使用事務刪除雙向好友關係
    await prisma.$transaction(async (tx) => {
      // 刪除 user -> friend 的關係
      await tx.friend.deleteMany({
        where: {
          user_id: user.id,
          friend_id: friendId,
        },
      });

      // 刪除 friend -> user 的關係
      await tx.friend.deleteMany({
        where: {
          user_id: friendId,
          friend_id: user.id,
        },
      });
    });

    return NextResponse.json({ message: '好友已刪除' });
  } catch (error) {
    console.error('刪除好友失敗:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

