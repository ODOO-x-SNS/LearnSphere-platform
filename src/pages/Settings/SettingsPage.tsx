import { useState, useEffect } from 'react';
import {
  Settings, User, Shield, Bell, Palette, Key,
  Save, Globe, Mail,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card, Button, Input, Tabs, Badge } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/auth';
import { healthApi } from '../../services/api';
import { useUpdateProfile, useChangePassword } from '../../hooks/useApi';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <Header title="Settings" subtitle="Manage your account and platform preferences" />

      <div className="p-8">
        <Tabs
          tabs={[
            {
              id: 'profile',
              label: 'Profile',
              icon: <User className="h-4 w-4" />,
              content: <ProfileTab />,
            },
            {
              id: 'security',
              label: 'Security',
              icon: <Key className="h-4 w-4" />,
              content: <SecurityTab />,
            },
            {
              id: 'notifications',
              label: 'Notifications',
              icon: <Bell className="h-4 w-4" />,
              content: <NotificationsTab />,
            },
            {
              id: 'platform',
              label: 'Platform',
              icon: <Globe className="h-4 w-4" />,
              content: <PlatformTab />,
            },
          ]}
        />
      </div>
    </div>
  );
}

function ProfileTab() {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const updateProfile = useUpdateProfile();

  const handleSave = () => {
    if (!name.trim()) {
      toast('error', 'Name cannot be empty');
      return;
    }
    updateProfile.mutate(
      { name: name.trim() },
      {
        onSuccess: () => toast('success', 'Profile updated'),
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Failed to update profile';
          toast('error', msg);
        },
      }
    );
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-200/30">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{user?.name}</h3>
            <p className="text-sm text-text-muted">{user?.email}</p>
            <Badge variant="primary" className="mt-2">{user?.role}</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" disabled />
        </div>
        <div className="flex justify-end mt-6">
          <Button
            icon={<Save className="h-4 w-4" />}
            onClick={handleSave}
            loading={updateProfile.isPending}
          >
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const changePassword = useChangePassword();

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast('error', 'All password fields are required');
      return;
    }
    if (newPassword.length < 8) {
      toast('error', 'New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast('error', 'New passwords do not match');
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast('success', 'Password updated');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        },
        onError: (err: any) => {
          const msg = err?.response?.data?.message || 'Failed to update password';
          toast('error', msg);
        },
      }
    );
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Key className="h-5 w-5 text-primary-500" /> Change Password
        </h3>
        <div className="space-y-4">
          <Input label="Current Password" type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <Input label="New Password" type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <Input label="Confirm Password" type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={handleChangePassword} loading={changePassword.isPending}>Update Password</Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent-500" /> Two-Factor Authentication
        </h3>
        <p className="text-sm text-text-muted mb-4">Add an extra layer of security to your account</p>
        <Button variant="secondary">Enable 2FA</Button>
      </Card>
    </div>
  );
}

function NotificationsTab() {
  const [notifications, setNotifications] = useState({
    email: true,
    enrollment: true,
    completion: false,
    reviews: true,
  });

  const toggle = (key: keyof typeof notifications) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const items = [
    { key: 'email' as const, label: 'Email Notifications', desc: 'Receive email for important updates' },
    { key: 'enrollment' as const, label: 'New Enrollments', desc: 'When a learner enrolls in your course' },
    { key: 'completion' as const, label: 'Course Completions', desc: 'When a learner completes your course' },
    { key: 'reviews' as const, label: 'New Reviews', desc: 'When a learner leaves a review' },
  ];

  return (
    <div className="max-w-2xl">
      <Card>
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Bell className="h-5 w-5 text-warning-500" /> Notification Preferences
        </h3>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <p className="text-xs text-text-muted">{item.desc}</p>
              </div>
              <button
                onClick={() => toggle(item.key)}
                className={`relative w-11 h-6 rounded-full transition-colors shadow-inner ${
                  notifications[item.key] ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    notifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={() => toast('success', 'Preferences saved')}>Save Preferences</Button>
        </div>
      </Card>
    </div>
  );
}

function PlatformTab() {
  const [healthData, setHealthData] = useState<{ api: boolean; database: boolean; storage: boolean } | null>(null);

  useEffect(() => {
    healthApi.check()
      .then(res => {
        const services = (res.data as { services?: Record<string, string> })?.services;
        setHealthData({
          api: true,
          database: services?.database === 'connected',
          storage: services?.storage === 'connected',
        });
      })
      .catch(() => setHealthData({ api: false, database: false, storage: false }));
  }, []);

  const healthItems = [
    { label: 'API', healthy: healthData?.api },
    { label: 'Database', healthy: healthData?.database },
    { label: 'Storage', healthy: healthData?.storage },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-success-500" /> Platform Health
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {healthItems.map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl bg-surface-dim">
              <div className={`w-2.5 h-2.5 rounded-full ${healthData == null ? 'bg-warning-500 animate-pulse' : s.healthy ? 'bg-success-500 animate-pulse' : 'bg-danger-500'}`} />
              <div>
                <p className="text-sm font-medium text-text-primary">{s.label}</p>
                <p className={`text-xs ${healthData == null ? 'text-warning-500' : s.healthy ? 'text-success-600' : 'text-danger-500'}`}>
                  {healthData == null ? 'Checking...' : s.healthy ? 'Healthy' : 'Unavailable'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-accent-500" /> Branding
        </h3>
        <div className="space-y-4">
          <Input label="Platform Name" defaultValue="LearnSphere" />
          <Input label="Support Email" defaultValue="support@learnsphere.io" />
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={() => toast('success', 'Settings saved')}>Save Settings</Button>
        </div>
      </Card>
    </div>
  );
}
