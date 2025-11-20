import { prisma } from '../../../lib/prisma';
import MyMapTabClient from './MyMapTabClient';

/**
 * MyMapTabData - Server Component
 * 在服務器端獲取 MapRecord 數據並傳遞給 Client Component
 */
export default async function MyMapTabData() {
  // TODO: 從 session 或 token 獲取 user_id
  // 目前使用臨時的 user_id，實際應該從認證系統獲取
  const userId = 'temp-user-id'; // 需要替換為實際的 user_id

  let records = [];

  try {
    const mapRecords = await prisma.mapRecord.findMany({
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

    // 轉換日期為字符串以便序列化
    records = mapRecords.map((record) => ({
      id: record.id,
      name: record.name,
      description: record.description,
      Create_time: record.Create_time.toISOString(),
      pictures: record.pictures.map((pic) => ({
        id: pic.id,
        picture: pic.picture,
      })),
    }));
  } catch (error) {
    console.error('獲取 MapRecord 失敗:', error);
  }

  return <MyMapTabClient records={records} />;
}

