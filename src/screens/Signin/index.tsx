import React, {useContext, useState} from "react";
import { ActivityIndicator, Alert, Platform } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import AppleSvg from '../../assets/apple.svg';
import GoogleSvg from '../../assets/google.svg';
import LogoSvg from '../../assets/logo.svg';
import { SignInSocialButton } from "../../components/SignInSocialButton";
import { useTheme } from 'styled-components'

import { useAuth } from '../../hooks/auth';

import {
    Container,
    Header,
    TitleWrapper,
    Title,
    SignInTitle,
    Footer,
    FooterWrapper
} from './style';
import { Button } from "../../components/Form/Button";

export function Signin(){
    
    const [isLoading, setIsLoading] = useState(false)
    const { GoogleSignIn, AppleSignIn } = useAuth()
    const theme = useTheme()
    const { signOut } = useAuth();

    async function handleGoogleSignIn() {
        try {
          setIsLoading(true)
         return  await GoogleSignIn();
        } catch (err) {
          Alert.alert('Erro', 'Não foi possível conectar com a conta Google.')
          setIsLoading(false)
        }

      }
    
      async function handleAppleSignIn() {
        try {
          setIsLoading(true)
          return await AppleSignIn()
        } catch (err) {
          Alert.alert('Erro', 'Não foi possível conectar com a conta Apple.')
        }finally{
            setIsLoading(false)
        }
      }

    return(
        <Container>
            <Header>
                <TitleWrapper>
                    <LogoSvg
                        width={RFValue(120)}
                        height={RFValue(68)}
                    />
                <Title>
                    Controle suas {'\n'} finanças de forma {'\n'} muito simples
                </Title>

                </TitleWrapper>
                <Button 
                    title="SignOut"
                    onPress={() => {signOut}}
                />
                <SignInTitle>
                    Faça seu login com  {'\n'} uma das contas abaixo
                </SignInTitle>
               
            </Header>

            <Footer>
                <FooterWrapper>
                    <SignInSocialButton 
                       onPress={handleGoogleSignIn}
                       svg={() => <GoogleSvg />}
                       title="Entrar com Google"
                    />
                    {Platform.OS === 'ios' && (
                        <SignInSocialButton
                        onPress={handleAppleSignIn}
                        svg={() => <AppleSvg />}
                        title="Entrar com Apple"
                        />
                    )}
                </FooterWrapper>

                {isLoading && (
                    <ActivityIndicator
                        color={theme.colors.shape}
                        size="small"
                        style={{ marginTop: 25 }}
                    />
                )}

            </Footer>
            
        </Container>
    )
}