import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet,Easing } from 'react-native';
const CombinedAnimation = () => {
  const rotateValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotate animation

         Animated.sequence([
            Animated.timing(rotateValue, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
            easing: Easing.linear
          }),
            Animated.timing(rotateValue, {
            toValue: 2,
            duration: 4000,
            useNativeDriver: true,
            easing: Easing.linear
          }),
         ]).start();


    // Pulse animation

      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.5,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start();

  }, []);

  const combinedStyle = {
    transform: [
      // {
      //   translateX: rotateValue.interpolate({
      //     inputRange: [0, 1],
      //     outputRange: [0, 50],
      //   }),
      // },
      // {
      //   translateY: rotateValue.interpolate({
      //     inputRange: [0, 1],
      //     outputRange: [0, 50],
      //   }),
      // },
      {
        rotate: rotateValue.interpolate({
          inputRange: [0, 2],
          outputRange: ['0deg', '360deg'],
        }),
      },
      {
        scale: pulseValue,
      },
    ],
  };


  return (
    <View style={styles.container}>
      <Animated.View style={[styles.box, combinedStyle]}>
        <Animated.Image
          source={require('../../assets/logo-intro.png')}
          style={styles.box}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding:5
  },
  box: {
    width: 100,
    height: 100,
    resizeMode: 'contain'
  },
});

export default CombinedAnimation;
