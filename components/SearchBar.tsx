import { Search } from '@tamagui/lucide-icons'
import { Input, InputProps, StackProps, View } from 'tamagui'

type SearchBarProps = InputProps & {
    containerProps?: StackProps
}

const SearchBar = ({ containerProps, ...props }: SearchBarProps) => {
    return (
        <View
            flexDirection='row'
            items="center"
            justify="space-between"
            bg="$background"
            borderColor="$borderColor"
            borderWidth={1}
            px="$4"
            borderStartEndRadius={6}
            borderStartStartRadius={6}
            borderEndEndRadius={6}
            borderEndStartRadius={6}
            width="100%"
            {...containerProps}
        >
            <Search size="$1" color="$color" mr="$4" />
            <Input
                flex={1}
                bg="transparent"
                borderWidth={0}
                placeholder={props.placeholder}
                pl={0}
                focusStyle={{ borderWidth: 0 }}
                hoverStyle={{ borderWidth: 0 }}
                {...props}
            />
        </View>
    )
}

export default SearchBar
