import { dbGetAll } from '@/lib/db';
import { Villa, HeroSlide, CampingGear, KithulProduct } from '@/lib/types';
import HomePageClient from '@/components/HomePageClient';

export default async function HomePage() {
  let initialVillas: Villa[] = [];
  let initialSlides: HeroSlide[] = [];
  let initialGear: CampingGear[] = [];
  let initialKithul: KithulProduct[] = [];

  try {
    const [rawVillas, rawSlides, rawCamping, rawKithul] = await Promise.all([
      dbGetAll<Villa>('lankagama_villas').catch(() => [] as Villa[]),
      dbGetAll<HeroSlide>('lankagama_slides').catch(() => [] as HeroSlide[]),
      dbGetAll<CampingGear>('lankagama_camping').catch(() => [] as CampingGear[]),
      dbGetAll<KithulProduct>('lankagama_kithul').catch(() => [] as KithulProduct[]),
    ]);
    initialVillas = rawVillas.filter(v => !['villa-1', 'villa-2', 'villa-3', 'villa-4'].includes(v.id));
    initialSlides = rawSlides;
    initialGear = rawCamping;
    initialKithul = rawKithul.filter(k => !['kithul-treacle-clay-1000', 'kithul-jaggery-1000'].includes(k.id));
  } catch (error) {
    console.warn('Server prefetch fallback:', error);
  }

  return (
    <HomePageClient
      initialVillas={initialVillas}
      initialSlides={initialSlides}
      initialGear={initialGear}
      initialKithul={initialKithul}
    />
  );
}
