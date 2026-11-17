import { connection } from 'next/server';
import {
  getCachedVillas,
  getCachedHeroSlides,
  getCachedCampingGear,
  getCachedKithulProducts,
} from '@/lib/cached-data';
import { Villa, HeroSlide, CampingGear, KithulProduct } from '@/lib/types';
import HomePageClient from '@/components/HomePageClient';

export default async function HomePage() {
  await connection();

  let initialVillas: Villa[] = [];
  let initialSlides: HeroSlide[] = [];
  let initialGear: CampingGear[] = [];
  let initialKithul: KithulProduct[] = [];
  let ssrStatus = {
    villas: false,
    slides: false,
    camping: false,
    kithul: false,
  };

  try {
    const [villasRes, slidesRes, campingRes, kithulRes] = await Promise.allSettled([
      getCachedVillas(),
      getCachedHeroSlides(),
      getCachedCampingGear(),
      getCachedKithulProducts(),
    ]);

    if (villasRes.status === 'fulfilled') {
      initialVillas = villasRes.value;
      ssrStatus.villas = true;
    }
    if (slidesRes.status === 'fulfilled') {
      initialSlides = slidesRes.value;
      ssrStatus.slides = true;
    }
    if (campingRes.status === 'fulfilled') {
      initialGear = campingRes.value;
      ssrStatus.camping = true;
    }
    if (kithulRes.status === 'fulfilled') {
      initialKithul = kithulRes.value.filter(k => !['kithul-treacle-clay-1000', 'kithul-jaggery-1000'].includes(k.id));
      ssrStatus.kithul = true;
    }
  } catch (error) {
    console.warn('Server prefetch fallback:', error);
    ssrStatus = { villas: false, slides: false, camping: false, kithul: false };
  }

  return (
    <HomePageClient
      initialVillas={initialVillas}
      initialSlides={initialSlides}
      initialGear={initialGear}
      initialKithul={initialKithul}
      ssrStatus={ssrStatus}
    />
  );
}
