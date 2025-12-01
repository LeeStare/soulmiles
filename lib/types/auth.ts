/**
 * NextAuth 型別擴展
 * 擴展預設的 Session 和 User 型別以包含自定義欄位
 */

import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      coin?: number;
      IsActive?: boolean;
      Google_Oath?: string | null;
      UserName?: string | null;
      Field?: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    coin?: number;
    IsActive?: boolean;
    Google_Oath?: string | null;
    UserName?: string | null;
    Field?: string | null;
  }
}

// NextAuth v5 可能不需要 JWT 模組擴展
// 如果需要的話，可以通過 token 型別斷言來處理

