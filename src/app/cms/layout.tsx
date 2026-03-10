import CmsSidebar from '@/components/cms/CmsSidebar';

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <CmsSidebar />
      <div className="flex-1 bg-gray-50/50 p-8">{children}</div>
    </div>
  );
}
