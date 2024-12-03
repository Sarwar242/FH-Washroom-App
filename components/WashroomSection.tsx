// src/components/WashroomSection.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { ToiletCard } from './ToiletCard';
import { styles } from '../styles';
import { WashroomSectionProps } from '../helpers/types';



export const WashroomSection: React.FC<WashroomSectionProps> = ({
  washroom,
  user,
  onOccupy,
  onRelease,
  onJoinWaitlist,
  waitingForToilets
}) => (
  <View style={styles.washroomSection}>
    <View style={styles.washroomHeader}>
      <Text style={styles.washroomName}>{washroom.name}</Text>
      <Text style={styles.washroomInfo}>
        {washroom.available_toilets} of {washroom.total_toilets} available
      </Text>
    </View>
    <View style={styles.toiletsGrid}>
      {washroom.toilets.map((toilet) => (
        <ToiletCard 
          key={toilet.id} 
          toilet={toilet}
          user={user}
          onOccupy={onOccupy}
          onRelease={onRelease}
          onJoinWaitlist={onJoinWaitlist}
          waitingForToilets={waitingForToilets}
        />
      ))}
    </View>
  </View>
);