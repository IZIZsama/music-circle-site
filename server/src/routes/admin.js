import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAdmin } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

router.use(requireAdmin);

// ユーザー一覧（全件）
router.get('/users', async (req, res) => {
  const users = await prisma.user.findMany({
    orderBy: [{ studentId: 'asc' }],
    select: { id: true, name: true, studentId: true, email: true, iconPath: true, isAdmin: true },
  });
  res.json({ users });
});

// 学籍番号でユーザー検索（管理者付与用）
router.get('/users/search', async (req, res) => {
  const { studentId } = req.query;
  if (!studentId || String(studentId).length < 2) {
    return res.status(400).json({ error: '学籍番号を2桁以上入力してください' });
  }
  const users = await prisma.user.findMany({
    where: { studentId: { contains: studentId } },
    select: { id: true, name: true, studentId: true, email: true, iconPath: true, isAdmin: true },
  });
  res.json({ users });
});

// 管理者付与
router.post('/users/:id/grant-admin', async (req, res) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, studentId: true, isAdmin: true },
  });
  if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません' });
  if (user.isAdmin) return res.status(400).json({ error: '既に管理者です' });
  await prisma.user.update({
    where: { id },
    data: { isAdmin: true },
  });
  res.json({ message: '管理者権限を付与しました', user: { ...user, isAdmin: true } });
});

// 退会（単体削除）
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (id === req.session.userId) {
    return res.status(400).json({ error: '自分自身を削除することはできません' });
  }
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません' });
  await prisma.reservation.deleteMany({ where: { userId: id } });
  await prisma.userBand.deleteMany({ where: { userId: id } });
  await prisma.passwordReset.deleteMany({ where: { userId: id } });
  await prisma.user.delete({ where: { id } });
  res.json({ ok: true });
});

// 学籍番号上2桁で一括検索（削除前確認用）
router.get('/users/bulk-preview', async (req, res) => {
  const { prefix } = req.query;
  if (!prefix || String(prefix).length < 2) {
    return res.status(400).json({ error: '学籍番号の上2桁以上を指定してください' });
  }
  const users = await prisma.user.findMany({
    where: { studentId: { startsWith: String(prefix) } },
    select: { id: true, name: true, studentId: true, iconPath: true },
  });
  res.json({ users, count: users.length });
});

// 一括削除実行
router.post('/users/bulk-delete', async (req, res) => {
  const { userIds } = req.body;
  if (!Array.isArray(userIds) || !userIds.length) {
    return res.status(400).json({ error: '削除対象ユーザーを指定してください' });
  }
  if (userIds.includes(req.session.userId)) {
    return res.status(400).json({ error: '自分自身を削除対象に含めることはできません' });
  }
  await prisma.reservation.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.userBand.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.passwordReset.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  res.json({ ok: true, deleted: userIds.length });
});

export default router;
