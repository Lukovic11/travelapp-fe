import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from './constants';
import HomeScreen from './pages/Homescreen';
import TripScreen from './pages/TripScreen';
import ExperienceScreen from './pages/ExperienceScreen';
import AddTripScreen from './pages/AddTripScreen';
import EditTripScreen from './pages/EditTripScreen';

const Stack = createNativeStackNavigator();
 
export default function App() {
  return (
<NavigationContainer>
<Stack.Navigator initialRouteName={ROUTES.HOME}>
<Stack.Screen name={ROUTES.HOME} component={HomeScreen} />
<Stack.Screen name={ROUTES.TRIPS} component={TripScreen} />
<Stack.Screen name={ROUTES.EXPERIENCE} component={ExperienceScreen} />
<Stack.Screen name={ROUTES.ADD_TRIP} component={AddTripScreen} />
<Stack.Screen name={ROUTES.EDIT_TRIP} component={EditTripScreen} />
</Stack.Navigator>
</NavigationContainer>
  );
}