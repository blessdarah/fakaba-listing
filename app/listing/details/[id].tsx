import { View, Text, ScrollView, YStack, XStack, Image, Button, Avatar } from 'tamagui'
import { Stack, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { Heart, Maximize, Dog, Bath, BedDouble, MessageCircle, Map as MapIcon, ChevronLeft } from '@tamagui/lucide-icons'
import HorizontalListing from 'components/HorizontalListing'
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

const { width } = Dimensions.get('window')

const listingsDetails: Record<string, any> = {
    '1': {
        id: 1,
        title: '1 Bedroom studio',
        price: '120k Monthly',
        posted: '2 days ago',
        location: 'Molyko, Buea',
        rating: 4.5,
        description: 'This facility has portable drinking water, parking, forage, 24/7 security. No need for a quotion fee before entry. Multiple guests allowed.',
        images: [
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
            'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
            'https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
        ],
        host: {
            name: 'Muma Franklin',
            location: 'Mile 17, Buea',
            image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80'
        },
        facilities: [
            { icon: Maximize, label: '40x80 sqft' },
            { icon: Dog, label: 'Pets allowed' },
            { icon: Bath, label: '4 Bathrooms' },
            { icon: BedDouble, label: '3 Bedrooms' },
        ]
    }
}

// Fallback for missing ID
const defaultDetails = listingsDetails['1']

const ListingDetailsScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>()
    const details = listingsDetails[id || ''] || defaultDetails
    const [liked, setLiked] = useState(false)
    const [activeIndex, setActiveIndex] = useState(0)

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width
        const index = event.nativeEvent.contentOffset.x / slideSize
        setActiveIndex(Math.round(index))
    }

    return (
        <>
            <Stack.Screen options={{ headerTransparent: false, headerTitle: details.title, headerTintColor: 'black' }} />
            <ScrollView flex={1} bg="white" contentContainerStyle={{ pb: 50 }}>
                {/* Hero Carousel */}
                <View height={300} width="100%" position="relative">
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        {details.images.map((img: string, index: number) => (
                            <Image
                                key={index}
                                source={{ uri: img }}
                                style={{ width: width, height: 300 }}
                                resizeMode="cover"
                            />
                        ))}
                    </ScrollView>

                    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: "100%", backgroundColor: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)' }} />

                    <XStack position="absolute" top={20} left={20} right={20} justify="flex-end" items="flex-start">
                        <Button
                            size="$3"
                            circular
                            icon={<Heart size={24} color={liked ? 'red' : 'white'} fill={liked ? 'red' : 'transparent'} />}
                            chromeless
                            unstyled
                            onPress={() => setLiked(!liked)}
                        />
                    </XStack>

                    {/* Bottom Overlay: Pagination Dots */}
                    <XStack position="absolute" bottom={20} left={0} right={0} justify="center" gap="$2" zIndex={10}>
                        {details.images.map((_: any, index: number) => (
                            <View
                                key={index}
                                width={8}
                                height={8}
                                borderRadius={4}
                                bg={index === activeIndex ? 'white' : 'rgba(255,255,255,0.5)'}
                            />
                        ))}
                    </XStack>
                </View>

                <YStack px="$4" pt="$4" gap="$5">
                    {/* Price & Map Button */}
                    <YStack gap="$1">
                        <XStack justify="space-between" items="center">
                            <Text fontSize="$7" fontWeight="bold" color="black">{details.price}</Text>
                            <Button
                                size="$3"
                                icon={<MapIcon size={16} color="#D4A017" />}
                                borderColor="#eee"
                                borderWidth={1}
                                bg="white"
                                color="gray"
                                fontSize="$3"
                            >
                                Map view
                            </Button>
                        </XStack>
                        <Text fontSize="$3" color="gray">Posted: {details.posted}</Text>

                        <XStack gap="$3" mt="$2">
                            <View borderWidth={1} borderColor="#eee" borderRadius="$4" px="$3" py="$2">
                                <Text color="gray">{details.location}</Text>
                            </View>
                            <XStack borderWidth={1} borderColor="#eee" borderRadius="$4" px="$3" py="$2" gap="$1" items="center">
                                <Text color="#D4A017">★</Text>
                                <Text fontWeight="600">{details.rating}</Text>
                            </XStack>
                        </XStack>
                    </YStack>

                    <View height={1} bg="#f0f0f0" />

                    {/* Facilities */}
                    <YStack gap="$4">
                        <Text fontSize="$5" fontWeight="600">Facilities</Text>
                        <XStack justify="space-between">
                            {details.facilities.map((fac: any, index: number) => {
                                const Icon = fac.icon
                                return (
                                    <YStack key={index} items="center" gap="$2" width={80}>
                                        <View bg="#f5f5f5" p="$3" borderRadius={100} width={60} height={60} justify="center" items="center">
                                            <Icon size={24} color="black" />
                                        </View>
                                        <Text fontSize="$2" textAlign="center" color="gray" numberOfLines={2}>{fac.label}</Text>
                                    </YStack>
                                )
                            })}
                        </XStack>

                        <Text color="gray" lineHeight={24} fontSize="$3">
                            {details.description}
                        </Text>
                    </YStack>

                    <View height={1} bg="#f0f0f0" />

                    {/* Posted by */}
                    <YStack gap="$4">
                        <Text fontSize="$5" fontWeight="600">Posted by</Text>
                        <XStack justify="space-between" items="center">
                            <XStack gap="$3" items="center">
                                <Avatar circular size="$5" borderWidth={2} borderColor="#D4A017">
                                    <Avatar.Image src={details.host.image} />
                                    <Avatar.Fallback backgroundColor="gray" />
                                </Avatar>
                                <YStack>
                                    <Text fontSize="$4" fontWeight="600">{details.host.name}</Text>
                                    <Text fontSize="$3" color="gray">{details.host.location}</Text>
                                </YStack>
                            </XStack>
                            <Button bg="#4CAF50" color="white" borderRadius="$10" icon={<MessageCircle size={18} />} px="$4">
                                Message
                            </Button>
                        </XStack>
                    </YStack>

                    {/* Similar Listings */}
                    <YStack gap="$3" mt="$4">
                        <Text fontSize="$5" fontWeight="600">Similar listings</Text>
                        <HorizontalListing
                            title=""
                            listings={[
                                {
                                    id: 5,
                                    price: '200k Monthly',
                                    location: 'Bonaberi, Douala',
                                    title: '3 bedroom apartment',
                                    time: '3 weeks ago',
                                    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
                                }
                            ]}
                        />
                    </YStack>
                </YStack>
            </ScrollView>
        </>
    )
}

export default ListingDetailsScreen
