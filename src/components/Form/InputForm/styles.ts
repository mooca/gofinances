import { RFValue } from 'react-native-responsive-fontsize';
import styled, {css} from 'styled-components/native';

export const Container = styled.View`
    width: 100%; 
`;

export const Error = styled.Text`
    font-family: ${({theme}) => theme.fonts.regular };
    color: ${({theme}) => theme.colors.attention };
    font-size: ${RFValue(14)}px;
    margin:  7px 0;

`;


