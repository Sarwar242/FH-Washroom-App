import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Alert, Platform } from 'react-native';

class NotificationService {
    // Initialize Firebase messaging and request permissions
    async initialize() {
        try {
            // Check if we have permission
            const authStatus = await messaging().requestPermission();
            const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED;

            if (!enabled) {
                console.warn('User has not granted notification permissions');
                return false;
            }

            // Get the token
            const token = await this.getFCMToken();
            
            // Register token with our backend
            if (token) {
                await this.registerTokenWithBackend(token);
            }

            // Set up token refresh listener
            this.setupTokenRefreshListener();
            
            // Set up notification handlers
            this.setupNotificationHandlers();

            return true;
        } catch (error) {
            console.error('Failed to initialize notifications:', error);
            return false;
        }
    }

    // Get the FCM token, creating it if necessary
    private async getFCMToken() {
        try {
            const token = await messaging().getToken();
            await AsyncStorage.setItem('fcmToken', token);
            return token;
        } catch (error) {
            console.error('Failed to get FCM token:', error);
            return null;
        }
    }

    // Register the token with our backend
    private async registerTokenWithBackend(token: string) {
        try {
            await axios.post('/notifications/register-token', {
                token,
                device_type: Platform.OS // 'ios' or 'android'
            });
        } catch (error) {
            console.error('Failed to register token with backend:', error);
        }
    }

    // Handle token refresh
    private setupTokenRefreshListener() {
        messaging().onTokenRefresh(async (token) => {
            await AsyncStorage.setItem('fcmToken', token);
            await this.registerTokenWithBackend(token);
        });
    }

    // Set up handlers for different notification scenarios
    private setupNotificationHandlers() {
        // Handle foreground messages
        messaging().onMessage(async remoteMessage => {
            this.handleNotification(remoteMessage);
        });

        // Handle background/quit state messages
        messaging().setBackgroundMessageHandler(async remoteMessage => {
            this.handleNotification(remoteMessage);
        });

        // Handle notification open events
        messaging().onNotificationOpenedApp(remoteMessage => {
            this.handleNotificationOpen(remoteMessage);
        });
    }

    // Handle incoming notifications
    private handleNotification(remoteMessage: any) {
        const { notification, data } = remoteMessage;

        switch (data.type) {
            case 'toilet_available':
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
                break;

            case 'session_expiring':
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
                break;

            default:
                Alert.alert(notification.title, notification.body);
        }
    }

    // Handle when a user taps on a notification
    private handleNotificationOpen(remoteMessage: any) {
        const { data } = remoteMessage;
        if (data.type === 'toilet_available') {
            this.navigateToToilet(data.toilet_id);
        }
    }

    // Navigate to specific toilet
    private navigateToToilet(toiletId: string) {
        // You'll need to implement navigation logic here
        // This will depend on your navigation setup
    }

    // Extend toilet time
    private async extendToiletTime(toiletId: string) {
        try {
            await axios.post(`/toilets/${toiletId}/extend`);
            Alert.alert('Success', 'Time extended successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to extend time');
        }
    }
}

export default new NotificationService();