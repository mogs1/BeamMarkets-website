import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import sideImage from "../../../public/assets/sideImage.png"


interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="flex h-screen">
      <Image
        src={sideImage}
        alt='Side Image'
        className='h-screen'
      />
      <div className="w-full md:w-3/5 bg-background flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-4">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            {subtitle && <p className="text-gray-600">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
