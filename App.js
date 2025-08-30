import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './constants';
import LoginScreen from './pages/LoginScreen';
import SignUpScreen from './pages/SignUpScreen';
import HomeScreen from './pages/Homescreen';
import TripScreen from './pages/TripScreen';
import ExperienceScreen from './pages/ExperienceScreen';
import AddTripScreen from './pages/AddTripScreen';
import EditTripScreen from './pages/EditTripScreen';
import AddExperienceScreen from './pages/AddExperienceScreen';
import EditExperienceScreen from './pages/EditExperienceScreen';

const Stack = createNativeStackNavigator();
 
export default function App() {
  return (
<NavigationContainer>
<Stack.Navigator initialRouteName={ROUTES.LOGIN}>
<Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} options={{ headerShown: false }} />
<Stack.Screen name={ROUTES.SIGNUP} component={SignUpScreen} options={{ title: "" }} />
<Stack.Screen name={ROUTES.HOME} component={HomeScreen} options={{ title: "" }} />
<Stack.Screen name={ROUTES.TRIPS} component={TripScreen} options={{ title: "" }} />
<Stack.Screen name={ROUTES.ADD_TRIP} component={AddTripScreen} options={{ title: "" }} />
<Stack.Screen name={ROUTES.EDIT_TRIP} component={EditTripScreen} options={{ title: "" }} />
<Stack.Screen name={ROUTES.EXPERIENCE} component={ExperienceScreen} options={{ title: "" }} />
<Stack.Screen name={ROUTES.ADD_EXPERIENCE} component={AddExperienceScreen} options={{ title: "" }} />
<Stack.Screen name={ROUTES.EDIT_EXPERIENCE} component={EditExperienceScreen} options={{ title: "" }} />
</Stack.Navigator>
</NavigationContainer>
  );
}