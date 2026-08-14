'use client';

import * as React from 'react';
import { useAdminAuth, AdminApiError } from '@/components/admin/auth-provider';
import { adminApi } from '@/lib/admin-api';
import {
  AdminButton,
  AdminCard,
  AdminInput,
  AdminPageHeader,
} from '@/components/admin/ui';
import { ImageUploadField } from '@/components/admin/image-upload-field';

export default function AdminProfilePage() {
  const { user, setUser } = useAdminAuth();
  const [name, setName] = React.useState(user?.name ?? '');
  const [email, setEmail] = React.useState(user?.email ?? '');
  const [avatarUrl, setAvatarUrl] = React.useState(user?.avatarUrl ?? '');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [message, setMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl ?? '');
    }
  }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const { user: u } = await adminApi.updateProfile({
        name,
        email,
        avatarUrl: avatarUrl || null,
      });
      setUser(u);
      setMessage('Profile updated.');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Update failed');
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await adminApi.updatePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Password changed.');
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Password change failed');
    }
  };

  return (
    <div>
      <AdminPageHeader title="Profile" description="Your admin account details." />
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <h2 className="mb-4 text-[1.125rem] text-navy">Account</h2>
          <form onSubmit={saveProfile} className="space-y-4">
            <AdminInput label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <AdminInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <ImageUploadField
              label="Avatar"
              value={avatarUrl}
              onChange={setAvatarUrl}
              onError={setError}
            />
            <p className="text-[0.8125rem] text-muted">Role: {user?.role}</p>
            <AdminButton type="submit">Save profile</AdminButton>
          </form>
        </AdminCard>

        <AdminCard>
          <h2 className="mb-4 text-[1.125rem] text-navy">Change password</h2>
          <form onSubmit={savePassword} className="space-y-4">
            <AdminInput
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <AdminInput
              label="New password (min 8)"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
            <AdminButton type="submit" variant="secondary">
              Update password
            </AdminButton>
          </form>
        </AdminCard>
      </div>
      {message && <p className="mt-4 text-[0.875rem] text-success">{message}</p>}
      {error && <p className="mt-4 text-[0.875rem] text-error">{error}</p>}
    </div>
  );
}
