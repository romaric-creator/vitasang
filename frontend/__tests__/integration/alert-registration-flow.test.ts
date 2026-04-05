import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import * as storage from '@/utils/storage';
import { sendAlert, registerUser } from '@/services/user.service';

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

// Mock Location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

// Mock AsyncStorage (used by storage.ts)
jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

// Mock services
jest.mock('@/services/user.service', () => ({
  sendAlert: jest.fn(),
  registerUser: jest.fn(),
  searchDonors: jest.fn(), // Also mock searchDonors
}));

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Return the key as the translation
    i18n: {
      changeLanguage: jest.fn(),
      language: 'fr',
    },
  }),
}));

// Components to test
import GuestAlertScreen from '@/app/guest-alert';
import RegisterScreen from '@/app/register';

describe('Alert Registration Flow', () => {
  const mockPush = jest.fn();
  const mockReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
    });
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
      coords: { latitude: 10, longitude: 20 },
    });
    (storage.removeData as jest.Mock).mockResolvedValue(undefined);
    (storage.storeData as jest.Mock).mockResolvedValue(undefined);
    (storage.getData as jest.Mock).mockResolvedValue(null); // Default: no pending alert
    (sendAlert as jest.Mock).mockResolvedValue({ alertId: 123, success: true });
    (registerUser as jest.Mock).mockResolvedValue({ user: { id: 1, id_utilisateur: 1, role: 'donor' }, token: 'mockToken' });
  });

  it('guest-alert screen should store pending alert and redirect to register', async () => {
    const { getByPlaceholderText, getByText } = render(<GuestAlertScreen />);

    await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());

    fireEvent.changeText(getByPlaceholderText('Jean Dupont'), 'Test Patient');
    fireEvent.changeText(getByPlaceholderText('6XXXXXXXX'), '677889900');
    fireEvent.changeText(getByPlaceholderText('alert.placeholders.location'), 'Test Location');
    fireEvent.changeText(getByPlaceholderText('alert.placeholders.quantity'), '2');
    fireEvent.press(getByText('alert.submit'));

    await waitFor(() => {
      expect(storage.storeData).toHaveBeenCalledWith('pending_alert', expect.any(Object));
      expect(mockPush).toHaveBeenCalledWith('/register');
    });

    const storedAlertData = (storage.storeData as jest.Mock).mock.calls[0][1];
    expect(storedAlertData).toMatchObject({
      nom_patient: 'Test Patient',
      telephone_contact: '677889900',
      lieu: 'Test Location',
      quantite_requise: 2,
    });
    expect(sendAlert).not.toHaveBeenCalled(); // Ensure alert is not sent directly
  });

  it('register screen should send pending alert and redirect to alert-confirmation upon successful registration', async () => {
    // Mock a pending alert being present in storage
    (storage.getData as jest.Mock).mockImplementation((key: string) => {
      if (key === 'pending_alert') {
        return Promise.resolve({
          latitude: 10,
          longitude: 20,
          groupe_sanguin: 'A+',
          quantite_requise: 1,
          lieu: 'Pending Alert Location',
          telephone_contact: '612345678',
        });
      }
      return Promise.resolve(null);
    });

    const { getByPlaceholderText, getByText, findByText } = render(<RegisterScreen />);

    // Fill Step 1
    fireEvent.changeText(getByPlaceholderText('Votre nom'), 'John');
    fireEvent.changeText(getByPlaceholderText('Votre prénom'), 'Doe');
    fireEvent.changeText(getByPlaceholderText('Ex: 6 99 99 99 99'), '699887766');
    fireEvent.changeText(getByPlaceholderText('6 caractères min.'), 'password123');
    fireEvent.press(getByText('Suivant'));

    // Ensure we are on Step 2
    await waitFor(() => expect(getByText('Votre groupe sanguin (Optionnel)')).toBeTruthy());

    // Submit registration (Step 2)
    fireEvent.press(getByText('Terminer'));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith(
        'John',
        'Doe',
        '699887766',
        'password123',
        null, // Default if not selected
        'donneur',
        undefined,
      );
    });

    await waitFor(() => {
      expect(sendAlert).toHaveBeenCalledWith({
        latitude: 10,
        longitude: 20,
        groupe_sanguin: 'A+',
        quantite_requise: 1,
        lieu: 'Pending Alert Location',
        telephone_contact: '612345678',
      });
      expect(storage.removeData).toHaveBeenCalledWith('pending_alert');
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/alert-confirmation',
        params: { alertId: '123' },
      });
    });
  });

  it('register screen should navigate to tabs if no pending alert', async () => {
    // No pending alert mocked by default

    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

    // Fill Step 1
    fireEvent.changeText(getByPlaceholderText('Votre nom'), 'Jane');
    fireEvent.changeText(getByPlaceholderText('Votre prénom'), 'Smith');
    fireEvent.changeText(getByPlaceholderText('Ex: 6 99 99 99 99'), '600112233');
    fireEvent.changeText(getByPlaceholderText('6 caractères min.'), 'securepass');
    fireEvent.press(getByText('Suivant'));

    // Submit registration (Step 2)
    await waitFor(() => expect(getByText('Votre groupe sanguin (Optionnel)')).toBeTruthy());
    fireEvent.press(getByText('Terminer'));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalled();
      expect(storage.getData).toHaveBeenCalledWith('pending_alert'); // Check if it tried to get pending alert
      expect(sendAlert).not.toHaveBeenCalled(); // No pending alert, so sendAlert should not be called
      expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
    });
  });
});
