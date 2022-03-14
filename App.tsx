import React from 'react';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import 'intl';
import 'intl/locale-data/jsonp/pt-BR';


import { ThemeProvider } from 'styled-components';
import AppLoading from 'expo-app-loading';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_700Bold
} from '@expo-google-fonts/poppins';

import theme from './src/global/styles/theme';

import  { Routes } from './src/routes';
import { GestureHandlerRootView } from 'react-native-gesture-handler';


import { AuthProvider, useAuth } from './src/hooks/auth';



export default function App() {

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_700Bold
  });

  const {loginLoading} = useAuth();


  if(!fontsLoaded || loginLoading){
    return <AppLoading/>
  }

  return (
    <GestureHandlerRootView style={{flex : 1}}>
      <ThemeProvider theme={theme} >
            <StatusBar barStyle="light-content"/>
              <AuthProvider>
                <Routes/>
              </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>


  )
  
}


