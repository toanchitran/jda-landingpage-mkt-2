'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const RB2B_KEY = 'LNKLDHPVZ2OJ';

export default function RB2BLoader() {
  const pathname = usePathname();

  useEffect(() => {
    const existing = document.getElementById('rb2b-script');
    if (existing) existing.remove();

    const script = document.createElement('script');
    script.id = 'rb2b-script';
    script.async = true;
    script.src = `https://ddwl4m2hdecbv.cloudfront.net/b/${RB2B_KEY}/${RB2B_KEY}.js.gz`;
    document.body.appendChild(script);
  }, [pathname]);

  return null;
}


