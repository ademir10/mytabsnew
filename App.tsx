import react, { useEffect } from "react";
import { NavigationContainer } from '@react-navigation/native'
import Routes from './src/routes';
import GeneralStatusBarColor from './src/components/GeneralStatusBarColor';

import RNBootSplash from "react-native-bootsplash";

export default function App() {

 // useEffect(() => {
 //   setTimeout(() => {
 //     RNBootSplash.hide({fade: true});
 //   }, 3000);
 // }, []);

  return (
    
    <NavigationContainer> 
      <GeneralStatusBarColor backgroundColor="black"/>
      <Routes/>
    </NavigationContainer>
  );
}