import React, {useEffect, useState, useCallback} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator } from "react-native";
import {addMonths, subMonths, format} from 'date-fns';
import {ptBR} from 'date-fns/locale'
import { HistoryCard } from "../../components/HistoryCard";
import { categories } from "../../utils/categories";

import {useTheme} from 'styled-components';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useAuth } from "../../hooks/auth";


import { RFValue } from "react-native-responsive-fontsize";

import { VictoryPie } from 'victory-native';
import {
    Container,
    Header,
    Title,
    Content,
    ChartContainer,
    MonthSelect,
    MonthSelectButton,
    MonthSelectIcon,
    Month,
    LoadContainer
} from './style';
import { useFocusEffect } from "@react-navigation/native";



interface TransactionDada{
    type: 'positive' | 'negative';
    name: string;
    amount: string;
    category: string;
    date: string;
}
interface CategoryData{
    key: string;
    name: string;
    total: number;
    totalFormatted: string;
    color: string;
    percent: string;
}
export function Resume(){

    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

    const theme = useTheme();
    const {user} = useAuth();
    
    
    function handleDateChange(action: 'next' | 'prev'){
        if(action === 'next'){
            setSelectedDate(addMonths(selectedDate, 1));
        }else{
            setSelectedDate(subMonths(selectedDate, 1));
        }
    }


    async function loadData(){
        setIsLoading(true);

        const dataKey = `@gofinances:transactions_user:${user.id}`;
        const response = await AsyncStorage.getItem(dataKey);
        const responseFormated = response ? JSON.parse(response) : [];

        const expensives = responseFormated
            .filter((expensive: TransactionDada)  => 
                expensive.type === 'negative' &&
                new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
                new Date(expensive.date).getFullYear() === selectedDate.getFullYear() 
        );


        const expensivesTotal = expensives
            .reduce((acumullator: number, expensive: TransactionDada)=>{
                return acumullator + Number(expensive.amount);
        }, 0); // o reduce pega coleção e soma os elementos  
        

        const totalByCategory: CategoryData[] = [];        
        
        categories.forEach(category => {
            let categorySum = 0;

            expensives.forEach((expensive: TransactionDada) => {
                if(expensive.category === category.key){
                    categorySum += Number(expensive.amount);
                }

            });
            
        if(categorySum > 0){    
            const totalFormatted = categorySum.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            })

            const percent = `${(categorySum / expensivesTotal * 100).toFixed(0)}%`;


                totalByCategory.push({
                    key: category.key,
                    color: category.color,
                    name: category.name,
                    total: categorySum,
                    totalFormatted,
                    percent
            });
        }
        });

        console.log(totalByCategory);

        setTotalByCategories(totalByCategory);
        setIsLoading(false);
    }




    useFocusEffect(useCallback(()=>{
        loadData();
    }, [selectedDate]));



    return(
        <Container>
        
            <Header>
                <Title>Resumo por Categorias</Title>
            </Header>   

            {
        
        isLoading ? 
            <LoadContainer>
                <ActivityIndicator 
                    color={theme.colors.primary} 
                    size="large"
                />
            </LoadContainer>  :
            

            <Content
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: useBottomTabBarHeight(),

                }}
            >

                <MonthSelect>

                    <MonthSelectButton onPress={()=> handleDateChange('prev')}>
                        <MonthSelectIcon name="chevron-left"/>
                    </MonthSelectButton>

                    <Month> { format(selectedDate, 'MMMM, yyyy', {locale: ptBR}) }</Month>

                    <MonthSelectButton onPress={()=> handleDateChange('next')}>
                        <MonthSelectIcon name="chevron-right"/>
                    </MonthSelectButton>

                </MonthSelect>


                <ChartContainer>
                    <VictoryPie 
                        data={totalByCategories}
                        colorScale={totalByCategories.map(category => category.color)}
                        style={{
                            labels: { 
                                fontSize: RFValue(18),
                                fontWeight: 'bold',
                                fill: theme.colors.shape
                            }
                        }}
                        labelRadius={50}
                        x="percent"
                        y="total"
                    />
                </ChartContainer>

                {   
                totalByCategories.map(item => (
                    <HistoryCard 
                        key={item.key}
                        title={item.name}
                        amount={item.totalFormatted}
                        color={item.color}
                    />

                ))
                }        
            </Content>
        
        }
        </Container>
    )
}