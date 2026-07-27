import { getUserSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import EditForm from '@/app/profile/edit/EditForm';

export default async function EditProfilePage() {
  const session = await getUserSession();
  if (!session?.uid) redirect('/auth/login');

  return (
    <div className="bg-gray-50 min-h-[85vh] py-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Edit Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Update your contact details and location.</p>
        </div>

        <EditForm initialPhone="" initialLoc={session.uloc || ''} />
      </div>
    </div>
  );
}