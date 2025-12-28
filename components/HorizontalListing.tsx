import { View, Text, XStack, YStack, ScrollView } from 'tamagui'
import { Link } from 'expo-router'
import React from 'react'
import ListingCard, { ListingItem } from './ListingCard'

type HorizontalListingProps = {
    title: string
    listings: ListingItem[]
}

const HorizontalListing = ({ title, listings }: HorizontalListingProps) => {
    return (
        <YStack gap="$4" width="100%">
            <XStack justify="space-between" items="center" px="$3">
                <Text fontSize="$6" fontWeight="bold">{title}</Text>
                <Link href="/listing/all" asChild>
                    <Text color="$black1" fontWeight="600">See all</Text>
                </Link>
            </XStack>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ px: 4 }}>
                <XStack gap="$4">
                    {listings.map((item) => (
                        <View key={item.id} width={280}>
                            <ListingCard item={item} />
                        </View>
                    ))}
                </XStack>
            </ScrollView>
        </YStack>
    )
}

export default HorizontalListing
