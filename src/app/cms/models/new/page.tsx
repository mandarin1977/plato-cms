import CmsPageHeader from '@/components/cms/CmsPageHeader';
import ModelForm from '@/components/cms/ModelForm';

export default function NewModelPage() {
  return (
    <div>
      <CmsPageHeader
        title="새 콘텐츠 모델"
        description="콘텐츠 타입과 필드를 정의하세요."
        breadcrumbs={[
          { label: '콘텐츠 모델', href: '/cms/models' },
          { label: '새 모델' },
        ]}
      />
      <ModelForm />
    </div>
  );
}
