import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ReactNativeInactivity from "react-native-inactivity";
import { useNavigation, useRoute } from '@react-navigation/native';
import SignIn from '../pages/SignIn';
import Config from '../pages/Config';
import Home from '../pages/Home';
import Instrumentos from '../pages/Instrumentos';
import Tablaturas from '../pages/Tablaturas';
import Setlist from '../pages/Setlist';
import Usuarios from '../pages/Usuarios';

const Stack = createNativeStackNavigator();
export default function Routes() {
    const navigation = useNavigation();
    return (
        <ReactNativeInactivity
            isActive={true}
            onInactive={() => navigation.navigate('SignIn')}
            timeForInactivity={18000000} //5 hours logout automatically
            restartTimerOnActivityAfterExpiration={false}
            loop={true}>
            <Stack.Navigator screenOptions={{ gestureEnabled: false }}>
                <Stack.Screen
                    name="SignIn"
                    component={SignIn}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Config"
                    component={Config}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Home"
                    component={Home}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Instrumentos"
                    component={Instrumentos}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Tablaturas"
                    component={Tablaturas}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Setlist"
                    component={Setlist}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Usuarios"
                    component={Usuarios}
                    options={{ headerShown: false }}
                />

            </Stack.Navigator>

        </ReactNativeInactivity>
    )
}