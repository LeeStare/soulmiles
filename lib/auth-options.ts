import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Adapter } from 'next-auth/adapters';
import { prisma } from './prisma';

/**
 * NextAuth 配置選項
 * 包含所有認證相關的配置，包括 providers, callbacks, events 等
 */

// Google OAuth 憑證
// 從環境變數讀取，不提供 fallback 值以確保安全性
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// 初始化 PrismaAdapter
const adapter = PrismaAdapter(prisma) as Adapter;

// 初始化 providers 陣列
const providers: any[] = [];

// 只有在憑證存在時才添加 Google Provider
if (googleClientId && googleClientSecret) {
  // 在開發環境中輸出配置信息（僅用於調試，不輸出完整 Secret）
  if (process.env.NODE_ENV === 'development') {
    console.log('[NextAuth Config] Google Client ID:', googleClientId.substring(0, 20) + '...');
    console.log('[NextAuth Config] Google Client Secret:', googleClientSecret ? '已設置' : '未設置');
  }

  // 初始化 Google Provider
  // 確保使用正確的配置格式
  const googleProvider = Google({
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    // 移除可能導致問題的 authorization 參數，使用默認配置
  });
  
  providers.push(googleProvider);
} else {
  // 在開發環境中輸出警告
  if (process.env.NODE_ENV === 'development') {
    console.warn('[NextAuth Config] Google OAuth 憑證未配置。請檢查 GOOGLE_CLIENT_ID 和 GOOGLE_CLIENT_SECRET 環境變數。');
  }
}

// 驗證 providers 不為空（只有在需要認證功能時才驗證）
// 注意：如果沒有 providers，NextAuth 仍然可以初始化，但無法進行登入

export const authOptions = {
  adapter,
  providers,
  pages: {
    signIn: '/',
  },
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  // 確保在開發環境中輸出配置信息（僅用於調試）
  ...(process.env.NODE_ENV === 'development' && {
    logger: {
      error(code, metadata) {
        console.error('[NextAuth Error]', code, metadata);
      },
      warn(code) {
        console.warn('[NextAuth Warn]', code);
      },
      debug(code, metadata) {
        console.log('[NextAuth Debug]', code, metadata);
      },
    },
  }),
  events: {
    async createUser({ user }) {
      // 當新用戶被創建時，確保 Google_Oath 欄位被正確設置
      try {
        if (user.email) {
          // 查找對應的 Account 以獲取 Google providerAccountId
          const account = await prisma.account.findFirst({
            where: {
              userId: user.id,
              provider: 'google',
            },
          });

          if (account) {
            // 更新用戶的 Google_Oath 欄位
            await prisma.user.update({
              where: { id: user.id },
              data: {
                Google_Oath: account.providerAccountId,
                coin: 0,
                IsActive: true,
                Update_time: new Date(),
              },
            });
          }
        }
      } catch (error) {
        console.error('初始化新用戶資料失敗:', error);
      }
    },
    async linkAccount({ account, user }) {
      // 當帳號被連結時，更新 Google_Oath
      try {
        if (account.provider === 'google' && account.providerAccountId) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              Google_Oath: account.providerAccountId,
              Update_time: new Date(),
            },
          });
        }
      } catch (error) {
        console.error('更新用戶 Google_Oath 失敗:', error);
      }
    },
  },
  callbacks: {
    async session({ session, user, token }) {
      // NextAuth v5 使用 adapter 時，session callback 可能同時有 user 和 token
      // 優先使用 user.id，如果沒有則使用 token.sub
      const userId = user?.id || token?.sub || token?.userId;
      
      if (userId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId as string },
            select: {
              coin: true,
              IsActive: true,
              Google_Oath: true,
              UserName: true,
              Field: true,
            },
          });

          if (dbUser && session.user) {
            // 擴展 session.user 以包含自定義欄位
            (session.user as any).id = userId;
            (session.user as any).coin = dbUser.coin;
            (session.user as any).IsActive = dbUser.IsActive;
            (session.user as any).Google_Oath = dbUser.Google_Oath;
            (session.user as any).UserName = dbUser.UserName;
            (session.user as any).Field = dbUser.Field;
          }
        } catch (error) {
          console.error('獲取用戶資料失敗:', error);
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      // 在 JWT token 中保存 user id
      if (user) {
        token.userId = user.id;
      }
      return token;
    },
  },
  secret: process.env.AUTH_SECRET || 'agAEIhrYpa2F0QneVhZq/ugGncS6lcBtNcBfezU3CmQ=',
};

