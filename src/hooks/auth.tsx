
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import * as AuthSession from 'expo-auth-session'
import * as AppleAuthentication from 'expo-apple-authentication'
import Storage from '@react-native-async-storage/async-storage'

const { CLIENT_ID } = process.env
const { REDIRECT_URI } = process.env

interface IAuthProviderProps {
  children: React.ReactNode
}

interface IUser {
  id: string
  email: string
  name: string
  given_name: string
  family_name: string
  picture: string
}

interface IAuthContext {
  user: IUser
  GoogleSignIn: () => Promise<void>
  AppleSignIn: () => Promise<void>
  signOut: () => Promise<void>
  loginLoading: boolean
}

interface IAuthSessionResponse {
  params: {
    access_token: string
  }
  type: string
}


const storageCollectionKey = '@gofinances:user'

const AuthContext = createContext({} as IAuthContext)

function AuthProvider({ children }: IAuthProviderProps) {


  const [user, setUser] = useState<IUser>({} as IUser)
  const [loginLoading, setLoginLoading] = useState(true)

  async function GoogleSignIn(): Promise<void> {
    try {
 
      const GOOGLE_END_POINT = 'https://accounts.google.com/o/oauth2/v2/auth'
      const RESPONSE_TYPE = 'token'
      const SCOPE = encodeURI('profile email')

      const authUrl = `${GOOGLE_END_POINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`

      const { type, params } = (await AuthSession.startAsync({
        authUrl
      })) as IAuthSessionResponse

      if (type === 'success') {
        const infoUrl = 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json'

        fetch(`${infoUrl}&access_token=${params.access_token}`)
          .then(response => response.json())
          .then(userInfo => {
            setUser(userInfo)
            Storage.setItem(storageCollectionKey, JSON.stringify(userInfo))
          })
      }
    } catch (err) {
      throw new Error(String(err))
    }
  }


  async function AppleSignIn(): Promise<void> {
    try {
      const credentials = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL
        ]
      })

      if (credentials) {
        const given_name = credentials.fullName!.givenName!
        const picture = `https://ui-avatars.com/api/?length=1&background=0D8ABC&color=fff&name=${given_name}`

        const formattedUser = {
          id: credentials.authorizationCode,
          email: credentials.email,
          name: 'Usuário',
          given_name,
          family_name: credentials.fullName!.familyName!,
          picture
        } as IUser

        setUser(formattedUser)
        Storage.setItem(storageCollectionKey, JSON.stringify(formattedUser))
      }
    } catch (err) {
      throw new Error(String(err))
    }
  }

  async function signOut(): Promise<void> {
    setUser({} as IUser);
    await Storage.removeItem(storageCollectionKey)
    // console.log('signOut');
  }

  useEffect(() => {
    async function loadUserDataFromStorage(): Promise<void> {
      const userData = await Storage.getItem(storageCollectionKey)

      if (userData) {
        const formattedData: IUser = JSON.parse(userData)

        setUser(formattedData)
      }

      setLoginLoading(false)
    }

    loadUserDataFromStorage()
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, GoogleSignIn, AppleSignIn, signOut, loginLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function useAuth(): IAuthContext {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('UseAuth Hook must be used within an AuthProvider.')
  }

  return context
}

export { AuthProvider, useAuth }
