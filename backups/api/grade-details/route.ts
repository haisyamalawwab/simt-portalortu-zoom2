import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const subjectId = searchParams.get('subjectId');

    if (!studentId || !subjectId) {
      return NextResponse.json({ error: 'studentId dan subjectId wajib diisi' }, { status: 400 });
    }

    const details = await db.gradeDetail.findMany({
      where: { studentId, subjectId },
      orderBy: [{ category: 'asc' }, { date: 'asc' }],
    });

    // Group by category
    const grouped = {
      tugas: details.filter(d => d.category === 'TUGAS').map(d => ({
        id: d.id, title: d.title, score: d.score, weight: d.weight,
        date: d.date ? (d.date instanceof Date ? d.date.toISOString() : String(d.date)) : null,
        note: d.note,
      })),
      harian: details.filter(d => d.category === 'HARIAN').map(d => ({
        id: d.id, title: d.title, score: d.score, weight: d.weight,
        date: d.date ? (d.date instanceof Date ? d.date.toISOString() : String(d.date)) : null,
        note: d.note,
      })),
      uts: details.filter(d => d.category === 'UTS').map(d => ({
        id: d.id, title: d.title, score: d.score, weight: d.weight,
        date: d.date ? (d.date instanceof Date ? d.date.toISOString() : String(d.date)) : null,
        note: d.note,
      })),
      uas: details.filter(d => d.category === 'UAS').map(d => ({
        id: d.id, title: d.title, score: d.score, weight: d.weight,
        date: d.date ? (d.date instanceof Date ? d.date.toISOString() : String(d.date)) : null,
        note: d.note,
      })),
      akhir: details.filter(d => d.category === 'AKHIR').map(d => ({
        id: d.id, title: d.title, score: d.score, weight: d.weight,
        date: d.date ? (d.date instanceof Date ? d.date.toISOString() : String(d.date)) : null,
        note: d.note,
      })),
    };

    // Calculate averages
    const avg = (arr: { score: number }[]) =>
      arr.length > 0 ? Math.round(arr.reduce((s, d) => s + d.score, 0) / arr.length * 10) / 10 : null;

    return NextResponse.json({
      details: grouped,
      averages: {
        tugas: avg(grouped.tugas),
        harian: avg(grouped.harian),
        uts: avg(grouped.uts),
        uas: avg(grouped.uas),
        akhir: avg(grouped.akhir),
      },
      hasData: details.length > 0,
    });
  } catch (error) {
    console.error('Grade Details API error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
