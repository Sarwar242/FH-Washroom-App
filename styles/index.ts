// src/styles/index.ts
import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 0 : 40,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  washroomSection: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  washroomHeader: {
    marginBottom: 15,
  },
  washroomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  washroomInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  toiletsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  toiletCard: {
    width: '48%',
    margin: '1%',
    aspectRatio: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  occupiedToilet: {
    backgroundColor: '#ffebee',
  },
  waitingToilet: {
    backgroundColor: '#FFF3E0',
  },
  toiletNumber: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: '500',
  },
  occupiedBy: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  waitingText: {
    fontSize: 11,
    color: '#FFA500',
    fontWeight: '500',
    marginTop: 2,
  },
  timeRemaining: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
});