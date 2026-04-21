import { runRefresh } from '@/lib/refresh';

export async function POST() {
  return runRefresh();
}

export async function GET() {
  return runRefresh();
}
