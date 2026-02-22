import React, { useState } from 'react';
import { User, Settings, Heart, Activity, Calendar, Shield, Bell, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';

interface ProfileTabsProps {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  onUpdateProfile: (data: any) => void;
}

export default function ProfileTabs({ user, onUpdateProfile }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: '',
    address: '',
    bio: '',
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'pl',
      timezone: 'Europe/Warsaw'
    },
    health: {
      height: '',
      weight: '',
      age: '',
      gender: '',
      activityLevel: 'moderate',
      dietaryRestrictions: [],
      allergies: []
    }
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'preferences', label: 'Preferencje', icon: Settings },
    { id: 'health', label: 'Zdrowie', icon: Heart },
    { id: 'activity', label: 'Aktywność', icon: Activity },
    { id: 'notifications', label: 'Powiadomienia', icon: Bell },
    { id: 'security', label: 'Bezpieczeństwo', icon: Shield }
  ];

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: '',
      address: '',
      bio: '',
      preferences: {
        notifications: true,
        darkMode: false,
        language: 'pl',
        timezone: 'Europe/Warsaw'
      },
      health: {
        height: '',
        weight: '',
        age: '',
        gender: '',
        activityLevel: 'moderate',
        dietaryRestrictions: [],
        allergies: []
      }
    });
    setIsEditing(false);
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informacje podstawowe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Imię</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nazwisko</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="address">Adres</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="bio">O mnie</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              disabled={!isEditing}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancel}>
              Anuluj
            </Button>
            <Button onClick={handleSave}>
              Zapisz zmiany
            </Button>
          </>
        ) : (
          <Button onClick={() => setIsEditing(true)}>
            Edytuj profil
          </Button>
        )}
      </div>
    </div>
  );

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia aplikacji</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="language">Język</Label>
            <Select
              value={formData.preferences.language}
              onValueChange={(value) => setFormData({
                ...formData,
                preferences: {...formData.preferences, language: value}
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pl">Polski</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="timezone">Strefa czasowa</Label>
            <Select
              value={formData.preferences.timezone}
              onValueChange={(value) => setFormData({
                ...formData,
                preferences: {...formData.preferences, timezone: value}
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Europe/Warsaw">Warszawa</SelectItem>
                <SelectItem value="Europe/London">Londyn</SelectItem>
                <SelectItem value="America/New_York">Nowy Jork</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wygląd</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Tryb ciemny</div>
              <div className="text-sm text-gray-600">Włącz tryb ciemny interfejsu</div>
            </div>
            <button
              onClick={() => setFormData({
                ...formData,
                preferences: {...formData.preferences, darkMode: !formData.preferences.darkMode}
              })}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.preferences.darkMode ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                formData.preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderHealthTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dane zdrowotne</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Wzrost (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.health.height}
                onChange={(e) => setFormData({
                  ...formData,
                  health: {...formData.health, height: e.target.value}
                })}
              />
            </div>
            <div>
              <Label htmlFor="weight">Waga (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.health.weight}
                onChange={(e) => setFormData({
                  ...formData,
                  health: {...formData.health, weight: e.target.value}
                })}
              />
            </div>
            <div>
              <Label htmlFor="age">Wiek</Label>
              <Input
                id="age"
                type="number"
                value={formData.health.age}
                onChange={(e) => setFormData({
                  ...formData,
                  health: {...formData.health, age: e.target.value}
                })}
              />
            </div>
            <div>
              <Label htmlFor="gender">Płeć</Label>
              <Select
                value={formData.health.gender}
                onValueChange={(value) => setFormData({
                  ...formData,
                  health: {...formData.health, gender: value}
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz płeć" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Mężczyzna</SelectItem>
                  <SelectItem value="female">Kobieta</SelectItem>
                  <SelectItem value="other">Inne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="activityLevel">Poziom aktywności</Label>
            <Select
              value={formData.health.activityLevel}
              onValueChange={(value) => setFormData({
                ...formData,
                health: {...formData.health, activityLevel: value}
              })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Siedzący</SelectItem>
                <SelectItem value="light">Lekka aktywność</SelectItem>
                <SelectItem value="moderate">Umiarkowana aktywność</SelectItem>
                <SelectItem value="active">Aktywny</SelectItem>
                <SelectItem value="very_active">Bardzo aktywny</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencje dietetyczne</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Tutaj można dodać preferencje dietetyczne, alergie i ograniczenia żywieniowe.
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Historia aktywności</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Historia aktywności będzie dostępna wkrótce</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statystyki</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Statystyki aktywności będą dostępne wkrótce</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ustawienia powiadomień</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Powiadomienia email</div>
              <div className="text-sm text-gray-600">Otrzymuj powiadomienia o nowych funkcjach</div>
            </div>
            <button
              onClick={() => setFormData({
                ...formData,
                preferences: {...formData.preferences, notifications: !formData.preferences.notifications}
              })}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.preferences.notifications ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                formData.preferences.notifications ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historia powiadomień</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Historia powiadomień będzie dostępna wkrótce</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Zmiana hasła</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Obecne hasło</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="Wpisz obecne hasło"
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Nowe hasło</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Wpisz nowe hasło"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Potwierdź nowe hasło"
            />
          </div>
          <Button className="w-full">
            Zmień hasło
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bezpieczeństwo konta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Autoryzacja dwuetapowa</div>
              <div className="text-sm text-gray-600">Dodatkowa warstwa bezpieczeństwa</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <div className="font-medium">Sesje zalogowania</div>
              <div className="text-sm text-gray-600">Zarządzaj aktywnymi sesjami</div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'preferences':
        return renderPreferencesTab();
      case 'health':
        return renderHealthTab();
      case 'activity':
        return renderActivityTab();
      case 'notifications':
        return renderNotificationsTab();
      case 'security':
        return renderSecurityTab();
      default:
        return renderProfileTab();
    }
  };

  return (
    <div className="flex gap-6">
      <div className="w-64">
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  );
}
