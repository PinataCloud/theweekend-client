import { useEffect } from 'react';

const IMAGES_TO_PRELOAD = [
  "https://dweb.mypinata.cloud/ipfs/QmTidtsgh4faygkV3Fj1f2gfdLNYCFh3gsgNVWRsGwSQbA",
  "https://dweb.mypinata.cloud/ipfs/QmeDejkafV9hwBE2zYmmfUkLb5AjqPFpRUY2XkbLd8iq6n",
  "https://dweb.mypinata.cloud/ipfs/QmZpFMrCFc8Xs3orLBUukiG3f1VfNaHweSZYTB2SyZGyfc",
  "https://dweb.mypinata.cloud/ipfs/QmQgqbUnCVwcXvdXjPMxEvY2vTv9HLY3ZwjG6rQS9Jc8XN"
];

export function ImagePreloader() {
  useEffect(() => {
    IMAGES_TO_PRELOAD.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return null; // This component doesn't render anything
}
