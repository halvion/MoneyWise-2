"use client";

import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { PiggyBank } from 'lucide-react'; // Ensure correct import

function Logo2() {
  const logoRef = useRef(null);

  const handleDownload = () => {
    if (logoRef.current === null) {
      return;
    }

    toPng(logoRef.current)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'logo.png';
        link.click();
      })
      .catch((err) => {
        console.error('Failed to convert to image', err);
      });
  };

  return (
    <div>
      <div ref={logoRef} className="flex items-center gap-2">
        <PiggyBank className='stroke w-11 h-11 stroke-amber-500 stroke-[1.5]' />
        <p className='bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text text-3xl font-bold'>
          MoneyWise
        </p>
      </div>
      <button onClick={handleDownload}>Download Logo as PNG</button>
    </div>
  );
}

export default Logo2;