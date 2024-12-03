import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert, Platform } from 'react-native';
import { BASE_URL } from '../constants';

class NotificationService {
    async initialize() {
        try {
            // Check platform support
            if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
                console.warn('Notifications not supported on this platform');
                return false;
            }

            // Check if messaging is supported
            if (!messaging().isSupported()) {
                console.warn('Firebase messaging is not supported');
                return false;
            }

            // Request permissions
            const authStatus = await messaging().requestPermission();
            const enabled = 
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (!enabled) {
                console.warn('Authorization status:', authStatus);
                return false;
            }

            // Get and register token
            const token = await this.getFCMToken();
            if (token) {
                await this.registerTokenWithBackend(token);
            }

            // Set up listeners
            this.setupTokenRefreshListener();
            this.setupNotificationHandlers();

            return true;
        } catch (error) {
            console.error('Notification initialization error:', error);
            return false;
        }
    }

    private async getFCMToken() {
        try {
            // Check if token exists in storage first
            const storedToken = await AsyncStorage.getItem('fcmToken');
            if (storedToken) return storedToken;

            // Get new token
            const token = await messaging().getToken();
            await AsyncStorage.setItem('fcmToken', token);
            return token;
        } catch (error) {
            console.error('Token retrieval error:', error);
            return null;
        }
    }

    private async registerTokenWithBackend(token: string) {
        try {
            await axios.post(`${BASE_URL}/notifications/register-token`, {
                token,
                device_type: Platform.OS
            });
        } catch (error) {
            console.error('Backend token registration failed:', error);
        }
    }

    // Handle when a user taps on a notification
    private handleNotificationOpen(remoteMessage: any) {
        const { data } = remoteMessage;
        if (data.type === 'toilet_available') {
            this.navigateToToilet(data.toilet_id);
        }
    }

    private setupTokenRefreshListener() {
        return messaging().onTokenRefresh(async (token) => {
            try {
                await AsyncStorage.setItem('fcmToken', token);
                await this.registerTokenWithBackend(token);
            } catch (error) {
                console.error('Token refresh error:', error);
            }
        });
    }

    private setupNotificationHandlers() {
        // Foreground message handler
        const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
            this.handleNotification(remoteMessage);
        });

        // Background message handler
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            this.handleNotification(remoteMessage);
        });

        // Notification opened handler
        const unsubscribeOpenedNotification = messaging().onNotificationOpenedApp(
            remoteMessage => {
                this.handleNotificationOpen(remoteMessage);
            }
        );

        // Return unsubscribe functions if needed
        return () => {
            unsubscribeForeground();
            unsubscribeOpenedNotification();
        };
    }

    private handleNotification(remoteMessage: any) {
        const { notification, data } = remoteMessage;

        if (!notification) return;

        switch (data?.type) {
            case 'toilet_available':
                this.showToiletAvailableNotification(notification, data);
                break;
            case 'session_expiring':
                this.showSessionExpiringNotification(notification, data);
                break;
            default:
                Alert.alert(notification.title || 'Notification', notification.body || '');
        }
    }

    private showToiletAvailableNotification(notification: any, data: any) {
        Alert.alert(
            notification.title,
            notification.body,
            [
                {
                    text: 'View',
                    onPress: () => this.navigateToToilet(data.toilet_id)
                },
                { text: 'Dismiss', style: 'cancel' }
            ]
        );
    }

    private showSessionExpiringNotification(notification: any, data: any) {
        Alert.alert(
            notification.title,
            notification.body,
            [
                {
                    text: 'Extend Time',
                    onPress: () => this.extendToiletTime(data.toilet_id)
                },
                { text: 'OK', style: 'cancel' }
            ]
        );
    }

    private navigateToToilet(toiletId: string) {
        // Implement navigation logic 
        console.log(`Navigating to toilet: ${toiletId}`);
    }

    private async extendToiletTime(toiletId: string) {
        try {
            await axios.post(`${BASE_URL}/toilets/${toiletId}/extend`);
            Alert.alert('Success', 'Time extended successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to extend time');
        }
    }
}

export default new NotificationService();