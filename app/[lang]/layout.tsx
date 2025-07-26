import { getGlobalData } from '@/lib/api-client';
import Navbar from '@/components/Navbar';

export default async function LanguageLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { lang: string }
}) {
  const { lang } = await params;
  
  const globalData = await getGlobalData(lang);
  
  return (
    <>
      <Navbar 
        lang={lang} 
        initialData={globalData} 
      />
      
      {children}
    </>
  );
}