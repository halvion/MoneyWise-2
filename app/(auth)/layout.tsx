import Logo from '@/components/Logo'
import Logo2 from '@/components/Logo2'
import React, { ReactNode } from 'react'

function layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center">
      <Logo />
      <div className='mt-12'>{children}</div>
    </div>
  )
}

export default layout 
